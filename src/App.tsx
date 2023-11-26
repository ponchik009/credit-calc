import React from "react";

import {
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  CssBaseline,
  Dialog,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Stack,
  Step,
  StepButton,
  Stepper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { createTheme, ThemeProvider } from "@mui/material/styles";

import { ArrowLeftIcon, ArrowRightIcon } from "@mui/x-date-pickers";

import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";

import "./App.css";

import {
  AmountDisplayType,
  EarlyPaymentType,
  PaymentType,
  countCredit,
} from "./utils/countCredit";

import { ThemeContext, ThemeContextType } from "./context/themeContext";

import { ChangeThemeSwitch } from "./components/ChangeThemeSwitch/ChangeThemeSwitch";

import { useAppSelector } from "./hooks/useAppSelector";

import {
  addEarlyPayment,
  countCreditSummaryAsync,
  removeEarlyPayment,
  selectEarlyPayments,
  selectOptions,
  selectPendingStatus,
  selectSummary,
  updateDateStart,
  updateDuration,
  updateDurationMonths,
  updatePercent,
  updateSum,
} from "./store/creaditSlice/creditSlice";
import { useAppDispatch } from "./hooks/useAppDispatch";
import { numberWithSpaces } from "./utils/format";
import { Storage } from "./utils/localStorage";

enum LeftoversEnum {
  WITHOUT,
  WITH,
}

enum PaymentsGroupEnum {
  BY_YEAR,
  NONE,
}

function App() {
  const dispatch = useAppDispatch();

  const creditOptions = useAppSelector(selectOptions);
  const earlyPayments = useAppSelector(selectEarlyPayments);
  const creditSummary = useAppSelector(selectSummary);
  const isLoading = useAppSelector(selectPendingStatus);

  const [theme, setTheme] = React.useState<ThemeContextType>(
    (Storage.get(Storage.THEME_KEY) as ThemeContextType) || "dark"
  );

  const darkTheme = createTheme({
    palette: {
      mode: theme,
    },
    components: {
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            padding: "8px 16px",
          },
        },
      },
    },
  });

  // годы для группировки
  const [activeYear, setActiveYear] = React.useState<number | null>(null);
  const [years, setYears] = React.useState<number[]>([]);

  // настройка
  const [leftoversValue, setLeftoversValue] = React.useState<LeftoversEnum>(
    +(Storage.get(Storage.LEFTOVERS_KEY) || LeftoversEnum.WITH)
  );
  const symbolsAfterDot = leftoversValue === LeftoversEnum.WITH ? 2 : 0;

  // группировка
  const [groupValue, setGroupValue] = React.useState<PaymentsGroupEnum>(
    +(Storage.get(Storage.GROUP_KEY) || PaymentsGroupEnum.BY_YEAR)
  );
  const hasGroup = groupValue !== PaymentsGroupEnum.NONE;

  // модалка добавления досрочных платежей
  const [addPaymentModalOpen, setAddPaymentModalOpen] = React.useState(false);

  const [earlyPaymentSum, setEarlyPaymentSum] = React.useState(0);
  const [earlyPaymentDate, setEarlyPaymentDate] = React.useState<
    Array<Date | null>
  >([null]);
  const [earlyPaymentType, setEarlyPaymentType] =
    React.useState<EarlyPaymentType>(EarlyPaymentType.DURATION_REDUCTION);

  const onAddPayment = () => {
    if (!earlyPaymentSum) {
      return;
    }

    earlyPaymentDate.forEach((date) => {
      if (date) {
        dispatch(
          addEarlyPayment({
            amount: earlyPaymentSum,
            date,
            type: earlyPaymentType,
          })
        );
      }
    });

    setAddPaymentModalOpen(false);
  };

  React.useEffect(() => {
    if (creditSummary.payments) {
      const newYears = Array.from(creditSummary.payments.keys() || null).sort(
        (a, b) => a - b
      );
      setYears(newYears);
      setActiveYear(newYears[0]);
    }
  }, [creditSummary.payments]);

  React.useEffect(() => {
    setEarlyPaymentSum(0);
    setEarlyPaymentDate([null]);
    setEarlyPaymentType(EarlyPaymentType.DURATION_REDUCTION);
  }, [addPaymentModalOpen]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle: () => {
          const newTheme = theme === "light" ? "dark" : "light";
          setTheme(newTheme);
          Storage.save(Storage.THEME_KEY, newTheme);
        },
      }}
    >
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <ChangeThemeSwitch />
        <div className="App">
          <Stack
            className="left"
            direction="column"
            spacing={2}
            alignItems="flex-end"
          >
            <FormControl variant="outlined">
              <Input
                type="text"
                name="sum"
                size="small"
                endAdornment={<InputAdornment position="end">₽</InputAdornment>}
                value={numberWithSpaces(creditOptions.sum) || ""}
                autoComplete="off"
                onChange={(e) => {
                  const newValue = Number.parseFloat(
                    e.target.value.replaceAll(" ", "")
                  );

                  if (isNaN(newValue)) {
                    return dispatch(updateSum(0));
                  }

                  dispatch(updateSum(newValue));
                }}
              />
              <FormHelperText>Сумма</FormHelperText>
            </FormControl>
            <Stack spacing={2} direction="row">
              <FormControl variant="outlined">
                <Input
                  type="number"
                  name="years"
                  inputProps={{ step: 1 }}
                  size="small"
                  endAdornment={
                    <InputAdornment position="end">лет</InputAdornment>
                  }
                  autoComplete="off"
                  value={creditOptions.duration || ""}
                  onChange={(e) => dispatch(updateDuration(+e.target.value))}
                />
                <FormHelperText>Длительность</FormHelperText>
              </FormControl>
              <Typography variant="body1" sx={{ alignSelf: "center" }}>
                или
              </Typography>
              <FormControl variant="outlined">
                <Input
                  type="number"
                  name="months"
                  inputProps={{ step: 1 }}
                  size="small"
                  endAdornment={
                    <InputAdornment position="end">мес.</InputAdornment>
                  }
                  autoComplete="off"
                  value={creditOptions.durationMonths || ""}
                  onChange={(e) =>
                    dispatch(updateDurationMonths(+e.target.value))
                  }
                />
              </FormControl>
            </Stack>
            <FormControl variant="outlined">
              <Input
                type="number"
                name="percent"
                inputProps={{ step: 0.1 }}
                size="small"
                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                autoComplete="off"
                value={creditOptions.percent || ""}
                onChange={(e) => dispatch(updatePercent(+e.target.value))}
              />
              <FormHelperText>Процент</FormHelperText>
            </FormControl>
            <FormControl variant="outlined">
              <DatePicker
                value={creditOptions.dateStart}
                onChange={(date) => dispatch(updateDateStart(date))}
              />
              <FormHelperText>Дата</FormHelperText>
            </FormControl>
            <Stack
              spacing={4}
              direction="column"
              alignItems="end"
              sx={{ width: "100%" }}
            >
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setAddPaymentModalOpen(true)}
              >
                Досрочный платеж
              </Button>
              {earlyPayments && (
                <List
                  sx={{
                    width: "20vw",
                    display: "flex",
                    flexDirection: "column",
                    rowGap: 2,
                  }}
                >
                  {Array.from(earlyPayments.values()).map((payment, index) => (
                    <ListItem
                      key={index}
                      selected
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="remove"
                          onClick={() =>
                            dispatch(
                              removeEarlyPayment(
                                payment.date.toLocaleDateString("ru-RU")
                              )
                            )
                          }
                        >
                          <ClearIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`${numberWithSpaces(payment.amount)} ₽`}
                        secondary={payment.date.toLocaleDateString("ru-RU")}
                      />
                      <Chip
                        label={
                          payment.type === EarlyPaymentType.DURATION_REDUCTION
                            ? "Уменьшение срока"
                            : "Уменьшение платежа"
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Divider sx={{ width: "100%" }} />
              <Button
                variant="outlined"
                onClick={() => dispatch(countCreditSummaryAsync())}
              >
                Посчитать
              </Button>
            </Stack>
            <Dialog
              open={addPaymentModalOpen}
              onClose={() => setAddPaymentModalOpen(false)}
            >
              <DialogTitle>Досрочное погашение</DialogTitle>
              <Stack
                direction="column"
                spacing={2}
                padding={3}
                sx={{ minWidth: 600 }}
              >
                <FormControl variant="outlined">
                  <Input
                    type="text"
                    name="sum"
                    size="small"
                    endAdornment={
                      <InputAdornment position="end">₽</InputAdornment>
                    }
                    sx={{ paddingLeft: 2 }}
                    value={numberWithSpaces(earlyPaymentSum) || ""}
                    autoComplete="off"
                    onChange={(e) => {
                      const newValue = Number.parseFloat(
                        e.target.value.replaceAll(" ", "")
                      );

                      if (isNaN(newValue)) {
                        return setEarlyPaymentSum(0);
                      }

                      setEarlyPaymentSum(newValue);
                    }}
                  />
                  <FormHelperText>Сумма</FormHelperText>
                </FormControl>
                {earlyPaymentDate.map((date, index) => (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl variant="outlined">
                      <DatePicker
                        value={date}
                        onChange={(date) =>
                          setEarlyPaymentDate((prev) => [
                            ...prev.slice(0, index),
                            date,
                            ...prev.slice(index + 1),
                          ])
                        }
                      />
                      <FormHelperText>Дата платежа</FormHelperText>
                    </FormControl>
                    {index !== 0 && (
                      <FormControl variant="outlined">
                        <IconButton
                          onClick={() =>
                            setEarlyPaymentDate((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                        >
                          <ClearIcon />
                        </IconButton>
                        <FormHelperText> </FormHelperText>
                      </FormControl>
                    )}
                  </Stack>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    setEarlyPaymentDate((prev) => [
                      ...prev,
                      prev.at(-1) ? new Date(prev.at(-1)!).addMonths(1) : null,
                    ])
                  }
                  sx={{ width: "fit-content" }}
                >
                  Добавить дату
                </Button>
                <FormControl>
                  <Stack direction="row" spacing={2}>
                    <ToggleButtonGroup
                      color="primary"
                      aria-label="Тип платежа"
                      value={earlyPaymentType}
                      onChange={(_, newValue) => {
                        setEarlyPaymentType(newValue);
                      }}
                      exclusive
                    >
                      <ToggleButton value={EarlyPaymentType.DURATION_REDUCTION}>
                        Уменьшение срока
                      </ToggleButton>
                      <ToggleButton value={EarlyPaymentType.PAYMENT_REDUCTION}>
                        Уменьшение платежа
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                  <FormHelperText>Тип платежа</FormHelperText>
                </FormControl>
                <Button
                  variant="outlined"
                  sx={{ width: "fit-content" }}
                  onClick={onAddPayment}
                >
                  Добавить
                </Button>
              </Stack>
            </Dialog>
          </Stack>
          <Stack className="right" direction="column" spacing={4}>
            {!isLoading ? (
              creditSummary.payments && (
                <>
                  <Stack direction="column" spacing={2}>
                    <Stack direction="row" spacing={4}>
                      <FormControl>
                        <Typography variant="h5">
                          {numberWithSpaces(
                            creditSummary.basePayment || 0,
                            symbolsAfterDot
                          )}{" "}
                          ₽
                        </Typography>
                        <FormHelperText sx={{ margin: 0 }}>
                          Месячный платеж
                        </FormHelperText>
                      </FormControl>
                      <FormControl>
                        <Typography variant="h5">
                          {numberWithSpaces(
                            creditSummary.totalPaidSum || 0,
                            symbolsAfterDot
                          )}{" "}
                          ₽
                        </Typography>
                        <FormHelperText sx={{ margin: 0 }}>
                          Общая сумма
                        </FormHelperText>
                      </FormControl>
                      <FormControl>
                        <Typography variant="h5">
                          {numberWithSpaces(
                            creditSummary.totalPercentSum || 0,
                            symbolsAfterDot
                          )}{" "}
                          ₽
                        </Typography>
                        <FormHelperText sx={{ margin: 0 }}>
                          Проценты
                        </FormHelperText>
                      </FormControl>
                    </Stack>
                    <Stack direction="row" spacing={4}>
                      <FormControl>
                        <Typography variant="h5">
                          {creditOptions.dateStart?.toLocaleDateString("ru-RU")}
                        </Typography>
                        <FormHelperText sx={{ margin: 0 }}>
                          Дата начала
                        </FormHelperText>
                      </FormControl>
                      <FormControl>
                        <Typography variant="h5">
                          {creditSummary?.dateEnd}
                        </Typography>
                        <FormHelperText sx={{ margin: 0 }}>
                          Дата окончания
                        </FormHelperText>
                      </FormControl>
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <FormControl>
                      <Stack direction="row" spacing={2}>
                        <ToggleButtonGroup
                          color="primary"
                          aria-label="Остатки"
                          value={leftoversValue}
                          onChange={(_, newValue) => {
                            setLeftoversValue(newValue);
                            Storage.save(Storage.LEFTOVERS_KEY, newValue);
                          }}
                          exclusive
                        >
                          <ToggleButton value={LeftoversEnum.WITHOUT}>
                            Без коп.
                          </ToggleButton>
                          <ToggleButton value={LeftoversEnum.WITH}>
                            С коп.
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Stack>
                      <FormHelperText>Остатки</FormHelperText>
                    </FormControl>
                    <FormControl>
                      <Stack direction="row" spacing={2}>
                        <ToggleButtonGroup
                          color="primary"
                          aria-label="Группировка"
                          value={groupValue}
                          onChange={(_, newValue) => {
                            setGroupValue(newValue);
                            Storage.save(Storage.GROUP_KEY, newValue);
                          }}
                          exclusive
                        >
                          <ToggleButton value={PaymentsGroupEnum.NONE}>
                            Выкл.
                          </ToggleButton>
                          <ToggleButton value={PaymentsGroupEnum.BY_YEAR}>
                            По годам
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Stack>
                      <FormHelperText>Группировка</FormHelperText>
                    </FormControl>
                  </Stack>
                  {hasGroup && (
                    <Stack direction="row" spacing={2}>
                      <IconButton
                        disabled={years.indexOf(activeYear || 0) === 0}
                        onClick={() =>
                          setActiveYear(
                            years[years.indexOf(activeYear || 0) - 1]
                          )
                        }
                      >
                        <ArrowLeftIcon />
                      </IconButton>
                      <IconButton
                        disabled={
                          years.indexOf(activeYear || 0) === years.length - 1
                        }
                        onClick={() =>
                          setActiveYear(
                            years[years.indexOf(activeYear || 0) + 1]
                          )
                        }
                      >
                        <ArrowRightIcon />
                      </IconButton>
                    </Stack>
                  )}
                  <>
                    {hasGroup && (
                      <Stepper
                        nonLinear
                        activeStep={years.indexOf(activeYear || 0)}
                        sx={{ flexWrap: "wrap", rowGap: 2 }}
                        alternativeLabel
                      >
                        {years.map((year) => (
                          <Step key={year}>
                            <StepButton
                              color="inherit"
                              onClick={() => setActiveYear(year)}
                            >
                              {year}
                            </StepButton>
                          </Step>
                        ))}
                      </Stepper>
                    )}
                    <Grid
                      columnGap={4}
                      rowGap={4}
                      alignItems="stretch"
                      justifyContent="start"
                      container
                    >
                      {(hasGroup
                        ? creditSummary.payments.get(activeYear || 0) || []
                        : Array.from(creditSummary.payments.values()).flat()
                      )?.map((payment) => (
                        <Grid item>
                          <Card
                            sx={{
                              boxShadow:
                                payment.paymentType !== PaymentType.BASE
                                  ? "0px 2px 1px -1px #85cb90,0px 1px 1px 0px #85cb90,0px 1px 3px 0px #85cb90"
                                  : "",
                              height: "100%",
                            }}
                          >
                            <CardContent
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              <Typography
                                sx={{ fontSize: 14 }}
                                color="text.secondary"
                              >
                                {payment.date}
                              </Typography>
                              <FormControl>
                                <Typography variant="h5">
                                  {numberWithSpaces(
                                    payment.count,
                                    symbolsAfterDot
                                  )}{" "}
                                  ₽
                                </Typography>
                                <FormHelperText sx={{ margin: 0 }}>
                                  Остаток задолженности
                                </FormHelperText>
                              </FormControl>
                              <FormControl>
                                <Typography variant="h6">
                                  {numberWithSpaces(
                                    (payment.mainCreditPayment || 0) +
                                      (payment.percentPayment || 0),
                                    symbolsAfterDot
                                  )}{" "}
                                  ₽
                                </Typography>
                                <FormHelperText sx={{ margin: 0 }}>
                                  Платеж
                                </FormHelperText>
                              </FormControl>
                              <Stack
                                justifyContent="space-between"
                                spacing={1}
                                direction="row"
                              >
                                <FormControl>
                                  <Typography variant="body2">
                                    {numberWithSpaces(
                                      payment.percentPayment || 0,
                                      symbolsAfterDot
                                    )}{" "}
                                    ₽
                                  </Typography>
                                  <FormHelperText sx={{ margin: 0 }}>
                                    По процентам
                                  </FormHelperText>
                                </FormControl>
                                <FormControl>
                                  <Typography variant="body2">
                                    {numberWithSpaces(
                                      payment.mainCreditPayment || 0,
                                      symbolsAfterDot
                                    )}{" "}
                                    ₽
                                  </Typography>
                                  <FormHelperText sx={{ margin: 0 }}>
                                    По основному долгу
                                  </FormHelperText>
                                </FormControl>
                              </Stack>
                              {payment.paymentType !== PaymentType.BASE && (
                                <Chip
                                  label={
                                    payment.paymentType ===
                                    PaymentType.EARLY_DURATION
                                      ? "Уменьшение срока"
                                      : "Уменьшение платежа"
                                  }
                                  sx={{
                                    marginTop: 1,
                                    paddingY: 0.5,
                                    height: "fit-content",
                                    width: "fit-content",
                                  }}
                                />
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                </>
              )
            ) : (
              <CircularProgress />
            )}
          </Stack>
        </div>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
