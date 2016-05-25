//events - a super-basic Javascript (publish subscribe) pattern

class EventDispatcher {

	constructor() {
		this.events = {};
	}

	// subscribe fn to event
	on(eventName, fn) {
		this.events[eventName] ? this.events[eventName].push(fn) : this.events[eventName] = [fn];
	}

	// unsubscribe fn from event
	off(eventName, fn) {
		if (fn == undefined) {
			// unsubscribe all
			this.events[eventName] = undefined;
			return;
		}

		let events = this.events[eventName];
		if (events) {
			let foundIndex = events.indexOf(fn);
			if (foundIndex !== -1) {
				events.splice(foundIndex, 1);
			}
		}
	}

	// fire off an event
	emit(eventName, ...data) {
		if (this.events[eventName]) {
			this.events[eventName].forEach(function(fn) {
				fn(...data);
			});
		}
	}

}

class EventfulClass {
	constructor(eventDispatcher = new EventDispatcher()) {
		if(!(eventDispatcher instanceof EventDispatcher)) throw new TypeError("eventDispatcher must be an instance of EventDispatcher");
		this._dispatcher = eventDispatcher;
	}

	get dispatcher() {
		return this._dispatcher;
	}

	on(...args) {
		this.dispatcher.on(...args);
	}

	off(...args) {
		this.dispatcher.off(...args);
	}

	emit(...args) {
		this.dispatcher.emit(...args);
	}
}


const eventDispatcher = new EventDispatcher();
