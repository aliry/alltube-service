import youtubeDl from 'youtube-dl-exec';
import { DownloadsDir, FileExtension } from './constants';

export interface IDownloadInfo {
  title: string;
  id: string;
  thumbnail: string;
  description: string;
  duration: number;
}

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

export const DownloadAudio = async (url: string, fileName: string) => {
  const flags = {
    audioFormat: FileExtension.Audio,
    extractAudio: true,
    output: fileName,
    addMetadata: true
  };
  const options = { cwd: DownloadsDir.Audio };
  await youtubeDl(url, flags, options);
};

export const DownloadVideo = async (url: string, fileName: string) => {
  const flags = {
    recodeVideo: FileExtension.Video,
    output: fileName
  };
  const options = { cwd: DownloadsDir.Video };
  await youtubeDl(url, flags, options);
};
