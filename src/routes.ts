import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { DownloadAudio, DownloadInfo, DownloadVideo } from './downloader';
import { DownloadType } from './constants';
import { RequestCache } from './requestsCache';
import {
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
    message: 'AllTube service is running!'
  });
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
    const downloadPromise = DownloadAudio(url);
    requestCache.set(url, {
      downloadPromise,
      downloadType: DownloadType.Audio
    });
    res.status(200).json({ message: 'Download started.' });
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
    const downloadPromise = DownloadVideo(url);
    requestCache.set(url, {
      downloadPromise,
      downloadType: DownloadType.Video
    });
    res.status(200).json({ message: 'Download started.' });
  } catch (err) {
    handleDownloadError(err, res);
  }
});

export default router;
