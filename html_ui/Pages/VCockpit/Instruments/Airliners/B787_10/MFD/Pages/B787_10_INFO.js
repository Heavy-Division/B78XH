class B787_10_INFO extends B787_10_CommonMFD.MFDTemplateElement {
	get templateID() {
		return 'B787_10_INFO_Template';
	}

	get pageIdentifier() {
		return MFDPageType.INFO;
	}

	initChild() {
		this.headingSlotBox = document.getElementById('heading-slot');
		this.magvarBox = document.getElementById('magvar');
		this.trueAirspeedBox = document.getElementById('true-airspeed');
		this.groundSpeedBox = document.getElementById('ground-speed');
		this.onGroundBox = document.getElementById('on-ground');
		this.windDirectionBox = document.getElementById('wind-direction');
		this.windSpeedBox = document.getElementById('wind-speed');
		this.trueHeadingBox = document.getElementById('true-heading');
		this.magneticHeadingBox = document.getElementById('magnetic-heading');
		this.trueTrackBox = document.getElementById('true-track');
		this.xtkBox = document.getElementById('xtk');
		this.dtkBox = document.getElementById('dtk');
		this.bankAngle = document.getElementById('bank-angle');
		this.apHeadingLockBox = document.getElementById('ap-heading-lock');
		this.apPanelHeadingHold = document.getElementById('ap-panel-heading-hold');
		this.apHeadingHoldActiveBox = document.getElementById('ap-heading-hold-active');
		this.turnToBox = document.getElementById('turn-to');

		this.lnavActiveBox = document.getElementById('lnav-active');
		this.lnavArmedBox = document.getElementById('lnav-armed');
		this.nav1HoldBox = document.getElementById('nav1-hold');

		this.fpSequencingBox = document.getElementById('fp-sequencing');
		this.fpInDiscontinuityBox = document.getElementById('fp-in-discontinuity');
	}

	updateChild(_deltaTime) {
		let state = this.getAircraftState();

		this.magvarBox.innerText = state.magVar;
		this.bankAngle.innerText = state.bankAngle;
		this.turnToBox.innerText = (state.bankAngle < 0 ? 'right' : 'left');
		this.turnToBox.innerText = (state.bankAngle > -0.5 && state.bankAngle < 0.5 ? 'none' : this.turnToBox.innerText);
		this.onGroundBox.innerText = state.onGround;

		this.trueAirspeedBox.innerText = state.trueAirspeed;
		this.groundSpeedBox.innerText = state.groundSpeed;

		this.windDirectionBox.innerText = state.windDirection;
		this.windSpeedBox.innerText = state.windSpeed;

		this.lnavActiveBox.innerText = SimVar.GetSimVarValue('L:AP_LNAV_ACTIVE', 'number');
		this.lnavArmedBox.innerText = SimVar.GetSimVarValue('L:AP_LNAV_ARMED', 'number');
		this.nav1HoldBox.innerText = SimVar.GetSimVarValue('K:AP_NAV1_HOLD_ON', 'number');


		this.headingSlotBox.innerText = SimVar.GetSimVarValue('AUTOPILOT HEADING SLOT INDEX', 'number');
		this.apHeadingLockBox.innerText = SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK', 'Boolean');
		this.apHeadingHoldActiveBox.innerText = SimVar.GetSimVarValue('L:AP_HEADING_HOLD_ACTIVE', 'Boolean');
		this.apPanelHeadingHold.innerText = SimVar.GetSimVarValue('K:AP_PANEL_HEADING_HOLD', 'Boolean');

		this.trueHeadingBox.innerText = state.trueHeading;
		this.trueTrackBox.innerText = state.trueTrack;
		this.magneticHeadingBox.innerText = state.magneticHeading;

		this.xtkBox.innerText = SimVar.GetSimVarValue('L:WT_CJ4_XTK', 'number');
		this.dtkBox.innerText = SimVar.GetSimVarValue('L:WT_CJ4_DTK', 'number');

		this.fpSequencingBox.innerText = state.sequencing;
		this.fpInDiscontinuityBox.innerText = state.inDiscontinuity;
	}

	getAircraftState() {
		let state = {};
		//state.position = new LatLongAlt(SimVar.GetSimVarValue("GPS POSITION LAT", "degree latitude"), SimVar.GetSimVarValue("GPS POSITION LON", "degree longitude"));
		state.magVar = SimVar.GetSimVarValue('MAGVAR', 'degrees');

		state.groundSpeed = SimVar.GetSimVarValue('GPS GROUND SPEED', 'knots');
		state.trueAirspeed = SimVar.GetSimVarValue('AIRSPEED TRUE', 'knots');
		state.onGround = SimVar.GetSimVarValue('SIM ON GROUND', 'bool') !== 0;

		state.windDirection = SimVar.GetSimVarValue('AMBIENT WIND DIRECTION', 'degrees');
		state.windSpeed = SimVar.GetSimVarValue('AMBIENT WIND VELOCITY', 'knots');

		state.trueHeading = SimVar.GetSimVarValue('PLANE HEADING DEGREES TRUE', 'Radians') * Avionics.Utils.RAD2DEG;
		state.magneticHeading = SimVar.GetSimVarValue('PLANE HEADING DEGREES MAGNETIC', 'Radians') * Avionics.Utils.RAD2DEG;
		state.trueTrack = SimVar.GetSimVarValue('GPS GROUND TRUE TRACK', 'Radians') * Avionics.Utils.RAD2DEG;

		state.bankAngle = SimVar.GetSimVarValue('PLANE BANK DEGREES', 'Radians') * Avionics.Utils.RAD2DEG;

		state.inDiscontinuity = (SimVar.GetSimVarValue('L:WT_CJ4_IN_DISCONTINUITY', 'number') ? 'TRUE' : 'FALSE');
		state.sequencing = (SimVar.GetSimVarValue('L:WT_CJ4_SEQUENCING', 'number') ? 'AUTO' : 'INHIBIT');

		return state;
	}

	onEvent(_event) {
	}

	setGPS(_gps) {
	}
}

customElements.define('b787-10-info-element', B787_10_INFO);
//# sourceMappingURL=B787_10_INFO.js.map