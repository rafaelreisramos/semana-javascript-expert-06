import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { Controller } from "../../../server/controller"
import { Service } from "../../../server/service"
import TestUtil from "../_util/testUtil.js"

describe("Controller", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.resetAllMocks()
  })

  it("should call a file stream service", async () => {
    const filename = "index.html"
    const controller = new Controller()

    jest
      .spyOn(Service.prototype, Service.prototype.getFileStream.name)
      .mockResolvedValue({})
    await controller.getFileStream(filename)

    expect(Service.prototype.getFileStream).toHaveBeenCalledWith(filename)
  })

  it("should call start streaming on start command", async () => {
    const controller = new Controller()
    const startStreaming = jest
      .spyOn(Service.prototype, Service.prototype.startStreaming.name)
      .mockResolvedValue({})
    const result = await controller.handleCommand({ command: "start" })

    expect(startStreaming).toHaveBeenCalledTimes(1)
    expect(result).toStrictEqual({
      result: "start",
    })
  })

  it("should call stop streaming on stop command", async () => {
    const controller = new Controller()

    const stopStreaming = jest
      .spyOn(Service.prototype, Service.prototype.stopStreaming.name)
      .mockResolvedValue({})
    const result = await controller.handleCommand({ command: "stop" })

    expect(stopStreaming).toHaveBeenCalledTimes(1)
    expect(result).toStrictEqual({
      result: "stop",
    })
  })

  it("should return command not found on inexistent command", async () => {
    const controller = new Controller()
    jest
      .spyOn(Service.prototype, Service.prototype.startStreaming.name)
      .mockResolvedValue()
    jest
      .spyOn(Service.prototype, Service.prototype.stopStreaming.name)
      .mockResolvedValue()
    const result = await controller.handleCommand({ command: "inexistent" })

    expect(Service.prototype.startStreaming).not.toHaveBeenCalled()
    expect(Service.prototype.stopStreaming).not.toHaveBeenCalled()
    expect(result).toStrictEqual({
      result: "command not found!",
    })
  })

  it("should create a clientStream", async () => {
    const controller = new Controller()
    const mockStream = TestUtil.generateReadableStream(["test"])
    const mockId = "uuid"
    jest
      .spyOn(Service.prototype, Service.prototype.createClientStream.name)
      .mockReturnValue({
        id: mockId,
        stream: mockStream,
      })

    const { stream } = controller.createClientStream()

    expect(stream).toStrictEqual(mockStream)
    expect(Service.prototype.createClientStream).toHaveBeenCalled()
  })

  it("should remove a clientStream", async () => {
    const controller = new Controller()
    const mockStream = TestUtil.generateReadableStream(["test"])
    const mockId = "uuid"
    jest
      .spyOn(Service.prototype, Service.prototype.createClientStream.name)
      .mockReturnValue({
        id: mockId,
        clientStream: mockStream,
      })
    jest
      .spyOn(Service.prototype, Service.prototype.removeClientStream.name)
      .mockReturnValue()

    const { onClose } = controller.createClientStream()
    onClose()

    expect(Service.prototype.removeClientStream).toHaveBeenCalledWith(mockId)
  })
})
