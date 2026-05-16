const fs = require('fs');
const path = require('path');

const csv = fs.readFileSync('c:/Users/subho/Downloads/colleges.csv', 'utf8');
const lines = csv.split('\n').filter(l => l.trim());

// Parse CSV properly handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQuotes = !inQuotes; }
    else if (line[i] === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += line[i]; }
  }
  result.push(current.trim());
  return result;
}

// Build a compact array: [name, state, district, city]
const colleges = [];
for (let i = 1; i < lines.length; i++) {
  const parts = parseCSVLine(lines[i]);
  if (!parts[2]) continue;
  colleges.push([parts[2].trim(), parts[1]?.trim() || '', parts[6]?.trim() || '', parts[5]?.trim() || '']);
}

console.log('Total parsed:', colleges.length);
console.log('Sample:', JSON.stringify(colleges.slice(0, 3)));

// Write compact JSON
const json = JSON.stringify(colleges);
const outPath = path.join(__dirname, '..', 'public', 'colleges.json');
fs.writeFileSync(outPath, json, 'utf8');
const stats = fs.statSync(outPath);
console.log('Output size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
