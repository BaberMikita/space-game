import * as THREE from 'three';
import type { Game } from './game';
import type { Building } from './building';

const MINIMAP_SIZE = 320;
const BORDER_COLOR = 0x5cc6ff;
const VIEW_MARGIN = 1.2;
const SUN_COLOR = 0xffcc66;
const FOCUS_RING_COLOR = 0x8be0ff;

export type MinimapMode = 'continent' | 'universe';

/**
 * Bottom-right mini-map: renders a small top-down view of the continent that
 * is currently the "main" building target — either the continent owned by
 * the player on the focused planet, or the planet's first continent as a
 * fallback. Buildings placed on that continent show up live as colored
 * markers. Runs its own tiny scene/camera/renderer so it never interferes
 * with the main game view.
 */
export class Minimap {
  game: Game;
  scene: THREE.Scene = new THREE.Scene();
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  continentPlane: THREE.Mesh | null = null;
  continentBorder: THREE.LineLoop | null = null;
  buildingsGroup: THREE.Group = new THREE.Group();
  planetMarkersGroup: THREE.Group = new THREE.Group();
  focusedPlanetId: number;
  activeContinentId: number | null = null;
  mode: MinimapMode = 'continent';

  constructor({ game }: { game: Game }) {
    this.game = game;
    this.focusedPlanetId = game.state.planets[0]?.id ?? 1;

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.set(0, 0, 3);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(MINIMAP_SIZE, MINIMAP_SIZE);

    const container = document.getElementById('minimap-container');
    container?.appendChild(this.renderer.domElement);

    // Match the minimap orientation to the planet surface view.
    this.scene.scale.x = -1;
    this.scene.add(this.buildingsGroup, this.planetMarkersGroup);
    this.buildContinentView(this.focusedPlanetId);

    this.focusPlanetByName = this.focusPlanetByName.bind(this);
    this.showUniverse = this.showUniverse.bind(this);
    this.update = this.update.bind(this);
  }

  private clearContinentMeshes() {
    if (this.continentPlane) {
      this.scene.remove(this.continentPlane);
      this.continentPlane.geometry.dispose();
      (this.continentPlane.material as THREE.Material).dispose();
      this.continentPlane = null;
    }
    if (this.continentBorder) {
      this.scene.remove(this.continentBorder);
      this.continentBorder.geometry.dispose();
      (this.continentBorder.material as THREE.Material).dispose();
      this.continentBorder = null;
    }
    this.buildingsGroup.clear();
  }

  private setLabel(text: string) {
    const label = document.querySelector('#minimap-container .minimap-label-text');
    if (label) label.textContent = text;
  }

  /** Picks the continent to display for a given planet: the player's owned
   * continent on that planet if any, otherwise the first continent. */
  private pickContinent(planetId: number) {
    const state = this.game.state.planets.find((p) => p.id === planetId);
    if (!state) return null;

    const ownedIds = new Set(this.game.player?.state.continents ?? []);
    return state.continents.find((c) => ownedIds.has(c.id)) ?? state.continents[0] ?? null;
  }

