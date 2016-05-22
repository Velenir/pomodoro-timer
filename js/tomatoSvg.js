(function () {

	const tomatoSvg = document.querySelector('.all-tomato');

	eventDispatcher.on('check-clock-filled:changed', (on) => {
		tomatoSvg.classList.toggle('transparent', !on);
	});

})();
