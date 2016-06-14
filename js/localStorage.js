// store user settings between sessions

function getStoredItem(keyName) {
	return JSON.parse(localStorage[keyName]);
}

function restoreSettings() {
	// .pauseControls
	pauseOnBreakStart.checked = getStoredItem("check-pause-on-break-start");
	pauseOnWorkStart.checked = getStoredItem("check-pause-on-work-start");

	// .notificationControls
	if(notifyOnBreak && ("Notification" in window) && Notification.permission === "granted"){
		// check that .notificationControls weren't removed
		notifyOnBreak.checked = getStoredItem("notify-break");
		notifyOnWork.checked = getStoredItem("notify-work");
	}

	// .timingComtrols
	// .workTimer
	workTime.textContent = getStoredItem("work-timer");

	// .breakTimer
	breakTime.textContent = getStoredItem("break-timer");

	// .midPanel
	checkVolume.checked = getStoredItem("check-volume");
	checkClockSeconds.checked = getStoredItem("check-clock-seconds");
	checkClockFilled.checked = getStoredItem("check-clock-filled");
	checkProgress.checked = getStoredItem("check-progress");
}


// update localStorage on settings changes
// .pauseControls
eventDispatcher.on('check-pause-on-break-start:changed', (val) => {
	localStorage["check-pause-on-break-start"] = val;
});
eventDispatcher.on('check-pause-on-work-start:changed', (val) => {
	localStorage["check-pause-on-work-start"] = val;
});

// .notificationControls
eventDispatcher.on('notify-break:changed', (val) => {
	localStorage["notify-break"] = val;
});
eventDispatcher.on('notify-work:changed', (val) => {
	localStorage["notify-work"] = val;
});

// .timingComtrols
// .workTimer
eventDispatcher.on('work-timer:time-set', (val) => {
	localStorage["work-timer"] = val/60;
});

// .breakTimer
eventDispatcher.on('break-timer:time-set', (val) => {
	localStorage["break-timer"] = val/60;
});

// .midPanel
eventDispatcher.on('check-volume:changed', (val) => {
	localStorage["check-volume"] = val;
});
eventDispatcher.on('check-clock-seconds:changed', (val) => {
	localStorage["check-clock-seconds"] = val;
});
eventDispatcher.on('check-clock-filled:changed', (val) => {
	localStorage["check-clock-filled"] = val;
});
eventDispatcher.on('check-progress:changed', (val) => {
	localStorage["check-progress"] = val;
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
	eventDispatcher.emit('check-clock-filled:changed', checkClockFilled.checked, true);
	eventDispatcher.emit('check-progress:changed', checkProgress.checked);
}

// when all resources are loaded and event listeners connected, try to restore settings
window.addEventListener('DOMContentLoaded', function () {
	console.log("DOM LOADED");
	if(localStorage.getItem("check-pause-on-break-start")) {
		try {
			restoreSettings();
		} catch (e) {
			console.log("Error", e);
		}
	}
	document.querySelector(".wrapper").classList.remove("transparent");
	saveInitSettings();
});
