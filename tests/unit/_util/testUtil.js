import { jest } from "@jest/globals"
import { Readable, Writable } from "stream"

export default class TestUtil {
  static generateReadableStream(data) {
    return new Readable({
      read() {
        for (const item of data) {
          this.push(item)
        }
        this.push(null)
      },
    })
  }

  static generateWritableStream(onData) {
    return new Writable({
      write(chunk, enc, callback) {
        onData?.(chunk)
        callback(null, chunk)
      },
    })
  }

  static defaultHandleParams() {
    const request = TestUtil.generateReadableStream([""])
    const response = TestUtil.generateWritableStream()
    const data = {
      request: Object.assign(request, {
        Headers: {},
        method: "",
        url: "",
      }),
      response: Object.assign(response, {
        writeHead: jest.fn(),
        end: jest.fn(),
      }),
    }

    return {
      values: () => Object.values(data),
      ...data,
    }
  }

  static getSpawnResponse = ({ stdout = "", stderr = "", stdin = "" }) => ({
    stdout: this.generateReadableStream([stdout]),
    stderr: this.generateReadableStream([stderr]),
    stdin: this.generateWritableStream(stdin),
  })
}
