import auth from "../auth.js";

export default class Login extends HTMLElement {
  constructor() {
    super();
    this.handleLogin = this.handleLogin.bind(this);
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const loginBtn = this.querySelector("#btnL");
    const registerBtn = this.querySelector("#btnR");

    if (loginBtn) {
      loginBtn.addEventListener("click", this.handleLogin);
    }

    if (registerBtn) {
      registerBtn.addEventListener("click", () => {
        location.hash = "register";
      });
    }
  }

  async handleLogin() {
    const lagKodInput = this.querySelector("#LagKod");
    const lagKod = lagKodInput.value.trim();

    if (!lagKod) {
      alert("Please enter your team code");
      return;
    }

    try {
      await auth.login(lagKod);
      alert("Inlogg lyckades!");
      // console.log(location.hash);
      location.hash = "team";
      // console.log(location.hash);
    } catch (error) {
      console.log("errorblocket");
      alert("Invalid team code: " + error.message);
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
        <h1>Logga in</h1>
        <input id="LagKod" type="text" placeholder="Din lagkod...." required />
        <button  type="submit"class="btn" id="btnL">Logga in</button>
        <button type="submit" class="btn" id="btnR">Registrera</button>
      </div>
      <div class="register">
        <h1>Välkommen Lagkapten!</h1>
        <p>
          För att komma in i omklädningsrummet behöver du antingen registrera
          ett nytt lag, eller logga in med den koden du fick vid skapandet av
          laget!
        </p>
        
      </div>
    </div>
`;
  }
}
