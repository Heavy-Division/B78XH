Include.addScript('/Heavy/Utils/HeavyUpdateDelayer.js');

/**
 * Important NOTE!!!!!!!!
 *
 * LocalVars B78XH_IRS_X_INIT_ALIGN_TIME are stored as string and contains timestamp in seconds.
 *
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !!                                                   !!
 * !!   DO NOT USE "Number" UNIT FOR STORING THE VARS   !!
 * !!                                                   !!
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * (You can use "Number" for deiniting (-1), but not for storing timestamp. You can use "Number" unit for retrieving values)
 *
 */


class B78XH_IRS {
	static get ALIGN_SPEED() {
		return {'INSTANT': 'INSTANT', 'FAST': 'FAST', 'NORMAL': 'NORMAL', 'REAL': 'REAL'};
	}

	constructor() {
		this.initLAlignTime = null;
		this.initRAlignTime = null;

		this.irsLTimeForAligning = this.generateTimeForAligning('L');
		this.irsRTimeForAligning = this.generateTimeForAligning('R');

		/**
		 * IRS States:
		 * 0 - off
		 * 1 - aligning
		 * 2 - aligned
		 */

		this.irsLState = 0;
		this.irsRState = 0;

		this.irsLSwitchState = 0;
		this.irsRSwitchState = 0;

		this.isIrsInited = 0;
		this.isIrsPositionSet = false;
		this.init();
	}

	init() {
		this.irsLState = SimVar.GetSimVarValue('L:B78XH_IRS_L_STATE', 'Number');
		this.irsRState = SimVar.GetSimVarValue('L:B78XH_IRS_R_STATE', 'Number');
		this.irsLSwitchState = SimVar.GetSimVarValue('L:B78XH_IRS_L_SWITCH_STATE', 'Number');
		this.irsRSwitchState = SimVar.GetSimVarValue('L:B78XH_IRS_R_SWITCH_STATE', 'Number');
		this.isIrsInited = SimVar.GetSimVarValue('L:B78XH_IS_IRS_INITED', 'Number');
	}

	checkAlignStates() {
		if (this.irsLSwitchState === 0) {
			SimVar.SetSimVarValue('L:B78XH_IRS_L_STATE', 'Number', 0);
			SimVar.SetSimVarValue('L:B78XH_IRS_L_INIT_ALIGN_TIME', 'Number', -1);
			this.initLAlignTime = null;
			this.irsLState = 0;
		}

		if (this.irsRSwitchState === 0) {
			SimVar.SetSimVarValue('L:B78XH_IRS_R_STATE', 'Number', 0);
			SimVar.SetSimVarValue('L:B78XH_IRS_R_INIT_ALIGN_TIME', 'Number', -1);
			this.initRAlignTime = null;
			this.irsRState = 0;
		}

	}

	update(_deltaTime, delayInMilliseconds) {
		this.updateVariables();
		this.checkAlignStates();

		if (this.shouldBeIRSDeInited()) {
			this.executeIRSDeinit()
		} else {
			this.executeInit();
		}

		if (this.shouldIRSStartAlign()) {
			this.executeIRSAlign();
		}
	}

	executeInit() {
		if (this.irsLSwitchState > 0 && this.irsLState < 1) {
			SimVar.SetSimVarValue('L:B78XH_IRS_L_STATE', 'Number', 1);
			this.irsLState = 1;
			if(!this.isIrsInited){
				this.isIrsInited = Math.floor(new Date().getTime() / 1000);
				SimVar.SetSimVarValue('L:B78XH_IS_IRS_INITED', 'String', this.isIrsInited.toString());
			}
		}

		if (this.irsRSwitchState > 0 && this.irsRState < 1) {
			SimVar.SetSimVarValue('L:B78XH_IRS_R_STATE', 'Number', 1);
			this.irsRState = 1;
			if(!this.isIrsInited){
				this.isIrsInited = Math.floor(new Date().getTime() / 1000);
				SimVar.SetSimVarValue('L:B78XH_IS_IRS_INITED', 'String', this.isIrsInited.toString());
			}
		}
	}

	executeIRSDeinit() {
		this.isIrsInited = 0;
		this.initLAlignTime = null;
		this.initRAlignTime = null;
		this.irsLState = 0;
		this.irsRState = 0;
		this.irsLTimeForAligning = this.generateTimeForAligning('L');
		this.irsRTimeForAligning = this.generateTimeForAligning('R');
		SimVar.SetSimVarValue('L:B78XH_IRS_L_INIT_ALIGN_TIME', 'Number', -1);
		SimVar.SetSimVarValue('L:B78XH_IRS_R_INIT_ALIGN_TIME', 'Number', -1);
		SimVar.SetSimVarValue('L:B78XH_IRS_L_STATE', 'Number', 0);
		SimVar.SetSimVarValue('L:B78XH_IRS_R_STATE', 'Number', 0);
		SimVar.SetSimVarValue('L:B78XH_IS_IRS_INITED', 'Number', 0);
	}

	shouldBeIRSInited() {
		return this.irsLSwitchState > 0 || this.irsRSwitchState > 0;
	}

	shouldBeIRSDeInited() {
		return this.irsLSwitchState === 0 && this.irsRSwitchState === 0;
	}

	isIRSAligning() {
		return this.shouldBeIRSInited();
	}

	shouldIRSStartAlign() {
		return (this.shouldBeIRSInited()) && (this.irsLState !== 2 || this.irsRState !== 2);
	}

	isIRSAligned() {
		return (this.irsLState === 2 || this.irsRState === 2);
	}

