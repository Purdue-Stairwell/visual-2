import Gesture from "./gesture.js";
import { io } from "socket.io-client";

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
let star_x = [];
let star_y = [];
let stars_made = false;

//spawn stuff
let playcount = -1;
let spawn_pos;

    // preload images
function preload() {
	for (let i = 0; i < names.length; i++) {
		let gifs = new Array();
		let base_gifs = new Array();

		for (let j = 0; j < 5; j++) {
			gifs[j] = loadImage("./assets/sprites/skin/" + names[i] + "/" + j + ".gif");
			base_gifs[j] = loadImage("./assets/sprites/base/" + base_names[i] + "/" + j + ".gif");
		}
		base_sprites.push(gifs);
		skin_sprites.push(base_gifs);
	}
	spawn_gif = loadImage("./assets/sprites/spawn.gif");
	mask = loadImage("./assets/LEDmask.png");
}

function setup() {
	createCanvas(mask.width, mask.height);
	frameRate(24);
	spawn_pos = createVector(width/2, height/2);
}
function draw() {
    space(width, height, 200, 2);
    imageMode(CENTER);
    //image(mask, width/2, height/2, width, height);
	gests.forEach((g) => {
		g.update(t);
		g.drawNormalPoints(t);
		g.drawSprites(t);
		g.boundingCheck();
	});
	
	spawn(0.8, 5, 10);

	t += 0.1;
}

socket.on("backend to visual", (points, who5, sprite, colorVar, base) => {
	console.log("Color: " + colorVar + " Who5: " + who5 + " Sprite: " + sprite + " Base: " + base);
	if (points !== null && colorVar !== null) {
		if (gests.length > 20) {
			gests.shift();
		}
		let newGest = new Gesture(colorVar, colorToIndex(colorVar), width/2, height/2, pathToSprite(base), pathToSprite(sprite), points);
		newGest.normalizePoints();
		gests.push(newGest);
		spawn_pos = createVector(width/2, height/2);
		playcount = 0;
	}
	else {
		console.log("Missing Either Color Or Points");
	}
});

function mouseClicked() {
		if (gests.length > 20) {
			gests.shift();
		}
        points = [
            createVector(0, 0),
            createVector(40, 40),
            createVector(80, 80),
            createVector(120, 120),
            createVector(160, 160),
			createVector(300, 200),
			createVector(340, 240),
			createVector(380, 280),
        ]
		let newGest = new Gesture("#4d26db", colorToIndex("#4d26db"), mouseX, mouseY, pathToSprite("/anim/base/heart.gif"), pathToSprite("/anim/newblob.gif"), points);
		newGest.normalizePoints();
		gests.push(newGest);
		spawn_pos = createVector(mouseX, mouseY);
		playcount = 0;
}

function colorToIndex(colorVar) {
	switch (colorVar) {
		case "#4d26db":
			return (0);
		case "#05a59d":
			return (1);
		case "#f6921e":
			return (2);
		case "#ec1d23":
			return (3);
		case "#ec008b":
			return (4);
		default:
			return (0);
	}
}

function pathToSprite(path) {
	switch (path) {
		case "/anim/newblob.gif":
		case "/anim/base/circle.gif":
			return (0);
		case "/anim/drops.gif":
		case "/anim/base/cloud.gif":
			return (1);
		case "/anim/sprite03.gif":
		case "/anim/base/cube.gif":
			return (2);
		case "/anim/star01.gif":
		case "/anim/base/heart.gif":
			return (3);
		case "/anim/head.gif":
		case "/anim/base/spikey.gif":
			return (4);
		default:
			return (0);
	}
}



function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

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

function spawn(scale, count, radius) {
	if (playcount > -1 && playcount < 11) {
	  push();
	  imageMode(CENTER);
	  translate(spawn_pos.x, spawn_pos.y);
	  for (let i = 0; i <= floor(count); i++) {
		rotate(radians(360 / floor(count)));
		image(spawn_gif, -radius, -radius, scale * 100, scale * 100);
	  }
	  pop();
	  playcount++;
	} else if (playcount >= 11) {
	  playcount = -1;
	  spawn_gif = loadImage("assets/sprites/spawn.gif");
	}
  }

