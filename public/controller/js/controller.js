export default class Controller {
  constructor({ view, service }) {
    this.view = view
    this.service = service
  }

  static initialize(dependencies) {
    const controller = new Controller(dependencies)
    controller.onLoad()

    return controller
  }

  async commandReceiver(text) {
    return this.service.makeRequest({ command: text })
  }

  onLoad() {
    this.view.onLoad()
    this.view.configureOnBtnClick(this.commandReceiver.bind(this))
  }
}
