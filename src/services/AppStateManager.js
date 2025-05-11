import { EventEmitter } from 'events';

class AppStateManager extends EventEmitter {
  constructor() {
    super();
    this.state = {
      muteMode: false, // Default value
    };
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    this.emit('stateChange', { key, value }); // Notify listeners of the change
  }
}

const appStateManager = new AppStateManager();
export default appStateManager;