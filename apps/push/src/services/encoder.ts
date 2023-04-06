import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { mkdir, readdir, rm } from 'fs/promises';
import { Readable } from 'stream';

if (!ffmpegPath) {
  throw new Error('ffmpeg-static path not found');
}

ffmpeg.setFfmpegPath(ffmpegPath);

export class Encoder {
  private rtmp: string;
  private dir: string;
  private persistentDir: string;
  private streams: {
    type: string;
    stream: ffmpeg.FfmpegCommand;
  }[] = [];

  constructor(private liveId: number, watchToken: string, pushToken: string) {
    this.rtmp = `rtmp://srs:1935/live/${liveId}_${watchToken}?token=${pushToken}`;
    this.dir = `/home/node/static/live/${liveId}_${watchToken}`;
    this.persistentDir = `/home/node/persistent/${liveId}_${watchToken}`;
  }

  async cleanup(removeDir = true) {
    this.streams.forEach(stream => {
      stream.stream.kill('SIGKILL');
    });

    if (removeDir) {
      try {
        await rm(this.dir, { recursive: true });
      } catch (e) {
        //
      }
    }
  }

  private async cleanupDirectory(name: string) {
    const path = `${this.dir}/${name}`;

    try {
      await rm(path, { recursive: true });
    } catch (e) {
      //
    }
    await mkdir(path, { recursive: true });

    return path;
  }

  async encodeToMp4() {
    if (this.streams.find(s => s.type === 'mp4')) {
      return;
    }

    const chunkDir = this.persistentDir + '/chunks';
    await mkdir(chunkDir, { recursive: true });

    const timestamp = Math.round(Date.now() / 1000);

    const stream = ffmpeg(this.rtmp)
      .audioCodec('copy')
      .videoCodec('libx264')
      .format('mp4')
      .outputFPS(30)
      .output(`${chunkDir}/${timestamp}.mp4`)
      .inputOptions(['-re', '-preset', 'ultrafast', '-tune', 'zerolatency'])
      .outputOptions([
        '-preset veryfast',
        '-crf 22',
        `-vf scale='if(gt(iw\\,1920)\\,1920\\,iw)':-2`
      ]);

    stream.on('start', (cmd: string) => {
      console.log('Start MP4', this.liveId, cmd);
    });

    stream.on('error', err => {
      console.warn('Error MP4', this.liveId, err);
    });

    stream.on('end', () => {
      console.log('End MP4', this.liveId);
      this.streams = this.streams.filter(s => s.stream !== stream);
    });

    stream.run();
    this.streams.push({
      type: 'mp4',
      stream
    });

    return stream;
  }

  killMp4() {
    const mp4Stream = this.streams.find(s => s.type === 'mp4');
    if (mp4Stream) {
      mp4Stream.stream.kill('SIGKILL');
    }
  }

  async mergeAndCleanupMp4() {
    const mp4Stream = this.streams.find(s => s.type === 'mp4');
    if (mp4Stream) {
      mp4Stream.stream.kill('SIGKILL');
    }

    const chunkDir = this.persistentDir + '/chunks';
    const files = (await readdir(chunkDir))
      .map(f => parseInt(f.split('.')[0], 10))
      .sort((a, b) => a - b)
      .map(f => `${chunkDir}/${f}.mp4`);
    if (files.length === 0) {
      return;
    }

    if (files.length === 1) {
      return files[0];
    }

    return new Promise<string>((resolve, reject) => {
      const stream = ffmpeg();
      files.forEach(f => {
        stream.input(f);
      });
      stream.mergeToFile(`./recording.mp4`, this.persistentDir);

      stream.on('start', (cmd: string) => {
        console.log('Start Merge MP4', this.liveId, cmd);
      });

      stream.on('error', (err: Error) => {
        console.warn('Error Merge MP4', this.liveId, err);
        reject(err);
      });

      stream.on('end', () => {
        console.log('End Merge MP4', this.liveId);

        void rm(chunkDir, { recursive: true });
        resolve(`${this.persistentDir}/recording.mp4`);
      });
    });
  }

  async cleanupMergedMp4() {
    await rm(this.persistentDir, { recursive: true });
  }

