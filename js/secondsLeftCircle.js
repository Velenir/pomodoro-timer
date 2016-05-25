(function () {

	const secondsLeftCircle = document.getElementById('secondsLeft');

	const r = parseInt(secondsLeftCircle.getAttribute("r"), 10);
	const fct = Math.round(r * 6.285714286)/100;

	function changeDashOffset(secondsLeft) {
		let val = 100 - secondsLeft * 5 / 3;
		secondsLeftCircle.style["stroke-dashoffset"] = -fct * val;
	}

	eventDispatcher.on('seconds-left', changeDashOffset);

	const secondsLeftText = document.querySelector('.tomatoTimer > .seconds');

	eventDispatcher.on('check-clock-seconds:changed', (on) => {
		secondsLeftCircle.classList.toggle('visible', on);
		secondsLeftText.classList.toggle('visible', on);
	});

})();
