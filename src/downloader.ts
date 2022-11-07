import youtubeDl from "youtube-dl-exec";
import { downloadsDir } from "./constants";
import fs from "fs-extra";

export const DownloadInfo = async (url: string) => {
  const flags = {
    skipDownload: true,
    dumpSingleJson: true,
  };
  const info = await youtubeDl(url, flags);
  return info;
};

export const DownloadAudio = async (url: string) => {
  emptyAudioDir();
  const flags = {
    audioFormat: "mp3",
    extractAudio: true,
    output: "%(title)s.%(ext)s",
  };
  const options = { cwd: downloadsDir.audio };
  await youtubeDl(url, flags, options);
  const files = fs.readdirSync(downloadsDir.audio);
  if (files.length < 1) {
    throw new Error("Error downloading audio");
  }
  return files[0];
};

export const DownloadVideo = async (url: string) => {
  emptyVideoDir();
  const flags = {
    remuxVideo: "mp4",
    output: "%(title)s.%(ext)s",
  };
  const options = { cwd: downloadsDir.video };
  await youtubeDl(url, flags, options);
  const files = fs.readdirSync(downloadsDir.video);
  if (files.length < 1) {
    throw new Error("Error downloading video");
  }
  return files[0];
};

function emptyAudioDir() {
  fs.emptyDirSync(downloadsDir.audio);
}

function emptyVideoDir() {
  fs.emptyDirSync(downloadsDir.video);
}
