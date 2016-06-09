// sound alarm on timer:session-changed

function soundAlarm() {
	const audioFile = "audio/oringz-w424.mp3";
	new Audio(audioFile).play();
}

eventDispatcher.on('timer:session-changed', function ({reason}) {
  // don't fire on skipSession
	if(reason === "previous-session-ended" && (notifyOnBreak.checked || notifyOnWork.checked))	soundAlarm();
});
