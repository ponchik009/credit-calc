import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import { RootState, AppThunk } from "../../store/store";
import {
  AmountDisplayType,
  countCredit,
  CreditSummary,
  EarlyPayment,
  PaymentSchedule,
} from "../../utils/countCredit";
import { Storage } from "../../utils/localStorage";

export interface CreditState {
  // сумма кредита
  sum: number;
  // длительность кредита в годах
  duration: number;
  // длительность кредита в месяцах
  durationMonths: number;
  // процент по кредиту
  percent: number;
  // дата оформления кредита
  dateStart: Date | null;

  // инфа по кредиту
  creditSummary: Map<number, PaymentSchedule[]> | null;
  basePayment: number | null;
  totalPercentSum: number | null;
  totalPaidSum: number | null;
  dateEnd: string | null;

  // ранние платежи
  earlyPayments: Map<string, EarlyPayment> | null;
}

const initialState: CreditState = {
  sum: Number.parseFloat(Storage.get(Storage.SUM_KEY) || "") || 0,
  duration: Number.parseFloat(Storage.get(Storage.DUR_KEY) || "") || 0,
  durationMonths:
    (Number.parseFloat(Storage.get(Storage.DUR_KEY) || "") || 0) * 12,
  percent: Number.parseFloat(Storage.get(Storage.PERCENT_KEY) || "") || 0,

  dateStart: new Date(
    Storage.get(Storage.DATE_START_KEY)?.split(".").reverse().join("-") ||
      Date.now()
  ),

  creditSummary: null,
  basePayment: null,
  totalPercentSum: null,
  totalPaidSum: null,
  dateEnd: null,

  earlyPayments:
    new Map(
      JSON.parse(Storage.get(Storage.EARLY_PAYMENT_KEY) || "[]").map(
        ([date, payment]: [string, EarlyPayment]) => [
          date,
          {
            ...payment,
            date: new Date(payment.date),
          },
        ]
      )
    ) || null,
};

export const counterSlice = createSlice({
  name: "credit",
  initialState,
  reducers: {
    updateSum: (state, action: PayloadAction<number>) => {
      state.sum = action.payload;

      Storage.save(Storage.SUM_KEY, action.payload.toString());
    },
    updateDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
      state.durationMonths = action.payload * 12;

      Storage.save(Storage.DUR_KEY, action.payload.toString());
    },
    updateDurationMonths: (state, action: PayloadAction<number>) => {
      state.durationMonths = action.payload;
      state.duration = action.payload / 12;

      Storage.save(Storage.DUR_KEY, (action.payload / 12).toString());
    },
    updatePercent: (state, action: PayloadAction<number>) => {
      state.percent = action.payload;

      Storage.save(Storage.PERCENT_KEY, action.payload.toString());
    },
    updateDateStart: (state, action: PayloadAction<Date | null>) => {
      state.dateStart = action.payload;

      if (action.payload) {
        Storage.save(
          Storage.DATE_START_KEY,
          action.payload.toLocaleDateString("ru-RU")
        );
      }
    },
    addEarlyPayment: (state, action: PayloadAction<EarlyPayment>) => {
      if (!state.earlyPayments) {
        state.earlyPayments = new Map();
      }

      state.earlyPayments.set(
        action.payload.date.toLocaleDateString("ru-RU"),
        action.payload
      );
      state.earlyPayments = new Map(
        Array.from(state.earlyPayments.entries()).sort(
          (a, b) => a[1].date.getDate() - b[1].date.getDate()
        )
      );

      Storage.save(
        Storage.EARLY_PAYMENT_KEY,
        JSON.stringify(Array.from(state.earlyPayments.entries()))
      );
    },
    removeEarlyPayment: (state, action: PayloadAction<string>) => {
      if (state.earlyPayments) {
        state.earlyPayments.delete(action.payload);
      }

      if (state.earlyPayments?.size === 0) {
        state.earlyPayments = null;
      } else {
        Storage.save(
          Storage.EARLY_PAYMENT_KEY,
          JSON.stringify(Array.from(state.earlyPayments?.entries() || []))
        );
      }
    },
    countCreditSummary: (state) => {
      if (state.dateStart && state.sum && state.duration && state.percent) {
        const summary = countCredit({
          amountDisplayType: AmountDisplayType.PER_MONTH,
          dateStart: state.dateStart,
          dur: state.duration,
          percent: state.percent,
          sum: state.sum,
          earlyPayments: state.earlyPayments || new Map(),
        });

        const summaryMap = new Map<number, PaymentSchedule[]>();

        summary.payments.forEach((payment) => {
          const year = new Date(
            payment.date.split(".").reverse().join("-")
          ).getFullYear();

          if (summaryMap.has(year)) {
            summaryMap.get(year)?.push(payment);
          } else {
            summaryMap.set(year, [payment]);
          }
        });

        state.creditSummary = summaryMap;

        // года по убыванию
        const years = Array.from(summaryMap?.keys() || []).sort(
          (k1, k2) => k2 - k1
        );
        // дата окончания кредита
        const lastYear = summaryMap.get(years[0]);
        const firstYear = summaryMap.get(years?.at(-1) || 0);
        const dateEnd = lastYear?.at(-1)?.date;
        state.dateEnd = dateEnd || null;
        // сумма месячного платежа
        state.basePayment = summary.basePayments[0].amount || 0;
        // выплата по процентам
        state.totalPercentSum = summary.totalPercents;
        // общая выплата
        state.totalPaidSum = summary.totalSum;
      }
    },
  },
});

export const {
  updateSum,
  updateDuration,
  updateDurationMonths,
  updatePercent,
  updateDateStart,
  addEarlyPayment,
  removeEarlyPayment,
  countCreditSummary,
} = counterSlice.actions;

const selectCredit = (state: RootState) => state.credit;

export const selectOptions = createSelector([selectCredit], (creditState) => ({
  sum: creditState.sum,
  duration: creditState.duration,
  durationMonths: creditState.durationMonths,
  percent: creditState.percent,
  dateStart: creditState.dateStart,
}));

export const selectEarlyPayments = createSelector(
  [selectCredit],
  (creditState) => creditState.earlyPayments
);

export const selectSummary = createSelector([selectCredit], (creditState) => ({
  payments: creditState.creditSummary,
  dateEnd: creditState.dateEnd,
  basePayment: creditState.basePayment,
  totalPercentSum: creditState.totalPercentSum,
  totalPaidSum: creditState.totalPaidSum,
}));

export default counterSlice.reducer;
