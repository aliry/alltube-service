import youtubeDl from 'youtube-dl-exec';
import { DownloadsDir, DownloadStatus, FileExtension } from './constants';

export interface IDownloadInfo {
  title: string;
  id: string;
  thumbnail: string;
  description: string;
  duration: number;
  status?: DownloadStatus;
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
    /*
     * Download format:
     * 1- best video with height < 800 in ${FileExtension.Video} format + best audio in m4a format
     * 2- best in ${FileExtension.Video} format
     * 3- best video with height < 800 in any format (webm)
     * 4- Second best video in any format
     */
    format: `bv*[ext=${FileExtension.Video}][height<800]+ba[ext=m4a]/b[ext=${FileExtension.Video}]/bv*[height<800]/bv.2`,
    output: fileName
  };
  const options = { cwd: DownloadsDir.Video };
  await youtubeDl(url, flags, options);
};
