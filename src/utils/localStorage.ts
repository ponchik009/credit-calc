export class Storage {
  public static SUM_KEY = "sum";
  public static DUR_KEY = "duration";
  public static PERCENT_KEY = "percent";
  public static DATE_START_KEY = "date_start";
  public static EARLY_PAYMENT_KEY = "early_payment";

  public static THEME_KEY = "theme";

  public static GROUP_KEY = "group";
  public static LEFTOVERS_KEY = "leftovers";

  public static save(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  public static get(key: string) {
    return localStorage.getItem(key);
  }
}
