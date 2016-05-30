const prgBar = document.getElementById('totalProgressBar');

eventDispatcher.on('timer-display-percent-left', (percentLeft) => {
	console.log("percentleft", percentLeft);
	prgBar.value = 100 - percentLeft;
});

eventDispatcher.on('check-progress:changed', (on) => {
	prgBar.classList.toggle('progress-off', !on);
});
