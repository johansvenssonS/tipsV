export default class Kupong extends HTMLElement {
  constructor() {
    super();
    this.kupong = [];
  }
  async connectedCallback() {
    const today = new Date();
    const day = today.getDay();
    if (day !== 4) { // 4 är torsdag 
      const response = await fetch('https://tipsv.onrender.com/not_thursday');
      const data = await response.json();
      this.kupong = data.kupong || [];
      console.log("det är inte torsdag, använder testdata");
      this.render();
      return;
    } else {
      try {
      const response = await fetch('https://tipsv.onrender.com/kupong');
      const data = await response.json();
      this.kupong = data.kupong || [];
      console.log(this.kupong);
    } catch (error) {
      console.error('något gick fel:', error);
      this.kupong = [];
    }
    }
    
    this.render();
  }
  
  render() {
    let fixadData = this.kupong.map(this.fixData);
    this.innerHTML = `
      <h2 class="text-xl font-bold mb-2 text-center">Här är kupongen</h2>
      <div class="flex-start justify-center items-center">
        <table class="w-auto max-w-md bg-white rounded shadow border border-gray-200 text-sm mx-auto">
          <thead>
            <tr>
              <th class="px-2 py-1 text-left">Match</th>
              <th class="px-2 py-1">1</th>
              <th class="px-2 py-1">X</th>
              <th class="px-2 py-1">2</th>
            </tr>
          </thead>
          <tbody>
            ${fixadData.map((team, i) =>
              `<tr>
                <td class="border px-2 py-1 whitespace-nowrap">${team}</td>
                <td class="border px-2 py-1"><button class="outline-btn" data-row="${i}" data-col="1"></button></td>
                <td class="border px-2 py-1"><button class="outline-btn" data-row="${i}" data-col="X"></button></td>
                <td class="border px-2 py-1"><button class="outline-btn" data-row="${i}" data-col="2"></button></td>
              </tr>`
            ).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    this.querySelectorAll('.outline-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        btn.classList.toggle('checked');
        btn.innerHTML = btn.classList.contains('checked') ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>' : '';
      });
    });
    return this;
  }
  fixData(kupong) {
    const strings = String(kupong);
    const noNumbers = strings.replace(/^\d+/, '');
    const teamNames = noNumbers.split('1')[0].trim()
    console.log(teamNames);
    return teamNames;
  }
}


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

// Add styles for outline-btn and checked state
const style = document.createElement('style');
style.textContent = `
  .outline-btn {
    width: 28px;
    height: 28px;
    border: 2px solid #cbd5e1;
    background: #fff;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s;
    outline: none;
    margin: 0 auto;
  }
  .outline-btn.checked {
    border-color: #38bdf8;
  }
`;
document.head.appendChild(style);