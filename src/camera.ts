import * as THREE from 'three';
import { Game } from './game';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Camera {
  game: Game;
  controls: OrbitControls;

  constructor({ game }: { game: Game }) {
    this.game = game;

    this.controls = new OrbitControls(
      this.game.engine.camera,
      this.game.engine.renderer.domElement
    );

    this.controls.target.copy(new THREE.Vector3(2, 0, -2));

    this.focusOnPlanet = this.focusOnPlanet.bind(this);
    this.focusOnPlanetByName = this.focusOnPlanetByName.bind(this);
    this.update = this.update.bind(this);
  }
  focusOnPlanet(planet: THREE.Object3D) {
    const pos = new THREE.Vector3();
    planet.getWorldPosition(pos);
    this.game.camera.controls.target.copy(pos);
    this.game.camera.controls.update();
  }
  focusOnPlanetByName(name: string) {
    const planet = this.game.state.planets.find((p) => p.name === name);
    if (!planet) return;

    this.controls.target.copy(planet.position);
    this.controls.update();
  }
  update() {
    this.controls.update();
  }
}
