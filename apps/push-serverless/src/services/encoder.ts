import ffmpeg from 'fluent-ffmpeg';
import { mkdir, rm } from 'fs/promises';
import { Readable } from 'stream';

const ffmpegPath = process.env.FFMPEG_PATH;
const ffprobePath = process.env.FFPROBE_PATH;

if (!ffmpegPath || !ffprobePath) {
  throw new Error('ffmpeg or ffprobe path not found');
}

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export class Encoder {
  private rtmp: string;
  private dir: string;
  private persistentDir: string;
  private streams: {
    type: string;
    stream: ffmpeg.FfmpegCommand;
    onRequestClose: () => Promise<void>;
  }[] = [];

  constructor(
    private liveId: number,
    watchToken: string,
    pushToken: string
  ) {
    this.rtmp = `rtmp://localhost:1935/live/${liveId}_${watchToken}?token=${pushToken}`;
    this.dir = `/tmp/knzklive/static/live/${liveId}_${watchToken}`;
    this.persistentDir = `/tmp/knzklive/record/${liveId}_${watchToken}`;
  }

  async cleanup(removeDir = true) {
    await Promise.all(this.streams.map(s => s.onRequestClose()));

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

  async encodeToHighQualityHls() {
    if (this.streams.find(s => s.type === 'high')) {
      return;
    }

    const idx = Math.round(Date.now() / 1000);
    const path = await this.cleanupDirectory('high');

    const stream = ffmpeg(this.rtmp)
      .audioCodec('copy')
      .videoCodec('copy')
      .autopad()
      .format('hls')
      .outputOptions([
        '-g 30',
        '-hls_time 1',
        '-hls_list_size 10',
        '-hls_flags delete_segments+omit_endlist',
        `-hls_segment_filename ${path}/${idx}-%d.ts`
      ])
      .output(`${path}/stream.m3u8`)
      .inputOptions(['-re', '-preset', 'ultrafast', '-tune', 'zerolatency']);

    stream.on('start', (cmd: string) => {
      console.log('Start HQ-HLS', this.liveId, cmd);
    });

    stream.on('error', err => {
      console.warn('Error HQ-HLS', this.liveId, err);
    });

    stream.on('end', () => {
      console.log('End HQ-HLS', this.liveId);
      this.streams = this.streams.filter(s => s.stream !== stream);
    });

    stream.run();
    this.streams.push({
      type: 'high',
      stream,
      onRequestClose() {
        stream.kill('SIGKILL');

        return Promise.resolve();
      }
    });

    return stream;
  }

  async encodeToLowQualityHls() {
    if (this.streams.find(s => s.type === 'low')) {
      return;
    }

    const idx = Math.round(Date.now() / 1000);
    const path = await this.cleanupDirectory('low');

    const stream = ffmpeg(this.rtmp)
      .audioCodec('aac')
      .audioBitrate('128k')
      // .audioChannels(2)
      .videoCodec('libx264')
      .videoBitrate('800k')
      .size('640x360')
      .autopad()
      .format('hls')
      .outputOptions([
        '-g 30',
        '-hls_time 2',
        '-hls_list_size 10',
        '-hls_flags delete_segments+omit_endlist',
        `-hls_segment_filename ${path}/${idx}-%d.ts`,
        '-filter:v fps=30'
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
      stream,
      onRequestClose() {
        stream.kill('SIGKILL');

        return Promise.resolve();
      }
    });

    return stream;
  }

  async encodeToAudio() {
    if (this.streams.find(s => s.type === 'audio')) {
      return;
    }

    const idx = Math.round(Date.now() / 1000);
    const path = await this.cleanupDirectory('audio');

    const stream = ffmpeg(this.rtmp)
      .audioCodec('copy')
      .noVideo()
      .format('hls')
      .outputOptions([
        '-g 30',
        '-hls_time 1',
        '-hls_list_size 10',
        '-hls_flags delete_segments+omit_endlist',
        `-hls_segment_filename ${path}/${idx}-%d.ts`
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
      stream,
      onRequestClose() {
        stream.kill('SIGKILL');

        return Promise.resolve();
      }
    });

    return stream;
  }

  publishToRtmp(pipe: Readable) {
    const stream = ffmpeg(pipe)
      .audioCodec('aac')
      .audioBitrate('128k')
      // .audioChannels(2)
      .videoCodec('libx264')
      .videoBitrate('1000k')
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
      stream,
      onRequestClose() {
        stream.kill('SIGKILL');

        return Promise.resolve();
      }
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
