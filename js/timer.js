/**
 * Timer with several sessions in order passed to constructor, capable of dispatching events during countdown and between sessions.
 *
 * @param  options  {updateFrequency : 1, loop: true, pauseOnSessionStart: false, pauseOnSessionEnd: false, eventDispatcher: new EventDispatcher}
	* @param updateFrequency	frequency to call _decrement at on current session, in seconds
	* @param loop	whether to loop to first session upon reaching the end or not
	* @param eventDispatcher	an instance of EventDispatcher class, will be ceated if no existing EventDispatcher is passed
	* @param pauseOnSessionStart	whether to pause when changing to a new session (right after _onSessionProgress is fired, left === len)
	* @param pauseOnSessionEnd	whether to pause when currentSession has elapsed (right after _onSessionProgress is fired, left === 0)
	* @param reversed	go through sessions array in reverse
 * @param  sessions array of {name: 'work', len: 25}
	* @param name	name of the session
	* @param len	length of the session in seconds
 */
class Timer extends EventfulClass {
	// default values in destructuring assignments don't work in Firefox yet
	// constructor({updateFrequency = 1, loop = true, pauseOnSessionStart: false, pauseOnSessionEnd: false, reversed: false, eventDispatcher = new EventDispatcher()}, ...sessions)
	constructor(options, ...sessions) {
		super(options.eventDispatcher);

		const defaultOptions = {updateFrequency: 1, loop: true, pauseOnSessionStart: false, pauseOnSessionEnd: false, reversed: false};
		({updateFrequency: this._updateFrequency, loop: this._loop, pauseOnSessionStart: this._pauseOnSessionStart, pauseOnSessionEnd: this._pauseOnSessionEnd, reversed: this._reversed} = Object.assign({}, defaultOptions, options));

		this._state = "idle";

		// session = {name: 'break', len: 5[seconds] [, skip: false, pauseOnStart: false, pauseOnEnd: false]}
		this._sessions = sessions;
		const startIndex = this._reversed ? this._sessions.length - 1 : 0;
		this._currentSession = sessions[startIndex];
		this._currentSessionIndex = startIndex;

		this._sessionsByName = {};

		for(let session of sessions) {
			Timer.checkTimeValidity(session.len);
			this._sessionsByName[session.name] = session;
		}
	}

	get sessions() {
		return this._sessions;
	}

	set sessions(sessions) {
		// remove references to current sessions
		this._sessionsByName = {};
		this._sessions = sessions;
		for(let session of sessions) {
			Timer.checkTimeValidity(session.len);
			this._sessionsByName[session.name] = session;
		}

		// reset progress and order
		this._pause();
		this.reset();

		this._onSessionModified(sessions, {valueName: "new-sessions"});
	}

	isIdle() {
		return this._state === "idle";
	}

	isActive() {
		return this._state === "active";
	}

	isPaused() {
		return this._state === "paused";
	}

	addSession(session, index = this._sessions.length) {
		Timer.checkTimeValidity(session.len);
		this._sessions.splice(index, 0, session);
		this._sessionsByName[session.name] = session;

		// hotswap sessions if adding in place of currentSession
		const isCurrentSession = this._currentSessionIndex === index;
		if(isCurrentSession) {
			this._currentSession = session;

			// if countdown is in progress or paused, reset .left on the new session unless already provided
			if(this.isActive() || this.isPaused()) this._resetCurrentSessionIfElapsed();
		}

		this._onSessionModified(session, {valueName: "new-session"}, isCurrentSession);
	}

	get state() {
		return this._state;
	}

	getElapsedSessions() {
		return this._sessions.filter((session) => {return session.left === 0;});
	}

	getSession(name) {
		return this._sessionsByName[name];
	}

	getSessionIndex(name) {
		const session = this.getSession(name);
		// no session return -1 index
		if(!session) return -1;

		return this._sessions.indexOf(session);
	}

	getSessionByIndex(index) {
		return this._sessions[index];
	}

	get sessionsCount() {
		return this._sessions.length;
	}

	get currentSession() {
		return this._currentSession;
	}

	get currentSessionIndex() {
		return this._currentSessionIndex;
	}

