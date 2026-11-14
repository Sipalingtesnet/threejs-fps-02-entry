// Game state store for DUSTLINE tactical FPS
export class GameState {
  constructor() {
    this.phase = 'menu'; // menu, buy, live, roundEnd, matchEnd
    this.round = 1;
    this.maxRounds = 9;
    this.scoreTeamA = 0; // Player team
    this.scoreTeamB = 0; // Enemy bots
    this.money = 800;
    this.health = 100;
    this.armor = 100;
    this.currentWeapon = 0; // 0: Rifle, 1: SMG, 2: Sniper, 3: Pistol
    this.ammoMag = 30;
    this.ammoReserve = 90;
    this.hasGrenade = false;
    this.timer = 15; // buy phase timer (15s) or live round timer (100s)
    this.bombState = 'idle'; // idle, planted, exploding, defused, exploded
    this.bombTimer = 40.0; // 40s bomb fuse
    this.bombSite = null; // 'A' or 'B'
    this.defusing = false;
    this.defuseProgress = 0.0;
    this.planting = false;
    this.plantProgress = 0.0;
    this.kills = 0;
    this.deaths = 0;
    this.matchWinner = null;
  }

  resetForNewRound(isBuyPhase = true) {
    this.phase = isBuyPhase ? 'buy' : 'live';
    this.timer = isBuyPhase ? 15.0 : 100.0;
    this.health = 100;
    this.armor = 100;
    this.bombState = 'idle';
    this.bombTimer = 40.0;
    this.bombSite = null;
    this.defusing = false;
    this.defuseProgress = 0.0;
    this.planting = false;
    this.plantProgress = 0.0;
    // pistol ammo refill, rifle/smg retain unless bought
  }

  resetMatch() {
    this.round = 1;
    this.scoreTeamA = 0;
    this.scoreTeamB = 0;
    this.money = 800;
    this.kills = 0;
    this.deaths = 0;
    this.matchWinner = null;
    this.resetForNewRound(true);
  }
}
