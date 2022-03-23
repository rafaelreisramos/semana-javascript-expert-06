import { jest, describe, expect, afterEach, it } from "@jest/globals"
import supertest from "supertest"
import portfinder from "portfinder"
import fs from "fs"
import { Transform } from "stream"
import { setTimeout } from "timers/promises"
import Server from "../../../server/server.js"
import config from "./../../../server/config.js"

const {
  dir: { publicDir },
  pages: { home, controller },
  files: { html, css, script },
} = config
const getAvailablePort = portfinder.getPortPromise
const RETENTION_DATA_PERIOD = 200
let testServer = supertest(Server())
const commands = {
  start: "start",
  stop: "stop",
  applause: "applause",
  audience: "audience",
  boo: "boo",
  fart: "fart",
  laughing: "laughing",
}

describe("API E2E Suite Test", () => {
  describe("Routes", () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it("should respond with 404 status code given an unknown route", async () => {
      const response = await testServer.get(`/unknown`)
      expect(response.statusCode).toStrictEqual(404)
    })

    it("should respond with the home location and 302 status code given / route", async () => {
      const response = await testServer.get("/")
      expect(response.headers.location).toStrictEqual("/home")
      expect(response.statusCode).toStrictEqual(302)
    })

    it("should respond with file stream given /home", async () => {
      const response = await testServer.get("/home")
      const homePage = await fs.promises.readFile(`${publicDir}/${home}`)
      expect(response.text).toStrictEqual(homePage.toString())
    })

    it("should respond with file stream given /controller", async () => {
      const response = await testServer.get("/controller")
      const homePage = await fs.promises.readFile(`${publicDir}/${controller}`)
      expect(response.text).toStrictEqual(homePage.toString())
    })
  })

  describe("GET static files", () => {
    it("should respond with 404 if file doesnt exists", async () => {
      const file = "missing-file.js"
      const response = await testServer.get(`/${file}`)
      expect(response.statusCode).toStrictEqual(404)
    })

    it("should respond with content-type text/css given a css file", async () => {
      const response = await testServer.get(`/${css}`)
      const content = await fs.promises.readFile(`${publicDir}/${css}`)
      expect(response.text).toStrictEqual(content.toString())
      expect(response.statusCode).toStrictEqual(200)
      expect(response.header["content-type"]).toStrictEqual("text/css")
    })

    it("should respond with content-type text/javascript given a js file", async () => {
      const response = await testServer.get(`/${script}`)
      const content = await fs.promises.readFile(`${publicDir}/${script}`)
      expect(response.text).toStrictEqual(content.toString())
      expect(response.statusCode).toStrictEqual(200)
      expect(response.header["content-type"]).toStrictEqual("text/javascript")
    })

    it("should respond with content-type text/html given a html file", async () => {
      const response = await testServer.get(`/${html}`)
      const content = await fs.promises.readFile(`${publicDir}/${html}`)
      expect(response.text).toStrictEqual(content.toString())
      expect(response.statusCode).toStrictEqual(200)
      expect(response.header["content-type"]).toStrictEqual("text/html")
    })
  })

  describe("Client workflow", () => {
    function pipeAndReadStreamData(stream, onChunk) {
      const transform = new Transform({
        transform(chunk, enc, cb) {
          onChunk(chunk)
          cb(null, chunk)
        },
      })
      return stream.pipe(transform)
    }

    async function getTestServer() {
      const getSupertest = (port) => supertest(`http://localhost:${port}`)
      const port = await getAvailablePort()
      return new Promise((resolve, reject) => {
        const server = Server()
          .listen(port)
          .once("listening", () => {
            const testServer = getSupertest(port)
            const response = {
              testServer,
              kill() {
                server.close()
              },
            }
            return resolve(response)
          })
          .once("error", reject)
      })
    }

    function commandSender(testServer) {
      return {
        async send(command) {
          const response = await testServer
            .post("/controller")
            .send({ command })

          expect(response.text).toStrictEqual(
            JSON.stringify({ result: `${command}` })
          )
        },
      }
    }

    it("should not receive data stream if the process is not playing", async () => {
      const server = await getTestServer()
      const onChunk = jest.fn()
      pipeAndReadStreamData(server.testServer.get("/stream"), onChunk)
      await setTimeout(RETENTION_DATA_PERIOD)
      server.kill()

      expect(onChunk).not.toHaveBeenCalled()
    })

    it("should receive data stream if the process is playing", async () => {
      const server = await getTestServer()
      const onChunk = jest.fn()
      const { send } = commandSender(server.testServer)
      pipeAndReadStreamData(server.testServer.get("/stream"), onChunk)
      await send(commands.start)
      await setTimeout(RETENTION_DATA_PERIOD)
      await send(commands.stop)
      const [[buffer]] = onChunk.mock.calls

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(1000)

      server.kill()
    })

    it("should send all commands and don't break the api", async () => {
      const server = await getTestServer()
      const onChunk = jest.fn()
      const { send } = commandSender(server.testServer)
      pipeAndReadStreamData(server.testServer.get("/stream"), onChunk)
      await send(commands.start)
      await setTimeout(RETENTION_DATA_PERIOD)
      const fxCommands = Object.keys(commands).filter(
        (fxCommand) =>
          fxCommand !== commands.start || fxCommand !== commands.stop
      )
      for (const fxCommand of fxCommands) {
        await send(fxCommand)
        await setTimeout(RETENTION_DATA_PERIOD)
      }
      await send(commands.stop)

      const NUM_OF_FXSOUNDS = 5
      const [[buffer]] = onChunk.mock.calls
      expect(onChunk.mock.calls.length).toBeGreaterThanOrEqual(NUM_OF_FXSOUNDS)
      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(1000)

      server.kill()
    })

    it("should not break the API when sending commands and no audio is playing", async () => {
      const server = await getTestServer()
      const { send } = commandSender(server.testServer)

      await send(commands.stop)
      await send(commands.applause)
      await send(commands.stop)
      await setTimeout(RETENTION_DATA_PERIOD)

      server.kill()
    })
  })
})
