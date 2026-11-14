import * as THREE from 'three';

export const WEAPON_DEFS = [
  { id: 0, name: 'VK-47 Rifle', price: 2700, damage: 32, headshotMult: 2.5, fireRate: 0.1, magSize: 30, reserve: 90, reloadTime: 2.2, auto: true, spreadBase: 0.02, priceTag: '$2700' },
  { id: 1, name: 'Hornet-9 SMG', price: 1250, damage: 22, headshotMult: 2.0, fireRate: 0.07, magSize: 32, reserve: 96, reloadTime: 1.8, auto: true, spreadBase: 0.04, priceTag: '$1250' },
  { id: 2, name: 'Longshot Sniper', price: 4750, damage: 95, headshotMult: 3.0, fireRate: 1.2, magSize: 5, reserve: 15, reloadTime: 3.0, auto: false, spreadBase: 0.001, scopeZoom: true, priceTag: '$4750' },
  { id: 3, name: 'P9 Sidearm', price: 0, damage: 25, headshotMult: 2.0, fireRate: 0.18, magSize: 12, reserve: 36, reloadTime: 1.5, auto: false, spreadBase: 0.03, priceTag: 'Free' }
];

export class WeaponSystem {
  constructor(camera) {
    this.camera = camera;
    this.currentIndex = 0;
    this.def = WEAPON_DEFS[0];
    this.mag = this.def.magSize;
    this.reserve = this.def.reserve;
    this.fireTimer = 0;
    this.reloadTimer = 0;
    this.reloading = false;
    this.recoilPitch = 0;
    this.recoilYaw = 0;
    this.spread = 0.02;
    this.ads = false; // Aim down sights (Sniper zoom)
    this.grenades = 1;
    this.activeGrenades = [];
  }

  selectWeapon(index) {
    if (index < 0 || index >= WEAPON_DEFS.length) return;
    this.currentIndex = index;
    this.def = WEAPON_DEFS[index];
    this.mag = this.def.magSize;
    this.reserve = this.def.reserve;
    this.reloading = false;
    this.reloadTimer = 0;
    this.ads = false;
  }

  update(dt, input, state, audio) {
    // Weapon switching via number keys 1-4
    if (input.keys['Digit1']) this.selectWeapon(0);
    if (input.keys['Digit2']) this.selectWeapon(1);
    if (input.keys['Digit3']) this.selectWeapon(2);
    if (input.keys['Digit4']) this.selectWeapon(3);

    // ADS / Scope on Right Click for Sniper
    if (this.def.scopeZoom) {
      this.ads = input.mouseRightDown;
    } else {
      this.ads = false;
    }

    // Timers
    if (this.fireTimer > 0) this.fireTimer -= dt;
    if (this.reloadTimer > 0) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.finishReload();
      }
    }

    // Reload trigger (R key or empty mag)
    if ((input.keys['KeyR'] || (this.mag === 0 && input.mouseLeftDown)) && !this.reloading && this.reserve > 0 && this.reloadTimer <= 0) {
      this.startReload(audio);
    }

    // Spread recovery
    this.spread = THREE.MathUtils.lerp(this.spread, this.def.spreadBase, dt * 6);

    // Recoil recovery
    this.recoilPitch = THREE.MathUtils.lerp(this.recoilPitch, 0, dt * 10);
    this.recoilYaw = THREE.MathUtils.lerp(this.recoilYaw, 0, dt * 10);
  }

  startReload(audio) {
    if (this.mag === this.def.magSize || this.reserve <= 0) return;
    this.reloading = true;
    this.reloadTimer = this.def.reloadTime;
    if (audio) audio.playReload();
  }

  finishReload() {
    const needed = this.def.magSize - this.mag;
    const take = Math.min(needed, this.reserve);
    this.mag += take;
    this.reserve -= take;
    this.reloading = false;
  }

  canFire(input) {
    if (this.reloading || this.reloadTimer > 0 || this.fireTimer > 0) return false;
    if (this.def.auto ? input.mouseLeftDown : input.mouseLeftPressed) return true;
    return false;
  }

  fire(audio) {
    if (this.mag <= 0) return false;
    this.mag--;
    this.fireTimer = this.def.fireRate;
    this.spread += this.def.spreadBase * 1.5;
    this.recoilPitch += (Math.random() - 0.5) * 0.02 + 0.015;
    this.recoilYaw += (Math.random() - 0.5) * 0.01;

    if (audio) audio.playGunshot(this.def.name);
    return true;
  }
}
