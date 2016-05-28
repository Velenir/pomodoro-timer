class Timer extends EventfulClass {
	constructor({updateFrequency = 1000, loop = true, eventDispatcher = new EventDispatcher()}, ...sessions) {
		super(eventDispatcher);

		this.updateFrequency = updateFrequency;
		this.loop = loop;
		this._state = "idle";

		// session = {name: 'break', len: 5*3600[seconds] [, skip: false]}
		this._sessions = sessions;
		this._currentSession = sessions[0];
		this._currentSessionNumber = 0;

		for(let session of sessions) {
			this._sessionsByName[session.name] = session;
		}
	}

	get sessions() {
		return this._sessions;
	}

	get state() {
		return this._state;
	}

	getElapsedSessions() {
		this.sessions.filter((session) => {return session.left === 0;});
	}

	getSession(name) {
		return this._sessionsByName[name];
	}

	setLength(seconds, name = this._currentSession.name) {
		const settingSession = this._sessionsByName[name];
		settingSession.len = seconds;
		if(seconds === 0 && settingSession === this._currentSession) this.goToNextSession();
	}

	setTimeLeft(seconds, name = this._currentSession.name) {
		const settingSession = this._sessionsByName[name];
		settingSession.left = seconds;
		if(seconds === 0 && settingSession === this._currentSession) this.goToNextSession();
	}

	set updateFrequency(freq) {
		this.pause();
		this.updateFrequency = freq;
		this.resume();
	}

	setSessionToSkip(skip = true, name = this._currentSession.name) {
		const settingSession = this._sessionsByName[name];
		settingSession.skip = skip;
		if(skip && settingSession === this._currentSession) this.goToNextSession();
	}

	start() {
		this.reset();
		this.resetCurrentSession();
		this.resume();
	}

	stop() {
		this.pause();
		this.reset();
		this._state = "idle";
	}

	pause() {
		clearInterval(this.intervalId);
		this._state = "paused";
	}

	resume() {
		this.intervalId = setInterval(this._decrement.bind(this), this.updateFrequency);
		this._state = "active";
	}

	reset() {
		this._currentSession = this.sessions[0];
		this._currentSessionNumber = 0;
	}

	resetCurrentSession() {
		this._currentSession.left = this._currentSession.len;
	}

	_decrement() {
		let secondsLeft = --this._currentSession.left;

		// if timer elapsed
		if(secondsLeft <= 0) {
			this.goToNextSession();

			// if no next session for whatever reason
			if(this._currentSession == null) this.stop();
			// otherwise set countdown to timer's length
			else this.resetCurrentSession();
		}
	}

	goToNextSession() {
		({number: this._currentSessionNumber, session: this._currentSession} = this._getNextSession());
	}

	_getNextSession() {
		let nextSessionNumber = this._currentSessionNumber;

		let nextSession;

		// look for the next non-skipped session in order of this.session
		do {
			++nextSessionNumber;
			// reached last session, loop to start
			if(nextSessionNumber === this.sessions.length) {
				nextSessionNumber = 0;

				// unless loop option is false
				if(!this.loop) {
					nextSession = null;
					break;
				}
			}

			// looped already to where started, no available sessions found
			if(nextSessionNumber === this._currentSessionNumber) {
				nextSessionNumber = 0;
				nextSession = null;
				break;
			}

			nextSession = this.sessions[nextSessionNumber];
		} while(!nextSession.skip);

		return {number: nextSessionNumber, session: nextSession};
	}

}
