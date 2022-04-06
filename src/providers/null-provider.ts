import { Provider } from './provider';

export class NullProvider extends Provider {
  constructor() {
    super(0);
  }
  async init() {
    return new NullProvider();
  }
  async sign() {
    return '';
  }
  async close() {
    return null;
  }
}
