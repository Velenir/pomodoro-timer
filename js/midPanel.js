const checkVolume = document.getElementById("check-volume");
const checkClockSeconds = document.getElementById("check-clock-seconds");
const checkClockFilled = document.getElementById("check-clock-filled");
const checkProgress = document.getElementById("check-progress");

checkVolume.onchange = () => console.log('changed');
checkVolume.oninput = () => console.log('input');

checkVolume.addEventListener('change', function () {
	eventDispatcher.emit('check-volume:changed', this.checked);
});

checkClockSeconds.addEventListener('change', function () {
	eventDispatcher.emit('check-clock-seconds:changed', this.checked);
});

checkClockFilled.addEventListener('change', function () {
	eventDispatcher.emit('check-clock-filled:changed', this.checked);
});

checkProgress.addEventListener('change', function () {
	eventDispatcher.emit('check-progress:changed', this.checked);
});
