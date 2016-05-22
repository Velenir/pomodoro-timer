(function () {

	const minutesSvg = document.getElementById('minutesSvg');

	let val = minutesSvg.textContent;

	minutesSvg.addEventListener('transitionend', function() {
		this.textContent = val;
		this.classList.remove('changing');
	});

	function changeValue(minutesLeft) {
		val = minutesLeft;
		minutesSvg.classList.add('changing');
	}

	eventDispatcher.on('minutes-left', changeValue);

})();
