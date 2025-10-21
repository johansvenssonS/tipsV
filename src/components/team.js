export default class Team extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `

    <div class="nav">
      <div class="logo">
        <img
          src="./static/logo/tipsvänner.png"
          alt="Tipsvänner Logo"
          height="200px"
          width="500px
          "
        />
      </div>
      <div class="links">
        <a class="aLink" href="">Hem</a>
        <a class="aLink" href="#team">Mitt Lag</a>
        <a class="aLink">Placeholder</a>
      </div>
    </div>
    <h1>Mitt Lag</h1>
    <main>
    
      <div class="Fbox">
        <form>
          <label for="noPlayers">Hur många spelare:</label><br>
          <input type="number" id="noPlayers" name="noPlayers" value="0"><br>
        </form>
      </div>
    
    </main>
    `;
  }
}
{
  /* <my-kupong></my-kupong> */
}
