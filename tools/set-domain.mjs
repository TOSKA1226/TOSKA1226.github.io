import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2];
const origin = (process.argv[3] || '').replace(/\/+$/, '');
if (!root || !origin) { console.error('usage: node set-domain.mjs <siteDir> <https://host>'); process.exit(1); }
const newHost = origin.replace(/^https?:\/\//, '');
const OLD_HOSTS = ['jiangdongyong.pages.dev', 'YOURNAME.pages.dev', 'toska1226.github.io'];
const exts = new Set(['.html', '.xml', '.txt', '.md', '.json', '.webmanifest']);
const skipDirs = new Set(['.git', 'node_modules', 'previews', '.backup-archive-v1', '.backup-archive-v2', '.backup-archive-v3']);

let changed = 0, files = 0;
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) { if (!skipDirs.has(ent.name)) walk(path.join(dir, ent.name)); continue; }
    if (!exts.has(path.extname(ent.name).toLowerCase())) continue;
    const p = path.join(dir, ent.name);
    let s = fs.readFileSync(p, 'utf8');
    const before = s;
    for (const h of OLD_HOSTS) {
      if (h === newHost) continue;
      s = s.split(h).join(newHost);
    }
    if (s !== before) {
      let n = 0;
      for (const h of OLD_HOSTS) if (h !== newHost) n += before.split(h).length - 1;
      changed += n; files++;
      fs.writeFileSync(p, s, 'utf8');
      console.log('  ' + path.relative(root, p) + '  (' + n + ')');
    }
  }
}
walk(root);
console.log('files changed: ' + files + ', occurrences: ' + changed + ' -> ' + newHost);
