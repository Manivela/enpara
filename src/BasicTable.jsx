import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { lightGreen } from "@mui/material/colors";
import { dateFormatter } from "./utils";

export default function BasicTable({ rows = [] }) {
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
            <TableRow
              key={row.id}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                backgroundColor: row.amount < 0 ? lightGreen[100] : undefined,
              }}
            >
              <TableCell>{dateFormatter.format(row.date)}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.installment}</TableCell>
              <TableCell align="right">{`${row.amount.format()}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
