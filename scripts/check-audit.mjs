import { execSync } from 'child_process';

// Chạy npm audit (prod only) và fail nếu có High/Critical.
// Sử dụng định dạng JSON để parse.

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString();
  } catch (e) {
    // npm audit trả code !=0 nếu có vulnerabilities; vẫn lấy stdout để phân tích
    if (e.stdout) return e.stdout.toString();
    throw e;
  }
}

console.log('Chạy: npm audit --omit=dev --json');
const raw = run('npm audit --omit=dev --json');
let data;
try { data = JSON.parse(raw); } catch (e) {
  console.error('Không parse được JSON từ npm audit');
  console.log(raw.slice(0, 500));
  process.exit(1);
}

// Cấu trúc npm audit mới (npm v8+): data.vulnerabilities có severity.
const vulns = data.vulnerabilities || {};
let high = 0, critical = 0, moderate = 0, low = 0;
for (const pkg of Object.keys(vulns)) {
  const v = vulns[pkg];
  switch (v.severity) {
    case 'critical': critical += v.via?.length ? v.via.length : 1; break;
    case 'high': high += v.via?.length ? v.via.length : 1; break;
    case 'moderate': moderate += v.via?.length ? v.via.length : 1; break;
    case 'low': low += v.via?.length ? v.via.length : 1; break;
  }
}

console.log('\n=== Kết quả audit (prod) ===');
console.log('Critical:', critical);
console.log('High    :', high);
console.log('Moderate:', moderate);
console.log('Low     :', low);

if (critical > 0 || high > 0) {
  console.error('\n❌ Có lỗ hổng High hoặc Critical. Vui lòng xử lý trước khi merge.');
  process.exit(1);
}

console.log('\n✅ Không có High/Critical.');
