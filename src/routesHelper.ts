import fs from 'fs-extra';
import logger from './logger';
import { DownloadStatus, DownloadType } from './constants';
import { RequestCache } from './requestsCache';
import { Response } from 'express';

export function validateURL(url: string, res: Response): boolean {
  try {
    new URL(url);
    return true;
  } catch (err) {
    res.status(400).json({
      message: 'Invalid or missing URL parameter.'
    });
    return false;
  }
}

export function handleDownloadError(err: unknown, res: Response) {
  logger.error(err);
  res.status(500).json({ message: 'An error occurred while downloading.' });
}

export function respondIfRequestExist(
  url: string,
  downloadType: DownloadType,
  res: Response,
  requestCache: RequestCache
): boolean {
  const info = requestCache.get(url, downloadType);
  if (!info) {
    return false;
  }
  if (info.status === DownloadStatus.InProgress) {
    res.status(200).json({ message: 'Download in progress.' });
    return true;
  }
  if (
    info.status === DownloadStatus.Complete &&
    info.filePath &&
    fs.existsSync(info.filePath)
  ) {
    res.status(200).sendFile(info.filePath, { root: './' });
    return true;
  }
  return false;
}
