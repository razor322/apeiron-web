import { chromium } from "@playwright/test";
const b = await chromium.launch({ args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:3000/en", { waitUntil: "domcontentloaded", timeout: 15000 });
await p.waitForTimeout(2000);
const max = await p.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
for (const [i, f] of [0,0.3,0.55,0.85].entries()) {
  await p.evaluate((y) => window.scrollTo(0, y), max * f);
  await p.waitForTimeout(800);
  await p.screenshot({ path: `C:/Users/Gybran/AppData/Local/Temp/opencode/v${i}.png` });
}
await b.close();
console.log("done max=" + max);