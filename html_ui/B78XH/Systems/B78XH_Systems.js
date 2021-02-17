/**
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * Be aware. This class should never be used outside ISFD (SAI).
 * This class is used for updating aircraft systems like IRS, APU etc... The class should not be used for getting
 * data about the aircraft systems. "Update" method should never be called from other system than ISFD (SAI) [MFD for example].
 * Systems in aircraft (FMC, MFDs, etc) are independent and it is not possible to get same instance of B78XH_Systems.
 * Even with singleton pattern or static class you will always get different instance (or static class) in each system.
 *
 * Calling "update" method in more than one aircraft system can cause systems instability or performance issues.
 *
 * Use Systems info classes or direct SimVar calls for getting info about B78XH systems.
 *
 * Why ISFD (SAI) is used for updating B78XH systems:
 * 1) ISFD is practically everytime online
 * 2) Airplane has only one ISFD
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */

class B78XH_Systems {

	static get VERSION() {
		return 'B78XHL';
	}

	static get SYSTEM() {
		return {'APU': 'B78XH_APU'};
	}

	constructor() {
		this.systems = {};

	}

	init() {
		if(B78XH_Systems.VERSION === 'B78XHL'){
			this.systems[B78XH_Systems.SYSTEM.APU] = {'instance': new B78XH_APU(), delay: 0};
		} else if (B78XH_Systems.VERSION === 'B78XH'){
			this.systems[B78XH_Systems.SYSTEM.APU] = {'instance': new B78XH_APU(), delay: 0};
			this.systems[B78XH_Systems.SYSTEM.IRS] = {'instance': new B78XH_IRS(), delay: 2500};
		}
	}

	update(_deltaTime) {
		Object.values(this.systems).forEach((system) => {
				if (typeof system.instance.update === 'function') {
					if (system.instance.update.length === 2) {
						system.instance.update(_deltaTime, system.delay);
					} else if (system.instance.update.length === 1) {
						system.instance.update(_deltaTime);
					}
				}
			}
		);
	}

	getSystem(name) {
		if (this.systems.hasOwnProperty(name)) {
			return this.systems[name].instance;
		}
		return null;
	}
}