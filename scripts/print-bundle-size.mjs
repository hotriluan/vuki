import fs from 'fs';
import path from 'path';

// Script: Tổng hợp kích thước bundle sau next build.
// Chiến lược: duyệt thư mục .next/static/chunks + .next/static/chunks/pages (nếu tồn tại)
// và tính tổng size các file .js, đồng thời liệt kê top 5 file lớn nhất.

function format(bytes) {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' kB';
  const mb = kb / 1024;
  return mb.toFixed(2) + ' MB';
}

const roots = [
  '.next/static/chunks',
  '.next/static/chunks/pages'
];

let files = [];
for (const dir of roots) {
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isFile() && /\.js$/.test(entry)) {
      const size = fs.statSync(full).size;
      files.push({ file: full, size });
    }
  }
}

if (files.length === 0) {
  console.log('Không tìm thấy file bundle JS nào. Đảm bảo đã chạy `next build`.');
  process.exit(0);
}

const total = files.reduce((s, f) => s + f.size, 0);
files.sort((a, b) => b.size - a.size);
const top = files.slice(0, 5);

console.log('=== Bundle Size Summary ===');
console.log('Tổng số file JS:', files.length);
console.log('Tổng dung lượng :', format(total));
console.log('\nTop 5 file lớn nhất:');
for (const f of top) {
  console.log(' -', f.file, '=>', format(f.size));
}

// Xuất JSON (có thể dùng cho github-script)
const summary = { totalBytes: total, totalHuman: format(total), fileCount: files.length, top: top.map(t => ({ file: t.file, bytes: t.size, human: format(t.size) })) };
fs.writeFileSync('bundle-size-summary.json', JSON.stringify(summary, null, 2));
console.log('\nĐã ghi bundle-size-summary.json');
