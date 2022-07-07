import { app } from 'app';
import { generateConfig } from './boot';

void (async () => {
  try {
    await generateConfig();
    app();
  } catch (e) {
    // todo: handle error
    console.error(e);
    process.exit(1);
  }
})();
