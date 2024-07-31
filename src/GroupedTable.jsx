import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Collapse, IconButton } from "@mui/material";
import React from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { lightGreen } from "@mui/material/colors";
import { dateFormatter } from "./utils";
import { prepareForCompare } from "./App";

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow
        key={`group-${row.id}`}
        sx={{
          "& > *": { borderBottom: "unset" },
          backgroundColor: row.amount < 0 ? lightGreen[100] : undefined,
        }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {prepareForCompare(row.description)}
        </TableCell>
        <TableCell>{row.installment}</TableCell>
        <TableCell align="right">{`${row.amount.format()}`}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="transactions">
                <TableBody>
                  {row.transactions.map((transaction) => (
                    <TableRow
                      key={`group-detail-${transaction.id}`}
                      sx={{
                        backgroundColor:
                          transaction.amount < 0 ? lightGreen[100] : undefined,
                      }}
                    >
                      <TableCell>
                        {dateFormatter.format(transaction.date)}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.installment}</TableCell>
                      <TableCell align="right">{`${transaction.amount.format()}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function GroupedTable({ rows = [] }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>İşlem tarihi</TableCell>
            <TableCell>Açıklama</TableCell>
            <TableCell>Taksit</TableCell>
            <TableCell align="right">Tutar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
