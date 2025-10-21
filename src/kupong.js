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

    // Klicka i i kupong
    this.querySelectorAll(".bet-button").forEach((btn) => {
      btn.addEventListener("click", function () {
        if (btn.classList.contains("checked")) {
          btn.classList.remove("checked");
          btn.innerHTML = "";
        } else {
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
