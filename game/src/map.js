import * as THREE from 'three';
import { PALETTE } from './palette.js';

export function createMap(scene) {
  const colliders = [];
  const materials = {
    sandstone: new THREE.MeshStandardMaterial({ color: PALETTE.sand, roughness: 0.8, metalness: 0.1 }),
    sandDark: new THREE.MeshStandardMaterial({ color: PALETTE.sandDark, roughness: 0.9 }),
    metal: new THREE.MeshStandardMaterial({ color: PALETTE.metal, roughness: 0.4, metalness: 0.6 }),
    rust: new THREE.MeshStandardMaterial({ color: PALETTE.rust, roughness: 0.6, metalness: 0.3 }),
    teal: new THREE.MeshStandardMaterial({ color: PALETTE.teal, roughness: 0.5, metalness: 0.2 }),
    ground: new THREE.MeshStandardMaterial({ color: PALETTE.ground, roughness: 0.9 })
  };

  // Helper to add box mesh + AABB collider
  function addBox(x, y, z, w, h, d, matKey, isCollider = true) {
    const geom = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geom, materials[matKey] || materials.sandstone);
    mesh.position.set(x, y + h/2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    if (isCollider) {
      const box = new THREE.Box3().setFromObject(mesh);
      colliders.push(box);
    }
    return mesh;
  }

  // Ground plane
  const groundGeom = new THREE.PlaneGeometry(160, 160);
  const groundMesh = new THREE.Mesh(groundGeom, materials.ground);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Outer boundary walls (dusty courtyard)
  addBox(0, 0, -80, 160, 15, 4, 'sandstone'); // North wall
  addBox(0, 0, 80, 160, 15, 4, 'sandstone');  // South wall
  addBox(-80, 0, 0, 4, 15, 160, 'sandstone'); // West wall
  addBox(80, 0, 0, 4, 15, 160, 'sandstone');  // East wall

  // Mid divider wall with central archway
  addBox(-30, 0, 0, 36, 12, 4, 'sandstone');
  addBox(30, 0, 0, 36, 12, 4, 'sandstone');
  addBox(0, 8, 0, 12, 4, 4, 'sandstone'); // Arch top

  // Bomb Site A (North-East: Crate yard)
  addBox(50, 0, -45, 14, 6, 14, 'rust'); // Site A Crate stack
  addBox(38, 0, -50, 8, 4, 8, 'metal');
  addBox(60, 0, -35, 10, 8, 10, 'sandDark');
  // Site A marker pad on floor
  const padAGeom = new THREE.PlaneGeometry(16, 16);
  const padAMesh = new THREE.Mesh(padAGeom, new THREE.MeshBasicMaterial({ color: PALETTE.teal, transparent: true, opacity: 0.3 }));
  padAMesh.rotation.x = -Math.PI / 2;
  padAMesh.position.set(50, 0.05, -45);
  scene.add(padAMesh);

  // Bomb Site B (South-West: Silo compound)
  const siloGeom = new THREE.CylinderGeometry(6, 7, 16, 16);
  const siloMesh = new THREE.Mesh(siloGeom, materials.teal);
  siloMesh.position.set(-50, 8, 45);
  siloMesh.castShadow = true;
  siloMesh.receiveShadow = true;
  scene.add(siloMesh);
  const siloBox = new THREE.Box3().setFromObject(siloMesh);
  colliders.push(siloBox);

  addBox(-38, 0, 45, 12, 5, 12, 'metal');
  addBox(-60, 0, 35, 10, 7, 10, 'rust');
  // Site B marker pad
  const padBGeom = new THREE.PlaneGeometry(16, 16);
  const padBMesh = new THREE.Mesh(padBGeom, new THREE.MeshBasicMaterial({ color: PALETTE.accent, transparent: true, opacity: 0.3 }));
  padBMesh.rotation.x = -Math.PI / 2;
  padBMesh.position.set(-50, 0.05, 45);
  scene.add(padBMesh);

  // Cover crates and obstacles around the map
  addBox(0, 0, -25, 10, 4, 6, 'metal');
  addBox(0, 0, 25, 10, 4, 6, 'metal');
  addBox(-25, 0, -20, 8, 5, 8, 'sandDark');
  addBox(25, 0, 20, 8, 5, 8, 'sandDark');
  addBox(-50, 0, -10, 6, 4, 16, 'sandstone'); // Long alley cover
  addBox(50, 0, 10, 6, 4, 16, 'sandstone');

  // Spawns
  const spawns = {
    teamA: [
      new THREE.Vector3(0, 0, 70),
      new THREE.Vector3(-6, 0, 72),
      new THREE.Vector3(6, 0, 72),
      new THREE.Vector3(-12, 0, 70),
      new THREE.Vector3(12, 0, 70)
    ],
    teamB: [
      new THREE.Vector3(0, 0, -70),
      new THREE.Vector3(-6, 0, -72),
      new THREE.Vector3(6, 0, -72),
      new THREE.Vector3(-12, 0, -70),
      new THREE.Vector3(12, 0, -70)
    ]
  };

  // Waypoints for AI navigation
  const waypoints = [
    { id: 0, pos: new THREE.Vector3(0, 0, 60), neighbors: [1, 2] },
    { id: 1, pos: new THREE.Vector3(-25, 0, 35), neighbors: [0, 3, 5] },
    { id: 2, pos: new THREE.Vector3(25, 0, 35), neighbors: [0, 4, 6] },
    { id: 3, pos: new THREE.Vector3(-50, 0, 45), neighbors: [1] }, // Site B
    { id: 4, pos: new THREE.Vector3(50, 0, -45), neighbors: [2] }, // Site A
    { id: 5, pos: new THREE.Vector3(-20, 0, 0), neighbors: [1, 7] }, // Mid
    { id: 6, pos: new THREE.Vector3(20, 0, 0), neighbors: [2, 7] },  // Mid
    { id: 7, pos: new THREE.Vector3(0, 0, -40), neighbors: [5, 6, 4] }
  ];

  return {
    colliders,
    spawns,
    waypoints,
    bombSites: {
      A: { center: new THREE.Vector3(50, 0, -45), radius: 10 },
      B: { center: new THREE.Vector3(-50, 0, 45), radius: 10 }
    }
  };
}
