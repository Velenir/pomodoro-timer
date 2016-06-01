// button.plus and .minus in .controls > .workTimer and. breakTimer

const workPlus = document.querySelector('.workTimer > .plus');
const workMinus = document.querySelector('.workTimer > .minus');

const breakPlus = document.querySelector('.breakTimer > .plus');
const breakMinus = document.querySelector('.breakTimer > .minus');

function workIncrement() {
	eventDispatcher.emit('work-timer:++');
}
function workDecrement() {
	eventDispatcher.emit('work-timer:--');
}

function breakIncrement() {
	eventDispatcher.emit('break-timer:++');
}
function breakDecrement() {
	eventDispatcher.emit('break-timer:--');
}

function repeatFunction(repeatF, freq = 200) {
	let intervalId;
	function start() {
		repeatF();
		intervalId = setInterval(repeatF, freq);
	}
	function stop() {
		clearInterval(intervalId);
	}

	return {start, stop};
}

function connectButtonOnOff(btn, {start, stop}) {
	btn.addEventListener('mousedown', start);
	btn.addEventListener('mouseup', stop);
	btn.addEventListener('mouseleave', stop);
}

const workIncrementRepeat = repeatFunction(workIncrement);
const workDecrementRepeat = repeatFunction(workDecrement);

const breakIncrementRepeat = repeatFunction(breakIncrement);
const breakDecrementRepeat = repeatFunction(breakDecrement);


connectButtonOnOff(workPlus, workIncrementRepeat);
connectButtonOnOff(workMinus, workDecrementRepeat);

connectButtonOnOff(breakPlus, breakIncrementRepeat);
connectButtonOnOff(breakMinus, breakDecrementRepeat);


function connectKeydown(btn, fn) {
	btn.addEventListener('keydown', function(e) {
		// keyCode 32 = space, 13 = Enter
		if(e.keyCode === 32 || e.keyCode === 13) {
			fn();
		}
	});
}

connectKeydown(workPlus, workIncrement);
connectKeydown(workMinus, workDecrement);

connectKeydown(breakPlus, breakIncrement);
connectKeydown(breakPlus, breakDecrement);

function disableBtn(disable, btnName) {
	if(btnName === "work") {
		workPlus.disabled = disable;
		workMinus.disabled = disable;

		// stop incr/decrementing if in progress
		workIncrementRepeat.stop();
		workDecrementRepeat.stop();

	}else if (btnName === "break") {
		breakPlus.disabled = disable;
		breakMinus.disabled = disable;

		// stop incr/decrementing if in progress
		breakIncrementRepeat.stop();
		breakDecrementRepeat.stop();
	}
}


eventDispatcher.on('timer:state-changed', ({currentState, session: {name: sessionName}}) => {
	disableBtn(currentState === "active", sessionName);
});
eventDispatcher.on('timer:session-changed', ({ended: {session: {name: endedSessionName}}, started: {session: {name: startedSessionName}}}) => {
	disableBtn(false, endedSessionName);
	disableBtn(true, startedSessionName);
});
