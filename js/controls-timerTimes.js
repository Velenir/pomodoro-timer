// .time in .controls > .workTimer and. breakTimer

const workTime = document.querySelector('.workTimer > .time');
const breakTime = document.querySelector('.breakTimer > .time');

function getWorkTimeSetting() {
	return parseInt(workTime.textContent, 10);
}

function getBreakTimeSetting() {
	return parseInt(breakTime.textContent, 10);
}

function validTime(val) {
	return val >= 1;
}

function emitControlTimerChange(timer, val) {
	// "work-timer:time-set" or "break-timer:time-set"
	eventDispatcher.emit(timer + "-timer:time-set", val * 60);
}

eventDispatcher.on('work-timer:++', () => {
	let newVal = parseInt(workTime.textContent, 10) + 1;
	if(!validTime(newVal)) return;
	workTime.textContent = newVal;

	emitControlTimerChange("work", newVal);
});
eventDispatcher.on('work-timer:--', () => {
	let newVal = parseInt(workTime.textContent, 10) - 1;
	if(!validTime(newVal)) return;
	workTime.textContent = newVal;

	emitControlTimerChange("work", newVal);
});

eventDispatcher.on('break-timer:++', () => {
	let newVal = parseInt(breakTime.textContent, 10) + 1;
	if(!validTime(newVal)) return;
	breakTime.textContent = newVal;

	emitControlTimerChange("break", newVal);
});
eventDispatcher.on('break-timer:--', () => {
	let newVal = parseInt(breakTime.textContent, 10) - 1;
	if(!validTime(newVal)) return;
	breakTime.textContent = newVal;

	emitControlTimerChange("break", newVal);
});
