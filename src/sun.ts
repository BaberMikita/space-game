import * as THREE from 'three';

export class Sun {
  game;

  constructor({ game }) {
    this.game = game;

    const light = new THREE.PointLight(0xffffff, 100);
    light.position.set(0, 0, 0);
    this.game.engine.scene.add(light);
  }
}
