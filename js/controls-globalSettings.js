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

// TODO: sound, notification, storage

// .globalSettings > .notificationControl

let notifyOnBreak = document.getElementById("notify-break");
let notifyOnWork = document.getElementById("notify-work");


notifyOnBreak.onclick = notifyOnWork.onclick = askForPermission;

(function () {
	// if notifications aren't supported, remove the panel
	if (!("Notification" in window)) {
		// don't keep references
		notifyOnBreak = notifyOnWork = null;
		const notificationPanel = document.querySelector('.notificationControl');
		notificationPanel.parentNode.removeChild(notificationPanel);
	}else if (Notification.permission === 'denied') {
		disableNotifyChecks();
	}
})();

function askForPermission() {
	// ask only once
	notifyOnBreak.onclick = notifyOnWork.onclick = null;
	testForNotification();
}

function disableNotifyChecks() {
	notifyOnBreak.disabled = notifyOnWork.disabled = true;
	notifyOnBreak.checked = notifyOnWork.checked = false;
}

function testForNotification() {
	// if already granted
	if (Notification.permission === "granted") return;

	// if permission wasn't denied previously
	if (Notification.permission !== 'denied') {
		// returns a Promise resolved with granted or denied, doesn't do anything on default (when dismessed)
		Notification.requestPermission().then(function (result) {
			if(result === "denied") {
				// if no permission, uncheck and disable
				disableNotifyChecks();
			}
		});
	}
}

// keep reference to last notification
let notification;

// dismiss notfication if clicked anywhere on the page
document.addEventListener("click", () => {
	if(notification) notification.close();
})

function fireNotification(sessionName) {
	// if .notificationControl has been removed
	if(notifyOnBreak === null) return;
	// only if permission is granted explicitly
	if (Notification.permission !== "granted") return;

	const itsBreakTime = sessionName === "break";
	if((itsBreakTime && notifyOnBreak.checked) || (!itsBreakTime && notifyOnWork.checked)) {
		notification = buildNotification(itsBreakTime);
		notification.addEventListener('close', function () {
			console.log("notification closed");
			// don't keep the reference
			notification = null;
		});
	}
}

const icon = "images/clock_red.png";

function buildNotification(itsBreakTime) {
	const title = itsBreakTime ? "Time for a Break" : "Time for Work";
	const body = itsBreakTime ? "Good work! Time for a break." : "Ready for more? Time for work.";

	console.log("FIRING NOTIFICATION");

	return new Notification(title, {body, icon});
}

eventDispatcher.on('timer:session-changed', ({started: {session: {name}}, reason}) => {
	console.log("session started", name, "for reason", reason);
	// don't fire on skipSession
	if(reason === "previous-session-ended")	fireNotification(name);
});
