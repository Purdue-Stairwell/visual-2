let inc = 0.05;

class Gesture {
    //         color    colorIndex  x  y  skin,  base, points
  constructor(colorVar, colorIndex, x, y, skin,  base, points) {
    this.seed = random(1000);
    this.points = [...points];
    this.color = colorVar;
    this.colorIndex = colorIndex;
    this.vel = p5.Vector.fromAngle(random(TWO_PI), 2)
    this.size = random(0.5, 1);
    this.maxSpeed = 10;
    this.wiggle = 5;
    this.smoothness = 1;
    this.scl = 50;

    this.skin = skin;
    this.base = base;

    this.baseSize = 30*this.size;
    this.skinSize = 20*this.size;

    this.normalizePoints();
    let xPoints = this.points.map((p) => p.x)
    let yPoints = this.points.map((p) => p.y)
    let maxX = Math.max(...xPoints);
    let maxY = Math.max(...yPoints);
    let minX = Math.min(...xPoints);
    let minY = Math.min(...yPoints);

    this.gestWidth = maxX - minX;
    this.gestHeight = maxY - minY;

    this.pos = createVector(x, y);
  }

/*   addPoint(x, y) {
    let newPoint = createVector(x, y);
    this.points.push(newPoint);
  } */

  update() {
    this.pos.add(this.vel);
  }

  drawSprites(time) {
    for(let i = 0; i < this.points.length; i+=4) {

      let offsetX = noise(this.seed + time + this.points[i].x) * this.wiggle;
      let offsetY = noise(this.seed + time + this.points[i].y) * this.wiggle;
      image(base_sprites[this.base][this.colorIndex],
        this.pos.x + this.points[i].x + offsetX,
        this.pos.y + this.points[i].y + offsetY,
        this.baseSize, this.baseSize);
      image(skin_sprites[this.skin][this.colorIndex],
        this.pos.x + this.points[i].x + offsetX,
        this.pos.y + this.points[i].y + offsetY,
        this.skinSize, this.skinSize);
    }
  }

    boundingCheck() {
      // gets the value of the mask pixel at the head of the gesture
      let brightnes = brightness(mask.get(this.pos.x, this.pos.y));
      if (brightnes < 50) {
        this.vel.mult(-1);
      }
    }

  normalizePoints() {
    if(this.points.length > 0) {
      for (let i = 1; i < this.points.length; i++) {
        this.points[i].x -= this.points[0].x;
        this.points[i].y -= this.points[0].y;
        this.points[i].x = this.points[i].x * 0.5;
        this.points[i].y = this.points[i].y * 0.5;
      }
      this.points[0].x = 0;
      this.points[0].y = 0;
    }
  }

  drawNormalPoints(time) {
    stroke(this.color);
    strokeWeight(this.size * 10);
    noFill();
    beginShape();
    for(let p of this.points) {
      let offsetX = noise(this.seed + time + p.x) * this.wiggle;
      let offsetY = noise(this.seed + time + p.y) * this.wiggle;

      vertex(this.pos.x + p.x + offsetX, this.pos.y + p.y + offsetY);
    }
    endShape();
  }
}
