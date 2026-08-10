import * as THREE from 'three';
import type { Game } from './game';
import type { Continent } from './continent';

export type UnitState = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

export class Unit {
  game: Game;
  mesh: THREE.Mesh = new THREE.Mesh();
  unitState: UnitState = {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
  };
  constructor({ game }: { game: Game }) {
    this.game = game;
  }
  update() {
    this.mesh.position.copy(this.unitState.position);
    this.mesh.rotation.copy(this.unitState.rotation);
  }
}

import * as THREE from 'three';
import type { Game } from './game';
import type { Continent } from './continent';

export type UnitState = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

export class Unit {
  game: Game;
  mesh: THREE.Mesh = new THREE.Mesh();
  unitState: UnitState = {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
  };
  constructor({ game }: { game: Game }) {
    this.game = game;
  }
  update() {
    this.mesh.position.copy(this.unitState.position);
    this.mesh.rotation.copy(this.unitState.rotation);
  }
}
