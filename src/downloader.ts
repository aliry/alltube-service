import youtubeDl from "youtube-dl-exec";
import { DownloadsDir, FileExtension } from "./constants";
import fs from "fs-extra";

export interface IDownloadInfo {
  title: string;
  id: string;
  description: string;
  duration: number;
}

const OutputFormat = "%(title)s.%(ext)s";

export const DownloadInfo = async (url: string): Promise<IDownloadInfo> => {
  const flags = {
    skipDownload: true,
    dumpSingleJson: true,
  };
  const info = await youtubeDl(url, flags);
  return {
    title: info.title,
    id: info.id,
    description: info.description,
    duration: info.duration,
  };
};

export const DownloadAudio = async (url: string) => {
  emptyAudioDir();
  const flags = {
    audioFormat: FileExtension.Audio,
    extractAudio: true,
    output: OutputFormat,
  };
  const options = { cwd: DownloadsDir.Audio };
  await youtubeDl(url, flags, options);
  const files = fs.readdirSync(DownloadsDir.Audio);
  if (files.length < 1) {
    throw new Error("Error downloading audio");
  }
  return files[0];
};

export const DownloadVideo = async (url: string) => {
  emptyVideoDir();
  const flags = {
    remuxVideo: FileExtension.Video,
    output: OutputFormat,
  };
  const options = { cwd: DownloadsDir.Video };
  await youtubeDl(url, flags, options);
  const files = fs.readdirSync(DownloadsDir.Video);
  if (files.length < 1) {
    throw new Error("Error downloading video");
  }
  return files[0];
};

function emptyAudioDir() {
  fs.emptyDirSync(DownloadsDir.Audio);
}

function emptyVideoDir() {
  fs.emptyDirSync(DownloadsDir.Video);
}
