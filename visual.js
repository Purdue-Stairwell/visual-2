const socket = io("wss://navinate.com", { secure: true });
console.log("connected to websocket");

const caps = ["ROUND", "SQUARE", "PROJECT"];
const joins = ["MITER", "BEVEL", "ROUND"];
let gests = [];
let t = 0;


// arrays of sprites
let base_sprites = [];
let skin_sprites = [];

// arrays of sprite names
names = [ "bread", "drops", "rombo", "star", "swirl" ];
base_names = ["circle", "cloud", "cube", "heart", "spiky" ];

// collision mask
let mask;

// stars
let star_x = [],
	star_y = [],
	stars_made = false
    names = ["bread", "drops", "rombo", "star", "swirl"];


    // preload images
function preload() {
	for (let i = 0; i < names.length; i++) {
		let gifs = new Array();
		let base_gifs = new Array();

		for (let j = 0; j < 5; j++) {
			gifs[j] = loadImage("./assets/sprites/skin/" + names[i] + "/" + j + ".gif");
			gifs[j] = loadImage("./assets/sprites/base/" + base_names[i] + "/" + j + ".gif");
		}
		base_sprites.push(gifs);
		skin_sprites.push(base_gifs);
	}

	mask = loadImage("./assets/LEDmask.png");
}

function setup() {
	createCanvas(mask.width, mask.height);
	frameRate(24);
}
function draw() {
    space(width, height, 200, 2);

	push();
        //scale(0.5);
        translate(width / 2, height / 2);
        gests.forEach((g) => {
            g.update(t);
            g.drawBezier(t);
        });
	pop();

	t += 0.0005;
}

socket.on("server to gesture", (points, red, green, blue, alpha, girth, cap, join, speed, wiggle, smoothness) => {
	console.log("recieved data");
	if (gests.length > 20) {
		gests.shift();
	}
	gests.push(
		//seed, colorVar, girth, cap, join, x, y, speed, wiggle, smoothness
		new Gesture(
			random(99999),
			color(red, green, blue, alpha),
			girth,
			cap,
			join,
			random(-width / 3, width / 3),
			random(-height / 3, height / 3),
			speed,
			wiggle,
			smoothness
		)
	);
	gests[gests.length - 1].points = [...points];
});

document.addEventListener("click", () => {
	if (gests.length > 20) {
		gests.shift();
	}
	gests.push(
		new Gesture(
			//seed, hue, girth, cap, join, x, y, speed, wiggle, smoothness
			random(99999), // seed
			color(200, 10, 89, 128), // hue
			random(120) + 20, // girth
			random(caps), // cap
			random(joins), // join
			random(-width / 3, width / 3), // x
			random(-height / 3, height / 3), // y
			random(1, 5), // speed
			random(10, 400), //wiggle
			random(1, 10) //smoothness
		)
	);
	gests[gests.length - 1].addPoint(-10, 10);
	gests[gests.length - 1].addPoint(10, 10);
	gests[gests.length - 1].addPoint(20, 20);
	gests[gests.length - 1].addPoint(30, 30);
	gests[gests.length - 1].addPoint(100, -100);
	gests[gests.length - 1].addPoint(-100, 100);
});

// draw space background
function space(w, h, star_count, star_size) {
	noStroke();
	fill(0);
	rectMode(CORNERS);
	rect(0, 0, w, h);

	if (stars_made == false) {
		for (let i = 0; i <= star_count - 1; i++) {
			star_x[i] = Math.floor(Math.random() * w);
			star_y[i] = Math.floor(Math.random() * h);
			stars_made = true;
		}
	}

	for (let i = 0; i <= star_count - 1; i++) {
		fill(255);
		circle(star_x[i], star_y[i], star_size);
		star_y[i] += 0.1;
		if (Math.floor(Math.random() * 15) % 15 == 0) {
			star_x[i] += (Math.floor(Math.random() * 3) - 1);
		}
		if (star_x[i] >= w || star_y[i] >= h) {
			star_x[i] = Math.floor(Math.random() * w);
			star_y[i] = Math.floor(Math.random() * h);
		}
	}
}
