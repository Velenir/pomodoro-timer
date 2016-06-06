// store user settings between sessions

function restoreSettings() {
	function getStoredItem(keyName) {
		return JSON.parse(localStorage.getItem(keyName));
	}

	// .pauseControls
	pauseOnBreakStart.checked = getStoredItem("check-pause-on-break-start");
	eventDispatcher.emit('check-pause-on-break-start:changed', pauseOnBreakStart.checked);

	pauseOnWorkStart.checked = getStoredItem("check-pause-on-work-start");
	eventDispatcher.emit('check-pause-on-work-start:changed', pauseOnWorkStart.checked);

	// .notificationControls
	if(notifyOnBreak){
		// check that .notificationControls weren't removed
		notifyOnBreak.checked = getStoredItem("notify-break");
		eventDispatcher.emit('notify-break:changed', notifyOnBreak.checked);

		notifyOnWork.checked = getStoredItem("notify-work");
		eventDispatcher.emit('notify-work:changed', notifyOnWork.checked);
	}

	// .timingComtrols
	// .workTimer
	const workTimeValue = getStoredItem("work-timer");
	workTime.textContent = workTimeValue;
	eventDispatcher.emit("work-timer:time-set", workTimeValue * 60);

	// .breakTimer
	const breakTimeValue = getStoredItem("break-timer");
	breakTime.textContent = breakTimeValue;
	eventDispatcher.emit("break-timer:time-set", breakTimeValue * 60);

	// .midPanel
	checkVolume.checked = getStoredItem("check-volume");
	eventDispatcher.emit('check-volume:changed', checkVolume.checked);

	checkClockSeconds.checked = getStoredItem("check-clock-seconds");
	eventDispatcher.emit('check-clock-seconds:changed', checkClockSeconds.checked);

	checkClockFilled.checked = getStoredItem("check-clock-filled");
	eventDispatcher.emit('check-clock-filled:changed', checkClockFilled.checked);

	checkProgress.checked = getStoredItem("check-progress");
	eventDispatcher.emit('check-progress:changed', checkProgress.checked);
}

// update localStorage on settings changes
// .pauseControls
eventDispatcher.on('check-pause-on-break-start:changed', (val) => {
	localStorage.setItem("check-pause-on-break-start", val);
});
eventDispatcher.on('check-pause-on-work-start:changed', (val) => {
	localStorage.setItem("check-pause-on-work-start", val);
});

// .notificationControls
eventDispatcher.on('notify-break:changed', (val) => {
	localStorage.setItem("notify-break", val);
});
eventDispatcher.on('notify-work:changed', (val) => {
	localStorage.setItem("notify-work", val);
});

// .timingComtrols
// .workTimer
eventDispatcher.on('work-timer:time-set', (val) => {
	localStorage.setItem("work-timer", val/60);
});

// .breakTimer
eventDispatcher.on('break-timer:time-set', (val) => {
	localStorage.setItem("break-timer", val/60);
});

// .midPanel
eventDispatcher.on('check-volume:changed', (val) => {
	localStorage.setItem("check-volume", val);
});
eventDispatcher.on('check-clock-seconds:changed', (val) => {
	localStorage.setItem("check-clock-seconds", val);
});
eventDispatcher.on('check-clock-filled:changed', (val) => {
	localStorage.setItem("check-clock-filled", val);
});
eventDispatcher.on('check-progress:changed', (val) => {
	localStorage.setItem("check-progress", val);
});


// populate localStorage on initial start
function saveInitSettings() {
	// .pauseControls
	eventDispatcher.emit('check-pause-on-break-start:changed', pauseOnBreakStart.checked);

	eventDispatcher.emit('check-pause-on-work-start:changed', pauseOnWorkStart.checked);

	// .notificationControls
	if(notifyOnBreak){
		// check that .notificationControls weren't removed
		eventDispatcher.emit('notify-break:changed', notifyOnBreak.checked);

		eventDispatcher.emit('notify-work:changed', notifyOnWork.checked);
	}

	// .timingComtrols
	// .workTimer
	eventDispatcher.emit("work-timer:time-set", parseInt(workTime.textContent, 10) * 60);

	// .breakTimer
	eventDispatcher.emit("break-timer:time-set", parseInt(breakTime.textContent, 10) * 60);

	// .midPanel
	eventDispatcher.emit('check-volume:changed', checkVolume.checked);

	eventDispatcher.emit('check-clock-seconds:changed', checkClockSeconds.checked);

	eventDispatcher.emit('check-clock-filled:changed', checkClockFilled.checked);

	eventDispatcher.emit('check-progress:changed', checkProgress.checked);
}

// when all resources are loaded and event listeners connected, try to restore settings
window.addEventListener('load', function () {
	if(localStorage.getItem("check-pause-on-break-start")) restoreSettings();
	else saveInitSettings();
});
