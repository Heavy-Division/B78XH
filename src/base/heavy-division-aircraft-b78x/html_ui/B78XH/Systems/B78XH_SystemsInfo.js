class B78XH_SystemsInfo {
	static get SYSTEM() {
		return {'APU': 'B78XH_APU', 'IRS': 'B78XH_IRS'};
	}

	constructor() {
		this.systems = {};
		this.systems[B78XH_SystemsInfo.SYSTEM.APU] = new B78XH_APUInfo();
	}

	getAPU() {
		return (this.systems[B78XH_SystemsInfo.SYSTEM.APU] ? this.systems[B78XH_SystemsInfo.SYSTEM.APU] : new B78XH_APUInfo());
	}

	getSystem(name) {
		if (this.systems.hasOwnProperty(name)) {
			return this.systems[name];
		}
		return null;
	}
}