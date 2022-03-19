import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { JSDOM } from "jsdom"
import View from "../../../public/controller/js/view.js"

describe("#View - test suit for presentation layer", () => {
  const dom = new JSDOM()
  global.document = dom.window.document
  global.window = dom.window

  function makeBtnElement(
    { text, classList } = {
      text: "",
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
    }
  ) {
    return {
      onclick: jest.fn(),
      classList,
      innerText: text,
    }
  }

  beforeEach(() => {
    jest.spyOn(document, "getElementById").mockReturnValue(makeBtnElement())
  })

  it("should hidden buttons when hide is true", () => {
    const view = new View()
    const btn = makeBtnElement()
    jest.spyOn(document, "querySelectorAll").mockReturnValue([btn])

    view.changeCommandBtnsVisibility()

    expect(btn.classList.add).toHaveBeenCalledWith("unassigned")
    expect(btn.onclick.name).toStrictEqual("onClickReset")
    expect(() => btn.onclick()).not.toThrow()
  })

  it("should show buttons when hide is false", () => {
    const view = new View()
    const btn = makeBtnElement()
    jest.spyOn(document, "querySelectorAll").mockReturnValue([btn])

    view.changeCommandBtnsVisibility(false)

    expect(btn.classList.add).not.toHaveBeenCalled()
    expect(btn.classList.remove).toHaveBeenCalledWith("unassigned")
    expect(btn.onclick.name).toStrictEqual("onClickReset")
    expect(() => btn.onclick()).not.toThrow()
  })

  it("onLoad", () => {
    const view = new View()
    jest.spyOn(view, view.changeCommandBtnsVisibility.name).mockReturnValue()

    view.onLoad()

    expect(view.changeCommandBtnsVisibility).toHaveBeenCalled()
  })
})
