(function () {

	const prgBar = document.getElementById('totalProgressBar');

	eventDispatcher.on('percent-left', (percentLeft) => {
		prgBar.value = 100 - percentLeft;
	});

})();
