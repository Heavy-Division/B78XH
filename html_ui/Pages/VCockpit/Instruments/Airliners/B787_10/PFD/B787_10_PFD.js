Include.addScript('/B78XH/Enums/B78XH_LocalVariables.js');

class B787_10_PFD extends BaseAirliners {
	constructor() {
		super();
		this.initDuration = 7000;
	}

	get templateID() {
		return 'B787_10_PFD';
	}

	get instrumentAlias() {
		return 'AS01B_PFD';
	}

	get IsGlassCockpit() {
		return true;
	}

	connectedCallback() {
		super.connectedCallback();
		this.mainPage = new B787_10_PFD_MainPage();
		this.pageGroups = [
			new NavSystemPageGroup('Main', this, [
				this.mainPage
			])
		];
		this.maxUpdateBudget = 12;
	}

	disconnectedCallback() {
		window.console.log('B787 PFD - destroyed');
		super.disconnectedCallback();
	}

	onPowerOn() {
		super.onPowerOn();
		this.mainPage.onPowerOn();
	}

	onUpdate(_deltaTime) {
		super.onUpdate(_deltaTime);
	}
}

class B787_10_PFD_MainElement extends NavSystemElement {
	init(root) {
	}

	onEnter() {
	}

	onUpdate(_deltaTime) {
	}

	onExit() {
	}

	onEvent(_event) {
	}
}

class B787_10_PFD_MainPage extends NavSystemPage {
	constructor() {
		super('Main', 'MainFrame', new B787_10_PFD_MainElement());
		this.map_IsCentered = false;
		this.map_DisplayMode = Jet_NDCompass_Display.ARC;
		this.map_NavigationMode = Jet_NDCompass_Navigation.NAV;
		this._debugShowConstraints = false;
		this.map = new B787_10_PFD_Map();
		this.compass = new B787_10_PFD_Compass();
		this.plane = new B787_10_PFD_PlaneInfo();
		this.day = new B787_10_PFD_DayInfo();
		this.element = new NavSystemElementGroup([
			new B787_10_PFD_Attitude(),
			new B787_10_PFD_VSpeed(),
			new B787_10_PFD_Airspeed(),
			new B787_10_PFD_Altimeter(),
			new B787_10_PFD_NavStatus(),
			new B787_10_PFD_ILS(),
			this.map,
			this.compass,
			this.plane,
			this.day
		]);
	}

	init() {
		super.init();
		this.map.instrument.showRoads = false;
		this.map.instrument.showObstacles = false;
		this.map.instrument.showVORs = false;
		this.map.instrument.showIntersections = false;
		this.map.instrument.showNDBs = false;
		this.map.instrument.showAirports = false;
		this.map.instrument.showAirspaces = false;
		this.map.instrument.intersectionMaxRange = Infinity;
		this.map.instrument.vorMaxRange = Infinity;
		this.map.instrument.ndbMaxRange = Infinity;
		this.map.instrument.smallAirportMaxRange = Infinity;
		this.map.instrument.medAirportMaxRange = Infinity;
		this.map.instrument.largeAirportMaxRange = Infinity;
		this.compass.svg.mapRange = 20;
		this.map.instrument.setZoom(0);
		this.setMapMode(this.map_IsCentered, this.map_NavigationMode);
	}

	onPowerOn() {
		if (this.plane) {
			this.plane.onPowerOn();
		}
	}

	_updateNDFiltersStatuses() {
		SimVar.SetSimVarValue('L:BTN_CSTR_FILTER_ACTIVE', 'number', this._debugShowConstraints ? 1 : 0);
		SimVar.SetSimVarValue('L:BTN_VORD_FILTER_ACTIVE', 'number', this.map.instrument.showVORs ? 1 : 0);
		SimVar.SetSimVarValue('L:BTN_WPT_FILTER_ACTIVE', 'number', this.map.instrument.showIntersections ? 1 : 0);
		SimVar.SetSimVarValue('L:BTN_NDB_FILTER_ACTIVE', 'number', this.map.instrument.showNDBs ? 1 : 0);
		SimVar.SetSimVarValue('L:BTN_ARPT_FILTER_ACTIVE', 'number', this.map.instrument.showAirports ? 1 : 0);
	}

	onUpdate(_deltaTime) {
		super.onUpdate(_deltaTime);
		this.extendHtmlElementsWithIrsState();
		this.isIRSAligned();
	}

	onEvent(_event) {
		super.onEvent(_event);
		switch (_event) {
			default:
				break;
		}
	}

	setMapMode(_centered, _navMode) {
		this.map_IsCentered = _centered;
		this.map_NavigationMode = _navMode;
		this.map_DisplayMode = (this.map_IsCentered) ? Jet_NDCompass_Display.ROSE : Jet_NDCompass_Display.ARC;
		this.applyMapMode();
	}

