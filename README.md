# DUSTLINE — Tactical FPS

DUSTLINE is a round-based tactical FPS in the Counter-Strike style, built for make.fun entry `threejs-fps-02`.

## Concept & Features
- **Dustline Yard Map**: A custom desert tactical map featuring Bombsite A (crate yard) and Bombsite B (silo compound), long sightlines, walls, and AABB colliders.
- **Buy Economy**: 15-second buy phase at the start of each round to purchase weapons (VK-47 Rifle, Hornet-9 SMG, Longshot Sniper with scope zoom).
- **Combat & AI Bots**: 4 enemy tactical bots and 2 friendly bots with patrol, engagement, and combat mechanics.
- **Synthesized Audio**: WebAudio gunshots, reloads, footsteps, and hit markers without external audio assets.
- **Tactical HUD**: Dynamic crosshair with spread scaling, health, ammo, round score, timer, and buy menu.

## Controls
- **WASD**: Move (Shift to sprint, Ctrl/C to crouch)
- **Space**: Jump
- **Mouse**: Look / Aim (Pointer lock on click)
- **Left Click**: Fire weapon
- **Right Click**: Aim Down Sights / Sniper Scope
- **R**: Reload
- **1-4**: Switch weapons / Buy in buy phase

## How to Run
```bash
node serve.ts
```
Then open `http://localhost:3000` in your browser.

## How to Build Dossier
```bash
npx tsx main.ts
```
