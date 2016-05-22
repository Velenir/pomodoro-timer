(function () {

	document.getElementById('maskRange').addEventListener('input', function () {
		eventDispatcher.emit('percent-left', this.value);
	});

	const sliderOut = document.getElementById('sliderOut');
	eventDispatcher.on('percent-left', (percentLeft) => {
		sliderOut.value = percentLeft;
	});

})();
