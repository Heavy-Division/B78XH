class B787_10_FMC_PayloadManagerPage {

	static get tankCapacity() {
		return {
			'CENTER': 22244,
			'LEFT_MAIN': 5570,
			'RIGHT_MAIN': 5570
		};
	}

	static get tankPriority() {
		return [['LEFT_MAIN', 'RIGHT_MAIN'], ['CENTER']];
	}

	static get tankVariables() {
		return {
			'CENTER': 'FUEL TANK CENTER QUANTITY',
			'LEFT_MAIN': 'FUEL TANK LEFT MAIN QUANTITY',
			'RIGHT_MAIN': 'FUEL TANK RIGHT MAIN QUANTITY',
		};
	}

	static get payloadIndex() {
		return {
			'PILOT': 1,
			'COPILOT': 2,
			'BUSINESS_CLASS': 3,
			'PREMIUM_ECONOMY': 4,
			'ECONOMY_CLASS': 5,
			'FORWARD_BAGGAGE': 6,
			'REAR_BAGGAGE': 7
		};
	}

	static get isPayloadManagerExecuted() {
		return this._isPayloadManagerExecuted;
	}

	static set isPayloadManagerExecuted(value) {
		this._isPayloadManagerExecuted = value;
	}

	static get centerOfGravity() {
		return this._centerOfGravity;
	}

	static set centerOfGravity(value) {
		this._centerOfGravity = value;
	}

	static get requestedCenterOfGravity() {
		return this._requestedCenterOfGravity || null;
	}

	static set requestedCenterOfGravity(value) {
		this._requestedCenterOfGravity = value;
	}

	static get requestedFuel() {
		return this._requestedFuel || null;
	}

	static set requestedFuel(value) {
		this._requestedFuel = value;
	}

	static get requestedPayload() {
		return this._requestedPayload || null;
	}

	static set requestedPayload(value) {
		this._requestedPayload = value;
	}

	static get remainingPayload() {
		return this._remainingPayload || null;
	}

	static set remainingPayload(value) {
		this._remainingPayload = value;
	}

	static get getMaxFuel() {
		let maxGallons = SimVar.GetSimVarValue('FUEL TOTAL CAPACITY', 'Gallons');
		if(B787_10_FMC_HeavyConfigurationPage.useImperial()) {
			return maxGallons;
		}
		return (maxGallons * SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'kilograms')).toFixed(2);
	}

	static get getMinFuel(){
		return 0;
	}

	static get getMaxPayload(){
		if(B787_10_FMC_HeavyConfigurationPage.useImperial()) {
			return 560001; //lbs
		}
		return 254011; //kgs
	}

	static get getMinPayload(){
		return 0;
	}

	static get getMaxCenterOfGravity(){
		return 100;
	}

	static get getMinCenterOfGravity(){
		return 0;
	}

	static set weightUnitsSystem(value){
		this._weightUnitsSystem = value;
	}

	static get weightUnitsSystem(){
		return this._weightUnitsSystem;
	}

	constructor(fmc) {
		this.fmc = fmc;
		this.tankPriorityValues = [];
		this.payloadValues = [];
		this.init();
	}

	init(){
		this.tankPriorityValues = [
			{
				'LEFT_MAIN': this.getTankValue(B787_10_FMC_PayloadManagerPage.tankVariables.LEFT_MAIN),
				'RIGHT_MAIN': this.getTankValue(B787_10_FMC_PayloadManagerPage.tankVariables.RIGHT_MAIN),
			},
			{'CENTER': this.getTankValue(B787_10_FMC_PayloadManagerPage.tankVariables.CENTER)}
		];

		this.payloadValues = this.getPayloadValues();

		B787_10_FMC_PayloadManagerPage.centerOfGravity = this.getCenterOfGravity();
	}

	getPayloadValues() {
		return [
			{
				'PILOT': this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.PILOT),
				'COPILOT': this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.COPILOT)
			},
			{
				'BUSINESS_CLASS': this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.BUSINESS_CLASS),
				'PREMIUM_ECONOMY': this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.PREMIUM_ECONOMY),
				'FORWARD_BAGGAGE': this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.FORWARD_BAGGAGE)
			},
			{
				'ECONOMY_CLASS': this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.ECONOMY_CLASS),
				'REAR_BAGGAGE': this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.REAR_BAGGAGE),
			}
		];
	}

	getPayloadValue(index) {
		let um = 'kilograms';
		if(B787_10_FMC_HeavyConfigurationPage.useImperial()) {
			um = 'Pounds';
		}
		return SimVar.GetSimVarValue('PAYLOAD STATION WEIGHT:' + index, um);
	}

	async setPayloadValue(index, value) {
		let um = 'kilograms';
		if(B787_10_FMC_HeavyConfigurationPage.useImperial()) {
			um = 'Pounds';
		}
		return SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:' + index, um, value);
	}

	getTankValue(variable) {
		return SimVar.GetSimVarValue(variable, 'Gallons');
	}

	getCenterOfGravity() {
		return SimVar.GetSimVarValue('CG PERCENT', 'Percent');
	}

	getTotalPayload() {
		let payload = 0;
		this.payloadValues.forEach((group) => {
			Object.values(group).forEach((sectionValue) => {
				payload = payload + sectionValue;
			});
		});
		return payload;
	}

	getTotalFuel(useLbs = false) {
		let fuel = 0;
		this.tankPriorityValues.forEach((group) => {
			Object.values(group).forEach((sectionValue) => {
				fuel = fuel + sectionValue;
			});
		});
		return (useLbs ? fuel * SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'Pounds') : fuel);
	}

	async flushFuelAndPayload(){
		return new Promise(resolve => {
			this.flushFuel().then(() => {
				return this.resetPayload();
			}).then(() => {
				return this.fmc.getCurrentWeight(true);
			}).then( weight => {
				return this.fmc.setZeroFuelWeight((298700 + B787_10_FMC_PayloadManagerPage.requestedPayload) / 1000, EmptyCallback.Void, true)
			}).then(() => {
				return this.resetPayload();
			}).then(() => {
				resolve();
			})
		});
	}

	async flushFuel() {
		return new Promise( resolve => {
			let setTankFuel = async (variable, gallons) => {
				SimVar.SetSimVarValue(variable, 'Gallons', gallons);
			}

			B787_10_FMC_PayloadManagerPage.tankPriority.forEach((tanks, index) => {
				tanks.forEach((tank) => {
					setTankFuel(B787_10_FMC_PayloadManagerPage.tankVariables[tank], 0).then(() => {
						console.log(B787_10_FMC_PayloadManagerPage.tankVariables[tank] + " flushed");
					});
				});
			});
			this.fmc.trySetBlockFuel(0, true)
			resolve();
		});
	}



	calculateTanks(fuel) {
		this.tankPriorityValues[0].LEFT_MAIN = 0;
		this.tankPriorityValues[1].CENTER = 0;
		this.tankPriorityValues[0].RIGHT_MAIN = 0;

		fuel = this.calculateMainTanks(fuel);
		fuel = this.calculateCenterTank(fuel);

		let fuelBlock = 0;

		let setTankFuel = async (variable, gallons) => {
			fuelBlock += gallons;
			SimVar.SetSimVarValue(variable, 'Gallons', gallons);
		}

		B787_10_FMC_PayloadManagerPage.tankPriority.forEach((tanks, index) => {
			tanks.forEach((tank) => {
				setTankFuel(B787_10_FMC_PayloadManagerPage.tankVariables[tank], this.tankPriorityValues[index][tank]).then(() => {
					console.log(B787_10_FMC_PayloadManagerPage.tankVariables[tank] + " set to " + this.tankPriorityValues[index][tank]);
				});
			});
		});

		this.fmc.trySetBlockFuel(fuelBlock * SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'Pounds') / 1000, true);
	}

	calculateMainTanks(fuel) {
		let remainingFuel = 0;
		let tanksCapacity = (B787_10_FMC_PayloadManagerPage.tankCapacity.LEFT_MAIN * 2);

		if (fuel > tanksCapacity) {
			remainingFuel = fuel - tanksCapacity;
			fuel = tanksCapacity;
		}

		let reminder = fuel % 2;
		let quotient = (fuel - reminder) / 2;

		this.tankPriorityValues[0].LEFT_MAIN = quotient;
		this.tankPriorityValues[0].RIGHT_MAIN = quotient;

		if (reminder) {
			this.tankPriorityValues[0].LEFT_MAIN++;
			reminder--;
		}
		if (reminder) {
			this.tankPriorityValues[0].RIGHT_MAIN++;
			reminder--;
		}

		return remainingFuel;
	}

	calculateCenterTank(fuel) {
		let remainingFuel = 0;
		let tankCapacity = B787_10_FMC_PayloadManagerPage.tankCapacity.CENTER;

		if (fuel > tankCapacity) {
			remainingFuel = fuel - tankCapacity;
			fuel = tankCapacity;
		}

		this.tankPriorityValues[1].CENTER = fuel;

		return remainingFuel;
	}

	showPage() {
		this.fmc.clearDisplay();

		this.payloadValues = this.getPayloadValues();

		if (!B787_10_FMC_PayloadManagerPage.requestedPayload) {
			B787_10_FMC_PayloadManagerPage.requestedPayload = this.getTotalPayload();
		}

		if (!B787_10_FMC_PayloadManagerPage.requestedCenterOfGravity) {
			B787_10_FMC_PayloadManagerPage.requestedCenterOfGravity = this.getCenterOfGravity();
		}

		if (!B787_10_FMC_PayloadManagerPage.requestedFuel) {
			B787_10_FMC_PayloadManagerPage.requestedFuel = (this.getTotalFuel() * (B787_10_FMC_HeavyConfigurationPage.useImperial() ? 1.0 : SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'kilograms')));
		}

		if (B787_10_FMC_PayloadManagerPage.isPayloadManagerExecuted) {
			this.fmc.pageUpdate = () => {
				this.showPage();
			}
		}
		let rows = [['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', '']];


		/**
		 * The string should be set to "PAYLOAD (Pounds)" for right side but has to be set to "(PAYLOAD (Pounds"
		 * Why: MSFS process the string
		 * Examples:
		 * "(PAYLOAD (Pounds" -> "PAYLOAD (Pounds)"
		 * "PAYLOAD (Pounds)" -> "(PAYLOAD (Pounds"
		 * "100000 lbs" -> "lbs 100000"
		 * "lbs 100000" => "lbs 100000"
		 */

		rows[0][0] = 'PAYLOAD MANAGER';
		rows[1][0] = 'REQ VALUES';
		rows[1][1] = 'ACT VALUES';
		rows[3][0] = 'CG';
		rows[3][1] = 'CG';
		rows[4][0] = (B787_10_FMC_PayloadManagerPage.requestedCenterOfGravity ? B787_10_FMC_PayloadManagerPage.requestedCenterOfGravity.toFixed(2) + '%' : B787_10_FMC_PayloadManagerPage.centerOfGravity.toFixed(2) + '%');
		rows[4][1] = this.getCenterOfGravity().toFixed(2) + '%';
		rows[5][0] = 'FOB (' + (B787_10_FMC_HeavyConfigurationPage.useImperial() ? 'Gallons' : 'Kg') + ')';
		rows[5][1] = '(FOB (' + (B787_10_FMC_HeavyConfigurationPage.useImperial() ? 'Gallons' : 'Kg');
		rows[6][0] = B787_10_FMC_PayloadManagerPage.requestedFuel ? B787_10_FMC_PayloadManagerPage.requestedFuel.toFixed(2) : (this.getTotalFuel() * (B787_10_FMC_HeavyConfigurationPage.useImperial() ? 1.0 : SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'kilograms'))).toFixed(2);
		rows[6][1] = (this.getTotalFuel() * (B787_10_FMC_HeavyConfigurationPage.useImperial() ? 1.0 : SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'kilograms'))).toFixed(2);
		rows[7][0] = 'PAYLOAD (' + (B787_10_FMC_HeavyConfigurationPage.useImperial() ? 'Pounds' : 'Kg') + ')';
		rows[7][1] = '(PAYLOAD (' + (B787_10_FMC_HeavyConfigurationPage.useImperial() ? 'Pounds' : 'Kg');
		rows[8][0] = (B787_10_FMC_PayloadManagerPage.requestedPayload ? B787_10_FMC_PayloadManagerPage.requestedPayload.toFixed(0) : (this.getTotalPayload()).toFixed(0));
		rows[8][1] = this.getTotalPayload().toFixed(0);
		rows[9][0] = (B787_10_FMC_PayloadManagerPage.remainingPayload ? 'REMAINING PAYLOAD' : '');
		rows[10][0] = (B787_10_FMC_PayloadManagerPage.remainingPayload ? (B787_10_FMC_HeavyConfigurationPage.useImperial() ? (B787_10_FMC_PayloadManagerPage.remainingPayload + ' lb') : ((B787_10_FMC_PayloadManagerPage.remainingPayload * 0.453592).toFixed(0) + ' kg')) : '');


		rows[12][0] = '\<BACK';


		this.fmc.onLeftInput[1] = () => {
			if(isFinite(parseFloat(this.fmc.inOut))){
				if(parseFloat(this.fmc.inOut) > B787_10_FMC_PayloadManagerPage.getMinCenterOfGravity && parseFloat(this.fmc.inOut) < B787_10_FMC_PayloadManagerPage.getMaxCenterOfGravity){
					B787_10_FMC_PayloadManagerPage.requestedCenterOfGravity = parseFloat(this.fmc.inOut);
					this.fmc.clearUserInput();
					this.showPage();
				} else {
					this.fmc.showErrorMessage("OUT OF RANGE")
					return false;
				}
			} else {
				this.fmc.showErrorMessage(this.fmc.defaultInputErrorMessage)
				return false;
			}
		};

		this.fmc.onLeftInput[2] = () => {
			if(isFinite(parseFloat(this.fmc.inOut))){
				if(parseFloat(this.fmc.inOut) > B787_10_FMC_PayloadManagerPage.getMinFuel && parseFloat(this.fmc.inOut) < B787_10_FMC_PayloadManagerPage.getMaxFuel){
					B787_10_FMC_PayloadManagerPage.requestedFuel = parseFloat(this.fmc.inOut);
					this.fmc.clearUserInput();
					this.showPage();
				} else {
					this.fmc.showErrorMessage("OUT OF RANGE")
					return false;
				}
			} else {
				this.fmc.showErrorMessage(this.fmc.defaultInputErrorMessage)
				return false;
			}
		};

		this.fmc.onLeftInput[3] = () => {
			if(isFinite(parseFloat(this.fmc.inOut))){
				if(parseFloat(this.fmc.inOut) > B787_10_FMC_PayloadManagerPage.getMinPayload && parseFloat(this.fmc.inOut) < B787_10_FMC_PayloadManagerPage.getMaxPayload){
					B787_10_FMC_PayloadManagerPage.requestedPayload = parseFloat(this.fmc.inOut);
					this.fmc.clearUserInput();
					this.showPage();
				} else {
					this.fmc.showErrorMessage("OUT OF RANGE")
					return false;
				}
			} else {
				this.fmc.showErrorMessage(this.fmc.defaultInputErrorMessage)
				return false;
			}
		};

		this.fmc.onLeftInput[5] = () => {
			B787_10_FMC_HeavyPage.ShowPage1(this.fmc)
		};

		if(B787_10_FMC_PayloadManagerPage.isPayloadManagerExecuted){
			rows[12][1] = 'RUNNING...'
		} else {
			rows[12][1] = '<EXECUTE';
			this.fmc.onRightInput[5] = () => {
				B787_10_FMC_PayloadManagerPage.isPayloadManagerExecuted = true;

				let requestedFuel = B787_10_FMC_PayloadManagerPage.requestedFuel;
				// if metric system in use, convert fuel from kgs to gallons
				if(!B787_10_FMC_HeavyConfigurationPage.useImperial()) {
					if(requestedFuel) {
						requestedFuel /= SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'kilograms');
					}
				}

				this.flushFuelAndPayload().then(() => {
					if (requestedFuel) {
						this.calculateTanks(requestedFuel);
					} else {
						this.calculateTanks(this.getTotalFuel());
					}

					if (B787_10_FMC_PayloadManagerPage.requestedPayload) {
						this.calculatePayload(B787_10_FMC_PayloadManagerPage.requestedPayload).then(() => {
							B787_10_FMC_PayloadManagerPage.isPayloadManagerExecuted = false;
						});
					} else {
						this.calculatePayload(this.getTotalPayload()).then(() => {
							B787_10_FMC_PayloadManagerPage.isPayloadManagerExecuted = false;
						});
					}
					this.showPage();
				});
			};
		}

		this.fmc.setTemplate(rows);
		this.fmc.updateSideButtonActiveStatus();
	}

	async resetPayload() {
		await this.setPayloadValue(1, 0);
		await this.setPayloadValue(2, 0);
		await this.setPayloadValue(3, 0);
		await this.setPayloadValue(4, 0);
		await this.setPayloadValue(5, 0);
		await this.setPayloadValue(6, 0);
		await this.setPayloadValue(7, 0);
	}

	async calculatePayload(requestedPayload) {
		await this.resetPayload();
		B787_10_FMC_PayloadManagerPage.remainingPayload = requestedPayload;
		let amount = 0;
		let requestedCenterOfGravity = (B787_10_FMC_PayloadManagerPage.requestedCenterOfGravity ? B787_10_FMC_PayloadManagerPage.requestedCenterOfGravity : this.getCenterOfGravity());

		while (B787_10_FMC_PayloadManagerPage.remainingPayload > 0) {
			B787_10_FMC_PayloadManagerPage.centerOfGravity = this.getCenterOfGravity();
			if (B787_10_FMC_PayloadManagerPage.remainingPayload > 30000) {
				amount = 1000;
			} else if (B787_10_FMC_PayloadManagerPage.remainingPayload > 10000) {
				amount = 200;
			} else if (B787_10_FMC_PayloadManagerPage.remainingPayload > 5000) {
				amount = 100;
			} else if (B787_10_FMC_PayloadManagerPage.remainingPayload > 50) {
				amount = 50;
			} else {
				amount = B787_10_FMC_PayloadManagerPage.remainingPayload;
			}

			if (B787_10_FMC_PayloadManagerPage.centerOfGravity > requestedCenterOfGravity) {
				await this.increaseFrontPayload(amount, requestedCenterOfGravity);
				B787_10_FMC_PayloadManagerPage.remainingPayload = B787_10_FMC_PayloadManagerPage.remainingPayload - amount;
			} else {
				await this.increaseRearPayload(amount, requestedCenterOfGravity);
				B787_10_FMC_PayloadManagerPage.remainingPayload = B787_10_FMC_PayloadManagerPage.remainingPayload - amount;
			}

		}
	}

	async increaseFrontPayload(amount, requestedCenterOfGravity) {
		let keys = Object.keys(this.payloadValues[1]);
		let randomFront;
		let actualValue;
		if (B787_10_FMC_PayloadManagerPage.centerOfGravity > (requestedCenterOfGravity + 0.05)) {
			actualValue = this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.BUSINESS_CLASS);
			await this.setPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.BUSINESS_CLASS, amount + actualValue);
		} else if (B787_10_FMC_PayloadManagerPage.centerOfGravity > (requestedCenterOfGravity + 0.01)) {
			randomFront = keys[Math.floor(Math.random() * keys.length)];
			actualValue = this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex[randomFront]);
			await this.setPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex[randomFront], amount + actualValue);
		} else {
			actualValue = this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.PREMIUM_ECONOMY);
			await this.setPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.PREMIUM_ECONOMY, amount + actualValue);
		}
	}

	async increaseRearPayload(amount, requestedCenterOfGravity) {
		let keys = Object.keys(this.payloadValues[2]);
		let randomRear;
		let actualValue;
		if (B787_10_FMC_PayloadManagerPage.centerOfGravity < (requestedCenterOfGravity - 0.05)) {
			actualValue = this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.REAR_BAGGAGE);
			await this.setPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.REAR_BAGGAGE, amount + actualValue);
		} else if (B787_10_FMC_PayloadManagerPage.centerOfGravity < (requestedCenterOfGravity - 0.01)) {
			randomRear = keys[Math.floor(Math.random() * keys.length)];
			actualValue = this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex[randomRear]);
			await this.setPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex[randomRear], amount + actualValue);
		} else {
			actualValue = this.getPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.ECONOMY_CLASS);
			await this.setPayloadValue(B787_10_FMC_PayloadManagerPage.payloadIndex.ECONOMY_CLASS, amount + actualValue);
		}
	}
}