export default class Kupong extends HTMLElement {
  constructor() {
    super();
    this.kupong = [];
    this.readonly = false;
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
          
          <div class="submit-section" style="display:flex; align-items:center; gap:12px; justify-content:flex-end;">
            <div class="kupong-cost" aria-live="polite" style="font-weight:600;">
              Kupongkostnad: <span class="kupong-cost-value">1</span> kr
            </div>
            <button class="submit-button">Lämna in kupong</button>
          </div>
        </div>
      </div>
    `;

    // Klicka i i kupong
    this.querySelectorAll(".bet-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (this.readonly) return;
        if (btn.classList.contains("checked")) {
          btn.classList.remove("checked");
          btn.innerHTML = "";
        } else {
          btn.classList.add("checked");
          btn.innerHTML =
            '<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>';
        }
        this.updateCost();
        this.dispatchEvent(new CustomEvent("kupong-change", { bubbles: true }));
      });
    });

    this.updateCost();

    return this;
  }

  fixData(kupong) {
    const str = String(kupong).replace(/^\d+\s*/, "");
    const teamNames = str.split("1X2")[0].trim();
    return teamNames;
  }

  updateCost() {
    const rows = this.querySelectorAll(".match-row");
    let product = 1;
    rows.forEach((row) => {
      const picks = row.querySelectorAll(".bet-button.checked").length;
      // Cost per match: 0→1, 1→1, 2→2, 3→4 (halv = x2, hel = x4)
      const factor = picks === 0 ? 1 : 2 ** (picks - 1);
      product *= factor;
    });
    const el = this.querySelector(".kupong-cost-value");
    if (el) el.textContent = String(product);
  }

  clearSelections() {
    this.querySelectorAll(".bet-button.checked").forEach((b) => {
      b.classList.remove("checked");
      b.innerHTML = "";
    });
    this.updateCost();
  }

  applySelections(kupongData) {
    // kupongData: [{ index: 1.., picks: [{col: '1'|'X'|'2'}] }]
    if (!Array.isArray(kupongData)) return;
    this.clearSelections();
    const rows = this.querySelectorAll(".match-row");
    kupongData.forEach((rowData) => {
      const rowIdx = (rowData.index || 1) - 1;
      const row = rows[rowIdx];
      if (!row) return;
      (rowData.picks || []).forEach((p) => {
        const btn = row.querySelector(`.bet-button[data-col="${p.col}"]`);
        if (btn && !btn.classList.contains("checked")) {
          btn.classList.add("checked");
          btn.innerHTML =
            '<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>';
        }
      });
    });
    this.updateCost();
  }

  setInteractive(enabled) {
    this.readonly = !enabled;
    const container = this.querySelector(".table-wrapper");
    if (container) container.style.pointerEvents = enabled ? "auto" : "none";
    const submitBtn = this.querySelector(".submit-button");
    if (submitBtn) submitBtn.toggleAttribute("disabled", !enabled);
  }
}
