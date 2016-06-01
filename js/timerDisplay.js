// .tomatoTimer > .svgSpace #minutesSvg

const minutesSvg = document.getElementById('minutesSvg');

let minutesSvgValue = minutesSvg.textContent;

minutesSvg.addEventListener('transitionend', function() {
	this.textContent = minutesSvgValue;
	this.classList.remove('changing');
});

function changeMinuteSvg(h, m, changeNow, newSessionStarted) {

	const hAndMin = h >= 1 ? `${h}:${m}` : m;

	if(minutesSvgValue !== hAndMin) {
		minutesSvgValue = hAndMin;
	}

	if(newSessionStarted) {
		minutesSvg.textContent = minutesSvgValue;
	}

	if(changeNow) {
		// turn transitions back on
		minutesSvg.classList.remove('no-transition');
		minutesSvg.classList.add('changing');
	}
}

function setImmediateMinuteSvg(h, m) {
	const hAndMin = h >= 1 ? `${h}:${m}` : m;
	// cancel transition in progress if any
	minutesSvg.classList.remove('changing');
	minutesSvg.classList.add('no-transition');

	minutesSvgValue = hAndMin;
	minutesSvg.textContent = hAndMin;
}

eventDispatcher.on('minutes-left', changeMinuteSvg);


// .tomatoTimer > .svgSpace #secondsLeft, .tomatoTimer > .seconds

const secondsLeftCircle = document.getElementById('secondsLeft');

const r = parseInt(secondsLeftCircle.getAttribute("r"), 10);
const fct = Math.round(r * 6.285714286)/100;

// proper offset to draw 60 cells, 1 cell representing 1 second
function changeCircleDashOffset(secondsLeft) {
	let dashoffset = 100 - secondsLeft * 5 / 3;
	console.log("circle secs", secondsLeft, ", dashoffset", dashoffset);
	secondsLeftCircle.style["stroke-dashoffset"] = -fct * dashoffset;
}

eventDispatcher.on('seconds-left', changeCircleDashOffset);

const secondsLeftText = document.querySelector('.tomatoTimer > .seconds');

eventDispatcher.on('seconds-left', (seconds) => {
	secondsLeftText.textContent = seconds;
});

eventDispatcher.on('check-clock-seconds:changed', (on) => {
	secondsLeftCircle.classList.toggle('visible', on);
});

function setSecondsDisplay(seconds) {
	// show full circle for *min:00sec exvept for 0min:00sec
	changeCircleDashOffset(seconds === 0 ? 60 : seconds);
	// :01 format instead of :1
	if(seconds < 10) seconds = "0" + seconds;
	secondsLeftText.textContent = ":" + seconds;
}


// #minutesSvg, #secondsLeft, .tomatoTimer > .seconds

function secondsToHMinSec(seconds) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor(seconds % 3600 / 60);
	const s = Math.floor(seconds % 3600 % 60);

	return {h, m, s};
}

eventDispatcher.on('timer:session-modified', ({modification: {valueName, newValue: seconds}, isCurrentSession}) => {
	// only processes modifications for values of len of currenSession
	if(valueName !== "len" || !isCurrentSession) return;
	const {h, m, s} = secondsToHMinSec(seconds);

	setImmediateMinuteSvg(h, m);
	console.log("setting hAndMin", h,m, ", sec", s);
	setSecondsDisplay(s);
});

eventDispatcher.on('timer:session-in-progress', ({session: {left: seconds, len: secondsTotal}}) => {
	console.log("received seconds", seconds);
	const {h, m, s} = secondsToHMinSec(seconds);

	changeMinuteSvg(h, m, s === 0, seconds === secondsTotal);
	console.log("setting hAndMin", h,m, ", sec", s);
	setSecondsDisplay(s);
});


// .tomatoTimer > .seconds and .tomatoTimer > .session

const sessionText = document.querySelector('.tomatoTimer > .session');

eventDispatcher.on('timer:session-changed', ({started: {session: {name: sessionName, len: seconds}}}) => {
	sessionText.textContent = sessionName;
});
