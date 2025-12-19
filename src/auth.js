// Remove pg import - use backend API instead
import { API_BASE } from "./config.js";

const auth = {
  isLoggedIn: false,
  currentUser: null,
  userCode: null,

  checkExistingLogin: function () {
    const savedUser = localStorage.getItem("currentUser");
    const savedCode = localStorage.getItem("userCode");

    if (savedUser && savedCode) {
      this.isLoggedIn = true;
      this.currentUser = savedUser;
      this.userCode = savedCode;
    }
  },

  async login(userCode) {
    try {
      // Make API call to backend
      const response = await fetch(`${API_BASE}/backend/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: userCode }),
      });

      if (!response.ok) {
        throw new Error("Invalid code - team not found");
      }

      const user = await response.json();

      // Set login state
      this.isLoggedIn = true;
      this.currentUser = user.name;
      this.userCode = user.code;

      // Save to localStorage
      localStorage.setItem("currentUser", user.name);
      localStorage.setItem("userCode", user.code);

      // Dispatch event to notify other components
      window.dispatchEvent(
        new CustomEvent("auth-changed", {
          detail: { isLoggedIn: true, username: user.name },
        })
      );

      return user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },
  async register(username) {
    try {
      // Make API call to backend
      const response = await fetch(`${API_BASE}/backend/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: username }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();

      // Auto-login after successful registration
      this.isLoggedIn = true;
      this.currentUser = data.name;
      this.userCode = data.code;

      localStorage.setItem("currentUser", data.name);
      localStorage.setItem("userCode", data.code);

      // Dispatch event to notify other components
      window.dispatchEvent(
        new CustomEvent("auth-changed", {
          detail: { isLoggedIn: true, username: data.name },
        })
      );

      return data.code;
    } catch (error) {
      console.error("Registration failed:", error);
      throw new Error("Registration failed");
    }
  },
  //ta bort i session
  logout: function () {
    this.isLoggedIn = false;
    this.currentUser = null;
    this.userCode = null;

    localStorage.removeItem("currentUser");
    localStorage.removeItem("userCode");

    window.dispatchEvent(
      new CustomEvent("auth-changed", {
        detail: { isLoggedIn: false },
      })
    );
  },
  // Gömmer team routen
  requiresAuth: function (route) {
    const protectedRoutes = ["team"];
    return protectedRoutes.includes(route);
  },
};

auth.checkExistingLogin();
export default auth;
