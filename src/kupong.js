import getKupong from './puppeteer.js';

export default class Kupong extends HTMLElement {
  constructor() {
    super();
    this.kupong = [];
  }
  async connectedCallback() {
    this.kupong = await getKupong();
    this.render();
  }

  render() {
    this.innerHTML = `
      <h2>Här är kupongen</h2>
      <ul>
        ${this.kupong.map(match => `<li>${match}</li>`).join('')}
      </ul>
    `;
    return this;
  }
}


