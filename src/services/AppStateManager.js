class AppStateManager {
  static instance = null;

  constructor() {
    if (!AppStateManager.instance) {
      this.state = {};
      AppStateManager.instance = this;
    }
    return AppStateManager.instance;
  }

  set(key, value) {
    this.state[key] = value;
  }

  get(key) {
    return this.state[key];
  }

  getAll() {
    return this.state;
  }
}

const appStateManager = new AppStateManager();
Object.freeze(appStateManager); // Prevent modifications to the singleton instance
export default appStateManager;