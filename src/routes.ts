import { Router } from "express";
import swaggerUi from "swagger-ui-express";

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

export default router;
