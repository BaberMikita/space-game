import * as THREE from 'three';
import { Sun } from './sun';
import { Planet, type PlanetState } from './planet';
import { Engine } from './engine';
import { Continent } from './continent';
import { Camera } from './camera';
import { addStars } from './stars';
import { HUD } from './hud';
import { BUILDING_ECONOMY, BUILDING_PRESETS } from './buildingConfig';
import { Player, type PlayerState } from './player';
import './style.css';
import type { Building, BuildingState } from './building';
import type { Unit } from './units';

type GameState = {
  players: PlayerState[];
  planets: PlanetState[];
};

export const BASE_RESOURCES = {
  money: 100,
  fuel: 100,
} as const;

export class Game {
  player: Player;
  players: Player[] = [];
  engine: Engine;
  camera: Camera;
  hud: HUD;
  units: (Building | Planet | Continent)[] = [];
  private economyTime = 0;
  private lastFrameTime = performance.now();

  state: GameState = {
    sun: {},
    players: [
      {
        id: 1,
        name: 'Nikita',
        continents: [1],
        resources: { ...BASE_RESOURCES },
      },
      {
        id: 2,
        name: 'AI',
        continents: [],
        resources: { ...BASE_RESOURCES },
      },
    ],
    planets: [
      {
        id: 1,
        type: 'planet',
        name: 'Earth',
        color: 0x335588,
        radius: 1,
        position: new THREE.Vector3(2, 0, -2),
        continents: [
          {
            id: 1,
            type: 'continent',
            height: 0.2,
            color: 0x337733,
            position: new THREE.Vector2(0.65, -0.25),
            units: [

            ],
          },
        ],
      },
      {
        id: 2,
        type: 'planet',
        name: 'Mars',
        color: 0x883333,
        radius: 0.5,
        position: new THREE.Vector3(2, 0, -5),
        continents: [],
      },
    ],
  };

  constructor() {
    this.engine = new Engine({ game: this });

    this.state.sun = new Sun({ game: this });

    // Apply building presets to any pre-defined building units (fill missing size/color)
    for (const planet of this.state.planets) {
      if (!planet.continents) continue;
      for (const cont of planet.continents) {
        if (!cont.units) continue;
        for (const unit of cont.units) {
          if (unit.type === 'building') {
            const k = (unit as any).kind || 'generic';
            const preset = BUILDING_PRESETS[k] || BUILDING_PRESETS.generic;
            unit.length = (unit as any).length ?? preset.length;
            unit.width = (unit as any).width ?? preset.width;
            unit.height = (unit as any).height ?? preset.height;
            unit.color = (unit as any).color ?? preset.color;
          }
        }
      }
    }

    this.engine.camera.position.z = 3;
    this.engine.camera.position.y = 3;

    this.engine.camera.lookAt(this.engine.scene.position);

    for (const state of this.state.planets) {
      this.units.push(new Planet({ game: this, state }));
    }

    for (const state of this.state.players) {
      //передать массив обьектов континентов(взять их из юнитс)
      this.players.push(
        new Player({
          game: this,
          state,
          continents: this.units.filter(
            (v): v is Continent => v?.state?.type === 'continent'
          ),
        })
      );
    }
    addStars(this.engine.scene, 300);
    const light = new THREE.AmbientLight(0xaaaaff, 0.2);
    const gridHelper = new THREE.GridHelper(50, 50);
    this.engine.scene.add(light, gridHelper);

    this.player = this.players[0];
    this.camera = new Camera({ game: this });
    this.hud = new HUD({ game: this });

    window.player = this.player;

    this.animate = this.animate.bind(this);
    this.engine.init();
  }

  animate() {
    const now = performance.now();
    const deltaSeconds = Math.min((now - this.lastFrameTime) / 1000, 0.25);
    this.lastFrameTime = now;
    this.economyTime += deltaSeconds;

    if (this.economyTime >= 1) {
      this.updateEconomy(this.economyTime);
      this.economyTime = 0;
    }

    this.camera.update();
    this.engine.animate();
    for (const unit of this.units) {
      unit.update();
    }
  }

  private updateEconomy(seconds: number) {
    const resources = this.player.state.resources;
    const ownedContinentIds = new Set(this.player.state.continents);
    const available = { money: resources.money, fuel: resources.fuel };
    const changes = { money: 0, fuel: 0 };

    for (const unit of this.units) {
      if (unit.state.type !== 'building') continue;
      if (!('continent' in unit)) continue;
      if (!ownedContinentIds.has(unit.continent.state.id)) continue;

      const rates = BUILDING_ECONOMY[unit.state.kind as keyof typeof BUILDING_ECONOMY];
      const consumption = {
        money: (rates.consumes?.money ?? 0) * seconds,
        fuel: (rates.consumes?.fuel ?? 0) * seconds,
      };
      const canPay = available.money >= consumption.money && available.fuel >= consumption.fuel;
      if (!canPay) continue;

      for (const resource of ['money', 'fuel'] as const) {
        available[resource] -= consumption[resource];
        const production = (rates.produces?.[resource] ?? 0) * seconds;
        available[resource] += production;
        changes[resource] += production - consumption[resource];
      }
    }

    resources.money += changes.money;
    resources.fuel += changes.fuel;

    this.hud.updateResources();
  }
}
declare global {
  interface Window {
    player: Player;
  }
}
