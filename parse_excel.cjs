const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const filePath = process.argv[2] || "/Users/jwestman/Downloads/Partner online training report April FY27 (1).xlsx";
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];

// Use dev (defval) to avoid skipping empty cells if needed, 
// but sheet_to_json usually handles the sparsity by omitting keys.
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

const outPath = path.join(__dirname, "client", "src", "lib", "activityData.ts");

// 1. Read existing data if it exists
let existingData = {};
if (fs.existsSync(outPath)) {
  const content = fs.readFileSync(outPath, "utf8");
  const jsonMatch = content.match(/export const activityData: Record<string, ActivityRecord\[\]> = ([\s\S]*?);/);
  if (jsonMatch) {
    try {
      existingData = JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.warn("Could not parse existing activityData.ts, starting fresh.");
    }
  }
}

const parsedData = { ...existingData };
let lastCompany = "";
let lastActivity = "";
let activityCount = 0;
let newRecordsCount = 0;

for (const row of data) {
  // 1. Identify Company (support multiple headers)
  let company = row["Contact: Account Name"] || row["Intellum User: Custom H  ↑"] || row["Company"] || row["Table 1"] || "";
  if (!company && lastCompany) {
    company = lastCompany;
  }
  lastCompany = company;

  // 2. Identify Activity
  let activity = row["Exam Name"] || row["Intellum Activity: Name  ↑"] || row["Activity "] || row["Activity"] || row["__EMPTY"] || "";
  if (!activity && lastActivity) {
    activity = lastActivity;
  }
  lastActivity = activity;
  
  // 3. Identify Email
  const email = row["Email (Corporate)"] || row["Intellum User: Email"] || row["Email"] || row["__EMPTY_1"] || "";
  if (!email || email === "User: Email" || email === "Email (Corporate)") continue;
  
  if (activity === "Activity: Name" || activity === "Exam Name") continue; 
  // Clean up Company name
  let cleanCompany = company;
  if (cleanCompany.startsWith("Altron")) {
    cleanCompany = "Altron Digital Business";
  }
  if (!cleanCompany) continue;

  const firstName = row["Contact: First Name"] || row["Intellum User: First Name"] || row["__EMPTY_6"] || "";
  const lastName = row["Contact: Last Name"] || row["Intellum User: Last Name"] || row["__EMPTY_7"] || "";
  const name = firstName || lastName ? `${firstName} ${lastName}`.trim() : String(email).split('@')[0];
  
  const startedOnRaw = row["Exam Date"] || row["Started On"] || row["Intellum User: Last Login At"] || row["__EMPTY_5"] || "";
  
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
  
  // Check for duplicates
  const exists = parsedData[cleanCompany].some(r => r.email === email && r.activity === activity);
  if (!exists) {
    parsedData[cleanCompany].push({
      email,
      name,
      activity: activity || "Unknown Activity",
      date: timeStr
    });
    newRecordsCount++;
  }
  
  activityCount++;
}

console.log(`Processed ${activityCount} rows. Added ${newRecordsCount} new records across ${Object.keys(parsedData).length} companies.`);

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

fs.writeFileSync(outPath, tsOutput);
console.log(`Wrote ${outPath}`);
