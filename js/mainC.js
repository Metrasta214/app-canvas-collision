const canvas = document.getElementById("canvasC");
const ctx = canvas.getContext("2d");

const countEl = document.getElementById("countC");
const tableBody = document.getElementById("tableC");

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let window_width = canvas.width;
let window_height = canvas.height;

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function timeNow() { return new Date().toLocaleTimeString(); }

let collisionsCount = 0;
const prevPairState = new Map();

function pairKey(a, b) {
  const i = Math.min(a, b);
  const j = Math.max(a, b);
  return `${i}-${j}`;
}

function logCollision() {
  collisionsCount++;
  countEl.textContent = String(collisionsCount);

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${collisionsCount}</td>
    <td>${timeNow()}</td>
  `;
  tableBody.prepend(tr);
}


function circlesCollide(c1, c2) {
  const dx = c1.posX - c2.posX;
  const dy = c1.posY - c2.posY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist <= (c1.radius + c2.radius);
}

class Circle {
  constructor(x, y, radius, color, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;

    this.baseColor = color;
    this.color = color;
    this.text = text;

    const dirX = Math.random() < 0.5 ? -1 : 1;
    const dirY = Math.random() < 0.5 ? -1 : 1;
    this.dx = dirX * speed;
    this.dy = dirY * speed;
  }

  draw(context) {
    context.beginPath();
    context.strokeStyle = this.color;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "16px Arial";
    context.fillText(this.text, this.posX, this.posY);

    context.lineWidth = 2;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
    context.stroke();
    context.closePath();
  }

  moveAndBounceWalls() {
    if (this.posX + this.radius > window_width) {
      this.posX = window_width - this.radius;
      this.dx = -this.dx;
    }
    if (this.posX - this.radius < 0) {
      this.posX = this.radius;
      this.dx = -this.dx;
    }
    if (this.posY + this.radius > window_height) {
      this.posY = window_height - this.radius;
      this.dy = -this.dy;
    }
    if (this.posY - this.radius < 0) {
      this.posY = this.radius;
      this.dy = -this.dy;
    }

    this.posX += this.dx;
    this.posY += this.dy;
  }

  update(context) {
    this.draw(context);
  }
}

function resolveCircleCollision(a, b) {
  let dx = b.posX - a.posX;
  let dy = b.posY - a.posY;

  let dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = a.radius + b.radius;

  if (dist === 0) { dist = 0.001; dx = 0.001; dy = 0; }
  if (dist >= minDist) return false;

  const nx = dx / dist;
  const ny = dy / dist;

  const overlap = minDist - dist;

  a.posX -= nx * (overlap / 2);
  a.posY -= ny * (overlap / 2);
  b.posX += nx * (overlap / 2);
  b.posY += ny * (overlap / 2);

  const rvx = b.dx - a.dx;
  const rvy = b.dy - a.dy;
  const velAlongNormal = rvx * nx + rvy * ny;

  if (velAlongNormal > 0) return true;

  const e = 1;
  const j = -(1 + e) * velAlongNormal / 2;

  const impulseX = j * nx;
  const impulseY = j * ny;

  a.dx -= impulseX;
  a.dy -= impulseY;
  b.dx += impulseX;
  b.dy += impulseY;

  return true;
}

const N = 10;
const circles = [];

function spawnCircle(i, tries = 200) {
  const radius = randInt(16, 38);
  const x = rand(radius, window_width - radius);
  const y = rand(radius, window_height - radius);
  const speed = randInt(1, 3);

  const c = new Circle(x, y, radius, "blue", String(i + 1), speed);

  for (let t = 0; t < tries; t++) {
    let overlaps = false;
    for (const other of circles) {
      if (circlesCollide(c, other)) { overlaps = true; break; }
    }
    if (!overlaps) return c;

    c.posX = rand(radius, window_width - radius);
    c.posY = rand(radius, window_height - radius);
  }
  return c;
}

for (let i = 0; i < N; i++) circles.push(spawnCircle(i));

function loop() {
  requestAnimationFrame(loop);

  window_width = canvas.width;
  window_height = canvas.height;

  ctx.clearRect(0, 0, window_width, window_height);

  for (const c of circles) c.color = c.baseColor;

  // mover primero
  for (const c of circles) c.moveAndBounceWalls();

  // colisiones + registro (inicio) + rebote
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      const a = circles[i];
      const b = circles[j];

      const collidingNow = circlesCollide(a, b);

      const key = pairKey(Number(a.text), Number(b.text));
      const was = prevPairState.get(key) === true;

      if (collidingNow) {
        // color
        a.color = "red";
        b.color = "red";

        // registrar SOLO al inicio
        if (!was) logCollision(`${a.text} ↔ ${b.text}`);

        // rebote real (separación + impulso)
        resolveCircleCollision(a, b);
      }

      prevPairState.set(key, collidingNow);
    }
  }

  // dibujar
  for (const c of circles) c.update(ctx);
}

loop();
