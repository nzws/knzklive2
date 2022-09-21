import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { mkdir, rm, rmdir } from 'fs/promises';

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

  async cleanup() {
    this.streams.forEach(stream => {
      stream.kill('SIGKILL');
    });

    try {
      await rmdir(this.dir, { recursive: true });
    } catch (e) {
      //
    }
  }

  async encodeToLowQualityHls() {
    try {
      await rm(`${this.dir}/low`, { recursive: true });
    } catch (e) {
      //
    }
    await mkdir(`${this.dir}/low`, { recursive: true });

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
      .output(`${this.dir}/low/stream.m3u8`)
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
    try {
      await rm(`${this.dir}/audio`, { recursive: true });
    } catch (e) {
      //
    }
    await mkdir(`${this.dir}/audio`, { recursive: true });

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
      .output(`${this.dir}/audio/stream.m3u8`)
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
}
