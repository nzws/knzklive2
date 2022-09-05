export class NewWindow {
  currentWindow: Window | null = null;

  constructor(id: string, url: string, width = 800, height = 600) {
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    this.currentWindow = window.open(
      url,
      id,
      [`width=${width}`, `height=${height}`, `left=${left}`, `top=${top}`].join(
        ','
      )
    );
    if (!this.currentWindow) {
      throw new Error('Failed to open window');
    }
  }

  close(): void {
    if (this.currentWindow) {
      this.currentWindow.close();
    }
  }

  async waitForClose(): Promise<void> {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (!this.currentWindow || this.currentWindow.closed) {
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });
  }
}
