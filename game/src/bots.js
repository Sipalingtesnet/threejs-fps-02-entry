import * as THREE from 'three';

export class BotManager {
  constructor(scene, colliders, waypoints, bombSites) {
    this.scene = scene;
    this.colliders = colliders;
    this.waypoints = waypoints;
    this.bombSites = bombSites;
    this.bots = [];
  }

  spawnBots(isBuyPhase) {
    // Clear existing bots
    for (const b of this.bots) {
      this.scene.remove(b.mesh);
    }
    this.bots = [];

    // 4 Enemy bots (Team B - Red/Rust) & 2 Friendly bots (Team A - Teal)
    const botConfigs = [
      { team: 'B', role: 'attacker', pos: new THREE.Vector3(0, 0, -65), color: 0xb84a2d },
      { team: 'B', role: 'attacker', pos: new THREE.Vector3(-10, 0, -65), color: 0xb84a2d },
      { team: 'B', role: 'defender', pos: new THREE.Vector3(10, 0, -65), color: 0xb84a2d },
      { team: 'B', role: 'defender', pos: new THREE.Vector3(-5, 0, -60), color: 0xb84a2d },
      { team: 'A', role: 'friendly', pos: new THREE.Vector3(-6, 0, 65), color: 0x2d828c },
      { team: 'A', role: 'friendly', pos: new THREE.Vector3(6, 0, 65), color: 0x2d828c }
    ];

    for (const cfg of botConfigs) {
      const geom = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
      const mat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.7 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(cfg.pos);
      mesh.position.y += 1.0;
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.bots.push({
        team: cfg.team,
        role: cfg.role,
        mesh: mesh,
        position: mesh.position,
        velocity: new THREE.Vector3(),
        health: 100,
        alive: true,
        state: 'patrol', // patrol, chase, engage, plant, defuse
        targetWaypoint: Math.floor(Math.random() * this.waypoints.length),
        shootTimer: 0,
        reactionDelay: 0.3
      });
    }
  }

  update(dt, playerPos, gameState, audio) {
    for (const bot of this.bots) {
      if (!bot.alive) continue;

      // Simple AI state machine
      const distToPlayer = bot.position.distanceTo(playerPos);

      if (bot.team === 'B' && gameState.phase === 'live') {
        // Enemy logic: patrol or attack player / bomb site
        if (distToPlayer < 25) {
          bot.state = 'engage';
          // Move towards player or shoot
          const dir = playerPos.clone().sub(bot.position).normalize();
          bot.velocity.copy(dir.multiplyScalar(3.5));

          bot.shootTimer += dt;
          if (bot.shootTimer > 0.6) {
            bot.shootTimer = 0;
            if (Math.random() < 0.6 && audio) audio.playGunshot('VK-47 Rifle');
            // Deal damage to player if close & line of sight clear
            if (distToPlayer < 18 && Math.random() < 0.4) {
              gameState.health -= 15;
            }
          }
        } else {
          bot.state = 'patrol';
          // Navigate towards waypoints
          const wp = this.waypoints[bot.targetWaypoint];
          if (wp) {
            const dir = wp.pos.clone().sub(bot.position);
            if (dir.length() < 3.0) {
              bot.targetWaypoint = wp.neighbors[Math.floor(Math.random() * wp.neighbors.length)];
            } else {
              dir.normalize();
              bot.velocity.copy(dir.multiplyScalar(2.5));
            }
          }
        }
      } else if (bot.team === 'A' && gameState.phase === 'live') {
        // Friendly bot logic: follow player or engage nearby enemies
        const dir = playerPos.clone().sub(bot.position);
        if (dir.length() > 6.0) {
          dir.normalize();
          bot.velocity.copy(dir.multiplyScalar(3.8));
        } else {
          bot.velocity.set(0, 0, 0);
        }
      }

      // Apply bot velocity
      bot.position.addScaledVector(bot.velocity, dt);
      bot.mesh.position.copy(bot.position);
      bot.mesh.position.y = bot.position.y + 1.0;

      // Check bot death
      if (bot.health <= 0 && bot.alive) {
        bot.alive = false;
        bot.mesh.visible = false;
        gameState.kills++;
      }
    }
  }
}
