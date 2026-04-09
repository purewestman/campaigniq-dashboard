const xlsx = require("xlsx");
const fs = require("fs");

const filePath = process.argv[2];
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

try {
  const workbook = xlsx.readFile(filePath);
  console.log("Sheet Names:", workbook.SheetNames);
  
  workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`Sheet: ${name}`);
    if (data.length > 0) {
      console.log("Headers (Row 1):", data[0]);
      if (data.length > 1) {
        console.log("Row 2 Sample:", data[1]);
      }
    } else {
      console.log("Sheet is empty.");
    }
  });
} catch (e) {
  console.error("Error reading file:", e.message);
}
