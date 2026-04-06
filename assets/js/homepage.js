const svg = document.getElementById('contours');

function buildContours() {
  const width = 1440;
  const height = 900;
  svg.innerHTML = '';

  for (let layer = 0; layer < 12; layer++) {
    const yBase = 80 + layer * 62;
    const amplitude = 18 + layer * 4;
    const freq = 0.010 + layer * 0.0008;
    const phase = layer * 0.9;
    let d = `M 0 ${yBase}`;

    for (let x = 0; x <= width; x += 24) {
      const y = yBase + Math.sin(x * freq + phase) * amplitude + Math.cos(x * freq * 0.42 + phase) * amplitude * 0.45;
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

const canvas = document.getElementById('flowCanvas');
const ctx = canvas.getContext('2d');
let w = 0;
let h = 0;
let time = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  canvas.width = w * ratio;
  canvas.height = h * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawFlow() {
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1;

  for (let i = 0; i < 46; i++) {
    const offset = i * 14;
    const alpha = 0.05 + i * 0.004;
    ctx.strokeStyle = `rgba(248,250,252,${Math.min(alpha, 0.18)})`;
    ctx.beginPath();

    for (let x = -40; x <= w + 40; x += 10) {
      const y = h * 0.2 + offset + Math.sin((x * 0.012) + time + i * 0.18) * (18 + i * 0.25) + Math.cos((x * 0.004) + i * 0.7 + time * 0.8) * 10;
      if (x === -40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
  }

  const grad = ctx.createRadialGradient(w * 0.30, h * 0.34, 0, w * 0.30, h * 0.34, 180);
  grad.addColorStop(0, 'rgba(59,130,246,0.18)');
  grad.addColorStop(1, 'rgba(59,130,246,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  time += 0.008;
  requestAnimationFrame(drawFlow);
}

resizeCanvas();
drawFlow();
window.addEventListener('resize', resizeCanvas);

document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const copyEmailButton = document.getElementById('copyEmailButton');
const copyToast = document.getElementById('copyToast');
let copyToastTimeout = null;

function showCopyToast() {
  if (!copyToast) return;

  copyToast.classList.add('is-visible');
  if (copyToastTimeout) {
    clearTimeout(copyToastTimeout);
  }

  copyToastTimeout = setTimeout(() => {
    copyToast.classList.remove('is-visible');
  }, 1800);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fall through to the legacy copy path below.
    }
  }

  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  tempInput.setAttribute('readonly', '');
  tempInput.style.position = 'absolute';
  tempInput.style.left = '-9999px';
  document.body.appendChild(tempInput);
  tempInput.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(tempInput);
  return copied;
}

if (copyEmailButton) {
  copyEmailButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = copyEmailButton.getAttribute('data-copy-email');
    if (!email) return;

    try {
      const copied = await copyTextToClipboard(email);
      if (copied) {
        showCopyToast();
        return;
      }

      window.location.href = copyEmailButton.href;
    } catch (error) {
      window.location.href = copyEmailButton.href;
    }
  });
}
