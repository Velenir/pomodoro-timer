// .globalSettings > .notificationControl

const notifyOnBreak = document.getElementById("notify-break");
const notifyOnWork = document.getElementById("notify-work");


// .globalSettings > .pauseControls

const pauseOnBreakStart = document.getElementById("pause-on-break-start");
const pauseOnWorkStart = document.getElementById("pause-on-work-start");


pauseOnBreakStart.addEventListener('change', function () {
	console.log(this, "changed to", this.checked ? "checked" : "unchecked");
	eventDispatcher.emit('check-pause-on-break-start:changed', this.checked);
});
pauseOnWorkStart.addEventListener('change', function () {
	console.log(this, "changed to", this.checked ? "checked" : "unchecked");
	eventDispatcher.emit('check-pause-on-work-start:changed', this.checked);
});
