const canvas = document.querySelector("#drawCanvas");
const ctx = canvas.getContext("2d");
const undoButton = document.querySelector("#undoButton");
const clearButton = document.querySelector("#clearButton");
const colorPalette = document.querySelector("#colorPalette");
let undoHistory = [];

const SECONDS = 90;

const playersDiv = document.querySelector(".players");
const canvasDiv = document.querySelector(".canvas");

const storedData = localStorage.getItem("jatekosok");
const data = storedData ? JSON.parse(storedData) : {};

var cdAudio = document.querySelector("#countdown");
var epicCdAudio = document.querySelector("#epicCountdown");
var buzzer = document.querySelector("#buzzer");

let prevGame = true;

canvasDiv.hidden = true;

undoHistory.push(canvas.toDataURL());

function getJatekosok() {
	const storedData = localStorage.getItem("jatekosok");
	const jatekosokDiv = document.querySelector(".jatekosok");

	jatekosokDiv.innerHTML = "";

	if (storedData) {
		const data = JSON.parse(storedData);

		for (const jatekos in data) {
			const jatekosBigDiv = document.createElement("div");
			const jatekosDiv = document.createElement("div");
			jatekosDiv.classList.add("jatekos");
			jatekosDiv.dataset.nev = jatekos;
			jatekosBigDiv.classList.add("jatekosNagy");

			jatekosBigDiv.innerHTML = `<p>${jatekos}</p>`;
			jatekosDiv.innerHTML = `${data[jatekos].pontszam}`;

			jatekosBigDiv.appendChild(jatekosDiv);
			jatekosokDiv.appendChild(jatekosBigDiv);
		}
	}
}

const formDiv = document.querySelector("form");

formDiv.addEventListener("keydown", function (event) {
	if (event.code === "Enter") {
		addJatekos();
	}
});

function addJatekos() {
	const nev = document.querySelector("#jatekosNev").value;
	const pontszam = 0;

	// Játékosok lekérése a localStorage-ból
	const storedData = localStorage.getItem("jatekosok");
	const data = storedData ? JSON.parse(storedData) : {};

	// Új játékos hozzáadása
	data[nev] = {nev, pontszam};

	// Játékosok mentése a localStorage-be
	localStorage.setItem("jatekosok", JSON.stringify(data));

	// Frissítsük az oldalt
	getJatekosok();
}

getJatekosok();

const jatekosok = document.querySelectorAll(".jatekos");

jatekosok.forEach(jatekos => {
	jatekos.addEventListener("click", event => {
		console.log(data[event.target.dataset.nev].pontszam);
		addPoints(event, 1);
	});
	jatekos.addEventListener("contextmenu", event => {
		event.preventDefault();
		if (data[event.target.dataset.nev].pontszam > 0) {
			addPoints(event, -1);
		}
	});
});

function addPoints(event, number) {
	data[event.target.dataset.nev].pontszam += number;
	localStorage.setItem("jatekosok", JSON.stringify(data));
	event.target.innerText = data[event.target.dataset.nev].pontszam;
}

const canvasButton = document.querySelector(".showCanvas");
const playersButton = document.querySelector(".showPlayers");

canvasButton.addEventListener("click", () => {
	playersDiv.hidden = true;
	canvasDiv.hidden = false;
	canvasButton.style.backgroundColor = "rgb(67, 0, 0)";
	playersButton.style.backgroundColor = "white";
	document.querySelector("body").style.backgroundImage = "none";
});

playersButton.addEventListener("click", () => {
	playersDiv.hidden = false;
	canvasDiv.hidden = true;
	playersButton.style.backgroundColor = "rgb(67, 0, 0)";
	canvasButton.style.backgroundColor = "white";
	document.querySelector("body").style.backgroundImage = 'url("extrem_activity_rgb.jpg")';
});

let countdown;
let isPaused = true;
let secondsRemaining = SECONDS;

function startCountdown() {
	countdown = setInterval(function () {
		if (!isPaused) {
			displayTime(secondsRemaining);
			secondsRemaining--;
			if (secondsRemaining == 33) {
				cdAudio.play();
			}
			if (secondsRemaining == 29) {
				isPaused = true;
				document.querySelector(".timer p").style.color = "rgb(185, 0, 0)";
			}
			if (secondsRemaining == 2) {
				epicCdAudio.play();
			}
			if (secondsRemaining < -1) {
				clearInterval(countdown);
				document.querySelector(".timer p").innerHTML = "Lejárt az idő!";
			}
		}
	}, 1000);
}

function displayTime(seconds) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	const formattedTime = `${padZero(minutes)}:${padZero(remainingSeconds)}`;
	document.querySelector(".timer p").innerText = formattedTime;
}

function padZero(value) {
	return value < 10 ? `0${value}` : value;
}

function togglePause() {
	isPaused = !isPaused;
}

function resetTimer() {
	document.querySelector(".timer p").style.color = "black";
	clearInterval(countdown);
	isPaused = true;
	secondsRemaining = SECONDS;
	displayTime(secondsRemaining);
	startCountdown();
}

document.querySelector(".removeAllP").addEventListener("click", function () {
	localStorage.clear();
	location.reload();
});

document.addEventListener("keydown", function (event) {
	if (event.code === "Space") {
		togglePause();
		epicCdAudio.pause();
		if (isPaused) {
			buzzer.play();
		}
	}
});

document.querySelector(".timer p").addEventListener("click", function () {
	document.querySelector(".ujJatekos").style.display = "none";
	resetTimer();
});

startCountdown();

// Állítsd be a vászon méretét
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let cursorColor = "#000";

function startDrawing(e) {
	drawing = true;
	draw(e);
}

function stopDrawing() {
	drawing = false;
	ctx.beginPath();
	saveCanvasState();
}

function draw(e) {
	if (!drawing) return;

	ctx.lineWidth = 5;
	ctx.lineCap = "round";
	ctx.strokeStyle = cursorColor;

	ctx.lineTo(e.clientX - 8, e.clientY - 173);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(e.clientX - 8, e.clientY - 173);
}

function startDrawing2(e) {
	e.preventDefault();
    drawing = true;
    draw(e.touches[0]); // Pass the first touch event
}

function draw2(e) {
	e.preventDefault();
    if (!drawing) return;

    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = cursorColor;

    ctx.lineTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
}

function saveCanvasState() {
	undoHistory.push(canvas.toDataURL());
}

function undoLastDraw() {
	if (undoHistory.length > 1) {
		undoHistory.pop();
		const img = new Image();
		img.src = undoHistory[undoHistory.length - 1];
		img.onload = function () {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0);
		};
	}
}

function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function changeCursorColor(color) {
	cursorColor = color;
}

// Eseménykezelők hozzáadása
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);

canvas.addEventListener('touchstart', startDrawing2);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchmove', draw2);
    

canvas.addEventListener("contextmenu", event => {
	event.preventDefault();
});
undoButton.addEventListener("click", undoLastDraw);
clearButton.addEventListener("click", clearCanvas);
