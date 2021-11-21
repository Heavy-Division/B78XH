export class LNAV {
	constructor() {
	}

	public async setManagedMode(value: boolean) {
		if (value) {
			await SimVar.SetSimVarValue('K:AP_AVIONICS_MANAGED_ON', 'number', 0);
		} else {
			await SimVar.SetSimVarValue('K:AP_AVIONICS_MANAGED_OFF', 'number', 0);
		}
	}

	public enableManagedMode() {
		this.setManagedMode(true);
	}

	public disableManagedMode() {
		this.setManagedMode(false);
	}

	public async setBank(degrees: number) {
		await SimVar.SetSimVarValue('AUTOPILOT BANK HOLD REF', 'degrees', degrees);
	}

	public setBankHold(value: boolean) {
		SimVar.SetSimVarValue('AUTOPILOT BANK HOLD', 'Bool', value);
	}

	public enableBankHold() {
		this.setBankHold(true);
	}

	public disableBankHold() {
		this.setBankHold(false);
	}
}