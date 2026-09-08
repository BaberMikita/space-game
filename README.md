# Space Game 🪐

A browser-based 3D space strategy game built with **Three.js** and **Vite**. Place
buildings on planet continents, manage an economy of money and fuel, and watch
your solar system come to life — all running in the browser, no install needed.

> Created with [StackBlitz](https://stackblitz.com) ⚡️

## ✨ Features

- **3D solar system** rendered with Three.js — orbit the Sun, Earth and Mars.
- **Building & economy system** — construct buildings that cost money and
  produce/consume resources over time.
- **Resource management** — track Money and Fuel live in the HUD.
- **Planet focus** — jump the camera to Earth or Mars, or re-center the view.
- **Orbit camera controls** — drag to rotate, scroll to zoom.
- **Mini-map** — a wireframe sphere in the bottom-right corner mirrors the
  focused planet's rotation and marks its continents; it switches
  automatically when you focus a different planet.

## 🎮 How to play

1. **Launch the game** (see [Run locally](#-run-locally) below or open it on
   StackBlitz).
2. **Move the camera** with the mouse: drag to orbit, scroll to zoom.
3. **Focus a planet** — click **Earth** or **Mars** in the bottom toolbar to
   center the camera on it, or click **Center** to reset.
4. **Open the Build menu** — click the **Build** button (hammer). Pick a
   building type from the submenu:
   - **Fuel Mine** — costs 100, produces Fuel over time.
   - **Factory** — costs 100, consumes Fuel to produce Money.
   - **Space Center** — costs 500, consumes Fuel and Money.
5. **Place a building** — with a building selected, click on the green
   continent surface to place it there. A red preview mesh follows your cursor
   in build mode.
6. **Remove a building** — hold **Shift** and click a placed building to delete
   it.
7. **Clear everything** — press **R** to remove all placed buildings.
8. **Exit build mode** — click **Back** or press **Esc**.

Watch your **Money** and **Fuel** counters in the top-left HUD as your economy
grows.

## 🏗️ Building reference

| Building      | Cost | Produces     | Consumes        |
| ------------- | ---- | ------------ | --------------- |
| Fuel Mine     | 100  | Fuel (+10)   | —               |
| Factory       | 100  | Money (+20)  | Fuel (−1)       |
| Space Center  | 500  | —            | Fuel (−15), Money (−90) |

## 🛠️ Tech stack

- [Three.js](https://threejs.org/) — 3D rendering and scene graph
- [Vite](https://vitejs.dev/) — dev server and build tooling
- [TypeScript](https://www.typescriptlang.org/) — typed game logic
- [Tailwind CSS](https://tailwindcss.com/) + [Iconify](https://iconify.design/) — HUD styling and icons

## ▶️ Run locally

Requires [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) (or npm/yarn).

```bash
# install dependencies
pnpm install

# start the dev server
pnpm dev
```

Then open the printed local URL (default <http://localhost:5173>) in your browser.

To build for production:

```bash
pnpm build
pnpm preview
```

## 📁 Project structure

```
src/
├── game.ts            # Game class — state, players, planets, update loop
├── engine.ts           # Three.js renderer / scene setup
├── camera.ts           # OrbitControls + planet focus
├── planet.ts          # Planet (Earth, Mars) meshes
├── continent.ts        # Continent surfaces where buildings can be placed
├── building.ts         # Building mesh + placement on continents
├── buildingConfig.ts   # Building presets (size/color) & economy (cost/rates)
├── player.ts           # Player input: build mode, pointer/raycast placement
├── minimap.ts          # Bottom-right wireframe mini-map of the focused planet
├── hud.ts              # HUD wiring: resources, build menu, planet focus
├── sun.ts / stars.ts   # Sun and starfield background
└── main.ts             # Entry point
```

## 📌 Notes

- The game is a work in progress — the AI opponent currently has no continents
  assigned yet.
- No license has been set yet; reach out before reusing the code.
