import {
  CreditOptions,
  CreditSummary,
  countCredit,
} from "../utils/countCredit";

export class CreditApi {
  private worker?: Worker;

  public summary: CreditSummary | null = null;

  public constructor() {
    if (window.Worker) {
      this.worker = new Worker(
        new URL("../longProcesses/calcCredit.ts", import.meta.url)
      );

      this.worker.onmessage = (e: MessageEvent<CreditSummary>) => {
        this.summary = e.data;
      };
    }
  }

  public async calc(options: CreditOptions): Promise<CreditSummary> {
    if (this.worker) {
      this.worker.postMessage(options);
    }

    return new Promise((resolve) => {
      if (this.worker) {
        this.worker.onmessage = (e: MessageEvent<CreditSummary>) => {
          resolve(e.data);
        };
      } else {
        resolve(countCredit(options));
      }
    });
  }
}
