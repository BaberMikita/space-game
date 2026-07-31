import * as THREE from 'three';
import type { Game } from './game';
import type { Continent } from './continent';
import { Unit } from './units';

export type BuildingState = {
  id: number;
  type: 'building';
  name: string;
  position: THREE.Vector2;
  color: number;
  length: number;
  width: number;
  height: number;
};

export type FuelMine = {
  type: 'building';
  kind: 'fuel_mine';
  cost: 100;
  produces: { fuelPerSecond: 10 };
};

export type Factory = {
  type: 'building';
  kind: 'factory';
  cost: 100;
  consumes: { fuelPerSecond: 1 };
  produces: { moneyPerSecond: 20 };
};

export type SpaceCenter = {
  type: 'building';
  kind: 'space_center';
  requirements: { factories: 3 };
  consumes: { fuelPerSecond: 15; moneyPerSecond: 90 };
  components: { launchStage: true };
};

export type BuildingType = FuelMine | Factory | SpaceCenter;

export class Building extends Unit {
  state: BuildingState;
  continent: Continent;

  constructor({
    game,
    state,
    continent,
  }: {
    game: Game;
    state: BuildingState;
    continent: Continent;
  }) {
    super({ game });
    this.state = state;
    this.continent = continent;
    const geometry = new THREE.BoxGeometry(
      this.state.length,
      this.state.width,
      this.state.height
    );
    const material = new THREE.MeshPhongMaterial({ color: this.state.color });

    this.mesh = new THREE.Mesh(geometry, material);

    this.game.engine.scene.add(this.mesh);
  }

  positionOnContinent() {
    this.unitState;
    this.unitState.position.copy(this.continent.unitState.position);
    this.unitState.rotation.copy(this.continent.unitState.rotation);

    const offset = new THREE.Vector3(
      this.state.position.x,
      this.state.position.y,
      -(this.continent.state.height + this.state.height) / 2
    );
    offset.applyEuler(this.continent.unitState.rotation);
    this.unitState.position.add(offset);
      
  }
}
