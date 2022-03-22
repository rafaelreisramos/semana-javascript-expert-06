import { beforeEach, jest, describe, expect, it } from "@jest/globals"
import Controller from "../../../public/controller/js/controller.js"

describe("#Controller - test suit for controller", () => {
  const dependencies = {
    view: {
      onLoad: jest.fn(),
      configureOnBtnClick: jest.fn(),
    },
    service: {
      makeRequest: jest.fn().mockResolvedValue(),
    },
  }

  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it("should create a controller instance - initialize", () => {
    jest
      .spyOn(Controller.prototype, Controller.prototype.onLoad.name)
      .mockReturnValue()

    const controller = Controller.initialize(dependencies)
    const controllerConstructor = new Controller(dependencies)

    expect(controller).toBeInstanceOf(Controller)
    expect(Controller.prototype.onLoad).toHaveBeenCalled()
    expect(controller).toStrictEqual(controllerConstructor)
  })

  it("should configure actions and load view - onLoad", () => {
    const controller = new Controller(dependencies)
    jest.spyOn(controller.commandReceiver, controller.commandReceiver.bind.name)

    controller.onLoad()
    const [call] = dependencies.view.configureOnBtnClick.mock.lastCall

    expect(call.name).toStrictEqual(
      controller.commandReceiver.bind(controller).name
    )
  })

  it("should make a request on command received - commandReceiver", async () => {
    const controller = new Controller(dependencies)

    await controller.commandReceiver("command")

    expect(dependencies.service.makeRequest).toHaveBeenCalledWith({
      command: "command",
    })
  })
})
