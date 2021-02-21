Include.addScript('/Heavy/Utils/HeavyUpdateDelayer.js');

/**
 * B78XHL does not support IRS aligning
 *
 * IRS system should use HeavyUpdateDelayer for better performance because we do not need update STATE variables every few millis.
 *
 * TODO: Implement partial IRS aligning
 */


class B78XH_IRS {

	constructor() {
		this.delayer  = new HeavyUpdateDelayer();
	}
	update(_deltaTime, delayInMilliseconds) {
		this.delayer.setDelay(delayInMilliseconds)
		this.delayer.addDeltaTime(_deltaTime)
		this.delayer.update(() => {
			SimVar.SetSimVarValue('L:B78XH_IRS_L_STATE', 'Number', 2);
			SimVar.SetSimVarValue('L:B78XH_IRS_R_STATE', 'Number', 2);
		});
	}
}