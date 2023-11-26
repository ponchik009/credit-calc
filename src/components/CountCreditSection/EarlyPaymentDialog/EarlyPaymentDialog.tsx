import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  InputAdornment,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers";

import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";

import { EarlyPaymentType } from "../../../utils/countCredit";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { addEarlyPayment } from "../../../store/creaditSlice/creditSlice";
import { numberWithSpaces } from "../../../utils/format";

interface EarlyPaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

export const EarlyPaymentDialog: React.FC<EarlyPaymentDialogProps> = ({
  open = false,
  onClose,
}) => {
  const dispatch = useAppDispatch();

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

    onClose();
  };

  React.useEffect(() => {
    setEarlyPaymentSum(0);
    setEarlyPaymentDate([null]);
    setEarlyPaymentType(EarlyPaymentType.DURATION_REDUCTION);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Досрочное погашение</DialogTitle>
      <Stack direction="column" spacing={2} padding={3} sx={{ minWidth: 600 }}>
        <FormControl variant="outlined">
          <Input
            type="text"
            name="sum"
            size="small"
            endAdornment={<InputAdornment position="end">₽</InputAdornment>}
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
  );
};
