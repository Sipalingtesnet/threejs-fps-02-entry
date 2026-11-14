import * as THREE from 'three';

export class Player {
  constructor(camera, colliders) {
    this.camera = camera;
    this.colliders = colliders;
    this.position = new THREE.Vector3(0, 0, 70);
    this.velocity = new THREE.Vector3();
    this.speed = 7.0;
    this.sprintMultiplier = 1.4;
    this.crouchMultiplier = 0.5;
    this.jumpForce = 7.5;
    this.gravity = 22.0;
    this.height = 1.7;
    this.crouchHeight = 1.1;
    this.currentHeight = this.height;
    this.radius = 0.4;
    
    // Look angles
    this.pitch = 0;
    this.yaw = 0;
    this.mouseSensitivity = 0.002;

    // Movement state
    this.isGrounded = false;
    this.crouching = false;
    this.sprinting = false;

    // Head bob & footsteps
    this.bobTimer = 0;
    this.footstepInterval = 0.4;
    this.stepTimer = 0;

    this.camera.position.copy(this.position);
    this.camera.position.y += this.currentHeight;
  }

  spawn(pos) {
    this.position.copy(pos);
    this.velocity.set(0, 0, 0);
    this.camera.position.copy(this.position);
    this.camera.position.y += this.currentHeight;
    this.pitch = 0;
    this.yaw = 0;
  }

  update(dt, input, audio) {
    // Mouse look
    if (input.pointerLocked) {
      this.yaw -= input.mouseDelta.x * this.mouseSensitivity;
      this.pitch -= input.mouseDelta.y * this.mouseSensitivity;
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
      input.mouseDelta.set(0, 0);
    }

    // Apply rotation to camera
    this.camera.rotation.set(0, 0, 0, 'YXZ');
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // Crouch & Sprint status
    this.crouching = input.keys['ControlLeft'] || input.keys['KeyC'];
    this.sprinting = input.keys['ShiftLeft'] && !this.crouching && this.isGrounded;
    
    let targetHeight = this.crouching ? this.crouchHeight : this.height;
    this.currentHeight = THREE.MathUtils.lerp(this.currentHeight, targetHeight, dt * 12);

    let currentSpeed = this.speed;
    if (this.sprinting) currentSpeed *= this.sprintMultiplier;
    if (this.crouching) currentSpeed *= this.crouchMultiplier;

    // Direction vector from input
    const moveDir = new THREE.Vector3();
    if (input.keys['KeyW']) moveDir.z -= 1;
    if (input.keys['KeyS']) moveDir.z += 1;
    if (input.keys['KeyA']) moveDir.x -= 1;
    if (input.keys['KeyD']) moveDir.x += 1;
    moveDir.normalize();
    moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    // Acceleration & Deceleration
    const targetVelX = moveDir.x * currentSpeed;
    const targetVelZ = moveDir.z * currentSpeed;
    const accel = this.isGrounded ? 16.0 : 4.0;
    this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, targetVelX, dt * accel);
    this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, targetVelZ, dt * accel);

    // Gravity & Jump
    if (this.isGrounded) {
      if (input.keys['Space']) {
        this.velocity.y = this.jumpForce;
        this.isGrounded = false;
      } else {
        this.velocity.y = 0;
      }
    } else {
      this.velocity.y -= this.gravity * dt;
    }

    // Apply movement with AABB collision resolution
    const deltaPos = this.velocity.clone().multiplyScalar(dt);
    this.moveAndCollide(deltaPos);

    // Head bob & footsteps sound
    const horizSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (this.isGrounded && horizSpeed > 1.0) {
      this.bobTimer += dt * horizSpeed * 1.5;
      const bobAmount = this.crouching ? 0.03 : 0.07;
      this.camera.position.y = this.position.y + this.currentHeight + Math.sin(this.bobTimer) * bobAmount;

      this.stepTimer += dt * horizSpeed;
      if (this.stepTimer > (this.sprinting ? 0.3 : 0.5)) {
        this.stepTimer = 0;
        if (audio) audio.playFootstep();
      }
    } else {
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.position.y + this.currentHeight, dt * 10);
    }
  }

  moveAndCollide(delta) {
    // Simple Axis-Aligned Bounding Box collision check against map colliders
    this.position.x += delta.x;
    if (this.checkCollision()) this.position.x -= delta.x;

    this.position.y += delta.y;
    if (this.checkCollision()) {
      if (this.velocity.y < 0) this.isGrounded = true;
      this.velocity.y = 0;
      this.position.y -= delta.y;
    } else {
      this.isGrounded = false;
    }

    this.position.z += delta.z;
    if (this.checkCollision()) this.position.z -= delta.z;

    this.camera.position.x = this.position.x;
    this.camera.position.z = this.position.z;
  }

  checkCollision() {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(this.position.x - this.radius, this.position.y, this.position.z - this.radius),
      new THREE.Vector3(this.position.x + this.radius, this.position.y + this.currentHeight, this.position.z + this.radius)
    );

    for (const box of this.colliders) {
      if (playerBox.intersectsBox(box)) return true;
    }
    return false;
  }
}
