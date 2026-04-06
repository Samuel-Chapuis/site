const svg = document.getElementById('contours');

if (svg) {
  function buildContours() {
    const width = 1440;
    svg.innerHTML = '';

    for (let layer = 0; layer < 12; layer++) {
      const yBase = 80 + layer * 62;
      const amplitude = 18 + layer * 4;
      const freq = 0.010 + layer * 0.0008;
      const phase = layer * 0.9;
      let d = `M 0 ${yBase}`;

      for (let x = 0; x <= width; x += 24) {
        const y =
          yBase +
          Math.sin(x * freq + phase) * amplitude +
          Math.cos(x * freq * 0.42 + phase) * amplitude * 0.45;
        d += ` L ${x} ${y.toFixed(2)}`;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(248,250,252,' + (0.06 + layer * 0.009) + ')');
      path.setAttribute('stroke-width', layer % 3 === 0 ? '1.25' : '0.9');
      path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
    }
  }

  buildContours();
}

const canvas = document.getElementById('flowCanvas');

if (canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });

  let w = 0;
  let h = 0;
  let ratio = 1;

  // Résolution interne volontairement plus faible pour garder une simulation fluide
  let nx = 0;
  let ny = 0;
  let dx = 1;
  let dy = 1;

  let dye = null;
  let dyeNext = null;
  let velX = null;
  let velY = null;

  let imageData = null;

  let lastTime = performance.now();
  let simTime = 0;

  const DIFFUSION = 0.0009;
  const DAMPING = 0.9975;
  const SWIRL_STRENGTH = 0.34;
  const CORE_SIZE = 0.018;
  const ORBIT_RADIUS = 0.18;
  const ANGULAR_SPEED = 0.42;
  const SOURCE_WIDTH = 0.035;
  const SINK_WIDTH = 0.040;
  const SHOW_DEBUG_MARKERS = true;

  let debugSourceX = 0.5;
  let debugSourceY = 0.5;
  let debugSinkX = 0.5;
  let debugSinkY = 0.5;

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function idx(i, j) {
    return i + j * nx;
  }

  function bilinearSample(field, x, y) {
    x = clamp(x, 0, nx - 1.001);
    y = clamp(y, 0, ny - 1.001);

    const x0 = x | 0;
    const y0 = y | 0;
    const x1 = Math.min(x0 + 1, nx - 1);
    const y1 = Math.min(y0 + 1, ny - 1);

    const tx = x - x0;
    const ty = y - y0;

    const f00 = field[idx(x0, y0)];
    const f10 = field[idx(x1, y0)];
    const f01 = field[idx(x0, y1)];
    const f11 = field[idx(x1, y1)];

    return (
      f00 * (1 - tx) * (1 - ty) +
      f10 * tx * (1 - ty) +
      f01 * (1 - tx) * ty +
      f11 * tx * ty
    );
  }

  function gaussian(x, y, cx, cy, sigma) {
    const dx = x - cx;
    const dy = y - cy;
    return Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
  }

  function resizeCanvas() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, canvas.clientWidth);
    h = Math.max(1, canvas.clientHeight);

    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    nx = Math.max(120, Math.round(w * 0.16));
    ny = Math.max(80, Math.round(h * 0.16));

    dx = 1 / (nx - 1);
    dy = 1 / (ny - 1);

    dye = new Float32Array(nx * ny);
    dyeNext = new Float32Array(nx * ny);
    velX = new Float32Array(nx * ny);
    velY = new Float32Array(nx * ny);

    imageData = ctx.createImageData(nx, ny);
  }

  function computeVelocityField(t) {
    const cx = 0.5;
    const cy = 0.5;

    // Angle de rotation des 2 points (source et puits) autour du centre.
    // ANGULAR_SPEED controle la vitesse de deplacement.
    const theta = ANGULAR_SPEED * t;

    // Source (S) : orbite circulaire de rayon ORBIT_RADIUS autour de (cx, cy).
    const sx = cx + ORBIT_RADIUS * Math.cos(theta);
    const sy = cy + ORBIT_RADIUS * Math.sin(theta);

    // Puits (P) : meme orbite mais a l'oppose (dephasage de PI).
    const kx = cx + ORBIT_RADIUS * Math.cos(theta + Math.PI);
    const ky = cy + ORBIT_RADIUS * Math.sin(theta + Math.PI);

    // Amplitudes temporelles de la source et du puits (elles varient dans le temps).
    const sourceAmp = 1.0 + 0.65 * Math.sin(1.15 * t);
    const sinkAmp = 0.95 + 0.65 * Math.sin(1.15 * t + Math.PI / 2);

    const tangentialSource = 0.85 * sourceAmp;
    const tangentialSink = -0.78 * sinkAmp;

    for (let j = 0; j < ny; j++) {
      const y = j / (ny - 1);

      for (let i = 0; i < nx; i++) {
        const x = i / (nx - 1);

        let u = 0;
        let v = 0;

        // Petit tourbillon global pour casser la symétrie
        {
          const rx = x - cx;
          const ry = y - cy;
          const r2 = rx * rx + ry * ry + 0.02;
          u += (-ry / r2) * 0.008;
          v += (rx / r2) * 0.008;
        }

        // Source rotative : composante radiale + tangentielle
        {
          const rx = x - sx;
          const ry = y - sy;
          const r2 = rx * rx + ry * ry + CORE_SIZE;
          const invr = 1 / Math.sqrt(r2);

          // Flux "sortant"
          u += SWIRL_STRENGTH * 0.11 * sourceAmp * rx * invr / r2;
          v += SWIRL_STRENGTH * 0.11 * sourceAmp * ry * invr / r2;

          // Vorticité locale
          u += SWIRL_STRENGTH * tangentialSource * (-ry) / r2;
          v += SWIRL_STRENGTH * tangentialSource * (rx) / r2;
        }

        // Puis : composante radiale entrante + vortex opposé
        {
          const rx = x - kx;
          const ry = y - ky;
          const r2 = rx * rx + ry * ry + CORE_SIZE;
          const invr = 1 / Math.sqrt(r2);

          // Flux "entrant"
          u -= SWIRL_STRENGTH * 0.10 * sinkAmp * rx * invr / r2;
          v -= SWIRL_STRENGTH * 0.10 * sinkAmp * ry * invr / r2;

          // Vorticité locale opposée
          u += SWIRL_STRENGTH * tangentialSink * (-ry) / r2;
          v += SWIRL_STRENGTH * tangentialSink * (rx) / r2;
        }

        // Limitation douce pour la stabilité
        const speed = Math.hypot(u, v);
        const maxSpeed = 1.6;
        if (speed > maxSpeed) {
          const s = maxSpeed / speed;
          u *= s;
          v *= s;
        }

        const id = idx(i, j);
        velX[id] = u;
        velY[id] = v;
      }
    }

    return { sx, sy, kx, ky, sourceAmp, sinkAmp };
  }

  function step(dt) {
    const src = computeVelocityField(simTime);
    debugSourceX = src.sx;
    debugSourceY = src.sy;
    debugSinkX = src.kx;
    debugSinkY = src.ky;

    // Advection semi-lagrangienne + diffusion explicite + source/puis
    for (let j = 0; j < ny; j++) {
      const y = j / (ny - 1);

      for (let i = 0; i < nx; i++) {
        const x = i / (nx - 1);
        const id = idx(i, j);

        const u = velX[id];
        const v = velY[id];

        // Backtrace
        const px = (x - u * dt);
        const py = (y - v * dt);

        const sampleX = px * (nx - 1);
        const sampleY = py * (ny - 1);

        let advected = bilinearSample(dye, sampleX, sampleY);

        // Diffusion
        const il = Math.max(i - 1, 0);
        const ir = Math.min(i + 1, nx - 1);
        const jb = Math.max(j - 1, 0);
        const jt = Math.min(j + 1, ny - 1);

        const center = dye[id];
        const lap =
          (dye[idx(il, j)] + dye[idx(ir, j)] + dye[idx(i, jb)] + dye[idx(i, jt)] - 4 * center);

        advected += DIFFUSION * lap;

        // Source positive
        advected +=
          1.65 * src.sourceAmp * gaussian(x, y, src.sx, src.sy, SOURCE_WIDTH) * dt;

        // Puis négatif
        advected -=
          1.45 * src.sinkAmp * gaussian(x, y, src.kx, src.ky, SINK_WIDTH) * dt;

        // Léger amortissement
        advected *= DAMPING;

        dyeNext[id] = advected;
      }
    }

    const temp = dye;
    dye = dyeNext;
    dyeNext = temp;
  }

  function render() {
    const data = imageData.data;

    let minVal = Infinity;
    let maxVal = -Infinity;

    for (let i = 0; i < dye.length; i++) {
      const v = dye[i];
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }

    const span = Math.max(1e-6, maxVal - minVal);

    for (let i = 0; i < dye.length; i++) {
      const v = dye[i];
      const n = (v - minVal) / span;

      // Palette sobre : blanc froid / bleu / anthracite
      const alpha = Math.pow(clamp(n, 0, 1), 0.88);

      const r = Math.round(20 + 65 * alpha);
      const g = Math.round(28 + 115 * alpha);
      const b = Math.round(39 + 205 * alpha);

      const p = i * 4;
      data[p] = r;
      data[p + 1] = g;
      data[p + 2] = b;
      data[p + 3] = Math.round(25 + 210 * alpha);
    }

    // rendu basse résolution -> canvas
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = nx;
    tmpCanvas.height = ny;
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.putImageData(imageData, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tmpCanvas, 0, 0, w, h);

    // léger voile radial pour mieux fondre dans le hero
    const grad = ctx.createRadialGradient(
      w * 0.52, h * 0.5, 0,
      w * 0.52, h * 0.5, Math.max(w, h) * 0.55
    );
    grad.addColorStop(0, 'rgba(248,250,252,0.03)');
    grad.addColorStop(0.55, 'rgba(59,130,246,0.06)');
    grad.addColorStop(1, 'rgba(17,24,39,0.10)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (SHOW_DEBUG_MARKERS) {
      const sourcePx = debugSourceX * w;
      const sourcePy = debugSourceY * h;
      const sinkPx = debugSinkX * w;
      const sinkPy = debugSinkY * h;

      ctx.save();

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillStyle = 'rgba(255, 40, 40, 0)';
      ctx.beginPath();
      ctx.arc(sourcePx, sourcePy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(90, 255, 120, 0)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(sinkPx, sinkPy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  function animate(now) {
    const dtRaw = (now - lastTime) / 1000;
    lastTime = now;

    const dt = Math.min(0.025, Math.max(0.008, dtRaw));
    simTime += dt;

    // Plusieurs sous-pas pour plus de stabilité
    const substeps = 2;
    const subdt = dt / substeps;

    for (let s = 0; s < substeps; s++) {
      step(subdt);
    }

    render();
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame((t) => {
    lastTime = t;
    animate(t);
  });
}