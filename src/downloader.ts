import youtubeDl from 'youtube-dl-exec';
import { DownloadsDir, FileExtension } from './constants';

export interface IDownloadInfo {
  title: string;
  id: string;
  thumbnail: string;
  description: string;
  duration: number;
}

const OutputFormat = '%(title)s.%(ext)s';

export const DownloadInfo = async (url: string): Promise<IDownloadInfo> => {
  const flags = {
    dumpJson: true
  };
  const info = await youtubeDl(url, flags);
  return {
    title: info.title,
    thumbnail: info.thumbnail,
    id: info.id,
    description: info.description,
    duration: info.duration
  };
};

export const DownloadAudio = async (url: string) => {
  const flags = {
    audioFormat: FileExtension.Audio,
    extractAudio: true,
    output: OutputFormat,
    addMetadata: true,
    embedThumbnail: true
  };
  const options = { cwd: DownloadsDir.Audio };
  await youtubeDl(url, flags, options);
};

export const DownloadVideo = async (url: string) => {
  const flags = {
    remuxVideo: FileExtension.Video,
    embedThumbnail: true,
    output: OutputFormat
  };
  const options = { cwd: DownloadsDir.Video };
  await youtubeDl(url, flags, options);
};