	applyMapMode() {
		this.compass.svg.setMode(this.map_DisplayMode, this.map_NavigationMode);
		this.map.setMode(this.map_DisplayMode);
		if (this.map_DisplayMode == Jet_NDCompass_Display.PLAN)
			this.gps.setAttribute('mapstyle', 'plan');
		else if (this.map_IsCentered)
			this.gps.setAttribute('mapstyle', 'rose');
		else
			this.gps.setAttribute('mapstyle', 'arc');
	}

	extendHtmlElementsWithIrsState() {
		let groundRibbonGroup = document.getElementById('GroundRibbonGroup');
		groundRibbonGroup.setAttribute('irs-state', 'off');

		let groundLineGroup = document.getElementById('GroundLineGroup');
		groundLineGroup.setAttribute('irs-state', 'off');

		let selectedHeadingGroup = document.getElementById('selectedHeadingGroup');
		selectedHeadingGroup.setAttribute('irs-state', 'off');
	}

	isIRSAligned() {
		let irsLState = SimVar.GetSimVarValue('L:B78XH_IRS_L_STATE', 'Number');
		let irsRState = SimVar.GetSimVarValue('L:B78XH_IRS_R_STATE', 'Number');

		// TODO: IRS Position should be set
		//let isIrsPositionSet = SimVar.GetSimVarValue('L:B78XH_IS_IRS_POSITION_SET', 'Boolean');

		if ((irsLState > 1 || irsRState > 1)) {
			document.querySelectorAll('[irs-state]').forEach((element) => {
				if (element) {
					element.setAttribute('irs-state', 'aligned');
				}
			});
		} else {
			let irsLSwitchState = SimVar.GetSimVarValue('L:B78XH_IRS_L_STATE', 'Number');
			let irsRSwitchState = SimVar.GetSimVarValue('L:B78XH_IRS_R_STATE', 'Number');
			if (irsLSwitchState > 0 || irsRSwitchState > 0) {
				document.querySelectorAll('[irs-state]').forEach((element) => {
					if (element) {
						element.setAttribute('irs-state', 'aligning');
					}
				});
			} else {
				document.querySelectorAll('[irs-state]').forEach((element) => {
					if (element) {
						element.setAttribute('irs-state', 'off');
					}
				});
			}
		}
	}
}

class B787_10_PFD_Map extends MapInstrumentElement {
	init(root) {
		super.init(root);
	}

	onTemplateLoaded() {
		super.onTemplateLoaded();
	}

	getZoomRanges(_factor) {
		let zoomRanges = [20];
		for (let i = 0; i < zoomRanges.length; i++)
			zoomRanges[i] *= _factor;
		return zoomRanges;
	}

	setMode(display) {
		switch (display) {
			case Jet_NDCompass_Display.ROSE: {
				this.instrument.zoomRanges = this.getZoomRanges(1);
				this.instrument.style.top = '0%';
				this.instrument.rotateWithPlane(true);
				this.instrument.centerOnActiveWaypoint(false);
				this.instrument.setPlaneScale(2.0);
				this.instrument.setPlaneIcon(1);
				break;
			}
			case Jet_NDCompass_Display.ARC: {
				this.instrument.zoomRanges = this.getZoomRanges(1);
				this.instrument.style.top = '20%';
				this.instrument.rotateWithPlane(true);
				this.instrument.centerOnActiveWaypoint(false);
				this.instrument.setPlaneScale(1.5);
				this.instrument.setPlaneIcon(1);
				break;
			}
			case Jet_NDCompass_Display.PLAN: {
				this.instrument.zoomRanges = this.getZoomRanges(1);
				this.instrument.style.top = '0%';
				this.instrument.rotateWithPlane(false);
				this.instrument.centerOnActiveWaypoint(true);
				this.instrument.setPlaneScale(1.5);
				this.instrument.setPlaneIcon(3);
				break;
			}
			default:
				this.instrument.style.top = '0%';
				this.instrument.rotateWithPlane(false);
				this.instrument.centerOnActiveWaypoint(false);
				this.instrument.setPlaneScale(1.0);
				this.instrument.setPlaneIcon(1);
				break;
		}
	}
}

class B787_10_PFD_VSpeed extends NavSystemElement {
	init(root) {
		this.vsi = this.gps.getChildById('VSpeed');
		this.vsi.aircraft = Aircraft.AS01B;
		this.vsi.gps = this.gps;
	}

	onEnter() {
	}

	onUpdate(_deltaTime) {
		var vSpeed = Math.round(Simplane.getVerticalSpeed());
		this.vsi.setAttribute('vspeed', vSpeed.toString());
		if (Simplane.getAutoPilotVerticalSpeedHoldActive()) {
			var selVSpeed = Math.round(Simplane.getAutoPilotVerticalSpeedHoldValue());
			this.vsi.setAttribute('selected_vspeed', selVSpeed.toString());
			this.vsi.setAttribute('selected_vspeed_active', 'true');
		} else {
			this.vsi.setAttribute('selected_vspeed_active', 'false');
		}
	}

	onExit() {
	}

	onEvent(_event) {
	}
}

class B787_10_PFD_Airspeed extends NavSystemElement {
	constructor() {
		super();
	}

