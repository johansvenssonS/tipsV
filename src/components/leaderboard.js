import { API_BASE } from "../config.js";

export default class Leaderboard extends HTMLElement {
  constructor() {
    super();
    this.code = localStorage.getItem("userCode");
    this.entries = [];
  }

  async connectedCallback() {
    this.render();
    await this.loadLeaderboard();
  }

  async loadLeaderboard() {
    if (!this.code) return;
    try {
      const res = await fetch(
        `${API_BASE}/backend/leaderboard?code=${encodeURIComponent(this.code)}`
      );
      const data = await res.json();
      this.entries = data.leaderboard || [];
    } catch (error) {
      console.error("leaderboard load error:", error);
      this.entries = [];
    }
    this.renderRows();
  }

  render() {
    this.innerHTML = `
    <div class="nav">
      <div class="logo">
        <img
          src="./static/logo/tipsvänner.png"
          alt="Tipsvänner Logo"
          height="100px"
          width="300px"
        />
      </div>
      <div class="links">
        <a class="aLink" href="">Hem</a>
        <a class="aLink" href="#team">Mitt Lag</a>
        <a class="aLink" href="#play">DevPlay</a>
        <a class="aLink" href="#leaderboard">Topplista</a>
      </div>
    </div>
    <div class="mainT">
      <div class="trupp">
        <h1>Topplista</h1>
        <p>Se vem som verkligen kan sina grejer – och vem som bara har tur!</p>
      </div>
      <div class="table-wrapper">
        <table class="matches-table">
          <thead>
            <tr class="table-header">
              <th class="match-header">#</th>
              <th class="match-header">Spelare</th>
              <th class="bet-header">Rätt</th>
              <th class="bet-header">Möjliga</th>
              <th class="bet-header">Snitt</th>
              <th class="bet-header">Veckor</th>
            </tr>
          </thead>
          <tbody id="leaderboard-body"></tbody>
        </table>
      </div>
    </div>
    `;
  }

  renderRows() {
    const tbody = this.querySelector("#leaderboard-body");
    if (!tbody) return;

    if (this.entries.length === 0) {
      tbody.innerHTML = `
        <tr class="match-row">
          <td class="team-names" colspan="6">
            Inga resultat än – spela och vänta på att veckans matcher avgörs!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.entries
      .map(
        (p, i) => `
        <tr class="match-row">
          <td class="team-names">${i + 1}</td>
          <td class="team-names" style="color:${p.color || "#1f2937"}; font-weight:600;">${p.name}</td>
          <td class="team-names" style="text-align:center;">${p.totalCorrect}</td>
          <td class="team-names" style="text-align:center;">${p.totalResolved}</td>
          <td class="team-names" style="text-align:center;">${Math.round(p.average * 100)}%</td>
          <td class="team-names" style="text-align:center;">${p.weeksPlayed}</td>
        </tr>
      `
      )
      .join("");
  }
}
