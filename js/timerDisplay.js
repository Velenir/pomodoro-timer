// .tomatoTimer > .svgSpace #minutesSvg

const minutesSvg = document.getElementById('minutesSvg');

let minutesSvgValue = minutesSvg.textContent;

minutesSvg.addEventListener('transitionend', function() {
	this.textContent = minutesSvgValue;
	this.classList.remove('changing');
});

function changeMinuteSvg(h, m, hourAndMin, changeNow) {
	// if(minutesSvgValue === hourAndMin) return;
	if(!changeNow) return;

	// turn transitions back on
	minutesSvg.classList.remove('no-transition');

	// no transition when no minutes left (m-1===-1)
	if(--m < 0) return;

	const hAndMin = h >= 1 ? `${h}:${m}` : m;

	// if(minutesSvgValue === hAndMin) return;

	minutesSvgValue = hAndMin;
	minutesSvg.classList.add('changing');
}

function setImmediateMinuteSvg(hourAndMin) {
	// cancel transition in progress if any
	minutesSvg.classList.remove('changing');
	minutesSvg.classList.add('no-transition');

	minutesSvgValue = hourAndMin;
	minutesSvg.textContent = hourAndMin;
}

eventDispatcher.on('minutes-left', changeMinuteSvg);


// .tomatoTimer > .svgSpace #secondsLeft, .tomatoTimer > .seconds

const secondsLeftCircle = document.getElementById('secondsLeft');

const r = parseInt(secondsLeftCircle.getAttribute("r"), 10);
const fct = Math.round(r * 6.285714286)/100;

function changeCircleDashOffset(secondsLeft) {
	let val = 100 - secondsLeft * 5 / 3;
	secondsLeftCircle.style["stroke-dashoffset"] = -fct * val;
}

eventDispatcher.on('seconds-left', changeCircleDashOffset);

const secondsLeftText = document.querySelector('.tomatoTimer > .seconds');

eventDispatcher.on('seconds-left', (seconds) => {
	secondsLeftText.textContent = seconds;
});

eventDispatcher.on('check-clock-seconds:changed', (on) => {
	secondsLeftCircle.classList.toggle('visible', on);
});

function setSecondsDisplay(seconds, lastMinute) {
	changeCircleDashOffset(!lastMinute && seconds === 0 ? 60 : seconds);
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

	const hAndMin = h >= 1 ? `${h}:${m}` : m;

	setImmediateMinuteSvg(hAndMin);
	console.log("setting hAndMin", hAndMin, ", sec", s);
	setSecondsDisplay(s, m === 0);
});

eventDispatcher.on('timer:session-in-progress', ({session: {left: seconds, len: secondsTotal}}) => {
	console.log("received seconds", seconds);
	const {h, m, s} = secondsToHMinSec(seconds);

	const hAndMin = h >= 1 ? `${h}:${m}` : m;

	// if new session just started
	// FIXME
	if(seconds === secondsTotal) {
		minutesSvg.textContent = minutesSvgValue = hAndMin;
	}
	changeMinuteSvg(h, m, hAndMin, s === 0);
	console.log("setting hAndMin", hAndMin, ", sec", s);
	setSecondsDisplay(s, m === 1);
});


// .tomatoTimer > .seconds and .tomatoTimer > .session

const sessionText = document.querySelector('.tomatoTimer > .session');

eventDispatcher.on('timer:session-changed', ({started: {session: {name: sessionName, len: seconds}}}) => {
	sessionText.textContent = sessionName;

	// const {h, m} = secondsToHMinSec(seconds);
	// minutesSvg.textContent = minutesSvgValue = h >= 1 ? `${h}:${m}` : m;
});


const minutesSvgCss = window.getComputedStyle(minutesSvg);

eventDispatcher.on('timer:state-changed', ({currentState, session: {name: sessionName, left: seconds}}) => {
	// don't show seconds intitially, but show as soon as something happens
	secondsLeftText.classList.remove("invisible");

	// if timer was paused
	if(currentState === "paused") {
		const {h, m, s} = secondsToHMinSec(seconds);
		console.log("time",{h,m,s});
		// during transition (which happens at s=0) to next minutes value
		if(s === 0) {
			// set minutesSvg value post transition back to actual minutes value, since s is still 0
			minutesSvgValue = h >= 1 ? `${h}:${m}` : m;

			console.log("dashoffset", minutesSvgCss.strokeDashoffset);
			// if
			// if(minutesSvgCss.strokeDashoffset !== 0 && minutesSvg.classList.contains("changing")) minutesSvg.textContent = minutesSvg;
			if(m !== 0 && h === 0) minutesSvg.textContent =  minutesSvgValue;
		}
	}
});
