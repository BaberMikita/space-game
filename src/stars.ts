import * as THREE from 'three';

function createStarfield(count: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to create the starfield canvas context.');
  }

  const background = context.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, '#080d1c');
  background.addColorStop(0.5, '#030712');
  background.addColorStop(1, '#080a18');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const nebula = context.createRadialGradient(
    canvas.width * 0.52,
    canvas.height * 0.47,
    0,
    canvas.width * 0.52,
    canvas.height * 0.47,
    canvas.width * 0.42
  );
  nebula.addColorStop(0, 'rgba(42, 58, 112, 0.2)');
  nebula.addColorStop(0.55, 'rgba(32, 38, 87, 0.1)');
  nebula.addColorStop(1, 'rgba(8, 12, 28, 0)');
  context.fillStyle = nebula;
  context.fillRect(0, 0, canvas.width, canvas.height);

  let seed = 27491;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const starColors = ['#ffffff', '#c9ddff', '#a9c8ff', '#ffe4c2'];

  for (let i = 0; i < count; i++) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const radius = 0.35 + random() * 0.8;
    const alpha = 0.35 + random() * 0.65;
    const color = starColors[Math.floor(random() * starColors.length)];

    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();

    if (i % 80 === 0) {
      const glow = context.createRadialGradient(x, y, 0, x, y, radius * 7);
      glow.addColorStop(0, `${color}aa`);
      glow.addColorStop(1, `${color}00`);
      context.globalAlpha = 0.7;
      context.fillStyle = glow;
      context.beginPath();
      context.arc(x, y, radius * 7, 0, Math.PI * 2);
      context.fill();
    }
  }

  context.globalAlpha = 1;
  return canvas;
}

export function addStars(scene: THREE.Scene, count = 1800) {
  const texture = new THREE.CanvasTexture(createStarfield(count));
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  scene.background = texture;
}
