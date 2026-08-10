import type { Continent } from './continent';
import { Game } from './game';
import * as THREE from 'three';
import type { Planet } from './planet';
import type { UnitState } from './units';
import { Building, type BuildingState } from './building';

export type PlayerMode = 'common' | 'build';

export type PlayerState = {
  id: number;
  name: string;
  continents: number[];
  resources: { money: number; fuel: number };
  mode?: PlayerMode;
};
export class Player {
  game: Game;
  state: PlayerState;
  mode: PlayerMode;
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  rollOverMesh!: THREE.Mesh;
  objects: THREE.Object3D[] = [];
  isShiftDown: boolean;
  cubeGeo: THREE.BoxGeometry;
  cubeMaterial: THREE.MeshLambertMaterial;
  continentHitTargets: THREE.Object3D[] = [];
  continent: Continent;
  planet: Planet;

  unitState: UnitState;
  constructor({ game, state }: { game: Game; state: PlayerState }) {
    this.game = game;
    this.state = state;
    const rollOverGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const rollOverMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
    });
    const rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    this.game.engine.scene.add(rollOverMesh);
    this.rollOverMesh = rollOverMesh;
    this.cubeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    this.cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    this.isShiftDown = false;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);
    this.onDocumentKeyUp = this.onDocumentKeyUp.bind(this);
    this.onDocumentKeyUpR = this.onDocumentKeyUpR.bind(this);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerdown', this.onPointerDown);
    document.addEventListener('keydown', this.onDocumentKeyDown);
    document.addEventListener('keyup', this.onDocumentKeyUp);
    document.addEventListener('keyup', this.onDocumentKeyUpR);

    this.updateRollOverVisibility();
  }
  private updateRollOverVisibility() {
    this.rollOverMesh.visible = this.mode === 'build';
  }
  setMode(mode: PlayerMode) {
    this.mode = mode;
    this.state.mode = mode;
    this.updateRollOverVisibility();
    console.log('Mode:', mode);
  }

  toggleMode() {
    this.setMode(this.mode === 'build' ? 'common' : 'build');
  }

  createBuilding() {}
  onPointerMove = (e: PointerEvent) => {
    if (this.mode !== 'build') return;

    this.pointer.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    this.raycaster.setFromCamera(this.pointer, this.game.engine.camera);
    const intersects = this.raycaster.intersectObjects(
      [
        ...this.game.units
          .filter(
            (o) =>
              o.state.type === 'continent' &&
              this.state.continents.some((v) => v === o.state.id)
          )
          .map((o) => o.mesh),
      ],
      true
    );
    if (intersects.length > 0) {
      const intersect = intersects[0];

      const q = new THREE.Quaternion();
      intersect.object.getWorldQuaternion(q);
      this.rollOverMesh.quaternion.copy(q);

      const outward = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
      this.rollOverMesh.position
        .copy(intersect.point)
        .addScaledVector(outward, 0.05);
      this.rollOverMesh.position
        .copy(intersect.point)
        .addScaledVector(
          intersect.face.normal
            .clone()
            .transformDirection(intersect.object.matrixWorld),
          0.05
        );
    }
  };
  onPointerDown = (e: PointerEvent) => {
    if (this.mode !== 'build') return;

    this.pointer.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    this.raycaster.setFromCamera(this.pointer, this.game.engine.camera);

    const intersects = this.raycaster.intersectObjects(
      [
        ...this.objects,
        ...this.game.units
          .filter(
            (o) =>
              o.state.type === 'continent' &&
              this.state.continents.some((v) => v === o.state.id)
          )
          .map((o) => o.mesh),
      ],
      true
    );
    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (this.isShiftDown) {
        const idx = this.objects.indexOf(intersect.object);
        if (idx > -1) {
          this.game.engine.scene.remove(intersect.object);
          this.objects.splice(idx, 1);
        }
      } else {
        const q = new THREE.Quaternion();
        intersect.object.getWorldQuaternion(q);
        const outward = new THREE.Vector3(0, 0, 1)
          .applyQuaternion(q)
          .normalize();

        const pos = intersect.point.clone().addScaledVector(outward, -0.05);
        const euler = new THREE.Euler().setFromQuaternion(q);
        const continent = this.game.units.find(
          (o) => o.state.type === 'continent' && o.mesh === intersect.object
        ) as Continent | undefined;

        const localPos = intersect.point
          .clone()
          .sub(continent.unitState.position);
        const inverseRotation = new THREE.Quaternion()
          .setFromEuler(continent.unitState.rotation)
          .invert();
        localPos.applyQuaternion(inverseRotation);

        const buildingState: BuildingState = {
          type: 'building',
          name: 'Building',
          position: new THREE.Vector2(localPos.x, localPos.y),
          color: 0x808080,
          length: 0.1,
          width: 0.1,
          height: 0.1,
        };

        if (!continent) return;

        //передать обьект континента взять его из массива континтентс, добавить логику выяснения какой обьект нужно передать
        const building = new Building({
          game: this.game,
          state: buildingState,
          continent,
        });

        building.positionOnContinent();

        // track it
        this.game.engine.scene.add(building.mesh);
        this.objects.push(building.mesh);
        this.game.units.push(building);
      }
    }
  };
  onDocumentKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Shift') this.isShiftDown = true;
    console.log('sheft pressed');
  };
  onDocumentKeyUp = (e: KeyboardEvent): void => {
    if (e.key === 'Shift') this.isShiftDown = false;
    console.log('sheft unpressed');
  };
  onDocumentKeyUpR = (e: KeyboardEvent): void => {
    if (e.key === 'r' || e.key === 'R') {
      for (const obj of this.objects) this.game.engine.scene.remove(obj);
      this.objects.length = 0;
      console.log('Cleared all placed objects');
    }
  };
}
