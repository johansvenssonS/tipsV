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

  handleLogin() {
    const lagKodInput = this.querySelector("#LagKod");
    const lagKod = lagKodInput.value.trim();
    console.log(lagKod);

    if (!lagKod) {
      alert("Please enter your team code");
      return;
    }

    try {
      // Pass to auth
      auth.login("Team", lagKod);

      // Redirect to team page
      location.hash = "team";
    } catch (error) {
      alert("Invalid team code");
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    if (!username) {
      this.showError("Please enter a username");
      return;
    }

    try {
      // Here you'd call your backend to register
      // For demo purposes, generate a simple code
      const userCode = Math.random().toString(36).substr(2, 8).toUpperCase();

      alert(
        `Your user code is: ${userCode}\\nSave this code - you'll need it to login!`
      );

      // Auto-login after registration
      auth.login(username, userCode);
      location.hash = "team";
    } catch (error) {
      this.showError("Registration failed");
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
