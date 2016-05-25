const prgBar = document.getElementById('totalProgressBar');

eventDispatcher.on('percent-left', (percentLeft) => {
	prgBar.value = 100 - percentLeft;
});

eventDispatcher.on('check-progress:changed', (on) => {
	prgBar.classList.toggle('progress-off', !on);
});
