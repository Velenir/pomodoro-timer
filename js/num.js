// REMOVE file

(function () {

	document.getElementById('num').onchange = function () {
		eventDispatcher.emit('minutes-left', this.value);
	};

})();
