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
    await this.loadPlayersAndGames();
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
    const totalMatches = this.games.length; // Should be 13
    const totalPlayers = this.userData.players.length;

    // Distribute matches as evenly as possible
    const matchesPerPlayer = Math.floor(totalMatches / totalPlayers);
    const extraMatches = totalMatches % totalPlayers;

    // Create array of all match indices
    const allMatchIndices = Array.from({ length: totalMatches }, (_, i) => i);

    // Shuffle the match indices for random distribution
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
        // Assign color
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
        <my-kupong></my-kupong>
        
      </div class="game-content">
    </div>
      
`;
  }
}
