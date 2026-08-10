import * as THREE from 'three';
import type { Game } from './game';
import { Planet, type PlanetState } from './planet';
import { Unit } from './units';
import { Building, type BuildingState } from './building';

export type ContinentState = {
  id: number;
  type: 'continent';
  color: THREE.ColorRepresentation;
  position: THREE.Vector2;
  height: number;
  units: BuildingState[];
};

export class Continent extends Unit {
  game;
  state: ContinentState;
  planet: Planet;
  public hitProxy!: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

  constructor({
    game,
    planet,
    state,
  }: {
    game: Game;
    planet: Planet;
    state: ContinentState;
  }) {
    super({ game });

    this.game = game;
    this.state = state;
    this.planet = planet;

    // continent mesh
    const size = { w: 0.8, h: 0.8, l: this.state.height };
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.l);
    const material = new THREE.MeshPhongMaterial({ color: state.color });
    const mesh = new THREE.Mesh(geometry, material);

    // place on planet surface
    const position = this.planet.state.position.clone();
    const offset = new THREE.Vector3();
    const coords = this.convertCoordsToRad(this.state.position);
    offset.setFromSphericalCoords(
      this.planet.state.radius - 0.1,
      coords.x,
      coords.y
    );
    position.add(offset);
    this.unitState.position.copy(position);

    this.game.engine.scene.add(mesh);
    this.mesh = mesh;
    this.update();

    // orient so the box's +Z points outward (look at planet center => -Z points in)
    mesh.lookAt(this.planet.unitState.position);
    this.unitState.rotation.copy(this.mesh.rotation);

    const proxyGeom = new THREE.PlaneGeometry(size.w, size.h);
    const proxyMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const hitProxy = new THREE.Mesh(proxyGeom, proxyMat);
    hitProxy.name = 'ContinentHitProxy';
    hitProxy.userData.continent = this;

    hitProxy.position.set(0, 0, size.l / 2 + 0.01);

    mesh.add(hitProxy);
    this.hitProxy = hitProxy;

    this.addUnits();
  }

  addUnits() {
    for (const unit of this.state.units) {
      if (unit.type === 'building') {
        const building = new Building({
          game: this.game,
          state: unit,
          continent: this,
        });
        building.positionOnContinent();
        this.game.units.push(building);
      }
    }
  }

  convertCoordToRad(num: number) {
    return (num + 1) * Math.PI;
  }

  convertCoordsToRad(coords: THREE.Vector2) {
    const result = new THREE.Vector2();
    result.setX(this.convertCoordToRad(coords.x));
    result.setY(this.convertCoordToRad(coords.y));
    return result;
  }
}
