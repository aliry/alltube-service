/* eslint-disable import/first */
import dotenv from "dotenv";
import fs from "fs-extra";
const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: ".env.development" });
}

import app from "./app";
import { downloadsDir } from "./constants";
import logger from "./logger";

const PORT = process.env.PORT || 3000;
fs.ensureDirSync(downloadsDir.video);
fs.ensureDirSync(downloadsDir.audio);

const serve = () =>
  app.listen(PORT, () => {
    logger.info(`🌏 Express server started at http://localhost:${PORT}`);

    if (process.env.NODE_ENV === "development") {
      // This route is only present in development mode
      logger.info(
        `⚙️  Swagger UI hosted at http://localhost:${PORT}/dev/api-docs`
      );
    }
  });

serve();
