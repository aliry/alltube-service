import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import logger from "./logger";
import { DownloadAudio } from "./downloader";

const swaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
};
const apiSpec: swaggerUi.JsonObject = require("../openapi.json");

const router = Router();

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

router.get("/api/dl-audio", (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({
      message: "Missing URL parameter",
    });
    return;
  }
  DownloadAudio(url)
    .then(() => {
      res.status(200).json({ message: "Downloaded audio successfully" });
    })
    .catch((err: unknown) => {
      logger.error(err);
      res
        .status(500)
        .json({ message: "An error occurred while downloading the audio" });
    });
});

export default router;
