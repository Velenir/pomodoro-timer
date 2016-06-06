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

const notifyOnBreak = document.getElementById("notify-break");
const notifyOnWork = document.getElementById("notify-work");


notifyOnBreak.onclick = notifyOnWork.onclick = askForPermission;

// function fireNotification(sessionName) {
// 	// if notifications aren't supported
// 	if (!("Notification" in window)) {
// 		alert("This browser does not support desktop notification");
// 	}
//
// 	// if permission was granted previously
// 	else if (Notification.permission === "granted") {
// 		buildNotification(sessionName);
// 	}
//
// 	// otherwise, ask permission
// 	else if (Notification.permission !== 'denied') {
// 		Notification.requestPermission(function (permission) {
// 			if (permission === "granted") {
// 				buildNotification(sessionName);
// 			}
// 		});
// 	}
// }

(function () {
	// if notifications aren't supported, remove the panel
	if (!("Notification" in window)) {
		alert("This browser does not support desktop notification");
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
	if(!document.body.contains(notifyOnBreak)) return;
	// only if permission is granted explicitly
	if (Notification.permission !== "granted") return;

	const itsBreakTime = sessionName === "break";
	if((itsBreakTime && notifyOnBreak.checked) || (!itsBreakTime && notifyOnWork.checked)) {
		notification = buildNotification(itsBreakTime);
	}
}

const icon = "images/clock_red.png";

function buildNotification(itsBreakTime) {
	const title = itsBreakTime ? "Time for a Break" : "Time for Work";
	const body = itsBreakTime ? "Good work! Time for a break." : "Ready for more? Time for work.";

	console.log("FIRING NOTIFICATION");

	return new Notification(title, {body, icon});
}

eventDispatcher.on('timer:session-changed', ({started: {session: {name}}}) => {
	console.log("session started", name);
	fireNotification(name);
});
