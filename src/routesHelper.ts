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
  if (info) {
    if (info.status === DownloadStatus.InProgress) {
      res.status(200).json(info.downloadInfo);
      return true;
    }
    if (
      info.status === DownloadStatus.Complete &&
      info.encodedFileName &&
      info.fullPath
    ) {
      res
        .status(200)
        .set('X-File-Name', info.encodedFileName)
        .sendFile(info.fullPath, { root: './' });
      return true;
    }
    if (info.status === DownloadStatus.Error) {
      res.status(500).json({ message: 'An error occurred while downloading.' });
      requestCache.delete(url, downloadType);
      return true;
    }
  }
  return false;
}

export function encodeRFC5987ValueChars(str: string) {
  return (
    encodeURIComponent(str)
      // Note that although RFC3986 reserves "!", RFC5987 does not,
      // so we do not need to escape it
      .replace(/['()]/g, escape) // i.e., %27 %28 %29
      .replace(/\*/g, '%2A')
      // The following are not required for percent-encoding per RFC5987,
      // so we can allow for a little better readability over the wire: |`^
      .replace(/%(?:7C|60|5E)/g, unescape)
  );
}
