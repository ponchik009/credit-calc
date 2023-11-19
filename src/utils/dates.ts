declare global {
  interface Date {
    isLeapYear(): boolean;
    getDaysInMonth(): number;
    addMonths(value: number): Date;
    addDays(value: number): Date;
  }
}

Date.prototype.isLeapYear = function () {
  const year = this.getFullYear();
  return new Date(year, 1, 29).getDate() === 29;
};

Date.prototype.getDaysInMonth = function () {
  const month = this.getMonth();

  return [
    31,
    this.getFullYear() ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month];
};

Date.prototype.addMonths = function (value) {
  const n = this.getDate();
  this.setDate(1);
  this.setMonth(this.getMonth() + value);
  this.setDate(Math.min(n, this.getDaysInMonth()));
  return this;
};

Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

export const addYears = (date: Date, yearsAmount: number) => {
  const res = new Date(date);
  res.setFullYear(res.getFullYear() + yearsAmount);

  return res;
};

export const yearsDiff = (d1: Date, d2: Date) => {
  return d2.getFullYear() - d1.getFullYear();
};

export const monthDiff = (d1: Date, d2: Date) => {
  let months;

  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();

  return months <= 0 ? 0 : months;
};

export const daysDiff = (d1: Date, d2: Date) => {
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
