import React from "react";
import {
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Input,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import {
  countCreditSummaryAsync,
  selectOptions,
  updateDateStart,
  updateDuration,
  updateDurationMonths,
  updatePercent,
  updateSum,
} from "../../store/creaditSlice/creditSlice";
import { numberWithSpaces } from "../../utils/format";
import { DatePicker } from "@mui/x-date-pickers";
import { EarlyPaymentDialog } from "./EarlyPaymentDialog/EarlyPaymentDialog";
import { EarlyPaymentsList } from "./EarlyPaymentsList/EarlyPaymentsList";

export const CountCreditSection = () => {
  const dispatch = useAppDispatch();

  const creditOptions = useAppSelector(selectOptions);

  // модалка добавления досрочных платежей
  const [addPaymentModalOpen, setAddPaymentModalOpen] = React.useState(false);

  return (
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
            endAdornment={<InputAdornment position="end">лет</InputAdornment>}
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
            endAdornment={<InputAdornment position="end">мес.</InputAdornment>}
            autoComplete="off"
            value={creditOptions.durationMonths || ""}
            onChange={(e) => dispatch(updateDurationMonths(+e.target.value))}
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
        <EarlyPaymentsList />
        <Divider sx={{ width: "100%" }} />
        <Button
          variant="outlined"
          onClick={() => dispatch(countCreditSummaryAsync())}
        >
          Посчитать
        </Button>
      </Stack>
      <EarlyPaymentDialog
        open={addPaymentModalOpen}
        onClose={() => setAddPaymentModalOpen(false)}
      />
    </Stack>
  );
};