  private buildContinentView(planetId: number) {
    const planetState = this.game.state.planets.find((p) => p.id === planetId);
    const continent = this.pickContinent(planetId);

    this.clearContinentMeshes();
    this.planetMarkersGroup.clear();

    if (!planetState || !continent) {
      this.activeContinentId = null;
      return;
    }

    this.activeContinentId = continent.id;

    const continentRadius = planetState.radius * continent.scale;
    const w = continentRadius;
    const h = continentRadius * 0.8;

    const geometry = new THREE.PlaneGeometry(w, h);
    const material = new THREE.MeshBasicMaterial({
      color: continent.color,
      transparent: true,
      opacity: 0.85,
    });
    const plane = new THREE.Mesh(geometry, material);
    this.scene.add(plane);
    this.continentPlane = plane;

    const borderGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-w / 2, -h / 2, 0.005),
      new THREE.Vector3(w / 2, -h / 2, 0.005),
      new THREE.Vector3(w / 2, h / 2, 0.005),
      new THREE.Vector3(-w / 2, h / 2, 0.005),
    ]);
    const borderMaterial = new THREE.LineBasicMaterial({ color: BORDER_COLOR });
    const border = new THREE.LineLoop(borderGeometry, borderMaterial);
    this.scene.add(border);
    this.continentBorder = border;

    const halfW = (w / 2) * VIEW_MARGIN;
    const halfH = (h / 2) * VIEW_MARGIN;
    const half = Math.max(halfW, halfH);
    this.camera.left = -half;
    this.camera.right = half;
    this.camera.top = half;
    this.camera.bottom = -half;
    this.camera.updateProjectionMatrix();

    this.refreshBuildings();
  }

  /** Rebuilds the building markers from the live game state so newly placed
   * buildings appear on the mini-map right away. */
  private refreshBuildings() {
    this.buildingsGroup.clear();
    if (this.activeContinentId == null) return;

    for (const unit of this.game.units) {
      if (unit.state.type !== 'building') continue;
      const building = unit as Building;
      if (building.continent.state.id !== this.activeContinentId) continue;

      const markerGeometry = new THREE.PlaneGeometry(
        Math.max(building.state.length, 0.03),
        Math.max(building.state.width, 0.03)
      );
      const markerMaterial = new THREE.MeshBasicMaterial({ color: building.state.color });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(building.state.position.x, building.state.position.y, 0.01);
      this.buildingsGroup.add(marker);
    }
  }

  /** Switches which planet the mini-map represents (hooked up to the Earth/Mars HUD buttons).
   * Also brings the map back from universe mode into continent mode, even if
   * that planet was already the focused one. */
  focusPlanetByName(name: string) {
    const state = this.game.state.planets.find((p) => p.name === name);
    if (!state) return;
    if (this.mode === 'continent' && state.id === this.focusedPlanetId) return;

    this.focusedPlanetId = state.id;
    this.mode = 'continent';
    this.buildContinentView(state.id);
    this.setLabel('Map');
  }

  /** Switches the mini-map to a system-wide view showing the sun and every
   * planet's position (hooked up to the "Center" HUD button). */
  showUniverse() {
    this.mode = 'universe';
    this.clearContinentMeshes();
    this.activeContinentId = null;
    this.buildUniverseView();
    this.setLabel('System');
  }

  private buildUniverseView() {
    this.planetMarkersGroup.clear();

    const sunGeometry = new THREE.CircleGeometry(0.12, 20);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: SUN_COLOR });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0.01);
    this.planetMarkersGroup.add(sun);

    let maxExtent = 1;
    for (const planet of this.game.state.planets) {
      const x = planet.position.x;
      const y = -planet.position.z;
      maxExtent = Math.max(maxExtent, Math.hypot(x, y) + planet.radius);

      const markerRadius = Math.max(planet.radius * 0.5, 0.08);
      const markerGeometry = new THREE.CircleGeometry(markerRadius, 20);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: planet.color });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, 0.01);
      this.planetMarkersGroup.add(marker);

      if (planet.id === this.focusedPlanetId) {
        const ringGeometry = new THREE.RingGeometry(markerRadius * 1.3, markerRadius * 1.55, 24);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: FOCUS_RING_COLOR });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(x, y, 0.015);
        this.planetMarkersGroup.add(ring);
      }
    }

    const half = maxExtent * VIEW_MARGIN;
    this.camera.left = -half;
    this.camera.right = half;
    this.camera.top = half;
    this.camera.bottom = -half;
    this.camera.updateProjectionMatrix();
  }

  update() {
    if (this.mode === 'continent') {
      this.refreshBuildings();
    }
    this.renderer.render(this.scene, this.camera);
  }
}

