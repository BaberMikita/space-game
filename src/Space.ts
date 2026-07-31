import * as THREE from 'three';

function Space(scene: THREE.Scene) {
  const spaceTexture = new THREE.TextureLoader().load('SpaceBG.webp');
  scene.background = spaceTexture;
  return spaceTexture;
}
export default Space;
