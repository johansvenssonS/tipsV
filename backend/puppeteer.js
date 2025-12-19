import puppeteer from "puppeteer";

async function getKupong() {
  let browser;
  try {
    console.log("[Puppeteer] Launching browser...");
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-blink-features=AutomationControlled",
        "--window-size=1920,1080",
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    );

    // Set a longer timeout and faster loading strategy
    page.setDefaultTimeout(60000); // 60 seconds instead of 30
    page.setDefaultNavigationTimeout(60000);

    console.log("[Puppeteer] Navigating to svenskaspel.se/stryktipset...");
    await page.goto("https://spela.svenskaspel.se/stryktipset", {
      waitUntil: "networkidle2",
      timeout: 120000,
    });

    console.log("[Puppeteer] Page loaded successfully");

    // Wait for the specific element to be available
    console.log("[Puppeteer] Waiting for coupon rows...");
    await page.waitForSelector("ol.coupon-rows li", { timeout: 30000 });

    const matcher = await page.$$eval("ol.coupon-rows li", (elements) => {
      return elements.map((elements) => elements.textContent.trim());
    });

    console.log(
      `[Puppeteer] SUCCESS! Scraped ${matcher.length} matches:`,
      matcher
    );

    if (!matcher || matcher.length === 0) {
      throw new Error(
        "Scraper returned empty array - no matches found on page"
      );
    }

    return matcher;
  } catch (error) {
    console.error("[Puppeteer] SCRAPING FAILED:", error.message);
    console.error("[Puppeteer] Full error:", error);

    // Return empty array so server can fall back to last entry
    // BUT now with proper logging so we can debug
    return [];
  } finally {
    if (browser) {
      console.log("[Puppeteer] Closing browser...");
      await browser.close();
    }
  }
}
export default getKupong;

// function not_thursday(){
//   const test_data = [
//     '1Irland - Ungern1X2Tipsinfo1X2Svenska folket44%28%28%Odds2,653,252,95',
//     '2Bolton - Wimbledon1X2Tipsinfo1X2Svenska folket66%20%14%Odds1,584,105,80',
//     '3Doncaster - Bradford1X2Tipsinfo1X2Svenska folket43%25%32%Odds2,283,453,10',
//     '4Huddersfield - Peterborough 1X2Tipsinfo1X2Svenska folket72%15%13%Odds1,524,605,75',
//     '5Lincoln - Wigan1X2Tipsinfo1X2Svenska folket44%28%28%Odds2,353,253,15',
//     '6Plymouth - Stockport1X2Tipsinfo1X2Svenska folket37%22%41%Odds3,303,602,12',
//     '7Port Vale - Leyton Orient1X2Tipsinfo1X2Svenska folket53%23%24%Odds2,283,403,15',
//     '8Rotherham - Exeter1X2Tipsinfo1X2Svenska folket44%25%31%Odds2,333,453,00',
//     '9Wycombe - Mansfield1X2Tipsinfo1X2Svenska folket51%21%28%Odds2,083,553,50',
//     '10Milton Keynes Dons - Grimsby1X2Tipsinfo1X2Svenska folket53%26%21%Odds2,023,503,35',
//     '11Notts County - Fleetwood1X2Tipsinfo1X2Svenska folket59%21%20%Odds1,903,603,65',
//     '12Salford - Tranmere1X2Tipsinfo1X2Svenska folket46%29%25%Odds2,233,403,00',
//     '13Walsall - Chesterfield1X2Tipsinfo1X2Svenska folket43%26%31%Odds2,703,352,45'

//   ]
//   const today = new Date();
//   const day = today.getDay();
//   if (day !== 4) { // 4 är torsdag
//     return test_data;
//   }

// export { not_thursday };
// matcher console.log
// Öppnar sidan...
// Sidan är öppnad
// [
//   '1Irland - Ungern1X2Tipsinfo1X2Svenska folket44%28%28%Odds2,653,252,95',
//   '2Bolton - Wimbledon1X2Tipsinfo1X2Svenska folket66%20%14%Odds1,584,105,80',
//   '3Doncaster - Bradford1X2Tipsinfo1X2Svenska folket43%25%32%Odds2,283,453,10',
//   '4Huddersfield - Peterborough 1X2Tipsinfo1X2Svenska folket72%15%13%Odds1,524,605,75',
//   '5Lincoln - Wigan1X2Tipsinfo1X2Svenska folket44%28%28%Odds2,353,253,15',
//   '6Plymouth - Stockport1X2Tipsinfo1X2Svenska folket37%22%41%Odds3,303,602,12',
//   '7Port Vale - Leyton Orient1X2Tipsinfo1X2Svenska folket53%23%24%Odds2,283,403,15',
//   '8Rotherham - Exeter1X2Tipsinfo1X2Svenska folket44%25%31%Odds2,333,453,00',
//   '9Wycombe - Mansfield1X2Tipsinfo1X2Svenska folket51%21%28%Odds2,083,553,50',
//   '10Milton Keynes Dons - Grimsby1X2Tipsinfo1X2Svenska folket53%26%21%Odds2,023,503,35',
//   '11Notts County - Fleetwood1X2Tipsinfo1X2Svenska folket59%21%20%Odds1,903,603,65',
//   '12Salford - Tranmere1X2Tipsinfo1X2Svenska folket46%29%25%Odds2,233,403,00',
//   '13Walsall - Chesterfield1X2Tipsinfo1X2Svenska folket43%26%31%Odds2,703,352,45'
// ]
