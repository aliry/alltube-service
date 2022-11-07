import youtubeDl from "youtube-dl-exec";
import fs from "fs";

export const DownloadAudio = async (url: string) => {
  return await youtubeDl.exec(url, {
    audioFormat: "mp3",
    extractAudio: true,
    output: "%(title)s.%(ext)s",
  });
};
