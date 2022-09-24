import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { mkdir, rm } from 'fs/promises';
import { Readable } from 'stream';

if (!ffmpegPath) {
  throw new Error('ffmpeg-static path not found');
}

ffmpeg.setFfmpegPath(ffmpegPath);

export class Encoder {
  private rtmp: string;
  private dir: string;
  private streams: ffmpeg.FfmpegCommand[] = [];

  constructor(private liveId: number, watchToken: string, pushToken: string) {
    this.rtmp = `rtmp://srs:1935/live/${liveId}_${watchToken}?token=${pushToken}`;
    this.dir = `/home/node/static/live/${liveId}_${watchToken}`;
  }

  async cleanup(removeDir = true) {
    this.streams.forEach(stream => {
      stream.kill('SIGKILL');
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

  async encodeToLowQualityHls() {
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
      this.streams = this.streams.filter(s => s !== stream);
    });

    stream.run();
    this.streams.push(stream);

    return stream;
  }

  async encodeAudio() {
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
      this.streams = this.streams.filter(s => s !== stream);
    });

    stream.run();
    this.streams.push(stream);

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
      this.streams = this.streams.filter(s => s !== stream);
    });

    stream.run();
    this.streams.push(stream);

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
