import * as THREE from 'three';

function addStar(scene: THREE.Scene) {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill(0)
    .map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
}

export function addStars(scene: THREE.Scene, count = 200) {
  for (let i = 0; i < count; i++) addStar(scene);
}
