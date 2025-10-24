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
    const loginForm = this.querySelector("#loginForm");
    const registerForm = this.querySelector("#registerForm");

    if (loginForm) {
      loginForm.addEventListener("submit", this.handleLogin);
    }

    if (registerForm) {
      registerForm.addEventListener("submit", this.handleRegister);
    }

    // Toggle between login and register
    const toggleBtns = this.querySelectorAll("[data-toggle]");
    toggleBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleView();
      });
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const userCode = formData.get("userCode");

    if (!username || !userCode) {
      this.showError("Please fill in all fields");
      return;
    }

    try {
      // Here you could validate with your backend
      // For now, just accept any non-empty values
      auth.login(username, userCode);

      // Redirect to team page after successful login
      location.hash = "team";
    } catch (error) {
      this.showError("Invalid login credentials");
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

  toggleView() {
    const loginDiv = this.querySelector("#loginDiv");
    const registerDiv = this.querySelector("#registerDiv");

    loginDiv.classList.toggle("hidden");
    registerDiv.classList.toggle("hidden");
  }

  showError(message) {
    const errorDiv = this.querySelector("#errorMessage");
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");

    setTimeout(() => {
      errorDiv.classList.add("hidden");
    }, 5000);
  }

  render() {
    this.innerHTML = `
      <div>hejhej</div>`;
  }
}
