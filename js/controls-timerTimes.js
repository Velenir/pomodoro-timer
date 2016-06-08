// .time in .timingControls > .workTimer and .breakTimer

const workTime = document.querySelector('.workTimer > .time');
const breakTime = document.querySelector('.breakTimer > .time');

function getWorkTimeSetting() {
	return parseInt(workTime.textContent, 10);
}

function getBreakTimeSetting() {
	return parseInt(breakTime.textContent, 10);
}

function getValidTime(val) {
	return val < 1 ? 1 : val;
}

function emitControlTimerChange(timer, val) {
	// "work-timer:time-set" or "break-timer:time-set"
	eventDispatcher.emit(timer + "-timer:time-set", val * 60);
}

eventDispatcher.on('work-timer:++', (multiplier = 1) => {
	const oldVal = parseInt(workTime.textContent, 10);
	let newVal =  oldVal + 1 * multiplier;
	newVal = getValidTime(newVal);
	if(oldVal === newVal) return;
	workTime.textContent = newVal;

	emitControlTimerChange("work", newVal);
});
eventDispatcher.on('work-timer:--', (multiplier = 1) => {
	const oldVal = parseInt(workTime.textContent, 10);
	let newVal =  oldVal - 1 * multiplier;
	newVal = getValidTime(newVal);
	if(oldVal === newVal) return;
	workTime.textContent = newVal;

	emitControlTimerChange("work", newVal);
});
eventDispatcher.on('work-timer:set', (minutes) => {
	if(parseInt(workTime.textContent, 10) === minutes) return;
	workTime.textContent = minutes;

	emitControlTimerChange("work", minutes);
});

eventDispatcher.on('break-timer:++', (multiplier = 1) => {
	const oldVal = parseInt(breakTime.textContent, 10);
	let newVal =  oldVal + 1 * multiplier;
	newVal = getValidTime(newVal);
	if(oldVal === newVal) return;
	breakTime.textContent = newVal;

	emitControlTimerChange("break", newVal);
});
eventDispatcher.on('break-timer:--', (multiplier = 1) => {
	const oldVal = parseInt(breakTime.textContent, 10);
	let newVal =  oldVal - 1 * multiplier;
	newVal = getValidTime(newVal);
	if(oldVal === newVal) return;
	breakTime.textContent = newVal;

	emitControlTimerChange("break", newVal);
});
eventDispatcher.on('break-timer:set', (minutes) => {
	if(parseInt(breakTime.textContent, 10) === minutes) return;
	breakTime.textContent = minutes;

	emitControlTimerChange("break", minutes);
});
