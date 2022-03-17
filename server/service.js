import fs from "fs"
import streamPromises from "stream/promises"
import { randomUUID } from "crypto"
import { join, extname } from "path"
import { PassThrough, Writable } from "stream"
import Throttle from "throttle"
import childProcess from "child_process"
import { once } from "events"
import config from "./config.js"
import { logger } from "./util.js"

const {
  dir: { publicDir },
  constants: { fallbackBitRate, bitrateDivisor, englishConversation },
} = config

export class Service {
  constructor() {
    this.clientStreams = new Map()
    this.currentSong = englishConversation
    this.currentBitrate = 0
    this.throttleTransform = {}
    this.currentReadable = {}
  }

  createClientStream() {
    const id = randomUUID()
    const stream = new PassThrough()
    this.clientStreams.set(id, stream)

    return {
      id,
      stream,
    }
  }

  removeClientStream(id) {
    this.clientStreams.delete(id)
  }

  createFileStream(filename) {
    return fs.createReadStream(filename)
  }

  _executeSoxCommand(args) {
    return childProcess.spawn("sox", args)
  }

  async getBitrate(song) {
    try {
      const args = ["--i", "-B", song]
      const { stdout, stderr } = this._executeSoxCommand(args)
      await Promise.all([once(stdout, "readable"), once(stderr, "readable")])
      const [success, error] = [stdout, stderr].map((stream) => stream.read())
      if (error) return await Promise.reject(error)
      return success.toString().trim().replace(/k/, "000")
    } catch (error) {
      logger.error(`Bitrate error: ${error}`)
      return fallbackBitRate
    }
  }

  broadcast() {
    return new Writable({
      write: (chunk, enc, cb) => {
        for (const [id, stream] of this.clientStreams) {
          if (stream.writableEnd) {
            this.clientStreams.delete(id)
            continue
          }
          stream.write(chunk)
        }
        cb()
      },
    })
  }

  async startStreaming() {
    logger.info(`starting with ${this.currentSong}`)
    const bitrate = (this.currentBitrate =
      (await this.getBitrate(this.currentSong)) / bitrateDivisor)
    const throttleTransform = (this.throttleTransform = new Throttle(bitrate))
    const songReadable = (this.currentReadable = this.createFileStream(
      this.currentSong
    ))
    streamPromises.pipeline(songReadable, throttleTransform, this.broadcast())
  }

  async stopStreaming() {
    this.throttleTransform?.end()
  }

  async getFileInfo(filename) {
    const fullFilePath = join(publicDir, filename)
    await fs.promises.access(fullFilePath)
    const fileType = extname(fullFilePath)
    return {
      type: fileType,
      name: fullFilePath,
    }
  }

  async getFileStream(filename) {
    const { name, type } = await this.getFileInfo(filename)
    return {
      stream: this.createFileStream(name),
      type,
    }
  }
}
