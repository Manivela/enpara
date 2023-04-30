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
import Chart from "react-apexcharts";

const TRY = (value) =>
  currency(value, {
    symbol: "TL",
    decimal: ",",
    separator: ".",
    pattern: "+# !",
    negativePattern: "-# !",
  });

const ignorePartsRegex = /(İSTANBUL TRTR|IYZICO\/)/;
function prepareForCompare(str) {
  return str.replace(ignorePartsRegex, "").toLocaleLowerCase();
}

function groupTransactionsByName(transactions) {
  let grouped = [];
  for (const transaction of transactions) {
    const index = grouped.findIndex(
      (g) =>
        g.description &&
        transaction.description &&
        stringSimilarity.compareTwoStrings(
          prepareForCompare(g.description),
          prepareForCompare(transaction.description)
        ) >= 0.4
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

function groupTransactionsByDate(transactions) {
  let grouped = [];
  for (const transaction of transactions) {
    const index = grouped.findIndex(
      (g) =>
        g.date &&
        transaction.date &&
        g.date.getTime() === transaction.date.getTime()
    );
    if (index !== -1) {
      grouped[index].amount = grouped[index].amount.add(transaction.amount);
      grouped[index].transactions.push(transaction);
    } else {
      grouped.push({ ...transaction, transactions: [transaction] });
    }
  }
  return grouped.sort((a, b) => a.date - b.date);
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
        setTransactions(t.sort((a, b) => b.date - a.date));
      }
    });

    return () => {
      ignore = true;
    };
  }, [files]);

  const groupedTransactionsByName = groupTransactionsByName(transactions);
  const groupedTransactionsByDate = groupTransactionsByDate(transactions);
  const options = {
    series: [
      {
        name: "Günlük değişim",
        data: groupedTransactionsByDate.map((t) => t.amount.value),
      },
    ],
    xaxis: {
      categories: groupedTransactionsByDate.map((t) =>
        t.date.toLocaleDateString()
      ),
    },
    tooltip: {
      y: {
        formatter: (value) => {
          return TRY(value).format();
        },
      },
    },
  };

  return (
    <div className="App">
      <Typography>Enpara kredi kartı ekstre pdfleri</Typography>
      <Dropzone onChange={setFiles} />
      <Chart
        options={options}
        series={options.series}
        height={350}
        width={"100%"}
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography>Tüm işlemler:</Typography>
          <BasicTable rows={transactions} />
        </Grid>
        <Grid item xs={6}>
          <Typography>Gruplanmış işlemler</Typography>
          <GroupedTable rows={groupedTransactionsByName} />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
