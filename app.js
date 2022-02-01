// load assets
let loadingAssets = true;
let assets = [];
let videoWishes = [];
let whistle = new Audio("https://rashadaziz.github.io/shafa20bday/assets/audio/firework_whistle.mp3");
let kaboom = new Audio("https://rashadaziz.github.io/shafa20bday/assets/audio/firework_explode.mp3");
let fire = new Audio("https://rashadaziz.github.io/shafa20bday/assets/audio/firework_launch.mp3");
let hbd = new Audio("https://rashadaziz.github.io/shafa20bday/assets/audio/Opening.mp3");
// DUMMY TROLL PAGE
let trollButton = document.querySelector(".troll-button");

trollButton.addEventListener("click", (e) => {
  let text = document.createElement("h2");
  text.innerText = "We wish you all the best! bye bye";
  trollButton.replaceWith(text);
  setTimeout(() => {
    let justKidding = document.createElement("h1");
    justKidding.classList.add("just-kidding");
    justKidding.innerText = "JUST KIDDING";
    document.body.appendChild(justKidding);
    setTimeout(() => {
      init();
    }, 1000); // just kidding text duration
  }, 5000); // just kidding popup delay duration
});

/**
 * START OF CANVAS MANIPULATION
 */

// global variables
let fadeIn;
let canvas;
let ctx;
let inFireworkPage = false,
  inCloudPage = false,
  inCakePage = false,
  inGiftPage = false,
  inCarPage = false,
  inEndPage = false;
let fireworkAnimationController,
  planeAnimationController,
  cakeAnimationController,
  giftAnimationController,
  carAnimationController,
  endAnimationController;

let cake;
let car;

let inTransition = false;

const gravity = 0.03;
const friction = 0.99;
let fireworks = [];
let fireworkShow;
let mouse = {
  x: null,
  y: null,
  radius: 2,
};

document.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

// will be called after dummy troll

function init() {
  // fade in pink background and display animated text when opacity is 1
  document.body.style.backgroundColor = "rgba(255, 94, 218, 0)";
  fadeIn = setInterval(() => {
    let color = document.body.style.backgroundColor;
    let opacity = Number(
      color.substring(color.lastIndexOf(",") + 1, color.length - 1)
    );
    if (opacity < 1) {
      document.body.style.backgroundColor = `rgba(255, 94, 218, ${
        opacity + 0.05
      })`;
    } else {
      clearInterval(fadeIn);
      hbd.volume = 0.1;
      hbd.play();
      fadeIn = setInterval(() => {
        // reuse fadeIn variable to fade out song
        if (hbd.currentTime >= hbd.duration - 1 && hbd.volume !== 0.0) {
          hbd.volume = Number(hbd.volume.toPrecision(1)) - 0.01;
        }
        let animatedText = document.querySelector("#animatedText");
        if (hbd.currentTime > 4 && animatedText !== null) {
          animatedText.style.animation = "fade-out 800ms forwards";
          setTimeout(() => {
            animatedText.remove();
          }, 800);
        }
        if (hbd.volume === 0.0) {
          clearInterval(fadeIn);
        }
      }, 50);
      let svgText = document.querySelector("#animatedText");
      svgText.style.display = "block";
      svgText.style.position = "absolute";
      svgText.style.left = "50%";
      svgText.style.top = "50%";
      svgText.style.transform = "translate(-50%,-50%)";
      let paths = Array.from(svgText.children);
      paths.forEach((path, i) => {
        // animate Happy Birthday To You text
        path.style.strokeDashoffset = path.getTotalLength();
        path.style.strokeDasharray = path.getTotalLength();
        path.style.animation = `svg-animation 2s forwards ${i * 0.1}s`;
      });
    }
  }, 50);
  Array.from(document.body.children).forEach((e) => {
    if (e.nodeName !== "svg" && e.nodeName !== "SCRIPT" && e.nodeName !== "IFRAME") {
      e.remove();
    } // cleanup html document for start of canvas manipulation
  });
  document.body.prepend(document.createElement("canvas"));
  canvas = document.querySelector("canvas");
  ctx = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  addEventListener("resize", (e) => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  });
  inTransition = true;
  document.querySelectorAll("iframe").forEach((frame, i)=> {
    frame.style.display = "block"
    frame.style.position = "absolute"
    frame.style.top = "30%"
    frame.style.left = `${innerWidth + 2400 * i}px`
  })
  commenceFireworkShow(15000)
}
// CAKE BLOWING PAGE
class Flame {
  constructor(x, y, vy, radius, durability) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vy = vy;
    this.durability = durability;
    this.smoke = false;
  }
  draw() {
    let radialGradient = ctx.createRadialGradient(
      this.x,
      this.y,
      this.radius * 0.4,
      this.x,
      this.y,
      this.radius
    );
    // radialGradient.addColorStop(0, "white");
    // radialGradient.addColorStop(0, "yellow");
    if (this.smoke) {
      radialGradient.addColorStop(1, "grey");
    } else {
      radialGradient.addColorStop(1, "orange");
    }
    ctx.fillStyle = radialGradient;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
  update() {
    if (!this.touchedByMouse) {
      this.y -= this.vy;
      this.radius -= 0.3;
      this.durability -= 1;
      if (this.y < 0 || this.radius < 0) {
        this.y = innerHeight * 0.5 - 55;
        this.radius = 10 * Math.random();
      }
    }
  }
  touched() {
    let distance = Math.hypot(this.x - mouse.x, this.y - mouse.y);
    return distance < this.radius + mouse.radius;
  }
}
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

