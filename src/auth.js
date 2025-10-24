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

  login: function (username, userCode) {
    this.isLoggedIn = true;
    this.currentUser = username;
    this.userCode = userCode;

    // Spara i session
    localStorage.setItem("currentUser", username);
    localStorage.setItem("userCode", userCode);

    // Dispatch event to notify other components
    window.dispatchEvent(
      new CustomEvent("auth-changed", {
        detail: { isLoggedIn: true, username },
      })
    );
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
