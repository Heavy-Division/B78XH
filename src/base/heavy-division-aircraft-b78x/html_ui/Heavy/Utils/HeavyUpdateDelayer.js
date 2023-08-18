class HeavyUpdateDelayer {
	constructor() {
		this.delay = 0;
		this.deltaTimeSum = 0;
		this.numberOfCycles = 0;
	}

	setDelay(milliseconds) {
		this.delay = milliseconds;
	}

	addDeltaTime(miliseconds) {
		this.deltaTimeSum += miliseconds;
		this.numberOfCycles++
	}

	resetDeltaTime() {
		this.deltaTimeSum = 0;
	}

	resetNumberOfCycles() {
		this.numberOfCycles = 0;
	}

	setDeltaTime(milliseconds) {
		this.deltaTimeSum = milliseconds;
	}

	getDeltaTime() {
		return this.deltaTimeSum;
	}

	update(callback) {
		if (this.shouldUpdate()) {
			if(callback.length == 1){
				let cycles = this.numberOfCycles;
				this.resetNumberOfCycles();
				callback(cycles);
			} else {
				callback();
			}
		}
	}

	shouldUpdate() {
		if (this.delay < this.deltaTimeSum) {
			this.resetDeltaTime();
			return true;
		} else {
			return false;
		}
	}
}