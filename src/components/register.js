import auth from "../auth.js";

export default class Register extends HTMLElement {
  constructor() {
    super();
    this.handleRegister = this.handleRegister.bind(this);
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const registerBtn = this.querySelector("#btnR");
    if (registerBtn) {
      registerBtn.addEventListener("click", this.handleRegister);
    }
  }

  async handleRegister(e) {
    const lagNameInput = this.querySelector("#LagKod");
    const lagName = lagNameInput.value.trim();

    if (!lagName) {
      alert("Skriv in ett lagnamn!");
      return;
    }

    try {
      // Call auth.register to create the team and get the code
      const userCode = await auth.register(lagName);

      alert(
        `Din lagkod är: ${userCode}\nSpara den! du behöver den för att logga in!`
      );

      // Auto-login after registration (auth.register already handles this)
      location.hash = "team";
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  }

  showError(message) {
    alert(message);
  } //AGMXM0PK

  render() {
    this.innerHTML = `
      <div class="nav">
      <div class="logo">
        <img
          src="./static/logo/tipsvänner.png"
          alt="Tipsvänner Logo"
          height="100px"
          width="300px
          "
        />
      </div>
      <div class="links">
        <a class="aLink" href="">Hem</a>
        <a class="aLink" href="#team">Mitt Lag</a>
      </div>
    </div>

    <div id="loginDiv">
      <div class="login">
        <h1>Registrera Lag</h1>
        <input id="LagKod" type="text" placeholder="Ditt lagnamn...." required />
        <button type="submit" class="btn" id="btnR">Registrera</button>
      </div>
      <div class="register">
        <h1>Välkommen Lagskapare!</h1>
        <p>
          För att komma in i värmen behöver du registrera ett lag med ett lagnamn här till höger.
          Du kommer sedan få en kod som du behöver, så skriv gärna ner den!.
        </p>
        
      </div>
    </div>
`;
  }
}
