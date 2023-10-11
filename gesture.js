let inc = 0.05;

class Gesture {
    //colorIndex, agitatedness, speed, size, sprite, base, x, y, points
  constructor(colorVar, colorIndex, x, y, base, skin, points) {
    this.seed = random(1000);
    this.points = [...points];
    this.color = colorVar;
    this.colorIndex = colorIndex;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = p5.Vector.fromAngle(random(TWO_PI), 2);
    this.size = random(0.5, 1);
    this.maxSpeed = 10;
    this.wiggle = 10;
    this.smoothness = 1;
    this.scl = 50;

    this.base = base
    this.skin = skin

    this.normalizePoints();
    let maxX = Math.max(...this.points.map((p) => p.x));
    let maxY = Math.max(...this.points.map((p) => p.y));
    let minX = Math.min(...this.points.map((p) => p.x));
    let minY = Math.min(...this.points.map((p) => p.y));

    this.gestWidth = maxX - minX;
    this.gestHeight = maxY - minY;
  }

  addPoint(x, y) {
    let newPoint = createVector(x, y);
    this.points.push(newPoint);
  }

  update(time) {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  drawSprites(time) {
    let baseSize = 30*this.size;
    let skinSize = 15*this.size;
    push();
      translate(this.pos.x, this.pos.y);
      for(let p of this.points) {

        let offsetX = noise(this.seed + time + p.x) * this.wiggle;
        let offsetY = noise(this.seed + time + p.y) * this.wiggle;

        image(base_sprites[this.base][this.colorIndex], p.x - this.gestWidth/4 + offsetX, p.y - this.gestHeight/4 + offsetY, baseSize, baseSize);
        image(skin_sprites[this.skin][this.colorIndex], p.x - this.gestWidth/4 + offsetX, p.y - this.gestHeight/4 + offsetY, skinSize, skinSize);
      }
    pop();
  }

    boundingCheck() {
      // gets the value of the mask pixel at the head of the gesture
      let brightnes = brightness(mask.get(this.pos.x, this.pos.y));
      if (brightnes < 50) {
        this.vel.mult(-1);
        this.acc.mult(-1);
      }
    }

  normalizePoints() {
    for (let i = 1; i < this.points.length; i++) {
      this.points[i].x -= this.points[0].x;
      this.points[i].y -= this.points[0].y;
      this.points[i].x = this.points[i].x * 0.5;
      this.points[i].y = this.points[i].y * 0.5;
    }
    this.points[0].x = 0;
    this.points[0].y = 0;
  }

  drawNormalPoints(time) {
    stroke(this.color);
    strokeWeight(this.size * 10);
    noFill();
    push();
      translate(this.pos.x, this.pos.y);
      beginShape();
      for(let p of this.points) {
        let offsetX = noise(this.seed + time + p.x) * this.wiggle;
        let offsetY = noise(this.seed + time + p.y) * this.wiggle;

        vertex(p.x - this.gestWidth/4 + offsetX, p.y - this.gestHeight/4 + offsetY);
      }
      endShape();
    pop();
  }
}
