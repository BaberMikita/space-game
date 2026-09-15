import * as THREE from 'three';
import type { Game } from './game';
import type { Planet } from './planet';
import { continentPositionToSpherical } from './continent';

const MINIMAP_SIZE = 168;
const SPHERE_RADIUS = 1;
const WIRE_COLOR = 0x5cc6ff;
const MARKER_COLOR = 0x8be08b;

/**
 * Bottom-right mini-map: renders a small wireframe sphere standing in for the
 * currently focused planet, with a marker for each of its continents. Runs
 * its own tiny scene/camera/renderer so it never interferes with the main
 * game view.
 */
export class Minimap {
  game: Game;
  scene: THREE.Scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  wireSphere: THREE.Mesh;
  markersGroup: THREE.Group = new THREE.Group();
  focusedPlanetId: number;

  constructor({ game }: { game: Game }) {
    this.game = game;
    this.focusedPlanetId = game.state.planets[0]?.id ?? 1;

    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 10);
    this.camera.position.set(0, 1.9, 3.3);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(MINIMAP_SIZE, MINIMAP_SIZE);

    const container = document.getElementById('minimap-container');
    container?.appendChild(this.renderer.domElement);

    const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 24, 16);
    const material = new THREE.MeshBasicMaterial({
      color: WIRE_COLOR,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    this.wireSphere = new THREE.Mesh(geometry, material);

    this.scene.add(this.wireSphere, this.markersGroup);
    this.buildMarkers(this.focusedPlanetId);

    this.focusPlanetByName = this.focusPlanetByName.bind(this);
    this.update = this.update.bind(this);
  }

  private buildMarkers(planetId: number) {
    this.markersGroup.clear();

    const state = this.game.state.planets.find((p) => p.id === planetId);
    if (!state) return;

    const markerGeometry = new THREE.SphereGeometry(0.045, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: MARKER_COLOR });

    for (const continent of state.continents) {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      const coords = continentPositionToSpherical(continent.position);
      marker.position.setFromSphericalCoords(SPHERE_RADIUS + 0.03, coords.x, coords.y);
      this.markersGroup.add(marker);
    }
  }

  /** Switches which planet the mini-map represents (hooked up to the Earth/Mars HUD buttons). */
  focusPlanetByName(name: string) {
    const state = this.game.state.planets.find((p) => p.name === name);
    if (!state || state.id === this.focusedPlanetId) return;

    this.focusedPlanetId = state.id;
    this.buildMarkers(state.id);
  }

  update() {
    const planetUnit = this.game.units.find(
      (u): u is Planet => u.state.type === 'planet' && u.state.id === this.focusedPlanetId
    );
    if (planetUnit) {
      this.wireSphere.rotation.y = planetUnit.unitState.rotation.y;
      this.markersGroup.rotation.y = planetUnit.unitState.rotation.y;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
