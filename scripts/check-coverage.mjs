import fs from 'fs';

// Simple coverage threshold checker for Vitest v8 (coverage-summary.json)
// Adjust thresholds as needed.
const THRESHOLDS = {
  statements: 40,
  branches: 30,
  functions: 40,
  lines: 40
};

function fail(msg) {
  console.error(`\n❌ Coverage check failed: ${msg}`);
  process.exit(1);
}

const summaryPath = 'coverage/coverage-summary.json';
if (!fs.existsSync(summaryPath)) {
  fail(`Không tìm thấy file ${summaryPath}. Hãy chạy 'npm run test:coverage' trước.`);
}

const data = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const total = data.total;

let passed = true;
for (const key of Object.keys(THRESHOLDS)) {
  const required = THRESHOLDS[key];
  const pct = total[key]?.pct;
  if (typeof pct !== 'number') {
    fail(`Không có chỉ số '${key}' trong coverage-summary.`);
  }
  if (pct < required) {
    console.error(` - ${key}: ${pct}% < required ${required}%`);
    passed = false;
  } else {
    console.log(` - ${key}: ${pct}% >= ${required}% ✓`);
  }
}

if (!passed) {
  fail('Coverage dưới ngưỡng yêu cầu.');
}

console.log('\n✅ Coverage đạt ngưỡng tối thiểu.');
