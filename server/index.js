import config from "./config.js"
import server from "./server.js"
import { logger } from "./util.js"

server()
  .listen(config.port)
  .on("listening", () => logger.info(`Server is running :${config.port}`))

// avoid crash on unhadled/uncaught errors
process.on("uncaughtException", (error) =>
  logger.error(`Uncaught Exception happened: ${error.stack || error} `)
)
process.on("unhandledRejection", (error) =>
  logger.error(`Unhandled Rejection happened: ${error.stack || error} `)
)