	static checkTimeValidity(seconds) {
		if(seconds < 0 || typeof seconds !== "number") throw new RangeError("time must be a positive number");
	}

	setLength(seconds, name = this._currentSession.name, resetCurrentSession = false) {
		Timer.checkTimeValidity(seconds);
		const settingSession = this._sessionsByName[name];
		if(!settingSession) return;

		const modification = {valueName: "len", oldValue: settingSession.len, newValue: seconds};
		settingSession.len = seconds;

		const isCurrentSession = settingSession === this._currentSession;
		if(isCurrentSession && resetCurrentSession) this.resetCurrentSession();

		// first inform of modification
		this._onSessionModified(settingSession, modification, isCurrentSession);
		// then skip if necessary
		if(seconds === 0 && isCurrentSession) this._sessionTransition();
	}

	setTimeLeft(seconds, name = this._currentSession.name) {
		Timer.checkTimeValidity(seconds);
		const settingSession = this._sessionsByName[name];
		if(!settingSession) return;

		const modification = {valueName: "left", oldValue: settingSession.left, newValue: seconds};
		settingSession.left = seconds;

		const isCurrentSession = settingSession === this._currentSession;

		// first inform of modification
		this._onSessionModified(settingSession, modification, isCurrentSession);
		// then skip if necessary
		if(seconds === 0 && isCurrentSession) this._sessionTransition();
	}

	get updateFrequency() {
		return this._updateFrequency;
	}

	set updateFrequency(freq) {
		Timer.checkTimeValidity(freq);
		const modification = {valueName: "updateFrequency", oldValue: this._updateFrequency, newValue: freq};
		this._updateFrequency = freq;

		this._onOptionsModified(modification);
		// restart interval timer with new frequency if in progress
		if(this.isActive()) {
			this._pause();
			this._resume();
		}
	}

	get loop() {
		return this._loop;
	}

	set loop(loop) {
		const modification = {valueName: "loop", oldValue: this._loop, newValue: loop};
		this._loop = loop;

		this._onOptionsModified(modification);
	}

	get reversed() {
		return this._reversed;
	}

	set reversed(reversed) {
		const modification = {valueName: "reversed", oldValue: this._reversed, newValue: reversed};
		this._reversed = reversed;

		this._onOptionsModified(modification);
	}

	get pauseOnSessionStart() {
		return this._pauseOnSessionStart;
	}

	set pauseOnSessionStart(pause) {
		const modification = {valueName: "pauseOnSessionStart", oldValue: this._pauseOnSessionStart, newValue: pause};
		this._pauseOnSessionStart = pause;

		this._onOptionsModified(modification);
	}

	get pauseOnSessionEnd() {
		return this._pauseOnSessionEnd;
	}

	set pauseOnSessionEnd(pause) {
		const modification = {valueName: "pauseOnSessionEnd", oldValue: this._pauseOnSessionEnd, newValue: pause};
		this._pauseOnSessionEnd = pause;

		this._onOptionsModified(modification);
	}

	setSessionToSkip(skip = true, name = this._currentSession.name) {
		const settingSession = this._sessionsByName[name];
		if(!settingSession) return;

		const modification = {valueName: "skip", oldValue: settingSession.skip, newValue: skip};
		settingSession.skip = skip;

		const isCurrentSession = settingSession === this._currentSession;

		// first inform of modification
		this._onSessionModified(settingSession, modification, isCurrentSession);
		// then skip if necessary
		if(skip && isCurrentSession) this._sessionTransition();
	}

	setSessionToPauseOnStart(pause = true, name = this._currentSession.name) {
		const settingSession = this._sessionsByName[name];
		if(!settingSession) return;

		const modification = {valueName: "pauseOnStart", oldValue: settingSession.pauseOnStart, newValue: pause};
		settingSession.pauseOnStart = pause;

		const isCurrentSession = settingSession === this._currentSession;

		// first inform of modification
		this._onSessionModified(settingSession, modification, isCurrentSession);
	}

	setSessionToPauseOnEnd(pause = true, name = this._currentSession.name) {
		const settingSession = this._sessionsByName[name];
		if(!settingSession) return;

		const modification = {valueName: "pauseOnEnd", oldValue: settingSession.pauseOnEnd, newValue: pause};
		settingSession.pauseOnEnd = pause;

		const isCurrentSession = settingSession === this._currentSession;

		// first inform of modification
		this._onSessionModified(settingSession, modification, isCurrentSession);
	}

