import { Game } from './game';

export class HUD {
  game: Game;

  constructor({ game }: { game: Game }) {
    this.game = game;

    document.addEventListener('DOMContentLoaded', function () {
      var hand = document.getElementById('btn-hand');
      var submenu = document.getElementById('hand-submenu');
      var back = document.getElementById('btn-hand-back');

      if (!hand || !submenu || !back) return;

      function syncBuildButtonUI() {
        const p = window.player;
        if (!p) return;
        if (p.mode === 'build') hand.classList.add('ring-2', 'ring-yellow-400');
        else hand.classList.remove('ring-2', 'ring-yellow-400');
      }

      hand.addEventListener('click', function () {
        if (window.player) {
          window.player.toggleMode();
          syncBuildButtonUI();
        }

        hand.classList.add('hidden');
        submenu.classList.remove('hidden');
      });

      back.addEventListener('click', function () {
        submenu.classList.add('hidden');
        hand.classList.remove('hidden');

        if (window.player) {
          window.player.setMode('common');
          syncBuildButtonUI();
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !submenu.classList.contains('hidden')) {
          submenu.classList.add('hidden');
          hand.classList.remove('hidden');

          if (window.player) {
            window.player.setMode('common');
            syncBuildButtonUI();
          }
        }
      });
      syncBuildButtonUI();
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