	init(root) {
		this.airspeed = this.gps.getChildById('Airspeed');
		this.airspeed.aircraft = Aircraft.AS01B;
		this.airspeed.gps = this.gps;
	}

	onEnter() {
	}

	onUpdate(_deltaTime) {
		this.airspeed.update(_deltaTime);
	}

	onExit() {
	}

	onEvent(_event) {
	}
}

class B787_10_PFD_Altimeter extends NavSystemElement {
	constructor() {
		super();
		this.isMTRSActive = false;
		this.minimumReference = 200;
	}

	init(root) {
		this.altimeter = this.gps.getChildById('Altimeter');
		this.altimeter.aircraft = Aircraft.AS01B;
		this.altimeter.gps = this.gps;
	}

	onEnter() {
	}

	onUpdate(_deltaTime) {
		this.altimeter.update(_deltaTime);
	}

	onExit() {
	}

	onEvent(_event) {
		switch (_event) {
			case 'BARO_INC':
				SimVar.SetSimVarValue('K:KOHLSMAN_INC', 'number', 1);
				break;
			case 'BARO_DEC':
				SimVar.SetSimVarValue('K:KOHLSMAN_DEC', 'number', 1);
				break;
			case 'MTRS':
				this.isMTRSActive = !this.isMTRSActive;
				this.altimeter.showMTRS(this.isMTRSActive);
				break;
			case 'Mins_INC':
				this.minimumReference += 50;
				this.altimeter.minimumReferenceValue = this.minimumReference;
				break;
			case 'Mins_DEC':
				this.minimumReference -= 50;
				this.altimeter.minimumReferenceValue = this.minimumReference;
				break;
			case 'Mins_Press':
				this.minimumReference = 200;
				this.altimeter.minimumReferenceValue = this.minimumReference;
				break;
		}
	}
}

class B787_10_PFD_Attitude extends NavSystemElement {
	constructor() {
		super(...arguments);
		this.vDir = new Vec2();
	}

	init(root) {
		this.hsi = this.gps.getChildById('Horizon');
		this.hsi.aircraft = Aircraft.AS01B;
		this.hsi.gps = this.gps;
	}

	onEnter() {
	}

	onUpdate(_deltaTime) {
		if (this.hsi) {
			this.hsi.update(_deltaTime);
			var xyz = Simplane.getOrientationAxis();
			if (xyz) {
				this.hsi.setAttribute('pitch', (xyz.pitch / Math.PI * 180).toString());
				this.hsi.setAttribute('bank', (xyz.bank / Math.PI * 180).toString());
			}
			this.hsi.setAttribute('slip_skid', Simplane.getInclinometer().toString());
			this.hsi.setAttribute('radio_altitude', Simplane.getAltitudeAboveGround().toString());
			this.hsi.setAttribute('radio_decision_height', this.gps.radioNav.getRadioDecisionHeight().toString());
		}
	}

	onExit() {
	}

	onEvent(_event) {
	}
}

class B787_10_PFD_NavStatus extends NavSystemElement {
	init(root) {
		this.fma = this.gps.querySelector('boeing-fma');
		this.fma.aircraft = Aircraft.AS01B;
		this.fma.gps = this.gps;
		this.isInitialized = true;
	}

	onEnter() {
	}

	onUpdate(_deltaTime) {
		if (this.fma != null) {
			this.fma.update(_deltaTime);
		}
	}

	onExit() {
	}

	onEvent(_event) {
	}
}

class B787_10_PFD_ILS extends NavSystemElement {
	constructor() {
		super(...arguments);
		this.altWentAbove500 = false;
	}

	init(root) {
		this.ils = this.gps.getChildById('ILS');
		this.ils.aircraft = Aircraft.AS01B;
		this.ils.gps = this.gps;
		this.ils.showNavInfo(true);
	}

	onEnter() {
	}

	onUpdate(_deltaTime) {
		if (!this.altWentAbove500) {
			let altitude = Simplane.getAltitudeAboveGround();
			if (altitude >= 500)
				this.altWentAbove500 = true;
		}
		if (this.ils) {
			let showIls = false;
			let localizer = this.gps.radioNav.getBestILSBeacon(UseNavSource.YES_FALLBACK);
			if ((localizer.id != 0 && this.altWentAbove500) || (this.gps.currFlightPlanManager.isActiveApproach() && Simplane.getAutoPilotApproachType() == ApproachType.APPROACH_TYPE_RNAV)) {
				showIls = true;
			}
			this.ils.showLocalizer(showIls);
			this.ils.showGlideslope(showIls);
			this.ils.update(_deltaTime);
		}
	}

	onExit() {
	}

	onEvent(_event) {
	}
}

class B787_10_PFD_Compass extends NavSystemElement {
	init(root) {
		this.svg = this.gps.getChildById('Compass');
		this.svg.forceNavAid(1, NAV_AID_STATE.ADF);
		this.svg.forceNavAid(2, NAV_AID_STATE.ADF);
		this.svg.setMode(Jet_NDCompass_Display.ARC, Jet_NDCompass_Navigation.NAV);
		this.svg.aircraft = Aircraft.AS01B;
		this.svg.gps = this.gps;
		this.infos = this.gps.getChildById('CompassInfos');
	}

