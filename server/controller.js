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
    const cmd = command.toLowerCase()
    if (cmd.includes("start")) {
      this.service.startStreaming()
      return { result: command }
    }
    if (cmd.includes("stop")) {
      this.service.stopStreaming()
      return { result: command }
    }

    const chosenSong = await this.service.readFxByName(command)
    logger.info(`added to fx service: ${chosenSong}`)
    this.service.appendFxStream(chosenSong)

    return { result: `${command}` }
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
