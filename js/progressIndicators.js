class ArcMask {
	constructor(element, startX = 50, startY = 0, radius = 50) {
		this._element = element;
		this._startX = startX;
		this._startY = startY;
		this._radius = radius;

		this._dl = `M${startX},${startY} a${radius},${radius} 0`;
	}

	_getNewCoord(percent) {
		let theta = 2 * Math.PI * percent / 100, r = this._radius;
		return {x: r * Math.sin(theta), y: r * (1 - Math.cos(theta))};
	}

	drawArc(percent) {
		percent = 100 - percent;
		let dm;
		let dr = (percent === 100 || percent === 0) ? '' : "L50,50 z";
		if(percent <= 50) {
			dm = '1,0';
			if(percent === 0) percent = .01;
		} else {
			dm = '0,0 ';
		}

		let coord = this._getNewCoord(percent);


		this._element.setAttribute('d', `${this._dl} ${dm} ${coord.x},${coord.y} ${dr}`);
	}

}


// .progress > progress#totalProgressBar

const prgBar = document.getElementById('totalProgressBar');

eventDispatcher.on('check-progress:changed', (on) => {
	prgBar.classList.toggle('progress-off', !on);
});


// .svgSpace mask > path#arcMask, .progress > progress#totalProgressBar

const arcMask = new ArcMask(document.getElementById('arcMask'));

eventDispatcher.on('timer:session-in-progress', ({session: {name, left: secondsLeft, len: secondsTotal}}) => {
	let percentLeft = Math.round(secondsLeft / secondsTotal * 100);
	console.log("percent left", percentLeft);
	arcMask.drawArc(percentLeft);
	prgBar.value = 100 - percentLeft;
});

eventDispatcher.on('timer:session-modified', ({modification: {valueName, newValue: seconds}, isCurrentSession}) => {
	// reset progress indicators when session is modified by the user
	if(valueName === "len" && isCurrentSession) {
		arcMask.drawArc(100);
		prgBar.value = 0;
	}
});