	onEnter() {
	}

	isReady() {
		return true;
	}

	onUpdate(_deltaTime) {
		if (this.svg) {
			this.svg.update(_deltaTime);
		}
		if (this.infos) {
			this.infos.deltaTime = _deltaTime;
			this.infos.simGS = Simplane.getGroundSpeed();
			this.infos.simTAS = Simplane.getTrueSpeed();
			this.infos.simWindDir = Simplane.getWindDirection();
			this.infos.simWindSpeed = Simplane.getWindStrength();
			this.infos.simPlaneAngle = Simplane.getHeadingMagnetic();
			this.infos.simWaypointName = SimVar.GetSimVarValue('GPS WP NEXT ID', 'string');
			this.infos.simWaypointETA = (SimVar.GetSimVarValue('E:ZULU TIME', 'seconds') + SimVar.GetSimVarValue('GPS WP ETE', 'seconds')) % (24 * 3600);
			this.infos.simWaypointDistance = SimVar.GetSimVarValue('GPS WP DISTANCE', 'nautical miles');
		}
	}

	onExit() {
	}

	onEvent(_event) {
	}
}

class B787_10_PFD_CompassInfos extends HTMLElement {
	constructor() {
		super(...arguments);
		this.deltaTime = 0;
		this.smoothedWindAngle = 0;
		this.windStrongEnough = false;
		this.viewboxWidth = 900;
		this.viewboxHeight = 352;
		this.padding = 10;
		this.width = 900 - (this.padding * 2);
		this.height = 352 - this.padding;
		this.top = 0 + this.padding;
		this.left = 0 + this.padding;
		this.right = this.width + this.left;
		this.bottom = this.height + this.top;
		this.construct = () => {
			this.svg = document.createElementNS(Avionics.SVG.NS, 'svg');
			this.svg.setAttribute('id', 'ViewBox');
			this.svg.setAttribute('viewBox', '0 0 ' + this.viewboxWidth + ' ' + this.viewboxHeight);
			this.windPlaneSpeedInfoGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			this.windPlaneSpeedInfoGroup.setAttribute('id', 'WindPlaneSpeedInfoGroup');
			{
				var lineHeight = 26;
				var textTemplate = (document.createElementNS(Avionics.SVG.NS, 'text'));
				textTemplate.setAttribute('y', `${this.top + lineHeight}`);
				textTemplate.setAttribute('font-family', 'Roboto-light');
				textTemplate.setAttribute('text-transform', 'uppercase');
				textTemplate.setAttribute('fill', 'white');
				var groundSpeedLabelText = textTemplate.cloneNode();
				groundSpeedLabelText.setAttribute('font-size', '15');
				groundSpeedLabelText.innerHTML = 'GS';
				groundSpeedLabelText.setAttribute('x', `${this.left}`);
				this.windPlaneSpeedInfoGroup.appendChild(groundSpeedLabelText);
				this.groundSpeedValueText = textTemplate.cloneNode();
				this.groundSpeedValueText.setAttribute('font-size', lineHeight.toString());
				this.groundSpeedValueText.setAttribute('x', `${this.left + 20}`);
				this.groundSpeedValueText.innerHTML = Math.ceil(this.simGS).toString().padStart(3, '0');
				this.windPlaneSpeedInfoGroup.appendChild(this.groundSpeedValueText);
				var trueAirSpeedLabelText = textTemplate.cloneNode();
				trueAirSpeedLabelText.setAttribute('font-size', '15');
				trueAirSpeedLabelText.innerHTML = 'TAS';
				trueAirSpeedLabelText.setAttribute('x', `${this.left + 70}`);
				this.windPlaneSpeedInfoGroup.appendChild(trueAirSpeedLabelText);
				this.trueAirSpeedValueText = textTemplate.cloneNode();
				this.trueAirSpeedValueText.setAttribute('font-size', lineHeight.toString());
				this.trueAirSpeedValueText.setAttribute('x', `${this.left + 100}`);
				this.trueAirSpeedValueText.innerHTML = Math.round(this.simTAS).toString().padStart(3, '0');
				this.windPlaneSpeedInfoGroup.appendChild(this.trueAirSpeedValueText);
				this.windDirectionValueText = textTemplate.cloneNode();
				this.windDirectionValueText.setAttribute('font-size', lineHeight.toString());
				this.windDirectionValueText.setAttribute('x', `${this.left}`);
				this.windDirectionValueText.setAttribute('y', `${this.top + lineHeight * 2 + 5}`);
				this.windDirectionValueText.innerHTML = Math.round(this.simWindDir).toString().padStart(3, '0');
				this.windPlaneSpeedInfoGroup.appendChild(this.windDirectionValueText);
				var windInfoSeparator = textTemplate.cloneNode();
				windInfoSeparator.setAttribute('font-size', lineHeight.toString());
				windInfoSeparator.setAttribute('x', `${this.left + 44}`);
				windInfoSeparator.setAttribute('y', `${this.top + lineHeight * 2 + 5}`);
				windInfoSeparator.setAttribute('letter-spacing', '-10');
				windInfoSeparator.innerHTML = '/';
				this.windPlaneSpeedInfoGroup.appendChild(windInfoSeparator);
				this.windSpeedValueText = textTemplate.cloneNode();
				this.windSpeedValueText.setAttribute('font-size', lineHeight.toString());
				this.windSpeedValueText.setAttribute('x', `${this.left + 65}`);
				this.windSpeedValueText.setAttribute('y', `${this.top + lineHeight * 2 + 5}`);
				this.windSpeedValueText.innerHTML = Math.round(this.simWindSpeed).toString();
				this.windPlaneSpeedInfoGroup.appendChild(this.windSpeedValueText);
				this.windArrow = document.createElementNS(Avionics.SVG.NS, 'path');
				this.windArrow.setAttribute('d', 'M-3 20, 3 20, 3 -20, 15 -20, 0 -40, -15 -20, -3 -20');
				this.windArrow.setAttribute('fill', 'white');
				this.windArrow.setAttribute('transform', 'translate(30, 100) scale(0.55) rotate(0)');
				this.windPlaneSpeedInfoGroup.appendChild(this.windArrow);
			}
			this.svg.appendChild(this.windPlaneSpeedInfoGroup);
			this.activeWaypointInfoGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			this.activeWaypointInfoGroup.setAttribute('id', 'ActiveWaypointInfoGroup');
			{
				var lineHeight = 26;
				var textTemplate = (document.createElementNS(Avionics.SVG.NS, 'text'));
				textTemplate.setAttribute('y', `${this.top + lineHeight}`);
				textTemplate.setAttribute('font-family', 'Roboto-light');
				textTemplate.setAttribute('text-transform', 'uppercase');
				textTemplate.setAttribute('text-anchor', 'end');
				textTemplate.setAttribute('fill', 'white');
				this.activeWaypointNameText = textTemplate.cloneNode();
				this.activeWaypointNameText.setAttribute('font-size', lineHeight.toString());
				this.activeWaypointNameText.setAttribute('fill', '#ff00e0');
				this.activeWaypointNameText.setAttribute('x', `${this.right - 25}`);
				this.activeWaypointNameText.innerHTML = this.simWaypointName;
				this.activeWaypointInfoGroup.appendChild(this.activeWaypointNameText);
				var activeWaypointETAUnitText = textTemplate.cloneNode();
				activeWaypointETAUnitText.setAttribute('font-size', '15');
				activeWaypointETAUnitText.setAttribute('text-transform', 'capitalize');
				activeWaypointETAUnitText.setAttribute('x', `${this.right}`);
				activeWaypointETAUnitText.setAttribute('y', `${this.top + lineHeight * 2 + 5}`);
				activeWaypointETAUnitText.innerHTML = 'Z';
				this.activeWaypointInfoGroup.appendChild(activeWaypointETAUnitText);
				this.activeWaypointETAText = textTemplate.cloneNode();
				this.activeWaypointETAText.setAttribute('font-size', lineHeight.toString());
				this.activeWaypointETAText.setAttribute('x', `${this.right - 10}`);
				this.activeWaypointETAText.setAttribute('y', `${this.top + lineHeight * 2 + 5}`);
				this.activeWaypointETAText.innerHTML = Math.floor((this.simWaypointETA / 3600) % 24).toString().padStart(2, '0') + Math.floor((this.simWaypointETA / 60) % 60).toString().padStart(2, '0') + '.0';
				this.activeWaypointInfoGroup.appendChild(this.activeWaypointETAText);
				var activeWaypointDistanceToGoUnitText = textTemplate.cloneNode();
				activeWaypointDistanceToGoUnitText.setAttribute('font-size', '15');
				activeWaypointDistanceToGoUnitText.setAttribute('text-transform', 'capitalize');
				activeWaypointDistanceToGoUnitText.setAttribute('x', `${this.right}`);
				activeWaypointDistanceToGoUnitText.setAttribute('y', `${this.top + lineHeight * 3 + 7}`);
				activeWaypointDistanceToGoUnitText.innerHTML = 'NM';
				this.activeWaypointInfoGroup.appendChild(activeWaypointDistanceToGoUnitText);
				this.activeWaypointDistanceToGoText = textTemplate.cloneNode();
				this.activeWaypointDistanceToGoText.setAttribute('font-size', lineHeight.toString());
				this.activeWaypointDistanceToGoText.setAttribute('x', `${this.right - 20}`);
				this.activeWaypointDistanceToGoText.setAttribute('y', `${this.top + lineHeight * 3 + 7}`);
				this.activeWaypointDistanceToGoText.innerHTML = this.simWaypointDistance.toFixed(2).padStart(2, '0');
				this.activeWaypointInfoGroup.appendChild(this.activeWaypointDistanceToGoText);
			}
			this.svg.appendChild(this.activeWaypointInfoGroup);
			this.activeAutopilotInfoGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			this.activeAutopilotInfoGroup.setAttribute('id', 'activeAutopilotInfoGroup');
			{
				var lineHeight = 26;
				var textTemplate = (document.createElementNS(Avionics.SVG.NS, 'text'));
				textTemplate.setAttribute('y', `${this.top + lineHeight}`);
				textTemplate.setAttribute('font-family', 'Roboto-light');
				textTemplate.setAttribute('text-transform', 'uppercase');
				textTemplate.setAttribute('text-anchor', 'end');
				textTemplate.setAttribute('fill', '#00FF21');
				this.selectedModeStatusText = textTemplate.cloneNode();
				this.selectedModeStatusText.setAttribute('font-size', (lineHeight * .5).toString());
				this.selectedModeStatusText.setAttribute('x', `${this.right - 25}`);
				this.selectedModeStatusText.innerHTML = 'SEL';
				this.activeAutopilotInfoGroup.appendChild(this.selectedModeStatusText);
				this.selectedModeText = textTemplate.cloneNode();
				this.selectedModeText.setAttribute('font-size', (lineHeight * .5).toString());
				this.selectedModeText.setAttribute('x', `${this.right - 25}`);
				this.selectedModeText.innerHTML = this.simAutopilotHeadTrackMode;
				this.activeAutopilotInfoGroup.appendChild(this.selectedModeText);
				this.selectedModeValueText = textTemplate.cloneNode();
				this.selectedModeValueText.setAttribute('font-size', lineHeight.toString());
				this.selectedModeValueText.setAttribute('x', `${this.right - 25}`);
				this.selectedModeValueText.innerHTML = this.simAutopilotHeadTrackValue.toString();
				this.activeAutopilotInfoGroup.appendChild(this.selectedModeValueText);
			}
			this.appendChild(this.svg);
		};
	}