class CandleParticle {
  constructor(x, y, radius, vx, vy, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.opacity = 50;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
  update() {
    this.color =
      this.color.substring(0, this.color.lastIndexOf(",")) +
      `,${this.opacity}%)`;
    this.x += this.vx;
    this.y += this.vy;
    this.opacity += 1;
  }
}

class Cake {
  constructor(numberOfLayers) {
    this.numberOfLayers = numberOfLayers;
    this.candles = [];
    this.layers = [];
    this.candlesPlaced = false;
    this.setupLayers();
  }
  setupLayers() {
    let colors = [
      "#FF000D",
      "#FF7034",
      "#FFFD01",
      "#66FF00",
      "#0165FC",
      "#6F00FE",
      "#AD0AFD",
    ];
    for (let i = 0; i < this.numberOfLayers; i++) {
      let layerColor = colors[i % colors.length];
      let width = 500 - i * 50;
      let height = 100;
      this.layers.push({
        width: width,
        height: height,
        x: innerWidth * 0.5 - width * 0.5,
        y: 0 - (height + height * i), // innerHeight - (height - height * i)
        color: layerColor,
        velocity: 10 - 0.5 * i,
      });
    }
  }
  drawCake() {
    for (let layer of this.layers) {
      ctx.fillStyle = layer.color;
      roundRect(
        ctx,
        layer.x,
        layer.y,
        layer.width,
        layer.height,
        10,
        true,
        false
      );
    }
  }
  staggerFall() {
    let layersInPosition = 0;
    for (let i = 0; i < this.layers.length; i++) {
      let layer = this.layers[i];
      if (layer.y < innerHeight - (layer.height + layer.height * i)) {
        this.layers[i].y += layer.velocity;
      } else {
        this.layers[i].y = innerHeight - (layer.height + layer.height * i);
        layersInPosition++;
      }
    }
    if (layersInPosition === this.layers.length && !this.candlesPlaced) {
      this.candlesPlaced = true;
      let promptMessage = document.createElement("div");
      promptMessage.classList.add("prompt-message");
      let message = ["put out the candles", "make a wish", "use your cursor!"];
      for (let i = 0; i < message.length + 1; i++) {
        let span = document.createElement("span");
        span.innerText = message[i % message.length];
        promptMessage.appendChild(span);
      }
      document.body.appendChild(promptMessage);
      this.placeCandles();
    }
  }
  placeCandles() {
    this.candles = [];
    let particlesFirstCandle = [];
    let particlesSecondCandle = [];
    let particleCount = 25;
    const power = 5;
    let radians = (Math.PI * 2) / particleCount;
    for (let i = 0; i < particleCount; i++) {
      let widthOfTopLayer = this.layers[this.layers.length - 1].width;
      let heightOfTopLayer = this.layers[this.layers.length - 1].height;
      particlesFirstCandle.push(
        new CandleParticle(
          innerWidth * 0.5 - widthOfTopLayer * 0.25,
          innerHeight -
            (this.layers.length * heightOfTopLayer + heightOfTopLayer * 0.5),
          3,
          Math.cos(radians * i) * Math.random() * power,
          Math.sin(radians * i) * Math.random() * power,
          `hsl(${Math.random() * 360}, 50%, 50%)`
        )
      );
    }
    for (let i = 0; i < particleCount; i++) {
      let widthOfTopLayer = this.layers[this.layers.length - 1].width;
      let heightOfTopLayer = this.layers[this.layers.length - 1].height;
      particlesSecondCandle.push(
        new CandleParticle(
          innerWidth * 0.5 + widthOfTopLayer * 0.25,
          innerHeight -
            (this.layers.length * heightOfTopLayer + heightOfTopLayer * 0.5),
          3,
          Math.cos(radians * i) * Math.random() * power,
          Math.sin(radians * i) * Math.random() * power,
          `hsl(${Math.random() * 360}, 50%, 50%)`
        )
      );
    }
    this.candles.push({
      path: new Path2D(
        "M1.46637 213.544C7.99437 208.36 10.9704 205.96 10.3944 206.344C29.2104 190.792 43.9944 178.024 54.7464 168.04C65.6904 158.056 74.9064 147.592 82.3944 136.648C89.8824 125.704 93.6264 115.048 93.6264 104.68C93.6264 96.808 91.8024 90.664 88.1544 86.248C84.5064 81.832 79.0344 79.624 71.7384 79.624C64.4424 79.624 58.6824 82.408 54.4584 87.976C50.4264 93.352 48.4104 101.032 48.4104 111.016H0.890381C1.27438 94.696 4.73038 81.064 11.2584 70.12C17.9784 59.176 26.7144 51.112 37.4664 45.928C48.4104 40.744 60.5064 38.152 73.7544 38.152C96.6024 38.152 113.786 44.008 125.306 55.72C137.018 67.432 142.874 82.696 142.874 101.512C142.874 122.056 135.866 141.16 121.85 158.824C107.834 176.296 89.9784 193.384 68.2824 210.088H146.042V250.12H1.46637V213.544Z"
      ),
      particles: particlesFirstCandle,
      lighted: false,
      dead: false,
      flames: [],
      smoke: [],
    });
    this.candles.push({
      path: new Path2D(
        "M20.1164 29.6717L20.1145 29.6746C7.36839 48.7938 1.02252 74.9191 1.02252 108C1.02252 141.463 7.36786 167.781 20.1145 186.901L20.1164 186.904C33.096 206.083 53.9134 215.636 82.4505 215.636C110.987 215.636 131.71 206.083 144.498 186.902C157.437 167.782 163.879 141.463 163.879 108C163.879 74.9195 157.437 48.7939 144.498 29.6745C131.711 10.4929 110.987 0.939972 82.4505 0.939972C53.9134 0.939972 33.096 10.493 20.1164 29.6717ZM108.194 63.5457L108.195 63.5486C112.383 73.8282 114.495 88.6323 114.495 108C114.495 121.038 113.727 131.854 112.199 140.455C110.676 148.829 107.541 155.652 102.814 160.947L102.813 160.948C98.3282 165.993 91.5732 168.556 82.4505 168.556C73.3333 168.556 66.4784 165.996 61.7998 160.947C57.2643 155.653 54.2254 148.83 52.7026 140.455C51.1737 131.855 50.4065 121.039 50.4065 108C50.4065 88.6323 52.5176 73.8282 56.7056 63.5486L56.7068 63.5457C58.7832 58.3545 61.9568 54.4852 66.2211 51.9079C70.4911 49.3271 75.8911 48.02 82.4505 48.02C89.01 48.02 94.4099 49.3271 98.6799 51.9079C102.944 54.4852 106.118 58.3545 108.194 63.5457Z"
      ),
      particles: particlesSecondCandle,
      lighted: false,
      dead: false,
      flames: [],
      smoke: [],
    });
  }
  light(index) {
    let widthOfTopLayer = this.layers[this.layers.length - 1].width;
    let heightOfTopLayer = this.layers[this.layers.length - 1].height;
    this.candles[index].lighted = true;
    for (let i = 0; i < 300; i++) {
      this.candles[index].flames.push(
        new Flame(
          index === 0
            ? rand(
                innerWidth * 0.5 - widthOfTopLayer * 0.25,
                innerWidth * 0.5 - widthOfTopLayer * 0.25 + 10
              )
            : rand(
                innerWidth * 0.5 + widthOfTopLayer * 0.25 - 5,
                innerWidth * 0.5 + widthOfTopLayer * 0.25 - 15
              ),
          innerHeight / 2 - heightOfTopLayer * 0.5,
          5 * Math.random(),
          10 * Math.random(),
          60 * Math.random()
        )
      );
    }
  }
}

function spawnCake() {
  resetAnimationContext();
  inCakePage = true;
  cake = new Cake(4);
  animate();
}

// FIREWORK PAGE
class FireworkParticle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = {
      x: velocity.x,
      y: velocity.y,
    };
    this.opacity = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.velocity.y += gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.opacity -= 0.003;
  }
}

