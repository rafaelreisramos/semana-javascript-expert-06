import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { JSDOM } from "jsdom"
import View from "../../../public/controller/js/view.js"

describe("#View - test suit for presentation layer", () => {
  const dom = new JSDOM()
  global.document = dom.window.document
  global.window = dom.window

  function makeClassListElement(
    { classNames } = {
      classNames: [],
    }
  ) {
    const classList = new Set(classNames)
    classList.contains = classList.has
    classList.remove = classList.delete
    return classList
  }

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

  it("should toggle fx button visibility - toogleFxButton", () => {
    const view = new View()
    let classList = makeClassListElement([])

    view.toogleFxButton(classList)
    expect([...classList.values()]).toStrictEqual(["active"])

    view.toogleFxButton(classList)
    expect([...classList.values()]).toStrictEqual([])
  })

  it("should add hidden class to startButton and remove it from stopButton when toogleBtnStart is true", () => {
    const view = new View()
    const btnStart = makeBtnElement({ classList: makeClassListElement() })
    const btnStop = makeBtnElement({
      classList: makeClassListElement({ classNames: ["hidden"] }),
    })

    view.btnStart = btnStart
    view.btnStop = btnStop

    view.toogleBtnStart()
    expect([...view.btnStart.classList.values()]).toStrictEqual(["hidden"])
    expect([...view.btnStop.classList.values()]).toStrictEqual([])
  })

  it("should add hidden class to stopButton and remove it from startButton when toogleBtnStart is false", () => {
    const view = new View()
    const btnStart = makeBtnElement({
      classList: makeClassListElement({ classNames: ["hidden"] }),
    })
    const btnStop = makeBtnElement({
      classList: makeClassListElement([]),
    })

    view.btnStart = btnStart
    view.btnStop = btnStop

    view.toogleBtnStart(false)
    expect([...view.btnStart.classList.values()]).toStrictEqual([])
    expect([...view.btnStop.classList.values()]).toStrictEqual(["hidden"])
  })

  it("should configue button click function", () => {
    const view = new View()
    const onclick = jest.fn()
    view.configureOnBtnClick(onclick)

    expect(view.onBtnClick).toStrictEqual(onclick)
  })

  it("should return true if button is unassigned and false if it isn't'", () => {
    const view = new View()
    const unassignedBtn = makeBtnElement({
      classList: makeClassListElement({ classNames: ["unassigned"] }),
    })
    const notUnassignedBtn = makeBtnElement({
      classList: makeClassListElement(),
    })

    expect(view.notIsUnassigneButton(unassignedBtn)).toStrictEqual(false)
    expect(view.notIsUnassigneButton(notUnassignedBtn)).toStrictEqual(true)
  })

  it("onStartClick", async () => {
    const view = new View()
    const buttonText = "START"
    const onClickElement = { srcElement: makeBtnElement({ text: buttonText }) }
    const fxButton = makeBtnElement({ classList: makeClassListElement() })
    jest.spyOn(view, view.onBtnClick.name).mockResolvedValue()
    jest.spyOn(view, view.toogleBtnStart.name).mockReturnValue()
    jest.spyOn(view, view.changeCommandBtnsVisibility.name).mockReturnValue()
    jest.spyOn(document, "querySelectorAll").mockReturnValueOnce([fxButton])
    jest.spyOn(view, view.notIsUnassigneButton.name).mockReturnValue(true)
    jest.spyOn(view, view.setupFxAction.name)

    await view.onStartClick(onClickElement)

    expect(view.onBtnClick).toHaveBeenCalledWith("start")
    expect(view.toogleBtnStart).toBeCalled()
    expect(view.changeCommandBtnsVisibility).toHaveBeenCalledWith(false)
    expect(view.notIsUnassigneButton).toHaveBeenNthCalledWith(1, fxButton)
    expect(view.setupFxAction).toHaveBeenCalledTimes(1)
  })

  it("onStopClick", () => {
    const view = new View()
    const buttonText = "STOP"
    const onClickElement = { srcElement: makeBtnElement({ text: buttonText }) }

    jest.spyOn(view, view.onBtnClick.name).mockResolvedValue()
    jest.spyOn(view, view.toogleBtnStart.name).mockReturnValue()
    jest.spyOn(view, view.changeCommandBtnsVisibility.name).mockReturnValue()

    view.onStopClick(onClickElement)

    expect(view.toogleBtnStart).toBeCalledWith(false)
    expect(view.changeCommandBtnsVisibility).toHaveBeenCalled()
    expect(view.onBtnClick).toHaveBeenCalledWith("stop")
  })

  it("onFxClick", async () => {
    const view = new View()
    const buttonText = "FX"
    const onClickElement = {
      srcElement: makeBtnElement({
        text: buttonText,
        classList: makeClassListElement({ classNames: [] }),
      }),
    }

    jest
      .spyOn(view, view.toogleFxButton.name)
      .mockImplementationOnce(() =>
        onClickElement.srcElement.classList.add("active")
      )
      .mockImplementationOnce(() =>
        onClickElement.srcElement.classList.remove("active")
      )
    jest.spyOn(view, view.onBtnClick.name).mockResolvedValue()

    jest.useFakeTimers()
    await view.onFxClick(onClickElement)
    jest.advanceTimersByTime(view.DISABLE_BTN_TIMEOUT)

    expect(view.toogleFxButton).toHaveBeenNthCalledWith(
      1,
      onClickElement.srcElement.classList
    )
    expect(view.toogleFxButton).toHaveBeenNthCalledWith(
      2,
      onClickElement.srcElement.classList
    )
    expect(view.onBtnClick).toBeCalledWith("fx")
  })

  it("View constructor", () => {
    const view = new View()

    expect(view.onBtnClick).toBeInstanceOf(Function)
    expect(() => view.onBtnClick("click")).not.toThrow()
  })
})
