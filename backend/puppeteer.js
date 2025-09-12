
import puppeteer from 'puppeteer';

async function getKupong(){
  console.log("inne i funktionen");
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    console.log("Öppnar sidan...");
    await page.goto('https://spela.svenskaspel.se/stryktipset', { waitUntil: 'networkidle0' });
    console.log("Sidan är öppnad");
    const matcher = await page.$$eval('ol.coupon-rows li', elements => {
      return elements.map(elements => elements.textContent.trim());
    });
    console.log(matcher);
    return matcher;
    //matcher är en array med strings
  } catch (error) {
    console.log("Något blev fel:", error);
    return [];
  }finally {
    if (browser) {
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