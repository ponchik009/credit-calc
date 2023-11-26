import React from "react";
import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  Stack,
  Step,
  StepButton,
  Stepper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import { useAppSelector } from "../../hooks/useAppSelector";
import {
  selectOptions,
  selectPendingStatus,
  selectSummary,
} from "../../store/creaditSlice/creditSlice";
import { numberWithSpaces } from "../../utils/format";

import { Storage } from "../../utils/localStorage";
import { ArrowLeftIcon, ArrowRightIcon } from "@mui/x-date-pickers";
import { PaymentType } from "../../utils/countCredit";

enum LeftoversEnum {
  WITHOUT,
  WITH,
}

enum PaymentsGroupEnum {
  BY_YEAR,
  NONE,
}

export const CreditSummarySection = () => {
  const creditOptions = useAppSelector(selectOptions);
  const creditSummary = useAppSelector(selectSummary);
  const isLoading = useAppSelector(selectPendingStatus);

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

  React.useEffect(() => {
    if (creditSummary.payments) {
      const newYears = Array.from(creditSummary.payments.keys() || null).sort(
        (a, b) => a - b
      );
      setYears(newYears);
      setActiveYear(newYears[0]);
    }
  }, [creditSummary.payments]);

  return (
    <Stack className="right" direction="column" spacing={4}>
      {!isLoading ? (
        creditSummary.payments && (
          <>
            {/* Общая инфа */}
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
                  <FormHelperText sx={{ margin: 0 }}>Проценты</FormHelperText>
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
                  <Typography variant="h5">{creditSummary?.dateEnd}</Typography>
                  <FormHelperText sx={{ margin: 0 }}>
                    Дата окончания
                  </FormHelperText>
                </FormControl>
              </Stack>
            </Stack>
            {/* Настройки */}
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
            {/* Группировка по годам */}
            {hasGroup && (
              <>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    disabled={years.indexOf(activeYear || 0) === 0}
                    onClick={() =>
                      setActiveYear(years[years.indexOf(activeYear || 0) - 1])
                    }
                  >
                    <ArrowLeftIcon />
                  </IconButton>
                  <IconButton
                    disabled={
                      years.indexOf(activeYear || 0) === years.length - 1
                    }
                    onClick={() =>
                      setActiveYear(years[years.indexOf(activeYear || 0) + 1])
                    }
                  >
                    <ArrowRightIcon />
                  </IconButton>
                </Stack>
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
              </>
            )}
            {/* Список платежей */}
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
                      <Typography sx={{ fontSize: 14 }} color="text.secondary">
                        {payment.date}
                      </Typography>
                      <FormControl>
                        <Typography variant="h5">
                          {numberWithSpaces(payment.count, symbolsAfterDot)} ₽
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
                            payment.paymentType === PaymentType.EARLY_DURATION
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
        )
      ) : (
        <CircularProgress />
      )}
    </Stack>
  );
};
