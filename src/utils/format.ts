export const numberWithSpaces = (num: number, symbolsAfterDot: number = 0) => {
  return num
    .toFixed(symbolsAfterDot)
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    .replace(".", ",");
};
