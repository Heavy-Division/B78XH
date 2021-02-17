Include.addScript('/B78XH/Enums/B78XH_LocalVariables.js');

class B78XH_APUInfo {
	constructor() {
		this.localVariables = B78XH_LocalVariables.APU;
	}

	getRPM() {
		return SimVar.GetSimVarValue(this.localVariables.RPM, 'Percent');
	}

	getEGT() {
		return SimVar.GetSimVarValue(this.localVariables.EGT, 'Celsius');
	}

	setEGT(value) {
		SimVar.SetSimVarValue(this.localVariables.EGT, 'Celsius', value);
	}

	getOilTemp() {
		return SimVar.GetSimVarValue(this.localVariables.OIL_TEMP, 'Number');
	}

	setOilTemp(value) {
		SimVar.SetSimVarValue(this.localVariables.OIL_TEMP, 'Number', value);
	}

	getOilPress() {
		return SimVar.GetSimVarValue(this.localVariables.OIL_PRESS, 'Number');
	}

	setOilPress(value) {
		SimVar.SetSimVarValue(this.localVariables.OIL_PRESS, 'Number', value);
	}
}