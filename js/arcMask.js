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

const arcMask = new ArcMask(document.getElementById('arcMask'));

eventDispatcher.on('timer-display-percent-left', (percentLeft) => {
	console.log("percentleft", percentLeft);
	arcMask.drawArc(percentLeft);
});
