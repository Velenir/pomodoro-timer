// .tomatTimer > .svgSpace .all-tomato

const tomatoSvg = document.querySelector('.all-tomato');

eventDispatcher.on('check-clock-filled:changed', (on, skipTransition) => {
	if(skipTransition) {
		tomatoSvg.classList.add("no-transition");
		tomatoSvg.classList.toggle('transparent', !on);
		// force reflow if necessary
		if(!on) tomatoSvg.clientWidth;
		tomatoSvg.classList.remove("no-transition");
	} else tomatoSvg.classList.toggle('transparent', !on);
});
