import { jest, describe, it, expect } from "@jest/globals"
import { Controller } from "../../../server/controller"
import { Service } from "../../../server/service"

describe("Controller", () => {
  it("should call a file stream service", async () => {
    const filename = "index.html"
    const controller = new Controller()

    jest
      .spyOn(Service.prototype, Service.prototype.getFileStream.name)
      .mockResolvedValue({})
    await controller.getFileStream(filename)

    expect(Service.prototype.getFileStream).toHaveBeenCalledWith(filename)
  })
})
