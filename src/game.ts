import * as THREE from 'three';
import { Sun } from './sun';
import { Planet, type PlanetState } from './planet';
import { Engine } from './engine';
import { Continent } from './continent';
import { Camera } from './camera';
import { addStars } from './stars';
import { HUD } from './hud';
import { BUILDING_PRESETS } from './buildingConfig';
import { Player, type PlayerState } from './player';
import './style.css';
import type { Building, BuildingState } from './building';
import type { Unit } from './units';

type GameState = {
  players: PlayerState[];
  planets: PlanetState[];
};

export class Game {
  player: Player;
  players: Player[] = [];
  engine: Engine;
  camera: Camera;
  hud: HUD;
  units: (Building | Planet | Continent)[] = [];

  state: GameState = {
    sun: {},
    players: [
      {
        id: 1,
        name: 'Nikita',
        continents: [1],
        resources: {
          money: 100,
          fuel: 100,
        },
      },
      {
        id: 2,
        name: 'AI',
        continents: [],
        resources: {
          money: 100,
          fuel: 100,
        },
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
              {
                id: 1,
                type: 'building',
                kind: 'fuel_mine', // ВОТ ТУТ МЕНЯЙ НА 'fuel_mine' ИЛИ 'factory'
                color: 0x335588,
                height: 0.1,
                length: 0.1,
                width: 0.1,
                name: 'Main Factory',
                position: new THREE.Vector2(0.1, 0.1),
              },
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
    this.camera.update();
    this.engine.animate();
    for (const unit of this.units) {
      unit.update();
    }
  }
}
declare global {
  interface Window {
    player: Player;
  }
}
