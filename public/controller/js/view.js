export default class View {
  constructor() {
    this.btnStart = document.getElementById("start")
    this.btnStop = document.getElementById("stop")
    this.fxButtons = () =>
      Array.from(document.querySelectorAll("[name=command]"))
    this.ignoredButtons = new Set(["unassigned"])
    async function onBtnClick() {}
    this.onBtnClick = onBtnClick
    this.DISABLE_BTN_TIMEOUT = 500
  }

  onLoad() {
    this.changeCommandBtnsVisibility()
    this.btnStart.onclick = this.onStartClick.bind(this)
  }

  changeCommandBtnsVisibility(hide = true) {
    this.fxButtons().forEach((btn) => {
      const fn = hide ? "add" : "remove"
      btn.classList[fn]("unassigned")
      function onClickReset() {}
      btn.onclick = onClickReset
    })
  }

  notIsUnassigneButton(btn) {
    const classes = Array.from(btn.classList)
    return !!!classes.find((classItem) => this.ignoredButtons.has(classItem))
  }

  configureOnBtnClick(fn) {
    this.onBtnClick = fn
  }

  toogleBtnStart(active = true) {
    if (active) {
      this.btnStart.classList.add("hidden")
      this.btnStop.classList.remove("hidden")
      this.btnStop.onclick = this.onStopClick.bind(this)
      return
    }
    this.btnStart.classList.remove("hidden")
    this.btnStop.classList.add("hidden")
  }

  toogleFxButton(classList) {
    if (!classList.contains("active")) {
      classList.add("active")
      return
    }
    classList.remove("active")
  }

  async onStartClick({ srcElement: { innerText } }) {
    const startCommand = innerText.toLowerCase()
    await this.onBtnClick(startCommand)
    this.toogleBtnStart()
    this.changeCommandBtnsVisibility(false)
    this.fxButtons()
      .filter((btn) => this.notIsUnassigneButton(btn))
      .forEach(this.setupFxAction.bind(this))
  }

  onStopClick({ srcElement: { innerText } }) {
    const stopCommand = innerText.toLowerCase()
    this.toogleBtnStart(false)
    this.changeCommandBtnsVisibility()
    return this.onBtnClick(stopCommand)
  }

  setupFxAction(btn) {
    btn.onclick = this.onFxClick.bind(this)
  }

  async onFxClick(btn) {
    const {
      srcElement: { classList, innerText },
    } = btn
    this.toogleFxButton(classList)
    const fxCommand = innerText.toLowerCase()
    await this.onBtnClick(fxCommand)
    setTimeout(() => this.toogleFxButton(classList), this.DISABLE_BTN_TIMEOUT)
  }
}
