// 번들 크기 제한(CI 맞춤 검증). `npm run build` 뒤에 실행한다.
// 브라우저로 내려가는 JS(.next/static/chunks 아래 .js)를 파일마다 gzip으로 압축한 크기를 더해,
// 한도(기본 400KB)를 넘으면 실패(종료 코드 1)한다. 실제 전송에 가까운 값이라 gzip 크기로 잰다.
// 한도는 환경 변수 BUNDLE_LIMIT_KB로 바꿀 수 있다. 예: BUNDLE_LIMIT_KB=450 npm run check:bundle
import { appendFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const CHUNKS_DIR = join(".next", "static", "chunks");
const LIMIT_KB = Number(process.env.BUNDLE_LIMIT_KB ?? 400);
const TOP_COUNT = 5;

function listJsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listJsFiles(path);
    return entry.name.endsWith(".js") ? [path] : [];
  });
}

const toKb = (bytes) => bytes / 1024;
const formatKb = (bytes) => `${toKb(bytes).toFixed(1)} KB`;

if (!Number.isFinite(LIMIT_KB) || LIMIT_KB <= 0) {
  console.error(`BUNDLE_LIMIT_KB 값이 올바르지 않아요: ${process.env.BUNDLE_LIMIT_KB}`);
  process.exit(1);
}

if (!existsSync(CHUNKS_DIR)) {
  console.error(`${CHUNKS_DIR} 폴더가 없어요. 먼저 npm run build를 실행해 주세요.`);
  process.exit(1);
}

const files = listJsFiles(CHUNKS_DIR).map((path) => {
  const content = readFileSync(path);
  return { path: relative(CHUNKS_DIR, path), raw: content.length, gzip: gzipSync(content).length };
});
const totalRaw = files.reduce((sum, file) => sum + file.raw, 0);
const totalGzip = files.reduce((sum, file) => sum + file.gzip, 0);
const passed = toKb(totalGzip) <= LIMIT_KB;
const largest = [...files].sort((a, b) => b.gzip - a.gzip).slice(0, TOP_COUNT);

const verdict = passed ? "통과" : "실패";
console.log(`브라우저 JS ${files.length}개 · gzip 합계 ${formatKb(totalGzip)} (압축 전 ${formatKb(totalRaw)}) / 한도 ${LIMIT_KB} KB → ${verdict}`);
console.log(`gzip 기준 큰 파일 ${largest.length}개:`);
for (const file of largest) console.log(`  ${formatKb(file.gzip).padStart(9)}  ${file.path}`);

// GitHub Actions에서는 실행 요약(Summary) 화면에 결과 표를 남긴다.
if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = largest.map((file) => `| \`${file.path}\` | ${formatKb(file.gzip)} | ${formatKb(file.raw)} |`).join("\n");
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
    `## 번들 크기 ${passed ? "✅" : "❌"} ${verdict}`,
    "",
    `브라우저 JS ${files.length}개 · **gzip 합계 ${formatKb(totalGzip)}** / 한도 ${LIMIT_KB} KB (압축 전 ${formatKb(totalRaw)})`,
    "",
    `| gzip 기준 큰 파일 | gzip | 압축 전 |`,
    `| --- | --- | --- |`,
    rows,
    "",
  ].join("\n"));
}

if (!passed) {
  console.error(`번들 크기가 한도를 ${formatKb(totalGzip - LIMIT_KB * 1024)} 넘었어요. 큰 라이브러리나 불필요한 Client Component가 추가됐는지 확인해 주세요.`);
  process.exit(1);
}
