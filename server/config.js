import { join, dirname } from "path"
import { fileURLToPath } from "url"

const currentDir = dirname(fileURLToPath(import.meta.url))
const rootDir = join(currentDir, "../")
const audioDir = join(rootDir, "audio")
const publicDir = join(rootDir, "public")
const songsDir = join(audioDir, "songs")

export default {
  port: process.env.PORT || 3000,
  dir: {
    root: rootDir,
    publicDir,
    audio: audioDir,
    songs: songsDir,
    fx: join(audioDir, "fx"),
  },
  pages: {
    home: "home/index.html",
    controller: "controller/index.html",
  },
  files: {
    script: "home/js/animation.js",
    css: "controller/css/index.css",
    html: "controller/index.html",
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
    audioMediaType: "mp3",
    songVolume: "0.99",
    fxVolume: "0.1",
    fallbackBitRate: "128000",
    bitrateDivisor: 8,
    englishConversation: join(songsDir, "conversation.mp3"),
  },
}
