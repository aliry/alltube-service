/* eslint-disable no-unused-vars */
export const DownloadRootFolder = './downloads';
export const DownloadsDir = {
  Audio: `${DownloadRootFolder}/audio`,
  Video: `${DownloadRootFolder}/video`
};

export const enum DownloadType {
  Audio,
  Video
}

export const enum DownloadStatus {
  InProgress,
  Complete,
  Error
}

export const FileExtension = {
  Audio: 'mp3',
  Video: 'mp4'
};
