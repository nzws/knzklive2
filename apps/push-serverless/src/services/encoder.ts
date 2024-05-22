import ffmpeg from 'fluent-ffmpeg';
import { mkdir, readdir, rm } from 'fs/promises';
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
  private srtPublish: string;
  private srtRequest: string;
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
    const stream = `${liveId}_${watchToken}`;
    this.rtmp = `rtmp://localhost:1935/live/${stream}?token=${pushToken}`;
    // this.srtPublish = `srt://localhost:10080?streamid=#!::r=live/${stream},token=${pushToken},m=publish`;
    // this.srtRequest = `srt://localhost:10080?streamid=#!::r=live/${stream},token=${pushToken},m=request`;
    this.srtPublish = this.rtmp;
    this.srtRequest = this.rtmp;
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

  async encodeToRecording(remainingSeconds: number) {
    if (this.streams.find(s => s.type === 'recording')) {
      return;
    }

    const chunkDir = this.persistentDir + '/chunks';
    await mkdir(chunkDir, { recursive: true });

    const timestamp = Math.round(Date.now() / 1000);

    const stream = ffmpeg(this.srtRequest)
      .audioCodec('aac')
      .audioBitrate('128k')
      .audioChannels(2)
      .videoCodec('libx264')
      .videoBitrate('2500k')
      .size('1920x1080')
      .autopad()
      .format('mp4')
      .output(`${chunkDir}/${timestamp}.mp4`)
      .outputOptions(['-async 1', '-vsync 1', '-filter:v fps=30'])
      .duration(remainingSeconds);

    stream.on('start', (cmd: string) => {
      console.log(
        'Start Recording',
        this.liveId,
        `remaining: ${remainingSeconds}s`,
        cmd
      );
    });

    stream.on('error', err => {
      console.warn('Error Recording', this.liveId, err);
    });

    stream.on('end', () => {
      console.log('End Recording', this.liveId);
      this.streams = this.streams.filter(s => s.stream !== stream);
    });

    stream.run();
    this.streams.push({
      type: 'recording',
      stream,
      onRequestClose: () => {
        return new Promise((resolve, reject) => {
          console.log('Request close Recording', this.liveId);
          const timeout = setTimeout(
            () => {
              console.warn('Timeout Recording', this.liveId);
              stream.kill('SIGKILL');
            },
            1000 * 60 * 5
          ); // 5 minutes

          stream.on('end', () => {
            clearTimeout(timeout);
            resolve();
          });

          stream.on('error', err => {
            clearTimeout(timeout);
            reject(err);
          });

          // @ts-expect-error: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/900
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          stream.ffmpegProc.stdin.write('q');
        });
      }
    });

    return stream;
  }

  async mergeRecording() {
    const recordingStream = this.streams.find(s => s.type === 'recording');
    if (recordingStream) {
      recordingStream.stream.kill('SIGKILL');
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
      const filePath = `${this.persistentDir}/recording.mp4`;
      const stream = ffmpeg();
      files.forEach(f => {
        stream.input(f);
      });
      stream.mergeToFile(filePath, this.persistentDir);

      stream.on('start', (cmd: string) => {
        console.log('Start Merge Recording', this.liveId, cmd);
      });

      stream.on(
        'progress',
        (progress: { frames: number; percent?: string }) => {
          console.log(
            'Progress Merge Recording',
            this.liveId,
            progress.frames,
            progress.percent
          );
        }
      );

      stream.on('error', (err: Error) => {
        console.warn('Error Merge Recording', this.liveId, err);
        reject(err);
      });

      stream.on('end', () => {
        console.log('End Merge Recording', this.liveId);

        resolve(filePath);
      });
    });
  }

  async cleanupMergedRecording() {
    await rm(this.persistentDir, { recursive: true });
  }

  async encodeToHighQualityHls() {
    if (this.streams.find(s => s.type === 'high')) {
      return;
    }

    const idx = Math.round(Date.now() / 1000);
    const path = await this.cleanupDirectory('high');

    const stream = ffmpeg(this.srtRequest)
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

    const stream = ffmpeg(this.srtRequest)
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

    const stream = ffmpeg(this.srtRequest)
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
      .outputOptions([
        '-preset',
        'ultrafast',
        '-tune',
        'zerolatency'
        // '-pes_payload_size',
        // '0'
      ])
      .output(this.srtPublish);

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

      const stream = ffmpeg(this.srtRequest)
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
