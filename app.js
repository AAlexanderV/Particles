const SPEED = 1;
const GRAV_FACTOR = 0;
const MASS_FACTOR = 0.2;
const REP_FACTOR = 220;
const TWO_PI = Math.PI * 2;
const DEF_PARTICLES_NUMBER = 600;
const DEF_RAD = 5;
const FRICTION = 0.97;

let W, H, particles, mouseIsDown, mouseX, mouseY;

const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");

canvas.addEventListener("mousemove", setMousePos);
window.addEventListener("mousedown", setMouseDown);
window.addEventListener("mouseup", setMouseDown);

class Particle {
  constructor(x, y, rad = randomInRange(10, 5)) {
    this.pos = { x, y };
    this.vel = { x: randomInRange(8, -8), y: randomInRange(8, -8) };
    this.rad = rad;
    // this.mass = this.rad ** 2 * MASS_FACTOR;
    this.mass = 1.5;

    // this.color = "rgb(10, 100, 250)";
  }

  draw() {
    // this.pos.x = Math.max(DEF_RAD, Math.min(this.pos.x + this.vel.x, W - DEF_RAD));
    // this.pos.y = Math.max(DEF_RAD, Math.min(this.pos.y + this.vel.y, H - DEF_RAD));

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // ctx.fillStyle = ctx.strokeStyle = this.color;
    ctx.fillStyle = ctx.strokeStyle = this.getColor();

    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.rad, 0, TWO_PI);
    ctx.closePath();
    ctx.fill();
  }

  getColor() {
    const V = (this.vel.x ** 2 + this.vel.y ** 2) * 16;

    // return `rgb(${Math.min(255, V)}, ${Math.max(0, 250 - V)}, ${Math.max(0, 255 - V)})`;
    return `rgb(0, ${Math.max(100, 255 - V / 2)}, ${Math.max(100, 255 - V)})`;
  }

  // move() {
  //   this.pos.x += this.vel.x;
  //   this.pos.y += this.vel.y;
  // }
}

function randomInRange(max, min = 0) {
  return Math.round(Math.random() * (max - min) + min);
}

function setMouseDown({ layerX, layerY }) {
  mouseIsDown = !mouseIsDown;
  setMousePos({ layerX, layerY });
}

function setMousePos({ layerX, layerY }) {
  if (mouseIsDown) {
    mouseX = layerX;
    mouseY = layerY;
  }
}

function addParticle(e) {
  particles.push(new Particle(e.layerX, e.layerY, randomInRange(30, 5)));
}

function init(particlesNumber = DEF_PARTICLES_NUMBER) {
  W = canvas.width = window.innerWidth - 20;
  H = canvas.height = window.innerHeight - 20;
  particles = [];
  mouseIsDown = false;

  console.log("W: ", W);
  console.log("H: ", H);

  for (let i = 0; i < particlesNumber; i++) {
    // particles.push(new Particle(randomInRange(W), randomInRange(H)));
    particles.push(new Particle(randomInRange(W), randomInRange(H), DEF_RAD));
  }
}

function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    const currParticle = particles[i];
    const acc = { x: 0, y: 0 };

    for (let k = 0; k < particles.length; k++) {
      if (i === k) {
        continue;
      }
      const a = currParticle;
      const b = particles[k];

      const delta = { x: b.pos.x - a.pos.x, y: b.pos.y - a.pos.y };
      const dist = Math.sqrt(delta.x ** 2 + delta.y ** 2);

      // если столкнулся с частичкой
      if (dist <= DEF_RAD * 1.5) {
        [a.vel, b.vel] = [b.vel, a.vel];
        continue;
      }

      // общее притяжение
      let attraction = b.mass / (dist ** 2 + 1);

      // repulsion
      let repulsion = REP_FACTOR / (dist ** 3 + 1);

      // если слишком близко к частичке
      if (dist <= DEF_RAD * 2) {
        repulsion * (50 / dist);
      }

      const forceX = delta.x * (attraction - repulsion);
      const forceY = delta.y * (attraction - repulsion);

      acc.x += forceX;
      acc.y += forceY;
    }

    // если mouseIsDown
    if (mouseIsDown) {
      const delta = { x: mouseX - currParticle.pos.x, y: mouseY - currParticle.pos.y };
      const dist = Math.sqrt(delta.x ** 2 + delta.y ** 2);

      let repulsion = (REP_FACTOR / (dist ** 2 + 1)) * -2;

      const forceX = delta.x * repulsion;
      const forceY = delta.y * repulsion;

      acc.x += forceX;
      acc.y += forceY;
    }

    // если ударил стенку
    if (currParticle.pos.x >= W - DEF_RAD * 2 || currParticle.pos.x <= DEF_RAD * 2) {
      currParticle.vel.x *= -1;
    }
    // если ударил пол-потолок
    if (currParticle.pos.y >= H - DEF_RAD * 1.5 || currParticle.pos.y <= DEF_RAD * 1.5) {
      currParticle.vel.y *= -1;
    }

    // floor repulsion
    const distToFloor = H - currParticle.pos.y - DEF_RAD;
    // let repulsion = REP_FACTOR / (distToFloor + 1);
    // const forceY = distToFloor * repulsion;
    // acc.y += forceY;
    // floor repulsion

    currParticle.vel.x =
      currParticle.vel.x * FRICTION + (acc.x / currParticle.mass ** 2) * FRICTION;

    currParticle.vel.y =
      currParticle.vel.y * FRICTION + (acc.y / currParticle.mass ** 2) * FRICTION;
    // +      (distToFloor > DEF_RAD ? GRAV_FACTOR : 0) +
    // (distToFloor <= 0 ? -GRAV_FACTOR : 0);

    // currParticle.vel.x =
    //   currParticle.vel.x * FRICTION + (acc.x / currParticle.mass ** 2) * FRICTION;

    // currParticle.vel.y =
    //   currParticle.vel.y * FRICTION + (acc.y / currParticle.mass ** 2) * FRICTION;
  }

  //
  // if (SPEED > 1) {
  //   for (let i = 0; i < particles.length; i++) {
  //     particles[i].move();
  //   }
  // }
}

function renderLoop() {
  ctx.clearRect(0, 0, W, H);

  // for (let i = 0; i < SPEED; i++) {
  updateParticles();
  // }

  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
  }

  window.requestAnimationFrame(renderLoop);
}

//

init();

// setTimeout(() => {
renderLoop();
// }, 2500);

setTimeout(() => {
  console.log(particles);
}, 3000);
