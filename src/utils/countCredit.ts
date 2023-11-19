import { addYears, daysDiff, monthDiff, yearsDiff } from "./dates";

export enum AmountDisplayType {
  PER_MONTH,
  PER_DAY,
  PER_YEAR,
}

export enum PaymentType {
  BASE,
  EARLY_DURATION,
  EARLY_PAYMENT,
}

export enum EarlyPaymentType {
  PAYMENT_REDUCTION,
  DURATION_REDUCTION,
}

interface CreditOptions {
  sum: number;
  // Длительность в годах
  dur: number;
  percent: number;

  dateStart: Date;

  amountDisplayType: AmountDisplayType;

  earlyPayments?: Map<string, EarlyPayment>;
}

interface Payment {
  date: Date;
  amount: number;
}

export interface EarlyPayment extends Payment {
  type: EarlyPaymentType;
}

interface CreditDurationOptions {
  dateStart: Date;
  dateEnd: Date;
  type: AmountDisplayType;
}

interface PercentByCreditCalculationTypeOptions {
  percent: number;
  type: AmountDisplayType;
}

export interface PaymentSchedule {
  percentPayment?: number;
  mainCreditPayment?: number;
  percentCount: number;
  count: number;
  date: string;
  paymentType?: PaymentType;
}

export interface CreditSummary {
  schedule: PaymentSchedule[];
  payments: PaymentSchedule[];
  basePayments: Payment[];
  totalSum: number;
  totalPercents: number;
}

const countCreditDuration = (options: CreditDurationOptions) => {
  switch (options.type) {
    case AmountDisplayType.PER_DAY:
      return daysDiff(options.dateStart, options.dateEnd);
    case AmountDisplayType.PER_MONTH:
      return monthDiff(options.dateStart, options.dateEnd);
    case AmountDisplayType.PER_YEAR:
      return yearsDiff(options.dateStart, options.dateEnd);
  }
};

const countPercentByCreditCalculationType = (
  options: PercentByCreditCalculationTypeOptions,
  leapYear: boolean = false
) => {
  switch (options.type) {
    case AmountDisplayType.PER_DAY:
      return leapYear ? options.percent / 366 : options.percent / 365;
    case AmountDisplayType.PER_MONTH:
      return options.percent / 12;
    case AmountDisplayType.PER_YEAR:
      return options.percent;
  }
};