	static get observedAttributes() {
		return [
			'sim-gs',
			'sim-tas',
			'sim-wind-dir',
			'sim-wind-speed',
			'sim-waypoint-name',
			'sim-waypoint-eta',
			'sim-waypoint-dist',
			'sim-autopilot-on',
			'sim-autopilot-headtrack-mode',
			'sim-autopilot-headtrack-value'
		];
	}

	connectedCallback() {
		this.construct();
	}

	get simGS() {
		return Number(this.getAttribute('sim-gs'));
	}

	set simGS(value) {
		this.setAttribute('sim-gs', `${value}`);
	}

	get simTAS() {
		return Number(this.getAttribute('sim-tas'));
	}

	set simTAS(value) {
		this.setAttribute('sim-tas', `${value}`);
	}

	get simWindDir() {
		return Number(this.getAttribute('sim-wind-dir'));
	}

	set simWindDir(value) {
		this.setAttribute('sim-wind-dir', `${value}`);
	}

	get simWindSpeed() {
		return Number(this.getAttribute('sim-wind-speed'));
	}

	set simWindSpeed(value) {
		this.setAttribute('sim-wind-speed', `${value}`);
	}

	get simPlaneAngle() {
		return Number(this.getAttribute('sim-plane-angle'));
	}

	set simPlaneAngle(value) {
		this.setAttribute('sim-plane-angle', `${value}`);
	}

