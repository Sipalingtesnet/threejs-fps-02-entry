// DOM HUD controller for DUSTLINE tactical FPS
export class Hud {
  constructor() {
    this.overlay = document.getElementById('overlay');
    this.title = document.getElementById('overlay-title');
    this.copy = document.getElementById('overlay-copy');
    this.play = document.getElementById('play');
    this.ammoMag = document.getElementById('ammo-mag');
    this.ammoReserve = document.getElementById('ammo-reserve');
    this.healthValue = document.getElementById('health-value');
    this.moneyValue = document.getElementById('money-value');
    this.timerValue = document.getElementById('timer-value');
    this.scoreValue = document.getElementById('score-value');
    this.buyMenu = document.getElementById('buy-menu');
    this.hitmarker = document.getElementById('hitmarker');
    this.crosshair = document.getElementById('crosshair');
    this.scopeOverlay = document.getElementById('scope-overlay');
  }

  update(state, weapons, player) {
    if (this.ammoMag) this.ammoMag.textContent = weapons.mag;
    if (this.ammoReserve) this.ammoReserve.textContent = `/ ${weapons.reserve}`;
    if (this.healthValue) this.healthValue.textContent = Math.max(0, state.health);
    if (this.moneyValue) this.moneyValue.textContent = `$${state.money}`;
    if (this.timerValue) this.timerValue.textContent = Math.ceil(state.timer);
    if (this.scoreValue) this.scoreValue.textContent = `${state.scoreTeamA} - ${state.scoreTeamB}`;

    if (this.buyMenu) {
      this.buyMenu.style.display = state.phase === 'buy' ? 'block' : 'none';
    }

    if (this.scopeOverlay) {
      this.scopeOverlay.style.display = weapons.ads ? 'block' : 'none';
    }

    if (this.crosshair) {
      const spreadPx = weapons.spread * 300;
      this.crosshair.style.transform = `translate(-50%, -50%) scale(${1 + spreadPx})`;
    }
  }

  showOverlay(title, text, actionText) {
    if (this.title) this.title.textContent = title;
    if (this.copy) this.copy.textContent = text;
    if (this.play) this.play.textContent = actionText;
    if (this.overlay) this.overlay.hidden = false;
  }

  hideOverlay() {
    if (this.overlay) this.overlay.hidden = true;
  }

  hitMarker(killed) {
    if (!this.hitmarker) return;
    this.hitmarker.classList.add('on');
    this.hitmarker.style.transform = killed ? 'translate(-50%, -50%) rotate(45deg) scale(1.3)' : '';
    setTimeout(() => {
      this.hitmarker.classList.remove('on');
      this.hitmarker.style.transform = '';
    }, 100);
  }
}
