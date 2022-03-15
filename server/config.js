import { join, dirname } from "path"
import { fileURLToPath } from "url"

const currentDir = dirname(fileURLToPath(import.meta.url))
const rootDir = join(currentDir, "../")
const audioDir = join(rootDir, "audio")
const publicDir = join(rootDir, "public")

export default {
  port: process.env.PORT || 3000,
  dir: {
    root: rootDir,
    publicDir,
    audio: audioDir,
    songs: join(audioDir, "songs"),
    fx: join(audioDir, "fx"),
  },
  pages: {
    home: "home/index.html",
    controller: "controller/index.html",
  },
  location: {
    home: "/home",
  },
  constants: {
    CONTENT_TYPE: {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
    },
  },
}
