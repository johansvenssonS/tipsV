export default class Kupong extends HTMLElement {
  constructor() {
    super();
    this.kupong = [];
  }

  async connectedCallback() {
    this.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <span class="loading-text">Hämtar Kupong...</span>
      </div>
    `;

    try {
      const response = await fetch("https://tipsv.onrender.com/kupong");
      const data = await response.json();
      this.kupong = data.kupong || [];
      console.log(this.kupong);
    } catch (error) {
      console.error("något gick fel:", error);
      this.kupong = [];
    }
    this.render();
  }

  render() {
    let fixedData = this.kupong.map(this.fixData);
    this.innerHTML = `
      <div class="kupong-container">
        <h2 class="kupong-title">Veckans Kupong</h2>
        
        <div class="table-wrapper">
          <table class="matches-table">
            <thead>
              <tr class="table-header">
                <th class="match-header">Match</th>
                <th class="bet-header">1</th>
                <th class="bet-header">X</th>
                <th class="bet-header">2</th>
              </tr>
            </thead>
            <tbody class="table-body">
              ${fixedData
                .map(
                  (team, i) =>
                    `<tr class="match-row">
                      <td class="team-names">${team}</td>
                      <td class="bet-cell">
                        <button class="bet-button" data-row="${i}" data-col="1"></button>
                      </td>
                      <td class="bet-cell">
                        <button class="bet-button" data-row="${i}" data-col="X"></button>
                      </td>
                      <td class="bet-cell">
                        <button class="bet-button" data-row="${i}" data-col="2"></button>
                      </td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="submit-section">
            <button class="submit-button">Lämna in kupong</button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners for bet buttons
    this.querySelectorAll(".bet-button").forEach((btn) => {
      btn.addEventListener("click", function () {
        if (btn.classList.contains("checked")) {
          // If checked, uncheck it
          btn.classList.remove("checked");
          btn.innerHTML = "";
        } else {
          // If not checked, check it
          btn.classList.add("checked");
          btn.innerHTML =
            '<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>';
        }
      });
    });

    return this;
  }

  fixData(kupong) {
    const str = String(kupong).replace(/^\d+\s*/, "");
    const teamNames = str.split("1X2")[0].trim();
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
const style = document.createElement("style");
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