	get simWaypointName() {
		return this.getAttribute('sim-waypoint-name');
	}

	set simWaypointName(value) {
		this.setAttribute('sim-waypoint-name', `${value}`);
	}

	get simWaypointETA() {
		return Number(this.getAttribute('sim-waypoint-eta'));
	}

	set simWaypointETA(value) {
		this.setAttribute('sim-waypoint-eta', `${value}`);
	}

	get simWaypointDistance() {
		return Number(this.getAttribute('sim-waypoint-dist'));
	}

	set simWaypointDistance(value) {
		this.setAttribute('sim-waypoint-dist', `${value}`);
	}

	get simIsAutopilotOn() {
		return this.hasAttribute('sim-autopilot-on');
	}

	set simIsAutopilotOn(value) {
		if (value) {
			this.setAttribute('sim-autopilot-on', '');
		} else {
			this.removeAttribute('sim-autopilot-on');
		}
	}

	get simAutopilotHeadTrackMode() {
		return this.getAttribute('sim-autopilot-headtrack-mode');
	}

	set simAutopilotHeadTrackMode(value) {
		this.setAttribute('sim-autopilot-headtrack-mode', `${value}`);
	}

	get simAutopilotHeadTrackValue() {
		return Number(this.getAttribute('sim-autopilot-headtrack-value'));
	}

