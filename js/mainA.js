const canvas = document.getElementById("canvasA");
const ctx = canvas.getContext("2d");

const countEl = document.getElementById("countA");
const tableBody = document.getElementById("tableA");

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let window_width = canvas.width;
let window_height = canvas.height;

function circlesCollide(c1, c2) {
  const dx = c1.posX - c2.posX;
  const dy = c1.posY - c2.posY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= (c1.radius + c2.radius);
}

function timeNow() {
  return new Date().toLocaleTimeString();
}

let collisionsCount = 0;
let wasColliding = false;

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


class Circle {
  constructor(x, y, radius, color, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;
    this.baseColor = color;
    this.color = color;
    this.text = text;
    this.speed = speed;
    this.dx = 1 * this.speed;
    this.dy = 1 * this.speed;
  }

  draw(context) {
    context.beginPath();
    context.strokeStyle = this.color;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "18px Arial";
    context.fillText(this.text, this.posX, this.posY);

    context.lineWidth = 2;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
    context.stroke();
    context.closePath();
  }

  update(context) {
    this.draw(context);

    if ((this.posX + this.radius) > window_width) this.dx = -this.dx;
    if ((this.posX - this.radius) < 0) this.dx = -this.dx;
    if ((this.posY - this.radius) < 0) this.dy = -this.dy;
    if ((this.posY + this.radius) > window_height) this.dy = -this.dy;

    this.posX += this.dx;
    this.posY += this.dy;
  }
}

let c1 = new Circle(90, 90, 35, "blue", "1", 2.5);
let c2 = new Circle(220, 140, 45, "blue", "2", 2.5);

function loop() {
  requestAnimationFrame(loop);

  window_width = canvas.width;
  window_height = canvas.height;

  ctx.clearRect(0, 0, window_width, window_height);

  c1.color = c1.baseColor;
  c2.color = c2.baseColor;

  const colliding = circlesCollide(c1, c2);

  if (colliding) {
    c1.color = "red";
    c2.color = "red";
  }

  // registrar SOLO cuando empieza la colisión
  if (colliding && !wasColliding) {
    logCollision("1 ↔ 2");
  }
  wasColliding = colliding;

  c1.update(ctx);
  c2.update(ctx);
}

loop();
