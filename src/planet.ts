import * as THREE from 'three';
import { Continent, type ContinentState } from './continent';
import type { Game } from './game';
import { Unit } from './units';

export type PlanetState = {
  id: number;
  type: 'planet';
  name: string;
  color: number;
  radius: number;
  position: THREE.Vector3;
  continents: ContinentState[];
};

export class Planet extends Unit {
  game: Game;
  state: PlanetState;
  mesh: THREE.Mesh;

  constructor({ game, state }: { game: Game; state: PlanetState }) {
    const geometry = new THREE.SphereGeometry(state.radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: state.color,
    });
    super({ game });
    this.game = game;
    this.state = state;
    this.mesh = new THREE.Mesh(geometry, material);

    this.unitState.position.copy(this.state.position);
    this.game.engine.scene.add(this.mesh);
    this.createContinent();
  }
  createContinent() {
    for (const state of this.state.continents) {
      const continent = new Continent({
        game: this.game,
        state,
        planet: this,
      });
      this.game.units.push(continent);
    }
  }
  update() {
    if (!this.mesh) return;
    if (!this.state) return;
    this.unitState.rotation.y += 0.005;
    this.mesh.position.copy(this.state.position);
  }
}
