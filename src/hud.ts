import { Game } from './game';

export class HUD {
  game: Game;

  constructor({ game }: { game: Game }) {
    this.game = game;

    document.addEventListener('DOMContentLoaded', function () {
      var hand = document.getElementById('btn-hand');
      var submenu = document.getElementById('hand-submenu');
      var back = document.getElementById('btn-hand-back');
      var planetFocusControls = document.getElementById('planet-focus-controls');

      if (!hand || !submenu || !back || !planetFocusControls) return;
      const handButton = hand;
      const buildSubmenu = submenu;
      const backButton = back;
      const focusControls = planetFocusControls;

      function syncBuildButtonUI() {
        const p = window.player;
        if (!p) return;
        if (p.mode === 'build') handButton.classList.add('ring-2', 'ring-yellow-400');
        else handButton.classList.remove('ring-2', 'ring-yellow-400');
      }

      handButton.addEventListener('click', function () {
        if (window.player) {
          window.player.toggleMode();
          syncBuildButtonUI();
        }

        handButton.classList.add('hidden');
        buildSubmenu.classList.remove('hidden');
        focusControls.classList.add('hidden');
      });

      backButton.addEventListener('click', function () {
        buildSubmenu.classList.add('hidden');
        handButton.classList.remove('hidden');
        focusControls.classList.remove('hidden');

        if (window.player) {
          window.player.setMode('common');
          syncBuildButtonUI();
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !buildSubmenu.classList.contains('hidden')) {
          buildSubmenu.classList.add('hidden');
          handButton.classList.remove('hidden');
          focusControls.classList.remove('hidden');

          if (window.player) {
            window.player.setMode('common');
            syncBuildButtonUI();
          }
        }
      });
      syncBuildButtonUI();

      // building selection buttons inside hand submenu
      const submenuBtns = document.querySelectorAll<HTMLButtonElement>('#hand-submenu .hud-btn');
      submenuBtns.forEach((btn) => {
        const kind = btn.dataset.kind?.trim();
        if (!kind) return;
        btn.addEventListener('click', () => {
          const colorHex = btn.dataset.color || '#808080';
          const shape = btn.dataset.shape || 'box';
          const colorNum = Number('0x' + colorHex.replace('#', ''));
          if ((window as any).player) {
            (window as any).player.selectedBuilding = {
              kind: kind as any,
              color: colorNum,
            };
            console.log('selectedBuilding set', (window as any).player.selectedBuilding);
          }

          // UI: mark pressed
          submenuBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
          btn.setAttribute('aria-pressed', 'true');
        });
      });

      // set default selection to first submenu button (if any)
      const firstBtn = Array.from(submenuBtns).find((b) => b.dataset.kind);
      if (firstBtn) {
        const applyDefault = () => {
          const kind = firstBtn.dataset.kind?.trim();
          const colorHex = firstBtn.dataset.color || '#808080';
          const colorNum = Number('0x' + colorHex.replace('#', ''));
          if ((window as any).player) {
            (window as any).player.selectedBuilding = { kind: kind as any, color: colorNum };
            firstBtn.setAttribute('aria-pressed', 'true');
            console.log('default selectedBuilding applied', (window as any).player.selectedBuilding);
          } else {
            setTimeout(applyDefault, 50);
          }
        };
        applyDefault();
      }
    });

    document
      .querySelectorAll<HTMLButtonElement>('[data-planet]')
      .forEach((btn) => {
        const name = btn.dataset.planet?.trim();
        if (!name) return;

        btn.addEventListener('click', () => {
          const cam: any = this.game.camera;
          if (typeof cam.focusInPlanetByName === 'function')
            cam.focusInPlanetByName(name);
          else if (typeof cam.focusOnPlanetByName === 'function')
            cam.focusOnPlanetByName(name);
        });
      });

    const resetTargetBtn = document.getElementById(
      'btn-reset-target'
    ) as HTMLButtonElement | null;

    resetTargetBtn?.addEventListener('click', () => {
      this.game.camera.controls.target.set(0, 0, 0);
      this.game.camera.controls.update();
    });
  }
}