class Fireworks {
  constructor(
    sx,
    sy,
    explosionSize,
    explosionPower,
    flightTime,
    velocity,
    launchAngle
  ) {
    this.particles = [];
    this.sx = sx;
    this.sy = sy;
    this.dx = this.sx;
    this.dy = this.sy;
    this.explosionSize = explosionSize;
    this.explosionPower = explosionPower;
    this.flightTime = flightTime;
    this.velocity = velocity;
    this.launchAngle = launchAngle;
    this.airTime = 0;
    this.hasExploded = false;
    this.whistle = whistle.cloneNode();
    this.fire = fire.cloneNode();
    this.kaboom = kaboom.cloneNode();
    this.whistle.volume = 0.1;
    this.fire.volume = 0.1;
    this.kaboom.volume = 0.1;
  }
  draw() {
    // draw function to setup firework launcher in sx and sy
    ctx.beginPath();
    ctx.arc(this.sx, this.sy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }
  launch() {
    // update function to send firework to dx and dy (with arc motion)
    if (this.airTime === 0) {
      // play just launched audio
      this.fire.play();
    } else {
      // play rocket flying audio
      if (this.fire.currentTime !== 0) {
        this.fire.pause();
        this.fire.currentTime = 0;
      }
      if (this.whistle.currentTime === 0) {
        this.whistle.play();
      }
    }
    if (this.airTime > this.flightTime && !this.hasExploded) {
      this.dx = this.sx;
      this.dy = this.sy;
      this.explode();
    } else {
      this.airTime += 0.05;
      const VX = this.velocity * Math.cos(this.launchAngle);
      const VY = this.velocity * Math.sin(this.launchAngle);
      this.sx += VX * this.airTime;
      this.sy += VY * this.airTime - 4.9 * this.airTime * this.airTime;
    }
  }
  explode() {
    // explode firework
    this.hasExploded = true;
    const particleCount = this.explosionSize;
    const power = this.explosionPower;
    let radians = (Math.PI * 2) / particleCount;

    if (Math.random() < 0.5) {
      for (let i = 0; i < particleCount; i++) {
        this.particles.push(
          new FireworkParticle(
            this.dx,
            this.dy,
            3,
            `hsl(${Math.random() * 360}, 50%, 50%)`,
            {
              x: Math.cos(radians * i) * (Math.random() * power),
              y: Math.sin(radians * i) * (Math.random() * power),
            }
          )
        );
      }
    } else {
      for (let i = 0; i < particleCount * 0.5; i++) {
        this.particles.push(
          new FireworkParticle(
            Math.cos(radians * i - 300) * 100 + this.dx,
            Math.sin(radians * i - 400) * 100 + this.dy,
            3,
            `pink`,
            {
              x: Math.cos(radians * i - 300) * (Math.random() * power * 0.2),
              y: Math.sin(radians * i - 400) * (Math.random() * power * 0.2),
            }
          )
        );
      }
      for (let i = 0; i < particleCount * 0.5; i++) {
        this.particles.push(
          new FireworkParticle(
            Math.cos(radians * i + 300) * 100 + this.dx,
            Math.sin(radians * i + 400) * 100 + this.dy,
            3,
            `pink`,
            {
              x: Math.cos(radians * i + 300) * (Math.random() * power * 0.2),
              y: Math.sin(radians * i + 400) * (Math.random() * power * 0.2),
            }
          )
        );
      }
    }
    this.kaboom.play();
  }
}

function commenceFireworkShow(duration) {
  resetAnimationContext();
  inFireworkPage = true;
  fireworks = [];

  fireworkShow = setInterval(() => {
    let startingPosition =
      Math.random() < 0.5
        ? { x: 0, y: innerHeight }
        : { x: innerWidth, y: innerHeight };
    let explosionSize = Math.floor(rand(300, 400));
    let explosionPower = rand(15, 30);
    let flightTime = rand(1.8, 2);
    let initialVelocity = rand(18, 20);
    let degrees =
      startingPosition.x === 0
        ? degreesConvert(rand(290, 350))
        : degreesConvert(rand(175, 235));
    fireworks.push(
      new Fireworks(
        startingPosition.x,
        startingPosition.y,
        explosionSize,
        explosionPower,
        flightTime,
        initialVelocity,
        degrees
      )
    );
  }, 750);

  setTimeout(() => {
    clearInterval(fireworkShow);
    fireworkShow = null;
  }, duration);
  animate();
}

// PLANE + CLOUD WRITING PAGE

function transitionToCarPage() {
  resetAnimationContext();
  inCarPage = true;
  animate();
}
// GIFT OPENING PAGE

// CAR DRIVING BIRTHDAY WISHES

const carBody = new Image()
carBody.src = "https://rashadaziz.github.io/shafa20bday/assets/images/Body.png"
const carWheel = new Image()
carWheel.src = "https://rashadaziz.github.io/shafa20bday/assets/images/Wheel.png"

const background = new Image();
background.src = "https://rashadaziz.github.io/shafa20bday/assets/images/birthday.png";
const BG = {
  x1: 0 ,
  x2: innerWidth,
  y: 0,
  width: innerWidth,
  height: innerHeight * 0.25,
};

function handleBackground() {
  if (BG.x1 <= -BG.width + car.velocity) BG.x1 = BG.width
  else BG.x1 -= car.velocity
  if (BG.x2 <= -BG.width + car.velocity) BG.x2 = BG.width
  else BG.x2 -= car.velocity
  ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height)
  ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height)
}

