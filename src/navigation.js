export default class Navigation extends HTMLElement {
  constructor() {
    super();
    //this.router = new Router(); väldigt märkligt, detta gav illegal constructor
    this.router = document.querySelector("router-outlet");
  }

  // connect component
  connectedCallback() {
    const routes = this.router.routes;

    let navigationLinks = "";

    for (let path in routes) {
      if (routes[path].hidden) {
        continue;
      }
      navigationLinks += `<a href='#${path}'>${routes[path].name}</a>`;
    }

    // this.innerHTML = `<nav>${navigationLinks}</nav>`;
  }
}
