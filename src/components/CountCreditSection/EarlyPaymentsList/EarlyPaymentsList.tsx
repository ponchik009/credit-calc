import React from "react";
import { Chip, IconButton, List, ListItem, ListItemText } from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";

import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { useAppSelector } from "../../../hooks/useAppSelector";
import {
  removeEarlyPayment,
  selectEarlyPayments,
} from "../../../store/creaditSlice/creditSlice";
import { numberWithSpaces } from "../../../utils/format";
import { EarlyPaymentType } from "../../../utils/countCredit";

export const EarlyPaymentsList = () => {
  const dispatch = useAppDispatch();

  const earlyPayments = useAppSelector(selectEarlyPayments);

  return (
    earlyPayments && (
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
                    removeEarlyPayment(payment.date.toLocaleDateString("ru-RU"))
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
    )
  );
};
