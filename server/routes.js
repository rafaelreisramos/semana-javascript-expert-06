import config from "./config.js"
import { logger } from "./util.js"
import { Controller } from "./controller.js"
import { once } from "events"

const controller = new Controller()

const {
  location,
  pages,
  constants: { CONTENT_TYPE },
} = config

const routes = {
  ":get": async (_, response) => {
    response.writeHead(302, {
      Location: location.home,
    })
    return response.end()
  },

  "home:get": async (_, response) => {
    const { stream } = await controller.getFileStream(pages.home)
    return stream.pipe(response)
  },

  "controller:get": async (_, response) => {
    const { stream } = await controller.getFileStream(pages.controller)
    return stream.pipe(response)
  },

  "controller:post": async (request, response) => {
    const data = await once(request, "data")
    const item = JSON.parse(data)
    const result = await controller.handleCommand(item)
    return response.end(JSON.stringify(result))
  },

  "stream:get": async (request, response) => {
    const { stream, onClose } = controller.createClientStream()
    request.once("close", onClose)
    response.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Accept-Ranges": "bytes",
    })
    return stream.pipe(response)
  },

  "file:get": async (request, response) => {
    const { url } = request
    const { stream, type } = await controller.getFileStream(url)
    const contentType = CONTENT_TYPE[type]
    if (contentType) {
      response.writeHead(200, {
        "Content-Type": contentType,
      })
    }
    return stream.pipe(response)
  },

  default: async (_, response) => {
    response.writeHead(404)
    return response.end()
  },
}

function handleError(error, response) {
  if (error.message.includes("ENOENT")) {
    logger.warn(`asset not found ${error.stack}`)
    response.writeHead(404)
    return response.end()
  }

  logger.error(`caught error on API ${error.stack}`)
  response.writeHead(500)
  return response.end()
}

export function handler(request, response) {
  const { method, url } = request
  let [_, route] = url.split("/")
  route = `${route}:${method}`
  route = url.includes("stream") ? `stream:${method}` : route
  route = url.includes(".") ? `file:${method}` : route
  const routeKey = route.toLowerCase()
  const routeChosen = routes[routeKey] || routes.default

  return routeChosen(request, response).catch((error) =>
    handleError(error, response)
  )
}
