// .time in .controls > .workTimer and. breakTimer

const workTime = document.querySelector('.workTimer > .time');
const breakTime = document.querySelector('.breakTimer > .time');

function validTime(val) {
	return val >= 1;
}

eventDispatcher.on('work-timer:++', () => {
	let newVal = parseInt(workTime.textContent, 10) + 1;
	if(!validTime(newVal)) return;
	workTime.textContent = newVal;
});
eventDispatcher.on('work-timer:--', () => {
	let newVal = parseInt(workTime.textContent, 10) - 1;
	if(!validTime(newVal)) return;
	workTime.textContent = newVal;
});

eventDispatcher.on('break-timer:++', () => {
	let newVal = parseInt(breakTime.textContent, 10) + 1;
	if(!validTime(newVal)) return;
	breakTime.textContent = newVal;
});
eventDispatcher.on('break-timer:--', () => {
	let newVal = parseInt(breakTime.textContent, 10) - 1;
	if(!validTime(newVal)) return;
	breakTime.textContent = newVal;
});