	start(reason = "called-from-without") {
		// pause in case active
		this._pause();
		this.reset();
		this.resume(reason);
	}

	startFromSession(name, reason = "called-from-without") {
		// pause in case active
		this._pause();

		const session = this.getSession(name);
		if(!session) return;

		this._currentSession = session;
		this._currentSessionIndex = this._sessions.indexOf(session);
		this.resetCurrentSession();
		this.resume(reason);
	}

	stop(reason = "called-from-without") {
		const prevState = this._state;
		this._pause();
		this.resetOrder();
		this._state = "idle";

		this._onStateChanged(prevState, reason);
	}

	pause(reason = "called-from-without") {
		const prevState = this._state;
		this._pause();
		this._state = "paused";

		this._onStateChanged(prevState, reason);
	}

	_pause() {
		clearInterval(this.intervalId);
	}

	resume(reason = "called-from-without") {
		// if session is null (when all sessions elapsed and loop === false)
		if(!this._currentSession) return;

		const prevState = this._state;
		this._resume();
		this._state = "active";

		this._onStateChanged(prevState, reason);
	}

	_resume() {
		// first report current/starting progress
		this._onSessionProgress();
		this.intervalId = setInterval(this._decrement.bind(this), this._updateFrequency * 1000); //updateFrequency is in seconds
	}

	reset() {
		this.resetOrder();
		this.resetCurrentSession();
	}

	resetOrder() {
		const startIndex = this._reversed ? this._sessions.length - 1 : 0;
		this._currentSession = this._sessions[startIndex];
		this._currentSessionIndex = startIndex;
	}

	resetCurrentSession() {
		// don't manipulate a null session
		if(!this._currentSession) return;
		this._currentSession.left = this._currentSession.len;
	}

	_resetCurrentSessionIfElapsed() {
		// don't reset if session.left was set to something else (by the user)
		const left = this._currentSession.left;
		if(left === undefined || left <= 0) this.resetCurrentSession();
	}

	_decrement() {
		// if starting with no seconds left, which can happen if session was paused-on-end
		if(this._currentSession.left <= 0) this._sessionTransition();

		this._currentSession.left -= this._updateFrequency;
		console.log("left", this._currentSession.left, ", freq", this._updateFrequency);

		// don't actually let it go below 0
		if(this._currentSession.left < 0) this._currentSession.left = 0;

		this._onSessionProgress();

		// if timer elapsed
		if(this._currentSession.left === 0) {
			// pause if required to at the end of session in progress
			if(this._pauseOnEndIfRequired()) return;
			this._sessionTransition();
		}
	}

	_sessionTransition() {
		this._goToNextSession("previous-session-ended");

		// if no next session for whatever reason
		if(this._currentSession == null) this.stop("no-next-session");
		// otherwise reset countdown
		else {
			this._resetCurrentSessionIfElapsed();
			// first report current/starting progress
			this._onSessionProgress();
			// pause if required at the start of new session
			this._pauseOnStartIfRequired();
		}
	}

	_goToNextSession(reason) {
		const prevSession = {session: this._currentSession, index: this._currentSessionIndex};
		({index: this._currentSessionIndex, session: this._currentSession} = this._getNextSession());
		if(this._currentSession) this._resetCurrentSessionIfElapsed();
		this._onSessionChanged(prevSession, reason);
	}

	_getNextSession() {
		let nextSessionIndex = this._currentSessionIndex;

		let nextSession;

		// look for the next non-skipped session in order of this.session
		do {
			this._reversed ? --nextSessionIndex : ++nextSessionIndex;
			// reached last session, loop to start
			if(nextSessionIndex === this._sessions.length || nextSessionIndex === -1) {
				nextSessionIndex = this._reversed ? this._sessions.length - 1 : 0;

				// unless loop option is false
				if(!this._loop) {
					nextSession = null;
					break;
				}
			}

			// looped already to where started, no available sessions found
			if(nextSessionIndex === this._currentSessionIndex) {
				nextSessionIndex = this._reversed ? this._sessions.length - 1 : 0;
				nextSession = null;
				break;
			}

			nextSession = this._sessions[nextSessionIndex];
		} while(nextSession.skip);

		return {index: nextSessionIndex, session: nextSession};
	}

