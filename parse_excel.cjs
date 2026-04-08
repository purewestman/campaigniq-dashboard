const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const filePath = "/Users/jwestman/Downloads/RSA Online_Train April FY27-2026-04-08-15-17-26.xlsx";
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];

// Use dev (defval) to avoid skipping empty cells if needed, 
// but sheet_to_json usually handles the sparsity by omitting keys.
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

const parsedData = {};
let lastCompany = "";
let lastActivity = "";
let activityCount = 0;

for (const row of data) {
  // 1. Identify Company (support multiple headers)
  let company = row["Intellum User: Custom H  ↑"] || row["Company"] || "";
  if (!company && lastCompany) {
    company = lastCompany;
  }
  lastCompany = company;

  // 2. Identify Activity
  let activity = row["Intellum Activity: Name  ↑"] || row["Activity "] || row["Activity"] || "";
  if (!activity && lastActivity) {
    activity = lastActivity;
  }
  lastActivity = activity;
  
  // 3. Identify Email
  const email = row["Intellum User: Email"] || row["Email"] || "";
  if (!email) continue;
  
  // Clean up Company name
  let cleanCompany = company;
  if (cleanCompany.startsWith("Altron")) {
    cleanCompany = "Altron Digital Business";
  }
  if (!cleanCompany) continue;

  const firstName = row["Intellum User: First Name"] || "";
  const lastName = row["Intellum User: Last Name"] || "";
  const name = firstName || lastName ? `${firstName} ${lastName}`.trim() : String(email).split('@')[0];
  
  const startedOnRaw = row["Started On"] || row["Intellum User: Last Login At"] || "";
  
  let timeStr = null;
  if (startedOnRaw) {
    const d = new Date(startedOnRaw);
    if (!isNaN(d.getTime())) {
      timeStr = d.toISOString();
    }
  }

  if (!parsedData[cleanCompany]) {
    parsedData[cleanCompany] = [];
  }
  
  parsedData[cleanCompany].push({
    email,
    name,
    activity: activity || "Unknown Activity",
    date: timeStr
  });
  
  activityCount++;
}

console.log(`Parsed ${activityCount} activities across ${Object.keys(parsedData).length} companies.`);

// Format as a TS module
const tsOutput = `// Auto-generated from Excel
export interface ActivityRecord {
  email: string;
  name: string;
  activity: string;
  date: string | null;
}

export const activityData: Record<string, ActivityRecord[]> = ${JSON.stringify(parsedData, null, 2)};
`;

const outPath = path.join(__dirname, "client", "src", "lib", "activityData.ts");
fs.writeFileSync(outPath, tsOutput);
console.log(`Wrote ${outPath}`);
