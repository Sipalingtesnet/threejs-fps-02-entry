import * as THREE from 'three';
import { PALETTE } from './palette.js';
import { GameState } from './state.js';
import { createMap } from './map.js';
import { Player } from './player.js';
import { WeaponSystem, WEAPON_DEFS } from './weapons.js';
import { BotManager } from './bots.js';
import { RoundManager } from './rounds.js';
import { AudioManager } from './audio.js';
import { Hud } from './hud.js';

// Parse query params for shot capture modes: ?shot=start | play | buy | end
const params = new URLSearchParams(window.location.search);
const shotMode = params.get('shot');

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(PALETTE.sky);
scene.fog = new THREE.FogExp2(PALETTE.sky, 0.012);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Lighting
const hemiLight = new THREE.HemisphereLight(0xfff0e5, 0x302820, 0.6);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
dirLight.position.set(40, 80, 40);
scene.add(dirLight);

// Core systems
const state = new GameState();
const map = createMap(scene);
const player = new Player(camera, map.colliders);
const weapons = new WeaponSystem(camera);
const bots = new BotManager(scene, map.colliders, map.waypoints, map.bombSites);
const rounds = new RoundManager(state, bots, player);
const audio = new AudioManager();
const hud = new Hud();

const input = {
  keys: {},
  mouseDelta: new THREE.Vector2(),
  mouseLeftPressed: false,
  mouseLeftDown: false,
  mouseRightDown: false,
  pointerLocked: false
};

bots.spawnBots(true);

if (shotMode) {
  if (shotMode === 'start') {
    state.phase = 'menu';
    hud.showOverlay('DUSTLINE', 'Tactical round-based FPS. Click to deploy.', 'Deploy');
  } else if (shotMode === 'play') {
    state.phase = 'live';
    hud.hideOverlay();
    player.spawn(new THREE.Vector3(0, 5, 40));
    camera.rotation.set(-0.1, 0, 0);
  } else if (shotMode === 'buy') {
    state.phase = 'buy';
    hud.hideOverlay();
  } else if (shotMode === 'end') {
    state.phase = 'roundEnd';
    state.scoreTeamA = 5;
    state.scoreTeamB = 3;
    hud.showOverlay('ROUND 8 COMPLETE', 'Team A (CT) wins the round.', 'Next Round');
  }
}

// Render immediately and set __shotReady
renderer.render(scene, camera);
setTimeout(() => {
  renderer.render(scene, camera);
  window.__shotReady = true;
}, 200);

let lastTime = performance.now();
const dt = 1 / 60;

function animate(now) {
  requestAnimationFrame(animate);
  if (!shotMode && state.phase === 'live') {
    player.update(dt, input, audio);
    weapons.update(dt, input, state, audio);
    bots.update(dt, player.position, state, audio);
    rounds.update(dt, audio);
  }
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
