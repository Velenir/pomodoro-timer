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


// .globalSettings > .notificationControls

let notifyOnBreak = document.getElementById("notify-break");
let notifyOnWork = document.getElementById("notify-work");

notifyOnBreak.addEventListener('change', function () {
	console.log(this, "changed to", this.checked ? "checked" : "unchecked");
	eventDispatcher.emit('notify-break:changed', this.checked);
});
notifyOnWork.addEventListener('change', function () {
	console.log(this, "changed to", this.checked ? "checked" : "unchecked");
	eventDispatcher.emit('notify-work:changed', this.checked);
});


notifyOnBreak.onclick = notifyOnWork.onclick = askForPermission;

(function () {
	// if notifications aren't supported, remove the panel
	if (!("Notification" in window)) {
		// don't keep references
		notifyOnBreak = notifyOnWork = null;
		const notificationPanel = document.querySelector('.notificationControls');
		notificationPanel.parentNode.removeChild(notificationPanel);
	}else if (Notification.permission === 'denied') {
		disableNotifyChecks();
	}
})();

function askForPermission() {
	// if any notification checkbox is checked
	if(notifyOnBreak.checked || notifyOnWork.checked) testForNotification();
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
		// returns a Promise resolved with granted or denied, doesn't do anything on default (when dismissed)
		Notification.requestPermission().then(function (result) {
			if(result === "denied") {
				// ask only once
				notifyOnBreak.onclick = notifyOnWork.onclick = null;
				// if no permission, uncheck and disable
				disableNotifyChecks();
			} else if(result === "granted") {
				// ask only once
				notifyOnBreak.onclick = notifyOnWork.onclick = null;
			}
			// don't do anything === ask again later if(result === "default")
			console.log("NOTIFY REQUEST", result);
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
	// if .notificationControls has been removed
	if(notifyOnBreak === null) return;
	// only if permission is granted explicitly
	if (Notification.permission !== "granted") return;

	const itsBreakTime = sessionName === "break";
	if((itsBreakTime && notifyOnBreak.checked) || (!itsBreakTime && notifyOnWork.checked)) {
		notification = buildNotification(itsBreakTime);
		notification.onclose = function () {
			console.log("notification closed");
			// don't keep the reference
			notification = null;
		};
		notification.onclick = function () {
			console.log("notification clicked");
			window.focus();
			notification.close();
		};
		console.log(notification);
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
	// don't Notification fire on skipSession
	if(reason === "previous-session-ended")	fireNotification(name);
});
