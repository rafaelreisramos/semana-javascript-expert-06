import { jest, describe, expect, test, it } from "@jest/globals"
import fs from "fs"
import { Service } from "../../../server/service"
import TestUtil from "../_util/testUtil"

describe("#Service", () => {
  it("should create a stream", async () => {
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
})
