import { Router, Response } from "express";
import swaggerUi from "swagger-ui-express";
import logger from "./logger";
import { DownloadAudio, DownloadInfo, DownloadVideo } from "./downloader";
import { DownloadsDir, DownloadStatus, DownloadType } from "./constants";
import { RequestCache } from "./requestsCache";

const swaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
};
const apiSpec: swaggerUi.JsonObject = require("../openapi.json");

const router = Router();

const requestCache = new RequestCache();

// Dev routes
if (process.env.NODE_ENV === "development") {
  router.use("/dev/api-docs", swaggerUi.serve);
  router.get("/dev/api-docs", swaggerUi.setup(apiSpec, swaggerUiOptions));
}

router.get("/", (req, res) => {
  res.json({
    message: "AllTube service is running!",
  });
});

router.get("/api/dl-info", async (req, res) => {
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

router.get("/api/dl-audio", async (req, res) => {
  const url = req.query.url as string;
  if (!validateURL(url, res)) {
    return;
  }
  try {
    if (respondIfRequestExist(url, DownloadType.Audio, res)) {
      return;
    }
    const downloadPromise = DownloadAudio(url);
    requestCache.set(url, {
      downloadPromise,
      downloadType: DownloadType.Audio,
    });
    res.status(200).json({ message: "Download started." });
  } catch (err) {
    handleDownloadError(err, res);
  }
});

router.get("/api/dl-video", async (req, res) => {
  const url = req.query.url as string;
  if (!validateURL(url, res)) {
    return;
  }
  try {
    if (respondIfRequestExist(url, DownloadType.Video, res)) {
      return;
    }
    const downloadPromise = DownloadVideo(url);
    requestCache.set(url, {
      downloadPromise,
      downloadType: DownloadType.Video,
    });
    res.status(200).json({ message: "Download started." });
  } catch (err) {
    handleDownloadError(err, res);
  }
});

function validateURL(url: string, res: Response): boolean {
  try {
    new URL(url);
    return true;
  } catch (err) {
    res.status(400).json({
      message: "Invalid or missing URL parameter.",
    });
    return false;
  }
}

function handleDownloadError(err: unknown, res: Response) {
  logger.error(err);
  res.status(500).json({ message: "An error occurred while downloading." });
}

function respondIfRequestExist(
  url: string,
  downloadType: DownloadType,
  res: Response
): boolean {
  const info = requestCache.get(url, downloadType);
  if (!info) {
    return false;
  }
  if (info.status === DownloadStatus.InProgress) {
    res.status(200).json({ message: "Download in progress." });
  } else if (info.status === DownloadStatus.Complete && info.fileName) {
    res.status(200).sendFile(info.fileName, {
      root:
        downloadType === DownloadType.Audio
          ? DownloadsDir.Audio
          : DownloadsDir.Video,
    });
  }
  return true;
}

export default router;
