import { afterEach, jest, describe, expect, it } from "@jest/globals"
import Service from "../../../public/controller/js/service.js"

describe("#Service - test suit for service", () => {
  afterEach(() => {
    jest.clearAllMocks()
    delete global.fetch
  })

  it("should make a POST request to url", async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true }),
      })
    )
    const url = "url"
    const data = { bodyData: "data" }
    const service = new Service({ url })

    const result = await service.makeRequest(data)

    expect(global.fetch).toHaveBeenCalledWith(url, {
      method: "POST",
      body: JSON.stringify(data),
    })
    expect(result).toStrictEqual({ success: true })
  })
})
