import { jest, describe, expect, it, beforeEach } from "@jest/globals"
import fs from "fs"
import streamPromises from "stream/promises"
import childProcess from "child_process"
import Throttle from "throttle"
import { Service } from "../../../server/service"
import TestUtil from "../_util/testUtil"
import config from "../../../server/config.js"
import { PassThrough, Writable } from "stream"
import path from "path"

const {
  constants: {
    fallbackBitRate,
    bitrateDivisor,
    audioMediaType,
    songVolume,
    fxVolume,
  },
  dir: { rootDir, fx: fxDir },
} = config

describe("#Service", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it("should create a client stream - createClientStream()", () => {
    const service = new Service()
    jest.spyOn(service.clientStreams, service.clientStreams.set.name)

    const { id, stream } = service.createClientStream()

    expect(id.length).toBeGreaterThan(0)
    expect(stream).toBeInstanceOf(PassThrough)
    expect(service.clientStreams.set).toHaveBeenCalledWith(id, stream)
  })

  it("should remove a client stream - removeClientStream()", () => {
    const service = new Service()
    const { id } = service.createClientStream()

    expect(service.clientStreams.size).toEqual(1)
    service.removeClientStream(id)
    expect(service.clientStreams.size).toEqual(0)
  })

  it("should create a stream - getFileStream()", async () => {
    const service = new Service()
    const filename = "index.html"
    const expectedFiletype = ".html"
    const mockFileStream = TestUtil.generateReadableStream(["data"])

    jest.spyOn(fs, fs.createReadStream.name).mockReturnValue(mockFileStream)
    jest.spyOn(fs.promises, fs.promises.access.name).mockResolvedValue()
    const stream = await service.getFileStream(filename)

    expect(stream).toStrictEqual({
      stream: mockFileStream,
      type: expectedFiletype,
    })
  })

  it("should call the sox command line - _executeSoxCommand()", async () => {
    const service = new Service()
    const spawnResponse = TestUtil.getSpawnResponse({
      stdout: "128k",
    })
    jest
      .spyOn(childProcess, childProcess.spawn.name)
      .mockReturnValue(spawnResponse)

    const args = ["args"]
    const result = service._executeSoxCommand(args)

    expect(childProcess.spawn).toHaveBeenCalledWith("sox", args)
    expect(result).toStrictEqual(spawnResponse)
  })

  it("should stop streaming if throttleTransform exists - stopStreaming()", () => {
    const service = new Service()
    const bps = 1000
    service.throttleTransform = new Throttle(bps)

    jest.spyOn(service.throttleTransform, "end").mockReturnValue()

    service.stopStreaming()
    expect(service.throttleTransform.end).toHaveBeenCalled()
  })

  it("should not throw if throttleTransform exists - stopStreaming()", () => {
    const service = new Service()
    expect(() => service.stopStreaming()).not.toThrow()
  })

  it("should return the bitrate as string - getBitrate()", async () => {
    const service = new Service()
    const spawnResponse = TestUtil.getSpawnResponse({
      stdout: "64k",
    })

    jest
      .spyOn(service, service._executeSoxCommand.name)
      .mockReturnValue(spawnResponse)

    const song = "song.mp3"
    const result = await service.getBitrate(song)

    expect(result).toStrictEqual("64000")
    expect(service._executeSoxCommand).toHaveBeenCalledWith(["--i", "-B", song])
  })

  it("should return the fallbackBitRate on error - getBitrate()", async () => {
    const service = new Service()
    const spawnResponse = TestUtil.getSpawnResponse({
      stderr: "error!",
    })

    jest
      .spyOn(service, service._executeSoxCommand.name)
      .mockReturnValue(spawnResponse)

    const song = "song.mp3"
    const result = await service.getBitrate(song)

    expect(result).toStrictEqual(fallbackBitRate)
    expect(service._executeSoxCommand).toHaveBeenCalledWith(["--i", "-B", song])
  })

  it("should write only for active client streams - broadcast()", () => {
    const service = new Service()
    const onData = jest.fn()
    const client1 = TestUtil.generateWritableStream(onData)
    const client2 = TestUtil.generateWritableStream(onData)
    jest.spyOn(service.clientStreams, service.clientStreams.delete.name)

    service.clientStreams.set("1", client1)
    service.clientStreams.set("2", client2)
    client2.end()

    const writable = service.broadcast()
    writable.write("Hello World")

    expect(writable).toBeInstanceOf(Writable)
    expect(service.clientStreams.delete).toHaveBeenCalledWith("2")
    expect(onData).toHaveBeenCalledTimes(1)
  })

  it("should start streaming - startStreaming()", async () => {
    const service = new Service()
    const currentSong = (service.currentSong = "song.mp3")
    const currentReadable = TestUtil.generateReadableStream(["song"])
    const broadcastWritable = TestUtil.generateWritableStream(() => {})

    jest.spyOn(fs, fs.createReadStream.name).mockReturnValue(currentReadable)
    jest
      .spyOn(service, service.broadcast.name)
      .mockReturnValue(broadcastWritable)
    jest
      .spyOn(service, service.getBitrate.name)
      .mockResolvedValue(fallbackBitRate)
    jest
      .spyOn(streamPromises, streamPromises.pipeline.name)
      .mockResolvedValue({})

    await service.startStreaming()

    expect(service.currentBitrate).toEqual(
      Number(fallbackBitRate) / bitrateDivisor
    )
    expect(service.getBitrate).toHaveBeenCalledWith(currentSong)
    expect(fs.createReadStream).toHaveBeenCalledWith(currentSong)
    expect(streamPromises.pipeline).toHaveBeenCalledWith(
      currentReadable,
      service.throttleTransform,
      service.broadcast()
    )
  })

  it("should return a chosen song based on fx command sent", async () => {
    const service = new Service()
    const fxName = "songB".toLowerCase()
    const fxSounds = ["songA is awesome.mp3", "bad songB.mp3"]
    const readDir = jest
      .spyOn(fs.promises, fs.promises.readdir.name)
      .mockResolvedValue(fxSounds)
    jest
      .spyOn(path, path.join.name)
      .mockReturnValue(`${rootDir}/audio/fx/'bad songB.mp3'`)

    const chosenFx = await service.readFxByName(fxName)

    expect(readDir).toHaveBeenCalledWith(fxDir)
    expect(chosenFx).toStrictEqual(`${chosenFx}`)
  })

  it("should return an error if fx sound wasn't found", async () => {
    const service = new Service()
    const fxName = "songC".toLowerCase()
    const fxSounds = ["songA is awesome.mp3", "bad songB.mp3"]
    const readDir = jest
      .spyOn(fs.promises, fs.promises.readdir.name)
      .mockResolvedValue(fxSounds)

    expect(service.readFxByName(fxName)).rejects.toEqual(
      `the song ${fxName} wasn't found!`
    )
    expect(readDir).toHaveBeenCalledWith(fxDir)
  })

  it("should merge audio stream", () => {
    const service = new Service()
    const readable = TestUtil.generateReadableStream()
    const spawnResponse = TestUtil.getSpawnResponse({
      stdout: "song+fx",
      stdin: "fx",
    })
    jest
      .spyOn(service, service._executeSoxCommand.name)
      .mockReturnValue(spawnResponse)
    jest.spyOn(streamPromises, streamPromises.pipeline.name).mockResolvedValue()

    const fxSound = "songA.mp3"
    const args = [
      "-t",
      audioMediaType,
      "-v",
      songVolume,
      "-m",
      "-",
      "-t",
      audioMediaType,
      "-v",
      fxVolume,
      fxSound,
      "-t",
      audioMediaType,
      "-",
    ]

    const transformStream = service.mergeAudioStream(fxSound, readable)
    const [_, call2] = streamPromises.pipeline.mock.calls
    const [stdoutCall, __] = call2

    expect(service._executeSoxCommand).toHaveBeenCalledWith(args)
    expect(streamPromises.pipeline).toHaveBeenCalledTimes(2)
    expect(streamPromises.pipeline).toHaveBeenNthCalledWith(
      1,
      readable,
      spawnResponse.stdin
    )
    expect(stdoutCall).toStrictEqual(spawnResponse.stdout)
    expect(transformStream).toBeInstanceOf(PassThrough)
  })

  it("should append a fx stream to current stream", () => {
    const service = new Service()
    const fx = "fxSound.mp3"
    const bps = 1000
    service.throttleTransform = new Throttle(bps)
    service.currentReadable = TestUtil.generateReadableStream(["stream"])
    const mergedThrottleTransform = new PassThrough()
    jest.spyOn(streamPromises, streamPromises.pipeline.name).mockResolvedValue()
    jest.spyOn(service.throttleTransform, "pause").mockReturnValue()
    jest.spyOn(service.throttleTransform, "unpipe").mockReturnValue()
    jest.spyOn(service.currentReadable, "unpipe").mockReturnValue()
    jest
      .spyOn(service, service.mergeAudioStream.name)
      .mockReturnValue(mergedThrottleTransform)
    jest.spyOn(mergedThrottleTransform, "removeListener").mockReturnValue()

    service.appendFxStream(fx)

    expect(service.throttleTransform.pause).toHaveBeenCalled()
    expect(service.currentReadable.unpipe).toHaveBeenCalledWith(
      service.throttleTransform
    )

    service.throttleTransform.emit("unpipe")

    expect(mergedThrottleTransform.removeListener).toHaveBeenCalled()
    expect(streamPromises.pipeline).toHaveBeenCalledTimes(2)
    expect(streamPromises.pipeline).toHaveBeenNthCalledWith(
      2,
      mergedThrottleTransform,
      service.throttleTransform
    )
  })
})
