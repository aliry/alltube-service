import {
  DownloadRootFolder,
  DownloadsDir,
  DownloadStatus,
  DownloadType,
  FileExtension
} from './constants';
import fs from 'fs-extra';
import path from 'path';
import logger from './logger';
import getFolderSize from 'get-folder-size';
import { IDownloadInfo } from './downloader';

export interface IRequestInfo {
  downloadPromise: Promise<void>;
  downloadType: DownloadType;
  downloadInfo: IDownloadInfo;
  encodedFileName: string;
  status?: DownloadStatus;
  fullPath?: string;
  createdAt?: number;
}

const CacheRetentionTime = 1000 * 60 * 10; // 10 minutes
const MaxCacheSizeKb = 1024 * 1024 * 500; // 500 MB

export class RequestCache {
  private cache: Map<string, IRequestInfo>;
  private _intervalId?: NodeJS.Timeout;

  constructor() {
    this.cache = new Map();
    this._intervalId = setInterval(
      this.deleteOldRequests.bind(this),
      CacheRetentionTime
    );
  }

  public set(url: string, info: IRequestInfo) {
    this.deleteOldRequests();
    const key = this.generateKey(url, info.downloadType);
    info.createdAt = Date.now();
    info.status = DownloadStatus.InProgress;
    this.cache.set(key, info);
    info.downloadPromise
      .then(() => {
        const requestInfo = this.cache.get(key);
        if (requestInfo) {
          const fileInfo = this.extractFolderAndExt(requestInfo);
          requestInfo.fullPath = path.join(
            fileInfo.folder,
            requestInfo.encodedFileName
          );
          requestInfo.status = DownloadStatus.Complete;
        }
      })
      .catch((error: unknown) => {
        const requestInfo = this.cache.get(key);
        if (requestInfo) {
          requestInfo.status = DownloadStatus.Error;
        }
        console.log(error);
      });
  }

  public get(url: string, downloadType: DownloadType) {
    const key = this.generateKey(url, downloadType);
    return this.cache.get(key);
  }

  public delete(url: string, downloadType: DownloadType) {
    const key = this.generateKey(url, downloadType);
    this.cache.delete(key);
  }

  public dispose() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }

  private generateKey(url: string, downloadType: DownloadType) {
    const downloadTypeStr =
      downloadType === DownloadType.Audio ? 'audio' : 'video';
    return `${downloadTypeStr}|${url}`;
  }

  private deleteOldRequests() {
    setTimeout(async () => {
      const shouldDelete = await this.isMaxCacheSizeExceeded();
      if (!shouldDelete) {
        return;
      }
      const deletePromises: Promise<void>[] = [];
      this.cache.forEach((info, key) => {
        if (
          info.status !== DownloadStatus.InProgress &&
          info.createdAt &&
          info.createdAt < Date.now() - CacheRetentionTime
        ) {
          deletePromises.push(
            new Promise<void>((resolve) => {
              fs.promises.rm(info.fullPath ?? '').finally(() => {
                this.cache.delete(key);
                resolve();
              });
            })
          );
        }
      });

      Promise.all(deletePromises).then(() => {
        logger.info(
          `Cache cleanup completed. Deleted ${deletePromises.length} items`
        );
      });
    }, 500);
  }

  private async isMaxCacheSizeExceeded() {
    return new Promise<boolean>((resolve) => {
      const dirPath = path.join(__dirname, '../', DownloadRootFolder);
      getFolderSize(dirPath, (err, size) => resolve(size > MaxCacheSizeKb));
    });
  }

  private extractFolderAndExt(requestInfo: IRequestInfo): {
    folder: string;
    ext: string;
  } {
    if (requestInfo.downloadType === DownloadType.Audio) {
      return {
        folder: DownloadsDir.Audio,
        ext: FileExtension.Audio
      };
    }
    if (requestInfo.downloadType === DownloadType.Video) {
      return {
        folder: DownloadsDir.Video,
        ext: FileExtension.Video
      };
    }
    throw 'Invalid request info.';
  }
}
