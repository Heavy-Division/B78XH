Include.addScript('/B78XH/Systems/B78XH_APUInfo.js');

class B78XH_APU extends B78XH_APUInfo {

	constructor() {
		super(...arguments);
		this.apuEGT = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
		this.apuRPM = SimVar.GetSimVarValue(B78XH_LocalVariables.APU.RPM, 'Percent');
		this.apuLastRPM = this.apuRPM;
		this.apuSwitchPosition = SimVar.GetSimVarValue(B78XH_LocalVariables.APU.SWITCH_STATE, 'Bool');
		this.isApuRunning = this.apuRPM > 85;
		this.apuStatus = null;
		this.apuOilPress = 5;
		this.apuOilTemp = 15;
	}

	update(_deltaTime, delayInMilliseconds){
		this.updateApuRPM();
		this.updateApuStatus();
		this.updateApuEGT();
		this.updateApuOilPress();
		this.updateApuOilTemp();
	}

	updateApuStatus() {
		/**
		 * 0 - APU shutting down
		 * 1 - APU starting
		 */
		if (this.apuLastRPM > this.apuRPM && this.apuRPM < 85) {
			this.apuStatus = 0;
		} else if (this.apuRPM < 5) {
			this.apuStatus = 0;
		} else {
			this.apuStatus = 1;
		}
	}

	updateApuEGT() {
		let base = 0.3;
		let apuRPM = this.getApuRPM(true);
		let ambientTemperature = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'Celsius');

		if (this.apuStatus === 0) {
			base = 0.1;
			this.apuEGT = this.apuEGT - (base * (1 - apuRPM));
			if (this.apuEGT < ambientTemperature) {
				this.apuEGT = ambientTemperature;
			}
		} else {
			this.apuEGT = this.apuEGT + (base * apuRPM);
			if (this.apuEGT > 305 + ambientTemperature) {
				this.apuEGT = 305 + ambientTemperature;
			}
		}
		this.setEGT(this.apuEGT);
	}

	updateApuRPM() {
		this.apuLastRPM = this.apuRPM;
		this.apuRPM = this.getApuRPM();
	}

	updateApuOilPress() {
		let base = 0.4;
		let apuRPM = this.getApuRPM(true);
		if (this.apuStatus === 0) {
			base = 0.3;
			this.apuOilPress = this.apuOilPress - (base * (1 - apuRPM));
			if (this.apuOilPress < 5) {
				this.apuOilPress = 5;
			}
		} else {
			this.apuOilPress = this.apuOilPress + (base * apuRPM);
			if (this.apuOilPress > 72) {
				this.apuOilPress = 72;
			}
		}

		this.setOilPress(this.apuOilPress);
	}

	updateApuOilTemp() {
		let base = 0.2;
		let apuRPM = this.getApuRPM(true);
		if (this.apuStatus === 0) {
			base = 0.05;
			this.apuOilTemp = this.apuOilTemp - (base * (1 - apuRPM));
			if (this.apuOilTemp < 15) {
				this.apuOilTemp = 15;
			}
		} else {
			this.apuOilTemp = this.apuOilTemp + (base * apuRPM);
			if (this.apuOilTemp > 82) {
				this.apuOilTemp = 82;
			}
		}

		this.setOilTemp(this.apuOilTemp);
	}

	getApuRPM(over100 = false) {
		if (over100 === true) {
			return SimVar.GetSimVarValue(B78XH_LocalVariables.APU.RPM, 'Percent over 100');
		}
		return SimVar.GetSimVarValue(B78XH_LocalVariables.APU.RPM, 'Percent');
	}

	getApuEGT() {
		return this.apuEGT;
	}
}