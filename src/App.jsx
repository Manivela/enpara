import currency from "currency.js";
import { useEffect, useState } from "react";
import "./App.css";
import BasicTable from "./BasicTable";
import { Dropzone } from "./Dropzone";
import { extractTableData } from "./utils";
import cuid from "cuid";
import { Grid, Typography } from "@mui/material";
import stringSimilarity from "string-similarity";
import GroupedTable from "./GroupedTable";

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
      grouped[index].transactions.push(transaction);
    } else {
      grouped.push({ ...transaction, transactions: [transaction] });
    }
  }
  return grouped;
}
function App() {
  const [files, setFiles] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let ignore = false;
    Promise.all(files.map((file) => extractTableData(file))).then((file) => {
      const t = [];
      for (const data of file) {
        for (const row of data) {
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
      }
    });

    return () => {
      ignore = true;
    };
  }, [files]);

  const groupedTransactions = groupTransactions(transactions);

  return (
    <div className="App">
      <Typography>Enpara kredi kartı ekstre pdfleri</Typography>
      <Dropzone onChange={setFiles} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography>Tüm işlemler:</Typography>
          <BasicTable rows={transactions} />
        </Grid>
        <Grid item xs={6}>
          <Typography>Gruplanmış işlemler</Typography>
          <GroupedTable rows={groupedTransactions} />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
