import { DownloadRootFolder, DownloadStatus, DownloadType } from './constants';
import fs from 'fs-extra';
import path from 'path';
import logger from './logger';
import getFolderSize from 'get-folder-size';

export interface IRequestInfo {
  downloadPromise: Promise<string>;
  downloadType: DownloadType;
  status?: DownloadStatus;
  filePath?: string;
  createdAt?: number;
}

const CacheRetentionTime = 1000 * 60 * 10; // 10 minutes
const MaxCacheSizeKb = 1024 * 1024 * 500; // 500 MB

export class RequestCache {
  private cache: Map<string, IRequestInfo>;

  constructor() {
    this.cache = new Map();
    setInterval(this.deleteOldRequests.bind(this), CacheRetentionTime);
  }

  public set(url: string, info: IRequestInfo) {
    this.deleteOldRequests();
    const key = this.generateKey(url, info.downloadType);
    info.createdAt = Date.now();
    info.status = DownloadStatus.InProgress;
    this.cache.set(key, info);
    info.downloadPromise
      .then((filePath) => {
        const requestInfo = this.cache.get(key);
        if (requestInfo) {
          requestInfo.filePath = filePath;
          requestInfo.status = DownloadStatus.Complete;
        }
      })
      .catch(() => {
        const requestInfo = this.cache.get(key);
        if (requestInfo) {
          requestInfo.status = DownloadStatus.Error;
        }
      });
  }

  public get(url: string, downloadType: DownloadType) {
    const key = this.generateKey(url, downloadType);
    return this.cache.get(key);
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
              fs.promises.rm(info.filePath ?? '').finally(() => {
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
}
