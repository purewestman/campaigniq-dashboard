const parser = require('@babel/parser');
const fs = require('fs');
const code = fs.readFileSync('client/src/components/CampaignTable.tsx', 'utf-8');
try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log("Parse successful");
} catch (e) {
  console.error("Syntax Error:", e.pos, e.loc, e.message);
  console.log("Context around error:");
  const lines = code.split('\n');
  const errorLine = e.loc.line - 1;
  for(let i=Math.max(0, errorLine - 5); i<Math.min(lines.length, errorLine + 5); i++) {
    console.log(i+1 + ": " + lines[i]);
  }
}
