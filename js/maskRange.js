// REMOVE file

document.getElementById('maskRange').addEventListener('input', function () {
	eventDispatcher.emit('timer-display-percent-left', this.value);
});

const sliderOut = document.getElementById('sliderOut');
eventDispatcher.on('timer-display-percent-left', (percentLeft) => {
	sliderOut.value = percentLeft;
});
