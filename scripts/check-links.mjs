// Checks every outbound link in lib/site.ts and lib/content.ts.
//   voltwisepower.com URLs must appear in the live /sitemap.xml (query strings such as ?enquiry=4 are ignored)
//   and answer 200; other hosts must answer 2xx/3xx (LinkedIn answers 999 to scripts, reported as such).
// Run: npm run links
import { readFileSync } from "node:fs";

const LIVE = "https://www.voltwisepower.com";
const sources = ["lib/site.ts", "lib/content.ts"].map((f) => readFileSync(f, "utf8")).join("\n").replaceAll("${LIVE}", LIVE);
const urls = [...new Set([...sources.matchAll(/https?:\/\/[^"'`\s)]+/g)].map((m) => m[0]))].sort();

const sitemap = await (await fetch(`${LIVE}/sitemap.xml`)).text();
const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/\/$/, "")));

let failed = 0;
for (const url of urls) {
  const bare = url.split("?")[0].replace(/\/$/, "");
  const own = bare.startsWith(LIVE);
  let status = 0;
  try { status = (await fetch(url, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 link-check" } })).status; } catch { status = 0; }
  const inMap = own ? listed.has(bare) : null;
  const ok = own ? inMap && status === 200 : (status >= 200 && status < 400) || status === 999;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${status} ${own ? (inMap ? "in-sitemap " : "NOT-IN-MAP ") : "external   "} ${url}`);
}
console.log(`\n${urls.length} links, ${failed} failed`);
process.exit(failed ? 1 : 0);