export const countCredit = (options: CreditOptions): CreditSummary => {
  // конечный объект, который вернем
  const res: CreditSummary = {
    schedule: [],
    payments: [],
    basePayments: [],
    totalPercents: 0,
    totalSum: 0,
  };
  // дата начала кредита
  let dateStart = new Date(options.dateStart);
  // дата выплаты кредита
  let dateEnd = addYears(options.dateStart, options.dur);

  // длительность в днях
  const count = countCreditDuration({
    dateStart,
    dateEnd,
    type: AmountDisplayType.PER_DAY,
  });
  // массив сумм
  const sums: PaymentSchedule[] = [];

  // процент по месяцу
  const monthPercent = options.percent / 12 / 100;
  // длительность в месяцах
  const monthCount = countCreditDuration({
    dateStart,
    dateEnd,
    type: AmountDisplayType.PER_MONTH,
  });
  // базовый платеж
  let basePayment = +(
    (options.sum * monthPercent) /
    (1 - (1 + monthPercent) ** -monthCount)
  ).toFixed(2);
  res.basePayments.push({
    date: dateStart,
    amount: basePayment,
  });
  // день платежа
  const basePaymentDay = dateStart.getDate();

  for (let i = 0; i < count; i++) {
    // текущий день
    const date = dateStart.addDays(i + 1);

    // процент кредита подневный
    const percent =
      countPercentByCreditCalculationType(
        {
          type: AmountDisplayType.PER_DAY,
          percent: options.percent,
        },
        date.isLeapYear()
      ) / 100;

    // остаток задолженности
    let prevSum = +(sums[i - 1]?.count || options.sum).toFixed(2);
    // капнутый процент
    let prevDiff = +(
      +(sums[i - 1]?.percentCount || 0).toFixed(2) +
      +(prevSum * percent).toFixed(2)
    ).toFixed(2);
    const percentCount = prevDiff;

    if (prevSum <= 0) {
      break;
    }

    // если сегодня день платежа, считаем
    let paymentWithoutPercent = 0;
    if (date.getDate() === basePaymentDay) {
      if (date.valueOf() === dateEnd.valueOf() || basePayment >= prevSum) {
        // выплачиваем всю оставшуюся сумму
        res.payments.push({
          date: date.toLocaleDateString("ru-RU"),
          percentCount: 0,
          percentPayment: percentCount,
          mainCreditPayment: +prevSum.toFixed(2),
          count: 0,
          paymentType: PaymentType.BASE,
        });

        break;
      } else {
        // выплачиваем ровно по кредиту
        paymentWithoutPercent = +(basePayment - prevDiff).toFixed(2);

        res.totalPercents += prevDiff;

        prevDiff = 0;
        prevSum -= +paymentWithoutPercent.toFixed(2);

        res.payments.push({
          date: date.toLocaleDateString("ru-RU"),
          percentCount: +prevDiff.toFixed(2),
          percentPayment: paymentWithoutPercent > 0 ? percentCount : 0,
          mainCreditPayment: +paymentWithoutPercent.toFixed(2),
          count: +prevSum.toFixed(2),
          paymentType: PaymentType.BASE,
        });
      }
    }

    // если сегодня вносим досрочное погашение
    const earlyPayment = options.earlyPayments?.get(
      date.toLocaleDateString("ru-RU")
    );
    if (earlyPayment) {
      if (prevDiff === 0) {
        paymentWithoutPercent = +(
          paymentWithoutPercent + earlyPayment.amount
        ).toFixed(2);
        prevSum -= +earlyPayment.amount.toFixed(2);

        res.payments.push({
          date: date.toLocaleDateString("ru-RU"),
          percentCount: 0,
          percentPayment: 0,
          mainCreditPayment: +earlyPayment.amount.toFixed(2),
          count: +prevSum.toFixed(2),
          paymentType:
            earlyPayment.type === EarlyPaymentType.DURATION_REDUCTION
              ? PaymentType.EARLY_DURATION
              : PaymentType.EARLY_PAYMENT,
        });
      } else if (earlyPayment.amount >= prevDiff) {
        paymentWithoutPercent = +(earlyPayment.amount - prevDiff).toFixed(2);

        res.totalPercents += +prevDiff.toFixed(2);

        prevSum -= +paymentWithoutPercent.toFixed(2);
        res.payments.push({
          date: date.toLocaleDateString("ru-RU"),
          percentCount: 0,
          percentPayment: +prevDiff.toFixed(2),
          mainCreditPayment: +(earlyPayment.amount - prevDiff).toFixed(2),
          count: +prevSum.toFixed(2),
          paymentType:
            earlyPayment.type === EarlyPaymentType.DURATION_REDUCTION
              ? PaymentType.EARLY_DURATION
              : PaymentType.EARLY_PAYMENT,
        });
        prevDiff = 0;
      } else {
        paymentWithoutPercent = 0;

        res.totalPercents += +earlyPayment.amount.toFixed(2);

        res.payments.push({
          date: date.toLocaleDateString("ru-RU"),
          percentCount: 0,
          percentPayment: +earlyPayment.amount.toFixed(2),
          mainCreditPayment: 0,
          count: +prevSum.toFixed(2),
          paymentType:
            earlyPayment.type === EarlyPaymentType.DURATION_REDUCTION
              ? PaymentType.EARLY_DURATION
              : PaymentType.EARLY_PAYMENT,
        });
        prevDiff -= +earlyPayment.amount.toFixed(2);
      }

      if (earlyPayment.type === EarlyPaymentType.PAYMENT_REDUCTION) {
        // уменьшаем платеж епте
        const newBasePayment = +(
          (prevSum * monthPercent) /
          (1 -
            (1 + monthPercent) **
              -(
                monthCount -
                res.payments.filter((p) => p.paymentType === PaymentType.BASE)
                  .length
              ))
        ).toFixed(2);

        basePayment =
          newBasePayment > basePayment ? basePayment : newBasePayment;

        // если отличается от существующего - записываем
        if (basePayment !== res.basePayments.at(-1)?.amount) {
          res.basePayments.push({
            date,
            amount: basePayment,
          });
        }
      }
    }

    sums.push({
      percentCount: +prevDiff.toFixed(2),
      percentPayment: paymentWithoutPercent > 0 ? percentCount : 0,
      mainCreditPayment: +paymentWithoutPercent.toFixed(2),
      count: +prevSum.toFixed(2),
      date: date.toLocaleDateString("ru-RU"),
    });
  }

  res.schedule = sums;
  res.totalPercents = +res.totalPercents.toFixed(2);
  res.totalSum = +(options.sum + res.totalPercents).toFixed(2);

  return res;
};
