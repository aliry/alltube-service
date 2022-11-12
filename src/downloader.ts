import youtubeDl from 'youtube-dl-exec';
import { DownloadsDir, FileExtension } from './constants';
import path from 'path';

export interface IDownloadInfo {
  title: string;
  id: string;
  description: string;
  duration: number;
}

const OutputFormat = '%(title)s.%(ext)s';

export const DownloadInfo = async (url: string): Promise<IDownloadInfo> => {
  const flags = {
    skipDownload: true,
    dumpSingleJson: true
  };
  const info = await youtubeDl(url, flags);
  return {
    title: info.title,
    id: info.id,
    description: info.description,
    duration: info.duration
  };
};

export const DownloadAudio = async (url: string) => {
  const flags = {
    audioFormat: FileExtension.Audio,
    extractAudio: true,
    output: OutputFormat
  };
  const options = { cwd: DownloadsDir.Audio };
  try {
    const info = await youtubeDl(url, flags, options);
    const fileName = getFileNameFromYtDlOutput(info);
    return path.join(DownloadsDir.Audio, `${fileName}.${FileExtension.Audio}`);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const DownloadVideo = async (url: string) => {
  const flags = {
    remuxVideo: FileExtension.Video,
    output: OutputFormat
  };
  const options = { cwd: DownloadsDir.Video };
  const info = await youtubeDl(url, flags, options);
  const fileName = getFileNameFromYtDlOutput(info);

  return path.join(DownloadsDir.Video, `${fileName}.${FileExtension.Video}`);
};

function getFileNameFromYtDlOutput(output: unknown): string {
  const lines = (output as string).split('\n');
  for (const line of lines) {
    if (line.startsWith('[download] Destination:')) {
      return line
        .substring('[download] Destination:'.length)
        .split('.')[0]
        .trim();
    }
  }
  return '';
}
