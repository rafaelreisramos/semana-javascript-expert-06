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

    jest.spyOn(fs, "createReadStream").mockReturnValue(mockFileStream)
    jest.spyOn(fs.promises, "access").mockReturnValue()
    const stream = await service.getFileStream(filename)

    expect(stream).toEqual({
      stream: mockFileStream,
      type: expectedFiletype,
    })
  })
})
