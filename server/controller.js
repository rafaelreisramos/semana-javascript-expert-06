import { Service } from "./service.js"
import { logger } from "./util.js"

export class Controller {
  constructor() {
    this.service = new Service()
  }

  async getFileStream(filename) {
    return this.service.getFileStream(filename)
  }

  async handleCommand({ command }) {
    logger.info(`Command received: ${command}`)
    const result = { result: "ok" }
    const cmd = command.toLowerCase()
    if (cmd.includes("start")) {
      this.service.startStreaming()
      return result
    }
    if (cmd.includes("stop")) {
      this.service.stopStreaming()
      return result
    }
  }

  createClientStream() {
    const { id, stream } = this.service.createClientStream()

    const onClose = () => {
      logger.info(`closing connection of ${id}`)
      this.service.removeClientStream(id)
    }

    return {
      stream,
      onClose,
    }
  }
}
