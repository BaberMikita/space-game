import * as THREE from 'three';

export class Engine {
  game;
  scene;
  camera;
  renderer;

  constructor({ game }) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.init = this.init.bind(this);
    this.animate = this.animate.bind(this);
  }

  init() {
    this.renderer.setAnimationLoop(this.game.animate);
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
  }
}
