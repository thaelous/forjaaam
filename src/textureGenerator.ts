import * as THREE from 'three';

// Procedural high-resolution canvas texture generators for realistic industrial surfaces

export function createCastIronTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark base
  ctx.fillStyle = '#222831';
  ctx.fillRect(0, 0, size, size);

  // Cast iron grain & roughness variation
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 45;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle industrial panel seams & micro-cracks
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 1.5;
  for (let x = 64; x < size; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createBrushedSteelBump(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Fine linear machining stripes (lathe / grinding finish)
  for (let y = 0; y < size; y++) {
    const val = 128 + Math.sin(y * 0.8) * 15 + (Math.random() - 0.5) * 35;
    const v = Math.floor(Math.min(255, Math.max(0, val)));
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, y, size, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 6);
  return texture;
}

export function createDiamondPlateTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Industrial dark slate floor
  ctx.fillStyle = '#111724';
  ctx.fillRect(0, 0, size, size);

  // Grid of industrial diamond treads
  const step = 32;
  ctx.fillStyle = '#26334d';
  ctx.strokeStyle = '#0a0d16';
  ctx.lineWidth = 1;

  for (let x = 0; x < size; x += step) {
    for (let y = 0; y < size; y += step) {
      const isAlt = (x / step + y / step) % 2 === 0;
      ctx.save();
      ctx.translate(x + step / 2, y + step / 2);
      ctx.rotate(isAlt ? Math.PI / 4 : -Math.PI / 4);

      // Tread shape
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  // Dirt / oil stains
  for (let i = 0; i < 12; i++) {
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    const rad = 20 + Math.random() * 60;
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
    grad.addColorStop(0, 'rgba(5, 7, 12, 0.4)');
    grad.addColorStop(1, 'rgba(5, 7, 12, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

export function createHotBilletTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Incandescent forge steel (yellow core, radiant orange, scale crust)
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#fff4cc'); // ultra-hot core
  grad.addColorStop(0.3, '#ff6600');
  grad.addColorStop(0.7, '#cc2900');
  grad.addColorStop(1, '#881100');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Black oxide scale flakes (*cascarilla de forja*)
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = 2 + Math.random() * 8;
    const h = 2 + Math.random() * 6;
    ctx.fillStyle = `rgba(20, 20, 20, ${0.4 + Math.random() * 0.5})`;
    ctx.fillRect(x, y, w, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createAAMGreenTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // AAM Machinery Industrial Green Base
  ctx.fillStyle = '#1e3a34';
  ctx.fillRect(0, 0, size, size);

  // Subtle paint wear and oil grime
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 25;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

export function createHazardStripesTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#18181b';
  const stripeWidth = 24;

  ctx.save();
  ctx.rotate(Math.PI / 4);
  for (let x = -size; x < size * 2; x += stripeWidth * 2) {
    ctx.fillRect(x, -size, stripeWidth, size * 3);
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 6);
  return texture;
}
