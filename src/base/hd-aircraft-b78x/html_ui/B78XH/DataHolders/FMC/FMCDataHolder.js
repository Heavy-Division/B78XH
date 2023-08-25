Include.addScript("/B78XH/DataHolders/FMC/PreFlightDataHolder.js");

class FMCDataHolder {
	get preFlightDataHolder() {
		return this._preFlightDataHolder;
	}
	constructor() {
		this._preFlightDataHolder = new PreFlightDataHolder();
	}
}