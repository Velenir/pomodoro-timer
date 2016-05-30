// .tomatoTimer

const tomatoTimerBigButton = document.querySelector('.tomatoTimer');

tomatoTimerBigButton.addEventListener('click', () => {
	eventDispatcher.emit("tomato-big-button-clicked");
});
