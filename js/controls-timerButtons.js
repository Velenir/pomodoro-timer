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
