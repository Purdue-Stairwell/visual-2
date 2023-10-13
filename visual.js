const socket = io("wss://navinate.com", { secure: true });
console.log("connected to websocket");

const caps = ["ROUND", "SQUARE", "PROJECT"];
const joins = ["MITER", "BEVEL", "ROUND"];
let gests = [];
let t = 0;

const maxSquiggles = 25;

let debugDisplay = false;

// arrays of sprites
let base_sprites = [];
let skin_sprites = [];

// arrays of sprite names
let names = [ "bread", "drops", "rombo", "star", "swirl" ];
let base_names = ["circle", "cloud", "cube", "heart", "spiky" ];

// collision mask
let mask;

// stars
let star_x = [];
let star_y = [];
let stars_made = false;

//spawn stuff
let playcount = -1;
let spawn_pos;

//spawn boundary (do width - outer/inner for right side)
let top_bound;
let outer_bound;
let bottom_bound;
let inner_bound; 

    // preload images
function preload() {
	console.log("toggleDebug()");
	for (let i = 0; i < names.length; i++) {
		let gifs = [];
		let base_gifs = [];

		for (let j = 0; j < 5; j++) {
			gifs[j] = loadImage("./assets/sprites/skin/" + names[i] + "/" + j + ".gif");
		}
		for (let j = 0; j < 5; j++) {
			base_gifs[j] = loadImage("./assets/sprites/base/" + base_names[i] + "/" + j + ".gif");
		}
		base_sprites.push(base_gifs);
		skin_sprites.push(gifs);
	}
	spawn_gif = loadImage("./assets/sprites/spawn.gif");
	mask = loadImage("./assets/LEDmask.png");
}

function setup() {
	createCanvas(mask.width, mask.height);
	frameRate(24);
	spawn_pos = createVector(width/2, height/2);
	imageMode(CENTER);
	rectMode(CORNERS);
	strokeJoin(ROUND);
    strokeCap(ROUND);
    noFill();
	top_bound = height*0.25;
	outer_bound = width * 0.175;
	bottom_bound = height*0.98;
	inner_bound = width * 0.35;
}

function toggleDebug() {
	debugDisplay = !debugDisplay;
	if(debugDisplay) {
		document.getElementById("body").style.backgroundColor = "red";
	} else {
		document.getElementById("body").style.backgroundColor = "black";
	}
	console.log("Debug Display: " + debugDisplay);
}
function draw() {
	if(debugDisplay) {
		image(mask, width/2, height/2, width, height);
	} else {
		space(width, height, 200, 2);
	}
     
	for(let g of gests){
		g.update();
		g.drawNormalPoints(t);
		g.drawSprites(t);
		g.boundingCheck();
	}
	//draw spawn animation
	spawn(0.8, 5, 10);
	
	if(debugDisplay) {
		stroke(0,0,255);
		strokeWeight(2);
		noFill();
		rect(outer_bound, top_bound, inner_bound, bottom_bound);
		rect(width - outer_bound, top_bound, width - inner_bound, bottom_bound);
	}

	


	t += 0.1;

	console.log(frameRate());
}

socket.on("backend to visual", (points, who5, sprite, colorVar, base) => {
	console.log("Color: " + colorVar + " Who5: " + who5 + " Sprite: " + sprite + " Base: " + base);
	if (points !== null && colorVar !== null) {
		if (gests.length > maxSquiggles) {
			gests.shift();
		}
		let placeToSpawn = getSpawnLocation();
		let newGest = new Gesture(colorVar, colorToIndex(colorVar), placeToSpawn.x, placeToSpawn.y, pathToSprite(sprite), pathToSprite(base), points);
		newGest.normalizePoints();
		gests.push(newGest);
		spawn_pos = placeToSpawn;
		playcount = 0;
	}
	else {
		console.log("Missing Either Color Or Points");
	}
});

function mouseClicked() {
		if (gests.length > maxSquiggles) {
			gests.shift();
		}
        points = [];
		for(let i = 0; i < 24; i++) {
			points.push(createVector(i * random(-10,10), i * random(-10,10)));
		}
		let placeToSpawn = getSpawnLocation();
		//                         color     colorIndex               x               y               skin, base, points
		let newGest = new Gesture("#4d26db", colorToIndex("#4d26db"), placeToSpawn.x, placeToSpawn.y, 0,    3,    points);
		newGest.normalizePoints();
		gests.push(newGest);
		spawn_pos = placeToSpawn;
		playcount = 0;
}

function getSpawnLocation() {
	let x = random() > 0.5 ? random(outer_bound, inner_bound) : random(width - inner_bound, width - outer_bound);
	let y = random(top_bound, bottom_bound);
	return createVector(x, y);
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
		case "/anim/base/spiky.gif":
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

