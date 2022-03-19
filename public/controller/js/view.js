export default class View {
  constructor() {
    this.btnStart = document.getElementById("start")
    this.btnStop = document.getElementById("stop")
    async function onBtnClick() {}
    this.onBtnClick = onBtnClick
  }

  onLoad() {
    this.changeCommandBtnsVisibility()
    this.btnStart.onclick = this.onStartClick.bind(this)
  }

  changeCommandBtnsVisibility(hide = true) {
    Array.from(document.querySelectorAll("[name=command]")).forEach((btn) => {
      const fn = hide ? "add" : "remove"
      btn.classList[fn]("unassigned")
      function onClickReset() {}
      btn.onclick = onClickReset
    })
  }

  configureOnBtnClick(fn) {
    this.onBtnClick = fn
  }

  async onStartClick({ srcElement: { innerText } }) {
    const btnText = innerText
    await this.onBtnClick(btnText)
  }
}
