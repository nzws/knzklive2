import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { mkdir, rm } from 'fs/promises';

if (!ffmpegPath) {
  throw new Error('ffmpeg-static path not found');
}

ffmpeg.setFfmpegPath(ffmpegPath);

export const getDirectory = (liveId: number, watchToken: string) =>
  `/home/node/static/${liveId}_${watchToken}`;

export class Encoder {
  private dir: string;
  private streams: {
    type: string;
    stream: ffmpeg.FfmpegCommand;
  }[] = [];

  constructor(
    private videoPath: string,
    private liveId: number,
    watchToken: string
  ) {
    this.dir = getDirectory(liveId, watchToken);
  }

  killAll() {
    this.streams.forEach(stream => {
      stream.stream.kill('SIGKILL');
    });
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

  async encodeToHqHls() {
    if (this.streams.find(s => s.type === 'hq')) {
      return;
    }
    const dir = await this.cleanupDirectory('hq');

    const stream = ffmpeg(this.videoPath)
      .format('hls')
      .outputOptions(['-hls_time 5', '-hls_list_size 0'])
      .output(`${dir}/index.m3u8`);

    this.streams.push({
      type: 'hq',
      stream
    });

    return new Promise<void>((resolve, reject) => {
      stream.on('start', (cmd: string) => {
        console.log('Start HQ', this.liveId, cmd);
      });

      stream.on(
        'progress',
        (progress: { frames: number; percent?: string }) => {
          console.log(
            'Progress HQ',
            this.liveId,
            progress.frames,
            progress.percent
          );
        }
      );

      stream.on('error', err => {
        console.warn('Error HQ', this.liveId, err);
        this.streams = this.streams.filter(s => s.stream !== stream);
        void this.cleanupDirectory('hq');
        reject(err);
      });

      stream.on('end', () => {
        console.log('End HQ', this.liveId);
        this.streams = this.streams.filter(s => s.stream !== stream);
        resolve();
      });

      stream.run();
    });
  }
}