	set simAutopilotHeadTrackValue(value) {
		this.setAttribute('sim-autopilot-headtrack-value', `${value}`);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'sim-gs':
				if (newValue == oldValue)
					break;
				this.groundSpeedValueText.innerHTML = Math.round(this.simGS).toString().padStart(3, '0');
				break;
			case 'sim-tas':
				if (newValue == oldValue)
					break;
				this.trueAirSpeedValueText.innerHTML = Math.round(this.simTAS).toString().padStart(3, '0');
				break;
			case 'sim-wind-dir':
				if (newValue == oldValue)
					break;
				this.updateWindDir();
				break;
			case 'sim-wind-speed':
				if (newValue == oldValue)
					break;
				this.updateWindSpeed();
				break;
			case 'sim-plane-angle':
				if (newValue == oldValue)
					break;
				this.updateWindArrow();
				break;
			case 'sim-waypoint-name':
				if (newValue == oldValue)
					break;
				this.activeWaypointInfoGroup.classList.toggle('hide', this.simWaypointName.length == 0);
				this.activeWaypointNameText.innerHTML = this.simWaypointName;
				break;
			case 'sim-waypoint-eta':
				if (newValue == oldValue)
					break;
				this.activeWaypointETAText.innerHTML = Math.floor((this.simWaypointETA / 3600) % 24).toString().padStart(2, '0') + Math.floor((this.simWaypointETA / 60) % 60).toString().padStart(2, '0') + '.0';
				break;
			case 'sim-waypoint-dist':
				if (newValue == oldValue)
					break;
				this.activeWaypointDistanceToGoText.innerHTML = this.simWaypointDistance.toFixed(2).padStart(2, '0');
				break;
			case 'sim-autopilot-on':
				if (newValue == oldValue)
					break;
				this.selectedModeStatusText.classList.toggle('hide', !this.simIsAutopilotOn);
				break;
			case 'sim-autopilot-headtrack-mode':
				if (newValue == oldValue)
					break;
				this.selectedModeText.innerHTML = this.simAutopilotHeadTrackMode;
				break;
			case 'sim-autopilot-headtrack-value':
				if (newValue == oldValue)
					break;
				this.selectedModeValueText.innerHTML = `${this.simAutopilotHeadTrackValue}`;
				break;
		}
	}

	updateWindSpeed() {
		if (Simplane.getIsGrounded()) {
			this.windSpeedValueText.innerHTML = '--';
			if (this.windStrongEnough) {
				this.windStrongEnough = false;
				this.updateWindArrow();
			}
		} else {
			let speed = Math.round(this.simWindSpeed);
			this.windSpeedValueText.innerHTML = speed.toString().padStart(2, '0');
			if (this.windStrongEnough && speed < B787_10_PFD_CompassInfos.MIN_WIND_STRENGTH_FOR_ARROW_DISPLAY) {
				this.windStrongEnough = false;
				this.updateWindArrow();
			} else if (!this.windStrongEnough && speed >= (B787_10_PFD_CompassInfos.MIN_WIND_STRENGTH_FOR_ARROW_DISPLAY + 2)) {
				this.windStrongEnough = true;
				this.updateWindArrow();
			}
		}
	}

	updateWindDir() {
		let startAngle = this.smoothedWindAngle;
		let endAngle = Math.round(this.simWindDir);
		let delta = endAngle - startAngle;
		if (delta > 180) {
			startAngle += 360;
		} else if (delta < -180) {
			endAngle += 360;
		}
		let smoothedAngle = Utils.SmoothSin(startAngle, endAngle, 0.25, this.deltaTime / 1000);
		this.smoothedWindAngle = smoothedAngle % 360;
		if (this.windStrongEnough)
			this.windDirectionValueText.innerHTML = this.smoothedWindAngle.toFixed(0).padStart(3, '0');
		else
			this.windDirectionValueText.innerHTML = '---';
		this.updateWindArrow();
	}

	updateWindArrow() {
		if (this.windStrongEnough) {
			let angle = Math.round(this.simPlaneAngle);
			var arrowAngle = this.smoothedWindAngle - angle;
			arrowAngle += 180;
			var transformStr = this.windArrow.getAttribute('transform');
			if (transformStr) {
				var split = transformStr.split('rotate');
				if (split) {
					transformStr = split[0];
				} else {
					transformStr = '';
				}
			}
			if (transformStr)
				this.windArrow.setAttribute('transform', transformStr + ' rotate(' + arrowAngle + ')');
			else
				this.windArrow.setAttribute('transform', 'rotate(' + arrowAngle + ')');
			this.windArrow.style.display = 'block';
		} else {
			this.windArrow.style.display = 'none';
		}
	}
}

B787_10_PFD_CompassInfos.MIN_WIND_STRENGTH_FOR_ARROW_DISPLAY = 2;
customElements.define('b787-10-pfd-compass-infos', B787_10_PFD_CompassInfos);

class B787_10_PFD_PlaneInfo extends NavSystemElement {
	constructor() {
		super(...arguments);
		this.chronoTime = 0;
		this.chronoStarted = false;
		this.chronoVisible = false;
	}