	skipToNextSession(thenPause = false, resetCurrent = true) {
		this._skipSession(thenPause, resetCurrent, "skipped-to-next-session");
	}

	_skipSession(thenPause, resetCurrent, reason) {
		// reset, then skip
		if(resetCurrent) this.resetCurrentSession();
		this._goToNextSession(reason);
		this.resetCurrentSession();

		// if no next session for whatever reason
		if(this._currentSession == null) return this.stop("no-next-session");

		this._onSessionProgress();

		if(thenPause) this.pause("paused-on-start");
	}

	skipToPreviousSession(thenPause = false, resetCurrent = true) {
		// reverse direction
		this._reversed = !this._reversed;

		this._skipSession(thenPause, resetCurrent, "skipped-to-previous-session");

		// restore direction
		this._reversed = !this._reversed;
	}

	_pauseOnStartIfRequired() {
		const paused = this._pauseOnSessionStart || this._currentSession.pauseOnStart;
		if(paused) this.pause("paused-on-start");

		return paused;
	}

	_pauseOnEndIfRequired() {
		const paused = this.pauseOnSessionEnd || this._currentSession.pauseOnEnd;
		if(paused) this.pause("paused-on-end");

		return paused;
	}

	_onStateChanged(previousState, reason) {
		console.log("timer:state-changed", this._currentSession.name, previousState, "=>", this._state);
		this.emit("timer:state-changed", {previousState, currentState: this._state, session: this._currentSession, index: this._currentSessionIndex, reason});
	}

	_onSessionChanged(ended, reason) {
		console.log('timer:session-changed', ended.session, ended.index, "=>", this._currentSession, this._currentSessionIndex);
		this.emit('timer:session-changed', {ended, started: {session: this._currentSession, index: this._currentSessionIndex}, reason});
	}

	_onSessionProgress() {
		console.log("timer:session-in-progress", this._currentSession.name, this._currentSession.left);
		this.emit("timer:session-in-progress", {session: this._currentSession, index: this._currentSessionIndex});
	}

	// fired on setting len, left, skip values or adding a new session via instance methods (not directly through inst.sessions[0].len = ...)
	_onSessionModified(session, modification, isCurrentSession) {
		//  modification is of form {valueName: "new-session"} or {valueName: "[value name], oldValue: [number], newValue: [number]"}
		console.log("session", session.name, "modified", modification, ", isCurrentSession", isCurrentSession);
		this.emit("timer:session-modified", {session, modification, isCurrentSession, timerState: this.state});
	}

	// fired on setting updateFrequency and loop values
	_onOptionsModified(modification) {
		//  modification is of form {valueName: "[value name], oldValue: [number], newValue: [number]"}
		console.log("timer:options-modified", modification, this.state);
		this.emit("timer:options-modified", {modification, timerState: this.state});
	}

}

const pomodoroTimer = new Timer({eventDispatcher}, {name: "work", len: getWorkTimeSetting()*60}, {name: "break", len: getBreakTimeSetting()*60});


eventDispatcher.on('work-timer:time-set', (seconds) => {
	pomodoroTimer.setLength(seconds, "work", true);
});
eventDispatcher.on('break-timer:time-set', (seconds) => {
	pomodoroTimer.setLength(seconds, "break", true);
});

eventDispatcher.on('tomato-big-button-clicked', () => {
	switch (pomodoroTimer.state) {
	case "idle":
		pomodoroTimer.start();
		break;
	case "active":
		pomodoroTimer.pause();
		break;
	case "paused":
		pomodoroTimer.resume();
		break;
	default:
		return;
	}
});

eventDispatcher.on('check-pause-on-break-start:changed', (on) => {
	pomodoroTimer.setSessionToPauseOnStart(on, "break");
});
eventDispatcher.on('check-pause-on-work-start:changed', (on) => {
	pomodoroTimer.setSessionToPauseOnStart(on, "work");
});

eventDispatcher.on('skip-session-button-clicked', (on) => {
	pomodoroTimer.skipToNextSession(true);
});