  async encodeToLowQualityHls() {
    if (this.streams.find(s => s.type === 'low')) {
      return;
    }

    const path = await this.cleanupDirectory('low');

    const stream = ffmpeg(this.rtmp)
      .audioCodec('aac')
      .audioBitrate('128k')
      .audioChannels(2)
      .videoCodec('libx264')
      .videoBitrate('800k')
      .size('640x360')
      .autopad()
      .format('hls')
      .outputFPS(30)
      .outputOptions([
        '-g 30',
        '-hls_time 1',
        '-hls_list_size 10',
        '-hls_flags delete_segments+omit_endlist'
      ])
      .output(`${path}/stream.m3u8`)
      .inputOptions(['-re', '-preset', 'ultrafast', '-tune', 'zerolatency']);

    stream.on('start', (cmd: string) => {
      console.log('Start LQ-HLS', this.liveId, cmd);
    });

    stream.on('error', err => {
      console.warn('Error LQ-HLS', this.liveId, err);
    });

    stream.on('end', () => {
      console.log('End LQ-HLS', this.liveId);
      this.streams = this.streams.filter(s => s.stream !== stream);
    });

    stream.run();
    this.streams.push({
      type: 'low',
      stream
    });

    return stream;
  }

  async encodeToAudio() {
    if (this.streams.find(s => s.type === 'audio')) {
      return;
    }

    const path = await this.cleanupDirectory('audio');

    const stream = ffmpeg(this.rtmp)
      .audioCodec('copy')
      .noVideo()
      .format('hls')
      .outputOptions([
        '-g 30',
        '-hls_time 1',
        '-hls_list_size 10',
        '-hls_flags delete_segments+omit_endlist'
      ])
      .output(`${path}/stream.m3u8`)
      .inputOptions(['-re', '-preset', 'ultrafast', '-tune', 'zerolatency']);

    stream.on('start', (cmd: string) => {
      console.log('Start Audio', this.liveId, cmd);
    });

    stream.on('error', err => {
      console.warn('Error Audio', this.liveId, err);
    });

    stream.on('end', () => {
      console.log('End Audio', this.liveId);
      this.streams = this.streams.filter(s => s.stream !== stream);
    });

    stream.run();
    this.streams.push({
      type: 'audio',
      stream
    });

    return stream;
  }

  publishToRtmp(pipe: Readable) {
    const stream = ffmpeg(pipe)
      .audioCodec('aac')
      .audioBitrate('128k')
      .audioChannels(2)
      .videoCodec('libx264')
      .videoBitrate('1500k')
      .format('flv')
      .inputOptions(['-re'])
      .outputOptions(['-preset', 'ultrafast', '-tune', 'zerolatency'])
      .output(this.rtmp);

    stream.on('start', (cmd: string) => {
      console.log('Start RTMP', this.liveId, cmd);
    });

    stream.on('error', err => {
      console.warn('Error RTMP', this.liveId, err);
    });

    stream.on('end', () => {
      console.log('End RTMP', this.liveId);
      this.streams = this.streams.filter(s => s.stream !== stream);
    });

    stream.run();
    this.streams.push({
      type: 'rtmp',
      stream
    });

    return stream;
  }

  async generateThumbnail() {
    const path = await this.cleanupDirectory('thumbnails');

    return new Promise<string>((resolve, reject) => {
      const file = `${Math.round(Date.now() / 1000)}.png`;

      const stream = ffmpeg(this.rtmp)
        .noAudio()
        // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/352#issuecomment-136297117
        .outputOptions([
          '-f image2',
          '-vframes 1',
          '-vcodec png',
          '-f rawvideo',
          '-s 1920x1080',
          '-ss 00:00:01'
        ])
        .output(`${path}/${file}`);

      stream.on('start', (cmd: string) => {
        console.log('Start Thumbnail', this.liveId, cmd);
      });

      stream.on('error', (err: Error) => {
        console.warn('Error Thumbnail', this.liveId, err);

        if (err.message.includes('does not contain any stream')) {
          resolve('');
        } else {
          reject(err);
        }
      });

      stream.on('end', () => {
        console.log('End Thumbnail', this.liveId);

        resolve(`${path}/${file}`);
      });

      stream.run();
    });
  }
}