	init(root) {
		this.flight = this.gps.getChildById('Value_Flight');
		this.freq = this.gps.getChildById('Value_Frequency');
		this.xpdr = this.gps.getChildById('Value_XPDR');
		this.selcal = this.gps.getChildById('Value_SELCAL');
		this.tail = this.gps.getChildById('Value_Tail');
		this.freq.textContent = '---';
		this.selcal.textContent = 'AS-BO';
		this.tail.textContent = SimVar.GetSimVarValue('ATC ID', 'string');
		this.analog = this.gps.getChildById('Analog');
		this.analogHour = this.gps.getChildById('Analog_Hour');
		this.analogMin = this.gps.getChildById('Analog_Minutes');
		this.analogSec = this.gps.getChildById('Analog_Seconds');
		this.analogSec.classList.toggle('hide', true);
		this.digital = this.gps.getChildById('Digital');
	}

	onPowerOn() {
		this.chronoTime = 0;
		this.chronoStarted = true;
		this.chronoVisible = true;
	}

	onEnter() {
	}

	onUpdate(_deltaTime) {
		{
			if (this.chronoStarted) {
				this.chronoTime += _deltaTime / 1000;
			}
			let minutes = Math.floor(this.chronoTime / 60);
			let seconds = Math.floor(this.chronoTime - (minutes * 60));
			if (this.analogHour) {
				let secDeg = (6 * seconds) % 360;
				let minDeg = (6 * minutes) % 360;
				this.analogHour.setAttribute('transform', 'rotate(' + minDeg + ' 250 250)');
				this.analogMin.setAttribute('transform', 'rotate(' + secDeg + ' 250 250)');
				this.analog.setAttribute('visibility', (this.chronoVisible) ? 'visible' : 'hidden');
			}
			if (this.digital) {
				this.digital.textContent = Utils.timeToString(-1, minutes, seconds);
				this.digital.classList.toggle('hide', !this.chronoVisible);
			}
		}
		if (this.xpdr) {
			let code = SimVar.GetSimVarValue('TRANSPONDER CODE:1', 'number');
			this.xpdr.textContent = code.toString().padStart(4, '0');
		}
		if (this.flight) {
			let flightNumber = SimVar.GetSimVarValue('ATC FLIGHT NUMBER', 'string');
			this.flight.textContent = (flightNumber != '') ? flightNumber : '787-10 Dreamliner';
		}
		if (this.freq) {
			let activeFreq = SimVar.GetSimVarValue('L:VHF_ACTIVE_INDEX:1', 'number') + 1;
			this.freq.textContent = this.gps.radioNav.getVHFActiveFrequency(1, activeFreq).toFixed(3);
		}
	}

	onExit() {
	}

	onEvent(_event) {
		switch (_event) {
			case 'BTN_Clock':
				if (this.chronoVisible) {
					if (this.chronoStarted) {
						this.chronoStarted = false;
					} else {
						this.chronoVisible = false;
					}
				} else {
					this.chronoVisible = true;
					this.chronoStarted = true;
				}
				break;
		}
	}
}

class B787_10_PFD_DayInfo extends NavSystemElement {
	constructor() {
		super(...arguments);
		this.flightDuration = 0;
		this.flightStartTime = -1;
	}

	init(root) {
		this.utc = this.gps.getChildById('Value_UTC');
		this.date = this.gps.getChildById('Value_Date');
		this.elapsed = this.gps.getChildById('Value_Elapsed');
	}

	onEnter() {
	}

	onUpdate(_deltaTime) {
		if (this.flightStartTime <= 0) {
			this.flightStartTime = SimVar.GetSimVarValue('E:ABSOLUTE TIME', 'seconds');
			this.flightDuration = 0;
		}
		if (this.utc) {
			var value = SimVar.GetGlobalVarValue('ZULU TIME', 'seconds');
			if (value) {
				var seconds = Number.parseInt(value);
				var time = Utils.SecondsToDisplayTime(seconds, true, true, false);
				this.utc.textContent = time + 'z';
			}
		}
		if (this.date) {
			var value1 = SimVar.GetGlobalVarValue('LOCAL DAY OF MONTH', 'number');
			var value2 = SimVar.GetGlobalVarValue('LOCAL MONTH OF YEAR', 'number');
			var value3 = SimVar.GetGlobalVarValue('LOCAL YEAR', 'number');
			if (value1 && value2 && value3) {
				let text = '';
				var day = Number.parseInt(value1);
				if (day < 10)
					text += '0';
				text += day;
				text += '/';
				var month = Number.parseInt(value2);
				if (month < 10)
					text += '0';
				text += month;
				text += '/';
				var year = Math.trunc(Number.parseInt(value3) / 100);
				if (year < 10)
					text += '0';
				text += year;
				this.date.textContent = text;
			}
		}
		if (this.elapsed) {
			var value = SimVar.GetSimVarValue('E:ABSOLUTE TIME', 'seconds');
			if (value >= this.flightStartTime) {
				this.flightDuration = value - this.flightStartTime;
			}
			this.elapsed.textContent = Utils.SecondsToDisplayTime(this.flightDuration, true, false, false);
		}
	}

	onExit() {
	}

	onEvent(_event) {
	}
}

registerInstrument('b787-10-pfd-element', B787_10_PFD);
//# sourceMappingURL=B787_10_PFD.js.map