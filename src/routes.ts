import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import {
  DownloadAudio,
  DownloadInfo,
  DownloadVideo,
  IDownloadInfo
} from './downloader';
import { DownloadStatus, DownloadType, FileExtension } from './constants';
import { RequestCache } from './requestsCache';
import {
  encodeRFC5987ValueChars,
  handleDownloadError,
  respondIfRequestExist,
  validateURL
} from './routesHelper';

const requestCache = new RequestCache();

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }'
};
import apiSpec from '../openapi.json';

const router = Router();

// Dev routes
if (process.env.NODE_ENV === 'development') {
  router.use('/dev/api-docs', swaggerUi.serve);
  router.get('/dev/api-docs', swaggerUi.setup(apiSpec, swaggerUiOptions));
}

router.get('/', (req, res) => {
  res.json({
    message: 'AllTube service is running!',
    revision: '1.0.6'
  });
});

router.get('/hidden/error-log', (req, res) => {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.HIDDEN_ROUTE_KEY &&
    req.headers['x-hidden-route-key'] === process.env.HIDDEN_ROUTE_KEY
  ) {
    res.sendFile('error.log', { root: './logs' });
  } else {
    res.status(404).end();
  }
});

router.get('/api/dl-info', async (req, res) => {
  const url = req.query.url as string;
  if (!validateURL(url, res)) {
    return;
  }
  try {
    const info = await DownloadInfo(url);
    res.status(200).json(info);
  } catch (err) {
    handleDownloadError(err, res);
  }
});

router.get('/api/dl-audio', async (req, res) => {
  const url = req.query.url as string;
  if (!validateURL(url, res)) {
    return;
  }
  try {
    if (respondIfRequestExist(url, DownloadType.Audio, res, requestCache)) {
      return;
    }
    const info = await DownloadInfo(url);
    const encodedFileName = getFileName(info, DownloadType.Audio);
    const downloadPromise = DownloadAudio(url, encodedFileName);
    requestCache.set(url, {
      downloadInfo: info,
      downloadPromise,
      downloadType: DownloadType.Audio,
      encodedFileName
    });
    info.status = DownloadStatus.InProgress;
    res.status(200).json(info);
  } catch (err) {
    handleDownloadError(err, res);
  }
});

router.get('/api/dl-video', async (req, res) => {
  const url = req.query.url as string;
  if (!validateURL(url, res)) {
    return;
  }
  try {
    if (respondIfRequestExist(url, DownloadType.Video, res, requestCache)) {
      return;
    }
    const info = await DownloadInfo(url);
    const encodedFileName = getFileName(info, DownloadType.Video);
    const downloadPromise = DownloadVideo(url, encodedFileName);
    requestCache.set(url, {
      downloadInfo: info,
      downloadPromise,
      downloadType: DownloadType.Video,
      encodedFileName
    });
    info.status = DownloadStatus.InProgress;
    res.status(200).json(info);
  } catch (err) {
    handleDownloadError(err, res);
  }
});

function getFileName(info: IDownloadInfo, type: DownloadType) {
  const extension =
    type === DownloadType.Audio ? FileExtension.Audio : FileExtension.Video;
  let fileName = info.title;

  if (fileName && fileName.length > 0) {
    let encodedFileName = encodeRFC5987ValueChars(fileName);
    while (encodedFileName.length > 200) {
      fileName = fileName.substring(0, fileName.length - 3);
      encodedFileName = encodeRFC5987ValueChars(fileName);
    }
    return `${encodedFileName}.${extension}`;
  } else {
    return `${info.id}.${extension}`;
  }
}

export default router;
