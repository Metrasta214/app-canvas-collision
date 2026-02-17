const canvas = document.getElementById("canvasA");
const ctx = canvas.getContext("2d");

// --- Resize correcto ---
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas();

window.addEventListener("resize", () => {
  resizeCanvas();
});

// Dimensiones del canvas (se actualizan en cada frame)
let window_width = canvas.width;
let window_height = canvas.height;

// ====== FUNCIÓN DE COLISIÓN ENTRE 2 CÍRCULOS ======
function circlesCollide(c1, c2) {
  const dx = c1.posX - c2.posX;
  const dy = c1.posY - c2.posY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= (c1.radius + c2.radius);
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

let miCirculo = new Circle(90, 90, 35, "blue", "1", 2.5);
let miCirculo2 = new Circle(220, 140, 45, "blue", "2", 2.5);

function loop() {
  requestAnimationFrame(loop);

  // actualizar dimensiones por si cambió el tamaño del card
  window_width = canvas.width;
  window_height = canvas.height;

  ctx.clearRect(0, 0, window_width, window_height);

  miCirculo.color = miCirculo.baseColor;
  miCirculo2.color = miCirculo2.baseColor;

  if (circlesCollide(miCirculo, miCirculo2)) {
    miCirculo.color = "red";
    miCirculo2.color = "red";
  }

  miCirculo.update(ctx);
  miCirculo2.update(ctx);
}

loop();
