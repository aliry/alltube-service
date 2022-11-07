import { createLogger, format, transports } from "winston";
import ConsoleLoggerTransport from "./transports/winston-console-transport";

const logTransports = [
  new transports.File({
    level: "error",
    filename: "./logs/error.log",
    format: format.json({
      replacer: (key: string, value: unknown) => {
        if (key === "error") {
          return {
            message: (value as Error).message,
            stack: (value as Error).stack,
          };
        }
        return value;
      },
    }),
  }),
  new ConsoleLoggerTransport(),
];

const logger = createLogger({
  format: format.combine(format.timestamp()),
  transports: logTransports,
  defaultMeta: { service: "api" },
  level: process.env.NODE_ENV === "development" ? "silly" : "info",
});

export default logger;
