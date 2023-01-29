export async function extractTableData(file) {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  await new Promise((resolve) => (reader.onload = resolve));
  // Load the PDF document
  const typedArray = new Uint8Array(reader.result);
  const loadingTask = pdfjsLib.getDocument(typedArray);
  const pdfDoc = await loadingTask.promise;
  // Get the number of pages in the PDF document
  const numPages = pdfDoc.numPages;
  // Create an array to store the extracted table data
  const tableData = [];
  // Iterate over the pages
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();

    // Extract the text from the textContent object
    let column1 = textContent.items.find((item) => item.str === "İşlem tarihi");
    if (!column1) {
      continue;
    }
    let column2 = textContent.items.find((item) => item.str === "Açıklama");
    let column3 = textContent.items.find((item) => item.str === "Taksit");

    let c1x = Math.round(column1.transform[4]);
    let c2x = Math.round(column2.transform[4]);
    let c3x = Math.round(column3.transform[4]);

    let c1w = c2x - c1x;
    let c2w = c3x - c2x;
    let c3w = Math.round(column3.width);

    // last field takes the leftover space
    let c4x = c3x + c3w;
    let c4w = Math.round(page.view[2]) - c4x;

    let end = textContent.items.find((item) => item.str.includes("Sayfa "));
    let column1index = textContent.items.indexOf(column1);
    let endIndex = textContent.items.indexOf(end);
    // Create an empty array to store the current row
    let currentRow = [];
    // Set the x and y coordinates of the previous text item
    let prevX, prevY;

    // Iterate through the text items
    for (let i = column1index; i < endIndex; i++) {
      let item = textContent.items[i];
      // Get the x and y coordinates of the current text item
      let x = item.transform[4];
      let y = item.transform[5];
      if (y < 45) {
        break;
      }
      // Check if the current text item is on a new row
      if (prevX !== undefined && y !== prevY) {
        // If the current row has data, add it to the table data
        if (currentRow.length > 0) {
          const a = currentRow.filter((r) => {
            let rx = Math.round(r.transform[4]);
            return rx >= c1x && rx < c1x + c1w;
          });
          const b = currentRow.filter((r) => {
            let rx = Math.round(r.transform[4]);
            return rx >= c2x && rx < c2x + c2w;
          });
          const c = currentRow.filter((r) => {
            let rx = Math.round(r.transform[4]);
            return rx >= c3x && rx < c3x + c3w;
          });
          const d = currentRow.filter((r) => {
            let rx = Math.round(r.transform[4]);
            return rx >= c4x && rx < c4x + c4w;
          });

          if (
            (!a || a.length === 0) &&
            tableData[tableData.length - 1].some((data) => data === undefined)
          ) {
            tableData[tableData.length - 1] = tableData[
              tableData.length - 1
            ].map((data, index) => {
              if (index === 0) {
                return data;
              }
              if (index === 1) {
                if (!b || b.length === 0) return data;
                return data
                  ? `${data} ${b
                      .map((x) => x.str)
                      .join("")
                      .trim()}`
                  : b
                      .map((x) => x.str)
                      .join("")
                      .trim();
              }
              if (index === 2) {
                return c.length > 0
                  ? c
                      .map((x) => x.str)
                      .join("")
                      .trim()
                  : undefined;
              }
              if (index === 3) {
                return d.length > 0
                  ? d
                      .map((x) => x.str)
                      .join("")
                      .trim()
                  : undefined;
              }
            });
          } else {
            tableData.push([
              a.length > 0
                ? a
                    .map((x) => x.str)
                    .join("")
                    .trim()
                : undefined,
              b.length > 0
                ? b
                    .map((x) => x.str)
                    .join("")
                    .trim()
                : undefined,
              c.length > 0
                ? c
                    .map((x) => x.str)
                    .join("")
                    .trim()
                : undefined,
              d.length > 0
                ? d
                    .map((x) => x.str)
                    .join("")
                    .trim()
                : undefined,
            ]);
          }
          currentRow = [];
        }
      }
      // Add the current text item to the current row
      currentRow.push(item);
      prevX = x;
      prevY = y;
    }
  }
  // Return the extracted table data
  return tableData;
}
