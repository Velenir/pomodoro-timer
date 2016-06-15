// sound alarm on timer:session-changed

eventDispatcher.on('timer:session-changed', function ({reason}) {
	// don't fire on skipSession
	if(reason === "previous-session-ended" && checkVolume.checked)	playSound();
});


// input[type="range"]#volume
const volumeSlider = document.getElementById("volume");

volumeSlider.oninput = function() {
	audio.volume = this.value;
};

const fileUpload = document.getElementById("file-upload");
const resetUploadBtn = document.getElementById("reset-upload-btn");

function setCustomSoundValues() {
	resetUploadBtn.textContent = "Default sound";
	resetUploadBtn.value = "reset";
	panel.classList.remove("default-sound");
}

const defaultSound = "audio/alarm.mp3";
const audio = new Audio(defaultSound);
resetUploadBtn.addEventListener("click", function() {
	if (this.value === "upload") {
		// empty fileUpload.files
		fileUpload.value = "";
		fileUpload.click();

	} else {
		revertToDefault();
	}
});

function revertToDefault() {
	audio.src = defaultSound;
	speakerContainer.classList.remove("playing");
	console.log("audio state immediate", audio.paused, audio.currentTime);
	console.log("reverting to default");
	resetUploadBtn.textContent = "Custom sound";
	resetUploadBtn.value = "upload";
	panel.classList.add("default-sound");


	eventDispatcher.emit("alarm-sound:reset");
}

fileUpload.addEventListener("change", function() {
	console.log("upload change", this.files);
	if (this.files.length === 0) return;
	handleFile(this.files[0]);
	setCustomSoundValues();
});

const speakerSvg = document.getElementById("speakerSvg");
const speakerContainer = speakerSvg.parentElement;
speakerSvg.addEventListener("click", playSound);

function playSound() {
	if (audio.error || !audio.src) return;

	if (audio.paused) {
		audio.play();
	}
	else {
		audio.pause();
		audio.currentTime = 0;
	}
}

function handleFile(file) {
	console.log(file);
	const reader = new FileReader();
	reader.onload = function(e) {
		console.log("alarm-sound setting");
		eventDispatcher.emit("alarm-sound:set", audio.src = e.target.result);
		speakerContainer.classList.remove("playing");

	};
	reader.readAsDataURL(file);
}


audio.addEventListener("play", function() {
	console.log("play");
	speakerContainer.classList.add("playing");
	startSpeakerTremble();
});
audio.addEventListener("pause", function() {
	console.log("pause");
	speakerContainer.classList.remove("playing");
	stopSpeakerTremble();
});

audio.addEventListener("canplay", function() {
	console.log("canplay");
	speakerContainer.classList.remove("error");
	if(audio.paused) stopSpeakerTremble();
});
audio.addEventListener("error", function(e) {
	console.log("error", e, audio.error, "code", audio.error.code);
	speakerContainer.classList.add("error");
	stopSpeakerTremble();
});

// animate .speaker
const turbulence = document.getElementById("feTurbulence6680");
const speakerInner = document.getElementById("speakerInner");
function speakerTremble(){
	turbulence.seed.baseVal = (turbulence.seed.baseVal + 1) % 100;
	speakerInner.r.baseVal.value += speakerTremble.radCoeff * 0.5;
	if(speakerInner.r.baseVal.value > 25) speakerTremble.radCoeff = -1;
	else if(speakerInner.r.baseVal.value < 20) speakerTremble.radCoeff = 1;

	if(speakerTremble.on) requestAnimationFrame(speakerTremble);
}
speakerTremble.on = false;
speakerTremble.radCoeff = 1;
function startSpeakerTremble() {
	speakerTremble.on = true;
	turbulence.numOctaves.baseVal = 5;
	requestAnimationFrame(speakerTremble);
}
function stopSpeakerTremble() {
	speakerTremble.on = false;
	turbulence.numOctaves.baseVal = 0;
}


// drag & drop in .panel.audioControls
const panel = document.getElementById("speakerPanel");
/* events fired on the drop targets */
panel.addEventListener("dragover", function(e) {
	// prevent default to allow drop
	//console.log("dragover", e.target);
	e.stopPropagation();
	e.preventDefault();
});

panel.addEventListener("dragenter", function(e) {
	// indicate .panel as a .dropzone
	e.stopPropagation();
	e.preventDefault();
	//console.log("dragenter", e.target);
	panel.classList.add("dropzone");
});

panel.addEventListener("dragend", function(e) {
	e.stopPropagation();
	e.preventDefault();
	//console.log("dragend", e.target);
	panel.classList.remove("dropzone");
});

panel.addEventListener("dragleave", function(e) {
	e.stopPropagation();
	e.preventDefault();
	toggleDropzone(e);
});


panel.addEventListener("drop", function(e) {
	// prevent default action (open as link for some elements)
	e.stopPropagation();
	e.preventDefault();
	console.log("drop", e.target);
	panel.classList.remove("dropzone");

	const file = e.dataTransfer.files[0];
	if(file.type.indexOf("audio/") === 0) {
		handleFile(file);
		setCustomSoundValues();
	}
});

function toggleDropzone(e) {
	return panel.classList.toggle("dropzone", panel.contains(document.elementFromPoint(e.clientX, e.clientY)));
}
