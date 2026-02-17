const canvas = document.getElementById("canvasB");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas();

window.addEventListener("resize", () => {
  resizeCanvas();
});

let window_width = canvas.width;
let window_height = canvas.height;

function circlesCollide(c1, c2) {
  const dx = c1.posX - c2.posX;
  const dy = c1.posY - c2.posY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= (c1.radius + c2.radius);
}

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

class Circle {
  constructor(x, y, radius, color, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;

    this.baseColor = color;
    this.color = color;
    this.text = text;
    this.speed = speed;

    const dirX = Math.random() < 0.5 ? -1 : 1;
    const dirY = Math.random() < 0.5 ? -1 : 1;
    this.dx = dirX * this.speed;
    this.dy = dirY * this.speed;
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

  update(context) {
    this.draw(context);

    if (this.posX + this.radius > window_width) this.dx = -this.dx;
    if (this.posX - this.radius < 0) this.dx = -this.dx;
    if (this.posY - this.radius < 0) this.dy = -this.dy;
    if (this.posY + this.radius > window_height) this.dy = -this.dy;

    this.posX += this.dx;
    this.posY += this.dy;
  }
}

const N = 10;
const circles = [];

function spawnCircle(i, tries = 200) {
  const radius = randInt(16, 40);
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

  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      if (circlesCollide(circles[i], circles[j])) {
        circles[i].color = "red";
        circles[j].color = "red";
      }
    }
  }

  for (const c of circles) c.update(ctx);
}

loop();
