export class RoundManager {
  constructor(state, bots, player) {
    this.state = state;
    this.bots = bots;
    this.player = player;
    this.roundEndTimer = 0;
  }

  update(dt, audio) {
    if (this.state.phase === 'buy') {
      this.state.timer -= dt;
      if (this.state.timer <= 0) {
        this.state.phase = 'live';
        this.state.timer = 100.0;
      }
    } else if (this.state.phase === 'live') {
      this.state.timer -= dt;

      // Check win conditions
      // 1. All enemies eliminated -> Team A wins
      const enemiesAlive = this.bots.bots.filter(b => b.team === 'B' && b.alive).length;
      const teamAAlive = this.bots.bots.filter(b => b.team === 'A' && b.alive).length;

      if (enemiesAlive === 0) {
        this.endRound('Team A (CT) wins by elimination!', 'A');
      } else if (teamAAlive === 0 && this.player.position.y < -10 || this.state.health <= 0) {
        this.endRound('Team B (T) wins by eliminating CTs!', 'B');
      } else if (this.state.timer <= 0) {
        this.endRound('Time expired! Defenders win.', 'A');
      }
    } else if (this.state.phase === 'roundEnd') {
      this.roundEndTimer -= dt;
      if (this.roundEndTimer <= 0) {
        if (this.state.scoreTeamA >= 5 || this.state.scoreTeamB >= 5 || this.state.round >= this.state.maxRounds) {
          this.state.phase = 'matchEnd';
        } else {
          this.round++;
          this.state.round = this.round;
          this.state.resetForNewRound(true);
          this.bots.spawnBots(true);
          this.player.spawn(new THREE.Vector3(0, 0, 70));
        }
      }
    }
  }

  endRound(message, winnerTeam) {
    this.state.phase = 'roundEnd';
    this.roundEndTimer = 4.0;
    if (winnerTeam === 'A') {
      this.state.scoreTeamA++;
      this.state.money += 3250;
    } else {
      this.state.scoreTeamB++;
      this.state.money += 1400;
    }
  }
}