class Car {
  constructor(x, y) {
    this.width = 300;
    this.height = 200;
    this.x = x;
    this.y = y - this.height;
    this.velocity = 0;
    this.tireAngle = 0;
    this.controlBinded = false
  }
}

let road = {
  x: 0,
  y: innerHeight + 200,
  height: innerHeight * 0.2,
};

let opacity = 0.01;

// END PAGE idk what to put here yet

function animate() {
  // will have if (inCakePage) {...}, etc...
  if (inFireworkPage) {
    fireworkAnimationController = requestAnimationFrame(animate);
    //   ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach((f, i) => {
      if (!f.hasExploded) {
        f.draw();
        f.launch();
      } else {
        if (f.particles.length !== 0) {
          f.particles.forEach((particle, i) => {
            if (particle.opacity > 0) {
              particle.update();
            } else {
              setTimeout(() => {
                f.particles.splice(i, 1);
              }, 0);
            }
          });
        }
        if (f.particles.length === 0) {
          fireworks.splice(i, 1);
          if (!fireworkShow && fireworks.length === 0) {
            cancelAnimationFrame(fireworkAnimationController);
            inFireworkPage = false;
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            spawnCake();
          }
        }
      }
    });
  } else if (inCakePage) {
    cakeAnimationController = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    cake.staggerFall();
    cake.drawCake();
    if (cake.candles.length !== 0) {
      let candlesOut = 0;
      cake.candles.forEach((candle, i) => {
        ctx.save();
        ctx.translate(
          i === 0 ? innerWidth / 2 - 120 : innerWidth / 2 + 20,
          i === 0 ? innerHeight / 2 - 66 : innerHeight / 2 - 45
        );
        ctx.scale(0.6, 0.6);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 20;
        ctx.fillStyle = "red";
        ctx.stroke(candle.path);
        ctx.fill(candle.path);
        ctx.restore();
        if (!candle.lighted) {
          candle.lighted = true;
          cake.light(i);
        }
        candle.particles.forEach((particle, j) => {
          particle.draw();
          particle.update();
          if (particle.opacity >= 100) {
            setTimeout(() => {
              candle.particles.splice(j, 1);
            }, 0);
          }
        });
        if (candle.lighted) {
          candle.flames.forEach((f, k) => {
            f.draw();
            f.update();
            if (f.touched()) {
              setTimeout(() => {
                candle.flames.splice(k, 1);
              }, 0);
            }
          });
        }
        if (candle.lighted && candle.flames.length === 0) {
          candlesOut++;
          if (candlesOut === cake.candles.length) {
            cancelAnimationFrame(cakeAnimationController);
            document.querySelector(".prompt-message").remove();
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            inTransition = true;
            transitionToCarPage();
          }
        }
      });
    }

    //
  } else if (inCarPage) {
    if (opacity >= 1 && inTransition) {
      car = new Car(innerWidth * 0.25, 0);
      document.body.style.backgroundColor = `rgb(87, 206, 235)`;
      inTransition = false;
    }
    planeAnimationController = requestAnimationFrame(animate);
    if (inTransition) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.fillStyle = `rgba(87, 206, 235, ${(opacity += 0.01)})`;
      ctx.fillRect(0, 0, innerWidth, innerHeight);
    } else {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
      ctx.fillStyle = "blue";
      let angle = car.tireAngle
      if (car.y + car.height < innerHeight * 0.8) {
        
        ctx.drawImage(carBody, car.x - car.width, car.y, car.width, car.height - 50)
        ctx.save()
        ctx.translate(car.x - car.width + 70, car.y + car.height * 0.5 + 50)
        ctx.rotate(angle * Math.PI/180)
        ctx.drawImage(carWheel, -50, -50, 100, 100)
        ctx.restore()
        ctx.save()
        ctx.translate(car.x - car.width + 210, car.y + car.height * 0.5 + 50)
        ctx.rotate(angle * Math.PI/180)
        ctx.drawImage(carWheel, -50, -50, 100, 100)
        ctx.restore()
        car.y += 10;
      } else {
        
        ctx.drawImage(carBody, car.x - car.width, car.y, car.width, car.height - 50)
        
        ctx.save()
        ctx.translate(car.x - car.width + 70, car.y + car.height * 0.5 + 50)
        ctx.rotate(angle * Math.PI/180)
        ctx.drawImage(carWheel, -50, -50, 100, 100)
        ctx.restore()
        ctx.save()
        ctx.translate(car.x - car.width + 210, car.y + car.height * 0.5 + 50)
        ctx.rotate(angle * Math.PI/180)
        ctx.drawImage(carWheel, -50, -50, 100, 100)
        ctx.restore()

        ctx.fillStyle = "grey";

        if (road.y > innerHeight * 0.8) {
          ctx.fillRect(road.x, road.y, innerWidth, road.height);
          road.y -= 6;
        } else {
          if (!car.controlBinded) {
            let controlScheme = document.createElement("div")
            controlScheme.classList.add("controls")
            controlScheme.innerHTML = "<h1>hold &#8594; key to accelerate</h1><h1>hold &#8592; key to brake</h1>"
            document.body.appendChild(controlScheme)
            controlScheme.style.left = `${innerWidth * 0.7}px`
            car.controlBinded = true
            addEventListener("keydown", (e) => {
              if (e.key === "ArrowRight") {
                controlScheme.remove()
                if (car.velocity < 10) {
                car.velocity += 0.3
                }
                
              } else if (e.key === "ArrowLeft") {
                if (car.velocity > -10) {
                  car.velocity -= 0.3
                }
                else {
                  car.velocity = -10
                }
              }
            })
            addEventListener("keyup", (e) => {
              if (e.key === "ArrowLeft") {
                car.velocity = 0
              }
            })
          }
          car.tireAngle += car.velocity
          document.querySelectorAll("iframe").forEach(frame => {
            frame.style.left = `${parseFloat(frame.style.left) - car.velocity}px`
            if (parseFloat(frame.style.left) <= innerWidth - 560) {
              if (!frame.classList.contains("played")) {
                frame.classList.add("played")
                frame.src += "?autoplay=1";
              }
            }
          })
          handleBackground()
          ctx.fillRect(road.x, road.y, innerWidth, road.height);
        }
      }
    }
    //
  }
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function degreesConvert(theta) {
  return theta * (Math.PI / 180);
}

function resetAnimationContext() {
  inFireworkPage = false;
  inCakePage = false;
  inCloudPage = false;
  inGiftPage = false;
  inCarPage = false;
  inEndPage = false;
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === "undefined") {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
