(function () {

	document.getElementById('secondsSlider').oninput = function () {
		eventDispatcher.emit('seconds-left', this.value);
	};

	const sliderOut2 = document.getElementById('sliderOut2');
	eventDispatcher.on('seconds-left', (secondsLeft) => {
		sliderOut2.value = secondsLeft;
	});

})();
