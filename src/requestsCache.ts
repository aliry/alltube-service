import { DownloadsDir, DownloadStatus, DownloadType } from "./constants";
import fs from "fs-extra";
import path from "path";

export interface IRequestInfo {
  downloadPromise: Promise<string>;
  downloadType: DownloadType;
  status?: DownloadStatus;
  fileName?: string;
  createdAt?: number;
}

const CacheRetentionTime = 1000 * 60 * 1;

export class RequestCache {
  private cache: Map<string, IRequestInfo>;

  constructor() {
    this.cache = new Map();
    setInterval(this.deleteOldRequests.bind(this), CacheRetentionTime);
  }

  public set(url: string, info: IRequestInfo) {
    const key = this.generateKey(url, info.downloadType);
    info.createdAt = Date.now();
    info.status = DownloadStatus.InProgress;
    this.cache.set(key, info);
    info.downloadPromise
      .then((fileName) => {
        const requestInfo = this.cache.get(key);
        if (requestInfo) {
          requestInfo.fileName = fileName;
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

  public has(url: string, downloadType: DownloadType) {
    const key = this.generateKey(url, downloadType);
    return this.cache.has(key);
  }

  public delete(url: string, downloadType: DownloadType) {
    const key = this.generateKey(url, downloadType);
    this.cache.delete(key);
  }

  public clear() {
    this.cache.clear();
  }

  public get size() {
    return this.cache.size;
  }

  private generateKey(url: string, downloadType: DownloadType) {
    const downloadTypeStr =
      downloadType === DownloadType.Audio ? "audio" : "video";
    return `${downloadTypeStr}|${url}`;
  }

  private deleteOldRequests() {
    const deletePromises: Promise<void>[] = [];
    this.cache.forEach((info, key) => {
      if (
        info.status !== DownloadStatus.InProgress &&
        info.createdAt &&
        info.createdAt < Date.now() - CacheRetentionTime
      ) {
        deletePromises.push(
          new Promise<void>((resolve) => {
            const filePath = path.join(
              info.downloadType === DownloadType.Audio
                ? DownloadsDir.Audio
                : DownloadsDir.Video,
              info.fileName ?? ""
            );
            fs.promises.rm(filePath).finally(() => {
              this.cache.delete(key);
              resolve();
            });
          })
        );
      }
    });

    Promise.all(deletePromises);
  }
}