	executeIRSAlign() {

		let nowSeconds = Math.floor(new Date().getTime() / 1000);

		if (this.irsLSwitchState > 0) {
			if (this.irsLState !== 2) {
				if (!this.initLAlignTime) {
					this.initLAlignTime = Math.floor(new Date().getTime() / 1000);
					SimVar.SetSimVarValue('L:B78XH_IRS_L_INIT_ALIGN_TIME', 'String', nowSeconds.toString());
					SimVar.SetSimVarValue('L:B78XH_IRS_L_STATE', 'Number', 1);
				} else {
					if (this.initLAlignTime + this.irsLTimeForAligning < this.initLAlignTime) {
						SimVar.SetSimVarValue('L:B78XH_IRS_L_STATE', 'Number', 2);
					}
				}
			}
		} else {
			SimVar.SetSimVarValue('L:B78XH_IRS_L_STATE', 'Number', 0);
			SimVar.SetSimVarValue('L:B78XH_IRS_L_INIT_ALIGN_TIME', 'Number', -1);
			this.initLAlignTime = null;
		}

		if (this.irsRSwitchState > 0) {
			if (this.irsRState !== 2) {
				if (!this.initRAlignTime) {
					this.initRAlignTime = nowSeconds;

					SimVar.SetSimVarValue('L:B78XH_IRS_R_INIT_ALIGN_TIME', 'String', nowSeconds.toString());
					SimVar.SetSimVarValue('L:B78XH_IRS_R_STATE', 'Number', 1);
				} else {
					if (this.initRAlignTime + this.irsRTimeForAligning < nowSeconds) {
						SimVar.SetSimVarValue('L:B78XH_IRS_R_STATE', 'Number', 2);
					}
				}
			}
		} else {
			SimVar.SetSimVarValue('L:B78XH_IRS_R_STATE', 'Number', 0);
			SimVar.SetSimVarValue('L:B78XH_IRS_R_INIT_ALIGN_TIME', 'Number', -1);
			this.initRAlignTime = null;
		}
	}

	updateVariables() {
		this.irsLState = SimVar.GetSimVarValue('L:B78XH_IRS_L_STATE', 'Number');
		this.irsRState = SimVar.GetSimVarValue('L:B78XH_IRS_R_STATE', 'Number');
		this.irsLSwitchState = SimVar.GetSimVarValue('L:B78XH_IRS_L_SWITCH_STATE', 'Number');
		this.irsRSwitchState = SimVar.GetSimVarValue('L:B78XH_IRS_R_SWITCH_STATE', 'Number');

		this.isIrsPositionSet = SimVar.GetSimVarValue('L:B78XH_IS_IRS_POSITION_SET', 'Boolean');
	}

	generateTimeForAligning(irsId, minimal, maximal) {

		/**
		 * TODO: Rework!!!
		 * requires from six to fifteen minutes depending on latitude
		 * six minutes at the equator
		 * ten minutes average
		 *
		 * Airports:
		 * Near equator (lat near 0): Makoua, Republic of Congo, Coordinates: 00°1'9.0"S  015°34'55.0"E
		 * Far from the equator: Alert, Canada, Coordinates: 82°31'4.0"N  062°16'50.0"W
		 */

		if (!minimal && !maximal) {
			switch (HeavyDataStorage.get('IRS_ALIGN_SPEED', B78XH_IRS.ALIGN_SPEED.REAL)) {
				case B78XH_IRS.ALIGN_SPEED.INSTANT:
					minimal = 0;
					maximal = 0;
					break;
				case B78XH_IRS.ALIGN_SPEED.FAST:
					minimal = 70;
					maximal = 110;
					break;
				case B78XH_IRS.ALIGN_SPEED.NORMAL:
					minimal = 230;
					maximal = 270;
					break;
				case B78XH_IRS.ALIGN_SPEED.REAL:
					let sqr = 0;
					let timeToAlign = 0;
					let timeSec = 0;
					let planeLatitudeAbsolute = Math.abs(SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude'));
					if (planeLatitudeAbsolute <= 60) {
						let fix = 1.07415;
						sqr = Math.pow(fix, planeLatitudeAbsolute - 37.5);
						timeToAlign = (sqr + 5);
						timeSec = Math.floor(timeToAlign * 60);
					} else if (planeLatitudeAbsolute > 60 && planeLatitudeAbsolute <=70) {
						timeToAlign = 10;
						timeSec = Math.floor(timeToAlign * 60);
					} else if (planeLatitudeAbsolute > 70 && planeLatitudeAbsolute <=78) {
						timeToAlign = 17;
						timeSec = Math.floor(timeToAlign * 60);
					} else if (planeLatitudeAbsolute > 78) {
						timeToAlign = 17;
						timeSec = Math.floor(timeToAlign * 60);
					}
					minimal = timeSec;
					maximal = timeSec;
					break;
				default:
					minimal = 230;
					maximal = 270;
			}
		}
		let ret = 0;
		if (maximal > 0) {
			switch (HeavyDataStorage.get('IRS_ALIGN_SPEED', B78XH_IRS.ALIGN_SPEED.REAL)) {
				case B78XH_IRS.ALIGN_SPEED.FAST:
					ret = Math.floor(Math.random() * (maximal - minimal + 1)) + minimal;
					break;
				case B78XH_IRS.ALIGN_SPEED.NORMAL:
					ret = Math.floor(Math.random() * (maximal - minimal + 1)) + minimal;
					break;
				case B78XH_IRS.ALIGN_SPEED.REAL:
					ret = maximal;
					break;
			}
		}
		SimVar.SetSimVarValue('L:B78XH_IRS_' + irsId + '_TIME_FOR_ALIGN', 'Number', ret);
		return ret;
	}
}