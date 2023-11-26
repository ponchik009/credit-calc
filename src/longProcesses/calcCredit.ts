import { CreditOptions, countCredit } from "../utils/countCredit";

/* eslint-disable no-restricted-globals */
self.onmessage = (e: MessageEvent<CreditOptions>) => {
  const res = countCredit(e.data);

  self.postMessage(res);
};

export {};
