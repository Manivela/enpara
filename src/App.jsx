import currency from "currency.js";
import { useEffect, useState } from "react";
import "./App.css";
import BasicTable from "./BasicTable";
import { Dropzone } from "./Dropzone";
import { extractTableData } from "./utils";
import cuid from "cuid";
import { Grid, Typography } from "@mui/material";
import stringSimilarity from "string-similarity";

const TRY = (value) =>
  currency(value, {
    symbol: "TL",
    decimal: ",",
    separator: ".",
    pattern: "+# !",
    negativePattern: "-# !",
  });

function groupTransactions(transactions) {
  let grouped = [];
  for (const transaction of transactions) {
    const index = grouped.findIndex(
      (g) =>
        g.description &&
        transaction.description &&
        stringSimilarity.compareTwoStrings(
          g.description,
          transaction.description
        ) >= 0.5
    );
    if (index !== -1) {
      grouped[index].amount = grouped[index].amount.add(transaction.amount);
    } else {
      grouped.push({ ...transaction });
    }
  }
  return grouped;
}
function App() {
  const [files, setFiles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [previousBalance, setPreviousBalance] = useState(TRY(0));

  useEffect(() => {
    let ignore = false;
    Promise.all(files.map((file) => extractTableData(file))).then((file) => {
      const t = [];
      let b = TRY(0);
      for (const data of file) {
        for (const row of data) {
          if (
            row[0] === "İşlem tarihi" ||
            row[0]?.includes("yapılan işlemler")
          ) {
            continue;
          }
          if (row[1] === "Bir önceki ekstre bakiyeniz") {
            b = b.add(TRY(row[3]));
            continue;
          }
          const dateArray = row[0].split("/");
          const date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
          t.push({
            id: cuid(),
            date,
            description: row[1],
            installment: row[2],
            amount: TRY(row[3]),
          });
        }
      }
      if (!ignore) {
        setTransactions(t);
        setPreviousBalance(b);
      }
    });

    return () => {
      ignore = true;
    };
  }, [files]);

  console.log("transactions: ", transactions);
  const groupedTransactions = groupTransactions(transactions);

  return (
    <div className="App">
      <Typography>Enpara kredi kartı ekstre pdfleri</Typography>
      <Dropzone onChange={setFiles} />
      <Typography>Önceki bakiye: {previousBalance.format()}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography>Tüm işlemler:</Typography>
          <BasicTable rows={transactions} />
        </Grid>
        <Grid item xs={6}>
          <Typography>Gruplanmış işlemler</Typography>
          <BasicTable rows={groupedTransactions} />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
