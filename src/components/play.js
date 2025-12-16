export default class Game extends HTMLElement {
  constructor() {
    super();
    this.teamName = localStorage.getItem("currentUser");
    this.userData = null;
    this.playerColors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ];
    this.games = [
      "Match 1",
      "Match 2",
      "Match 3",
      "Match 4",
      "Match 5",
      "Match 6",
      "Match 7",
      "Match 8",
      "Match 9",
      "Match 10",
      "Match 11",
      "Match 12",
      "Match 13",
    ];
  }

  async connectedCallback() {
    this.render();
    this.bindKupongSubmit();
    await this.loadPlayersAndGames();
    await this.initEntriesUI();
  }

  async getUser() {
    try {
      const userCode = localStorage.getItem("userCode");

      if (!userCode) {
        console.error("No user code found");
        return null;
      }
      const response = await fetch("https://tipsv.onrender.com/backend/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: userCode }),
      });

      if (!response.ok) {
        throw new Error("Failed to get user data");
      }

      const userData = await response.json();
      const players = userData.kupong_data;
      console.log("User data from DB:", players);

      return players;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }
  async loadPlayersAndGames() {
    this.userData = await this.getUser();
    if (this.userData && this.userData.players) {
      // Wait for kupong to load, then get real match data
      await this.waitForKupongData();
      this.assignGamesToPlayers();
      this.renderPlayerTable();
    }
  }

  async initEntriesUI() {
    const code = localStorage.getItem("userCode");
    if (!code) return;
    try {
      const listResp = await this.fetchJson(
        `https://tipsv.onrender.com/backend/entries/list?code=${encodeURIComponent(
          code
        )}`
      );
      const items = listResp?.data?.items || [];
      this.populateEntryDropdown(items);

      const latestResp = await this.fetchJson(
        `https://tipsv.onrender.com/backend/entries/latest?code=${encodeURIComponent(
          code
        )}`
      );
      const entry = latestResp?.data?.entry;
      if (entry) {
        this.applyEntry(entry);
        this.setEntryStatus(entry);
        const canEdit =
          !entry.locked && this.isCurrentWeek(entry.week, entry.year);
        this.setEditButtonAvailability(canEdit);
        this.setEditable(canEdit);
        const select = this.querySelector("#entry-select");
        if (select) select.value = `${entry.year}-${entry.week}`;
      } else {
        this.setEditButtonAvailability(true);
        this.setEditable(true);
      }
    } catch (e) {
      console.error("entries init error", e);
      this.populateEntryDropdown([]);
      this.setEditButtonAvailability(true);
      this.setEditable(true);
    }

    // Bind dropdown and edit button
    const select = this.querySelector("#entry-select");
    const editBtn = this.querySelector("#edit-entry");
    select?.addEventListener("change", async () => {
      const val = select.value; // e.g., 2025-46
      const [y, w] = val.split("-").map((x) => Number(x));
      await this.loadAndApplyEntry(w, y);
    });
    editBtn?.addEventListener("click", () => {
      this.setEditable(true);
      this.showToast("Redigering aktiverad", "info");
    });
  }

  isCurrentWeek(week, year) {
    const now = new Date();
    const cur = this.getWeekInfo(now);
    return cur.week === Number(week) && cur.year === Number(year);
  }

  getWeekInfo(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return { week, year: d.getUTCFullYear() };
  }

  populateEntryDropdown(items) {
    const select = this.querySelector("#entry-select");
    if (!select) return;
    select.innerHTML = items
      .map((i) => {
        return `<option value="${i.year}-${i.week}">v${i.week} ${i.year}${
          i.locked ? " (låst)" : ""
        }</option>`;
      })
      .join("");
  }

  async loadAndApplyEntry(week, year) {
    const code = localStorage.getItem("userCode");
    const resp = await this.fetchJson(
      `https://tipsv.onrender.com/backend/entries/get?code=${encodeURIComponent(
        code
      )}&week=${week}&year=${year}`
    );
    const entry = resp?.data?.entry;
    if (entry) {
      this.applyEntry(entry);
      this.setEntryStatus(entry);
      const editable = !entry.locked && this.isCurrentWeek(week, year);
      this.setEditButtonAvailability(editable);
      this.setEditable(editable);
    }
  }

  applyEntry(entry) {
    const kupongEl = this.querySelector("my-kupong");
    kupongEl?.applySelections(entry?.data?.kupong || []);
  }

  setEntryStatus(entry) {
    const status = this.querySelector("#entry-status");
    if (!status) return;
    status.textContent = entry.locked
      ? `v${entry.week} ${entry.year} – Låst`
      : `v${entry.week} ${entry.year}`;
  }

  setEditable(enabled) {
    const kupongEl = this.querySelector("my-kupong");
    kupongEl?.setInteractive(enabled);
    const submitBtn = this.querySelector("my-kupong .submit-button");
    if (submitBtn) submitBtn.toggleAttribute("disabled", !enabled);
    const editBtn = this.querySelector("#edit-entry");
    if (editBtn) editBtn.toggleAttribute("disabled", enabled);
  }

  setEditButtonAvailability(canEdit) {
    const editBtn = this.querySelector("#edit-entry");
    if (editBtn) editBtn.disabled = !canEdit;
  }

  bindKupongSubmit() {
    const tryBind = () => {
      const kupongEl = this.querySelector("my-kupong");
      const btn = kupongEl?.querySelector(".submit-button");
      if (btn && !btn.__boundToPlay) {
        btn.addEventListener("click", (e) => this.handleSubmit(e));
        btn.__boundToPlay = true;
        return true;
      }
      return false;
    };

    if (!tryBind()) {
      const observer = new MutationObserver(() => {
        if (tryBind()) observer.disconnect();
      });
      observer.observe(this, { childList: true, subtree: true });
    }
  }

  collectKupongData() {
    const rows = this.querySelectorAll(".match-row");
    const kupong = Array.from(rows).map((row, idx) => {
      const match = row.querySelector(".team-names")?.textContent.trim() || "";
      const selected = row.querySelectorAll(".bet-cell .bet-button.checked");

      const picks = Array.from(selected).map((btn) => {
        const col = btn.getAttribute("data-col");
        const label = col ?? btn.textContent.trim();
        return { col, label };
      });

      return {
        index: idx + 1,
        match,
        picks,
      };
    });

    const players = (this.userData?.players ?? []).map((p) => {
      const indices = new Set(p.assignedGames.map((g) => g.index));
      const myPicks = kupong.filter((k) => indices.has(k.index));
      return {
        name: p.name,
        color: p.color,
        assignedGames: p.assignedGames,
        picks: myPicks,
      };
    });

    const teamPayload = {
      team: this.teamName,
      submittedAt: new Date().toISOString(),
      kupong,
    };

    return { teamPayload, players };
  }

  async handleSubmit(e) {
    e?.preventDefault?.();

    const submitBtn = this.querySelector("my-kupong .submit-button");
    submitBtn?.setAttribute("disabled", "true");

    try {
      // Validate: every match has at least one pick
      const rows = this.querySelectorAll(".match-row");
      const missing = [];
      rows.forEach((row, i) => {
        const hasPick = row.querySelector(".bet-button.checked");
        row.classList.toggle("missing-pick", !hasPick);
        if (!hasPick) missing.push(i + 1);
      });
      if (missing.length) {
        this.showToast(
          `Du måste välja för alla matcher (${missing.length} saknas)`,
          "error"
        );
        return;
      }

      const { teamPayload, players } = this.collectKupongData();
      console.log("Submitting:", { teamPayload, players });

      const code = localStorage.getItem("userCode");
      if (!code) throw new Error("No team code found in localStorage");

      const teamData = {
        team: teamPayload.team,
        submittedAt: teamPayload.submittedAt,
        kupong: teamPayload.kupong,
        players,
      };

      const nowInfo = this.getWeekInfo(new Date());
      const payload = {
        code,
        team: teamData.team,
        week: nowInfo.week,
        year: nowInfo.year,
        data: teamData,
      };

      const res = await fetch(
        "https://tipsv.onrender.com/backend/entries/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Submit failed (${res.status}): ${text}`);
      }
      console.log("Submit OK");
      this.showToast("Kupongen är inlämnad!", "success");
      // refresh dropdown list and status
      await this.initEntriesUI();
    } catch (err) {
      console.error("Submit error:", err);
      this.showToast(`Inlämning misslyckades: ${err.message}`, "error");
    } finally {
      submitBtn?.removeAttribute("disabled");
    }
  }

  async tableEvent() {
    let tableRows = this.getElementsByClassName("match-row");
    for (let i = 0; i < tableRows.length; i++) {
      const teamNames = tableRows[i].querySelector(".team-names");
      console.log(teamNames); ///teamnames element

      const button = tableRows[i].querySelectorAll(".bet-cell");
      console.log(`i är nu ${i}`);
      console.log(button);
    }
    // console.log(tableRows);

    // console.log(childs);
  }

  async waitForKupongData() {
    // Wait a bit for kupong component to load
    return new Promise((resolve) => {
      const checkKupong = () => {
        const kupongComponent = this.querySelector("my-kupong");
        if (
          kupongComponent &&
          kupongComponent.kupong &&
          kupongComponent.kupong.length > 0
        ) {
          // Extract real match names from kupong
          this.games = kupongComponent.kupong.map((match, index) => {
            const str = String(match).replace(/^\d+\s*/, "");
            const teamNames = str.split("1X2")[0].trim();
            return teamNames || `Match ${index + 1}`;
          });
          console.log("Real match names extracted:", this.games);
          resolve();
        } else {
          setTimeout(checkKupong, 100); // Check every 100ms
        }
      };
      checkKupong();
    });
  }

  assignGamesToPlayers() {
    const totalMatches = this.games.length;
    const totalPlayers = this.userData.players.length;

    const matchesPerPlayer = Math.floor(totalMatches / totalPlayers);
    const extraMatches = totalMatches % totalPlayers;

    const allMatchIndices = Array.from({ length: totalMatches }, (_, i) => i);

    for (let i = allMatchIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allMatchIndices[i], allMatchIndices[j]] = [
        allMatchIndices[j],
        allMatchIndices[i],
      ];
    }

    let matchIndex = 0;

    const playersWithGames = this.userData.players.map(
      (player, playerIndex) => {
        const color = this.playerColors[playerIndex % this.playerColors.length];

        // Calculate how many matches this player gets
        const playerMatches =
          matchesPerPlayer + (playerIndex < extraMatches ? 1 : 0);

        // Assign matches to this player
        const assignedGames = [];
        for (let i = 0; i < playerMatches; i++) {
          if (matchIndex < allMatchIndices.length) {
            const gameIndex = allMatchIndices[matchIndex];
            assignedGames.push({
              name: this.games[gameIndex],
              index: gameIndex + 1, // 1-based for display
            });
            matchIndex++;
          }
        }

        return {
          ...player,
          color: color,
          assignedGames: assignedGames,
        };
      }
    );

    this.userData.players = playersWithGames;
    console.log("Players with games assigned:", this.userData.players);
  }

  renderPlayerTable() {
    this.tableEvent();
    const playerTable = this.querySelector(".player-table");
    if (!playerTable || !this.userData.players) return;

    let tableHTML = '<div class="player-grid">';

    this.userData.players.forEach((player) => {
      tableHTML += `
        <div class="player-card" style="border-left: 4px solid ${player.color}">
          <div class="player-header" style="background-color: ${
            player.color
          }20">
            <h3 style="color: ${player.color}">${player.name}</h3>
            <span class="match-count">${
              player.assignedGames.length
            } matches</span>
          </div>
          <div class="player-games">
            <h4>${player.name} ansvarsområde</h4>
            <ul>
              ${player.assignedGames
                .map(
                  (game) =>
                    `<li>
                  <span class="match-number">${game.index}.</span>
                  <span class="match-name">${game.name}</span>
                </li>`
                )
                .join("")}
            </ul>
          </div>
        </div>
      `;
    });

    tableHTML += "</div>";
    playerTable.innerHTML = tableHTML;
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
        <a href="#play">DevPlay</a>
      </div>
    </div>
    <div class="mainT">
      <div class="trupp">
        <h1>Här lägger ni eran kupong</h1>
        <p>Lycka till lag: ${this.teamName}!</p>
      </div>
      <div class="game-content">
        <div class="player-table"></div>

        <aside class="right-column">
          <div class="entry-controls">
            <span id="entry-status" class="entry-status"></span>
            <label for="entry-select" class="entry-label">Tidigare kuponger:</label>
            <select id="entry-select" class="entry-select"></select>
            <button id="edit-entry" type="button" class="entry-edit">Redigera</button>
          </div>

          <div id="kupong-form">
            <my-kupong></my-kupong>
          </div>
        </aside>

      </div class="game-content">
    </div>
      
`;
    this.ensureToastHost();
  }

  async fetchJson(url, options) {
    const res = await fetch(url, options);
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return { ok: false, data: null, status: res.status };
    }
    try {
      const data = await res.json();
      return { ok: res.ok, data, status: res.status };
    } catch (e) {
      return { ok: false, data: null, status: res.status };
    }
  }

  ensureToastHost() {
    if (this.querySelector(".toast-host")) return;
    const host = document.createElement("div");
    host.className = "toast-host";
    host.style.position = "fixed";
    host.style.right = "16px";
    host.style.bottom = "16px";
    host.style.display = "flex";
    host.style.flexDirection = "column";
    host.style.gap = "8px";
    host.style.zIndex = "9999";
    this.appendChild(host);
  }

  showToast(message, type = "info") {
    this.ensureToastHost();
    const host = this.querySelector(".toast-host");
    const t = document.createElement("div");
    t.textContent = message;
    t.style.color = "#0b0d0e";
    t.style.padding = "10px 12px";
    t.style.borderRadius = "8px";
    t.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
    t.style.fontWeight = "600";
    t.style.maxWidth = "340px";
    t.style.background =
      type === "success" ? "#B9F5D0" : type === "error" ? "#FFD6DD" : "#E6F0FF";
    t.style.border = "1px solid rgba(0,0,0,0.08)";
    t.style.transition = "opacity 200ms ease";
    t.style.opacity = "1";
    host.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      setTimeout(() => t.remove(), 250);
    }, 3000);
  }
}
