class UpdateDelayer {
	constructor(rate) {
		this.rate = (rate ? rate : 0);
		this.deltaTimeSum = 0;
		this.numberOfCycles = 0;
		this.updateOffset = Math.floor(Math.random() * rate);
	}

	setRate(rate) {
		this.rate = rate;
	}

	resfreshOffset() {
		this.updateOffset = Math.floor(Math.random() * this.rate);
	}

	addDeltaTime(milliseconds) {
		this.deltaTimeSum += milliseconds;
		this.numberOfCycles++;
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

	update(callback, _deltaTime = -1) {
		let forceUpdate = null;
		if(_deltaTime >= 0){
			this.addDeltaTime(_deltaTime);
		}

		console.log(this.getDeltaTime());
		if(this.rate === 0){
			forceUpdate = true;
		}
		if (forceUpdate || this.shouldUpdate()) {
			if (callback.length === 1) {
				let cycles = this.numberOfCycles;
				this.resetNumberOfCycles();
				callback(cycles);
			} else if (callback.length === 2) {
				let cycles = this.numberOfCycles;
				let deltaTime = this.getDeltaTime();
				this.resetNumberOfCycles();
				callback(deltaTime, cycles);
			} else {
				callback();
			}
		}
	}

	shouldUpdate() {
		if (this.rate + this.updateOffset < this.deltaTimeSum + this.updateOffset) {
			this.resetDeltaTime();
			return true;
		} else {
			return false;
		}
	}
}