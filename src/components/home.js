export default class Homescreen extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div class="nav">
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
    <main>
      <div class="card welcome-card">
        <h2 class="card-title">Välkommen till Tipsvänner!</h2>
        <div class="card-content">
          <p>
            Stryktipset är för mig <strong>gemenskap</strong> och en ursäkt för
            att umgås. Jag har spelat stryktipset med mina bröder där vi delar
            upp matcher - var och en får 4 matcher att lägga sina tips på.
          </p>
          <p>
            Trots att det kan låta cheesy så är det verkligen så! Vi är alla
            tipsläggare, fotbollsentusiaster och tävlingsmänniskor. När vi är en
            match ifrån 13 rätt och man skött sina matcher utmärkt, då vill man
            ha <em>underlag</em> och möjlighet att var det fallerar och ens
            tipskamrater presterar.
          </p>
          <p>
            Därför försökte jag mig på att bygga denna applikation som ska
            visualisera ert tipsföretags bäst presterande spelare - och även
            avslöja den svaga länken. Här kan vi äntligen få svar på vem som
            verkligen kan sina grejer och vem som bara har tur.
          </p>
          <p>
            Målet är att skapa lite extra spänning och kanske lite vänlig
            rivalitet. Nu kan vi se statistik, jämföra prestationer och
            viktigast av allt - ha konkreta bevis när vi påstår att vi är bättre
            än de andra!
          </p>
          <p class="motto-small">
            <strong>Inget lag är starkare än sin svagaste spelare!</strong> 😉
          </p>
        </div>
      </div>
      <div class="instructions">
        <div class="box" id="boxT">
          <img src="./static/icons/group.jpg" />
          <ul>
            <li>Samla ihop dina nära och kära</li>
            <li>Skapa ett lag här på Tipsvänner</li>
            <li>Delegera ut matcher och ansvarsområden</li>
          </ul>
        </div>
        <div class="box" id="boxB">
          <img src="./static/icons/graph.jpg" />
          <ul>
            <li>Följ upp kupongen</li>
            <li>Analysera enskild individsprestationer över tid</li>
            <li>Konfrontera och kräv mer ifrån dina spelare!</li>
          </ul>
        </div>
      </div>
      <my-kupong></my-kupong>
      
    </main>
                           `;
  }
}
