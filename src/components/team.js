import auth from "../auth.js";

export default class Team extends HTMLElement {
  constructor() {
    super();
    this.teamName = localStorage.getItem("currentUser");
    this.savedCode = localStorage.getItem("userCode");
    this.players = [];
    this.playerCount = this.players.length;

    // Bind methods
    this.addPlayer = this.addPlayer.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
    this.updatePlayerCount = this.updatePlayerCount.bind(this);
    this.submitTeam = this.submitTeam.bind(this);
  }

  connectedCallback() {
    console.log(auth.isLoggedIn);

    if (auth.isLoggedIn) {
      window.location.hash = "#play";
    }
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const addPlayerBtn = this.querySelector("#addPlayerBtn");
    const submitTeamBtn = this.querySelector("#submitTeam");

    if (addPlayerBtn) {
      addPlayerBtn.addEventListener("click", this.addPlayer);
    }

    if (submitTeamBtn) {
      submitTeamBtn.addEventListener("click", this.submitTeam);
    }
  }

  addPlayer() {
    this.playerCount++;
    console.log(this.players);

    const playerInputsContainer = this.querySelector("#playerInputs");
    const playerDiv = document.createElement("div");
    playerDiv.className = "player-input";
    playerDiv.dataset.playerId = this.playerCount;

    playerDiv.innerHTML = `
      <input 
        id="player-${this.playerCount}"
        type="text" 
        placeholder="Spelarens namn..." 
        class="player-name-input"
        data-player-id="${this.playerCount}"
      />
      <button type="button" class="remove-player-btn" data-player-id="${this.playerCount}">−</button>
    `;

    playerInputsContainer.appendChild(playerDiv);

    // Add event listener for remove button
    const removeBtn = playerDiv.querySelector(".remove-player-btn");
    removeBtn.addEventListener("click", () =>
      this.removePlayer(this.playerCount)
    );

    // Update the counter
    this.updatePlayerCount();
  }

  removePlayer(playerId) {
    const playerDiv = this.querySelector(`[data-player-id="${playerId}"]`);
    if (playerDiv) {
      playerDiv.remove();
      this.playerCount--;
      this.updatePlayerCount();
    }
  }

  updatePlayerCount() {
    const noPlayersInput = this.querySelector("#noPlayers");
    const actualPlayerCount = this.querySelectorAll(".player-input").length;
    if (noPlayersInput) {
      noPlayersInput.value = actualPlayerCount;
    }
  }

  async submitTeam() {
    // Get all player name inputs
    const playerInputs = this.querySelectorAll(".player-name-input");
    const players = [];

    // Collect all player names
    playerInputs.forEach((input, index) => {
      const playerName = input.value.trim();
      if (playerName) {
        players.push({
          id: index + 1,
          name: playerName,
        });
      }
    });

    console.log("Team submitted with players:", players);
    console.log("Total players:", players.length);

    if (players.length === 0) {
      alert("Lägg till minst en spelare innan du lämnar in laget!");
      return;
    }

    // Prepare data for backend
    const teamData = {
      players: players,
      playerCount: players.length,
      submittedAt: new Date().toISOString(),
    };

    try {
      // Send to backend
      const response = await fetch(
        "https://tipsv.onrender.com/backend/update-team",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: this.savedCode,
            teamData: teamData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save team");
      }

      const result = await response.json();

      alert(
        `Laguppställning sparad! ${result.playerCount} spelare registrerade.`
      );
      console.log("Team saved successfully:", result);
      location.hash = "play";
    } catch (error) {
      console.error("Error saving team:", error);
      alert("Kunde inte spara laguppställning. Försök igen.");
    }
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
      <h1 >Välkommen: ${this.teamName}</h1> 
      <p>Nu ska du presentera din laguppställning!<p>
      </div>

      <div class="taktiktavla">
        <div class="Fbox">
          <div class="player-management">
            <label for="noPlayers">Antal spelare:</label>
            <input
              type="number"
              id="noPlayers"
              name="noPlayers"
              value="0"
              readonly
            />
            
            <div class="add-player-section">
              <button type="button" id="addPlayerBtn" class="add-player-btn">+ Lägg till spelare</button>
            </div>
            
            <div id="playerInputs" class="player-inputs-container">
              <!-- Här kommer player inputs  -->
            </div>
            <button type="button" id="submitTeam" class="submitTeam">Lämna in laguppställning</button>
          </div>
        </div>
        <div class="tavla">
          <img src="./static/icons/taktiktavla.png" />
        </div>
      </div>
    </div>
    `;
  }
}
