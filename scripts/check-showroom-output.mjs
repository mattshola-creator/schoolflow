import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("../showroom/out/", import.meta.url).pathname;
const forbidden = [
  /https:\/\/[a-z0-9-]+\.supabase\.co/,
  /qa-(?:payment|assessment|internal|provision)/i,
  /deploy-preview-(?:119|120|121)--/i,
  /(?:bgnmvfktscofbwpyougd|afqykqlxecpzspjoyegc)/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:sb_secret_|ghp_)[a-zA-Z0-9_]{20,}/,
];
const allowedPages = new Set([
  "index.html",
  "preview/index.html",
  "verify/index.html",
  "404.html",
  "404/index.html",
  "_not-found/index.html",
]);
let files = 0;
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await scan(path);
      continue;
    }
    files++;
    if (!/\.(?:html|js|json|txt|css|svg)$/.test(path)) continue;
    const content = await readFile(path, "utf8");
    if (forbidden.some((pattern) => pattern.test(content)))
      throw new Error(
        `Showroom isolation check failed: ${relative(root, path)}`,
      );
    if (path.endsWith(".html") && !allowedPages.has(relative(root, path)))
      throw new Error(`Unexpected exported page: ${relative(root, path)}`);
  }
}
await scan(root);
console.log(
  `Showroom isolation scan passed: ${files} static files; only public showroom routes exported.`,
);
