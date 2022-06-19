class B787_10_SYS extends B787_10_CommonMFD.MFDTemplateElement {
	constructor() {
		super(...arguments);
		this.allPageButtons = new Array();
		this.currentPage = null;
		this.navHighlight = -1;
		this.navHighlightTimer = -1.0;
		this.navHighlightLastIndex = 0;
	}

	get templateID() {
		return 'B787_10_SYS_Template';
	}

	get pageIdentifier() {
		return MFDPageType.SYS;
	}

	initChild() {
		if (this.allPageButtons == null) {
			this.allPageButtons = new Array();
		}
		var pageButtonSmallTemplate = this.querySelector('#PageButtonSmallTemplate');
		var pageButtonLargeTemplate = this.querySelector('#PageButtonLargeTemplate');
		if (pageButtonSmallTemplate != null) {
			this.allPageButtons.push(new B787_10_SYS_Page_STAT(this, pageButtonSmallTemplate));
			this.allPageButtons.push(new B787_10_SYS_Page_ELEC(this, pageButtonSmallTemplate));
			this.allPageButtons.push(new B787_10_SYS_Page_HYD(this, pageButtonSmallTemplate));
			this.allPageButtons.push(new B787_10_SYS_Page_FUEL(this, pageButtonSmallTemplate));
			this.allPageButtons.push(new B787_10_SYS_Page_AIR(this, pageButtonSmallTemplate));
			this.allPageButtons.push(new B787_10_SYS_Page_DOOR(this, pageButtonSmallTemplate));
			pageButtonSmallTemplate.remove();
		}
		if (pageButtonLargeTemplate != null) {
			this.allPageButtons.push(new B787_10_SYS_Page_GEAR(this, pageButtonLargeTemplate));
			this.allPageButtons.push(new B787_10_SYS_Page_FCTL(this, pageButtonLargeTemplate));
			this.allPageButtons.push(new B787_10_SYS_Page_EFIS_DSP(this, pageButtonLargeTemplate));
			this.allPageButtons.push(new B787_10_SYS_Page_MAINT(this, pageButtonLargeTemplate));
			this.allPageButtons.push(new B787_10_SYS_Page_CB(this, pageButtonLargeTemplate));
			pageButtonLargeTemplate.remove();
		}
		if (this.allPageButtons != null) {
			for (var i = 0; i < this.allPageButtons.length; ++i) {
				if (this.allPageButtons[i] != null) {
					this.allPageButtons[i].init();
				}
			}
		}
		this.setPageActiveByName('FUEL');
	}

	updateChild(_deltaTime) {
		if (this.currentPage != null) {
			this.currentPage.update(_deltaTime);
		}
		if (this.navHighlightTimer >= 0) {
			this.navHighlightTimer -= _deltaTime / 1000;
			if (this.navHighlightTimer <= 0) {
				this.setNavHighlight(-1);
				this.navHighlightTimer = -1;
			}
		}
	}

	onEvent(_event) {
		if (_event.startsWith('CHANGE_SYS_PAGE_')) {
			this.setPageActiveByName(_event.replace('CHANGE_SYS_PAGE_', ''));
		} else {
			switch (_event) {
				case 'Cursor_DEC':
					if (this.navHighlight > 0)
						this.setNavHighlight(this.navHighlight - 1);
					else if (this.navHighlight == -1)
						this.setNavHighlight(this.navHighlightLastIndex);
					break;
				case 'Cursor_INC':
					if (this.navHighlight >= 0 && this.navHighlight < this.allPageButtons.length - 1)
						this.setNavHighlight(this.navHighlight + 1);
					else if (this.navHighlight == -1)
						this.setNavHighlight(this.navHighlightLastIndex);
					break;
				case 'Cursor_Press':
					if (this.navHighlight >= 0) {
						this.allPageButtons[this.navHighlight].trigger();
					}
					break;
			}
		}
	}

	setGPS(_gps) {
	}

	setPageActiveByIndex(_index) {
		if ((_index >= 0) && (this.allPageButtons != null) && (_index < this.allPageButtons.length)) {
			for (var i = 0; i < this.allPageButtons.length; ++i) {
				if (this.allPageButtons[i] != null) {
					if (i == _index) {
						this.allPageButtons[i].isActive = true;
						this.currentPage = this.allPageButtons[i];
						this.navHighlightLastIndex = _index;
					} else {
						this.allPageButtons[i].isActive = false;
					}
				}
			}
		}
	}

	setPageActiveByName(_name) {
		if (this.allPageButtons != null) {
			for (var i = 0; i < this.allPageButtons.length; ++i) {
				if (this.allPageButtons[i] != null) {
					if (_name == this.allPageButtons[i].getName()) {
						this.setPageActiveByIndex(i);
						break;
					}
				}
			}
		}
	}

	setNavHighlight(_index) {
		if (this.navHighlight != _index) {
			if (this.navHighlight >= 0) {
				this.navHighlight = -1;
				this.navHighlightTimer = -1.0;
			}
			if (_index >= 0) {
				this.navHighlight = _index;
				this.navHighlightTimer = 5.0;
				this.navHighlightLastIndex = _index;
			}
			for (var i = 0; i < this.allPageButtons.length; ++i) {
				if (i == this.navHighlight) {
					this.allPageButtons[i].isHighlight = true;
				} else {
					this.allPageButtons[i].isHighlight = false;
				}
			}
		}
	}
}

class B787_10_SYS_Page {
	constructor(_sys, _buttonTemplate) {
		this.sys = null;
		this.buttonRoot = null;
		this.pageRoot = null;
		this.active = false;
		this.allTextValueComponents = new Array();
		this.gallonToMegagrams = 0;
		this.gallonToMegapounds = 0;
		this.sys = _sys;
		if (_sys != null) {
			var pageButtonRoot = _sys.querySelector('#' + this.getName() + '_PageButton');
			if ((pageButtonRoot != null) && (_buttonTemplate != null)) {
				this.buttonRoot = _buttonTemplate.cloneNode(true);
				this.buttonRoot.removeAttribute('id');
				pageButtonRoot.appendChild(this.buttonRoot);
				this.buttonRoot.addEventListener('mouseup', this.trigger.bind(this));
				var textElement = this.buttonRoot.querySelector('text');
				if (textElement != null) {
					diffAndSetText(textElement, this.getName().replace('_', '/'));
				}
			}
			this.pageRoot = _sys.querySelector('#' + this.getName() + '_Page');
		}
		this.gallonToMegagrams = SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'kilogram') * 0.001;
		this.gallonToMegapounds = SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'lbs') * 0.001;
	}

	set isActive(_active) {
		this.active = _active;
		if (this.buttonRoot != null) {
			if (this.active) {
				this.buttonRoot.classList.add('page-button-active');
				this.buttonRoot.classList.remove('page-button-inactive');
			} else {
				this.buttonRoot.classList.remove('page-button-active');
				this.buttonRoot.classList.add('page-button-inactive');
			}
		}
		if (this.pageRoot != null) {
			diffAndSetStyle(this.pageRoot, StyleProperty.display, this.active ? 'block' : 'none');
		}
	}

	set isHighlight(_highlight) {
		if (this.buttonRoot != null) {
			if (_highlight) {
				this.buttonRoot.classList.add('page-button-highlight');
			} else {
				this.buttonRoot.classList.remove('page-button-highlight');
			}
		}
	}

	init() {
		if (this.pageRoot != null) {
			var inopText = document.createElementNS(Avionics.SVG.NS, 'text');
			diffAndSetAttribute(inopText, 'x', '50%');
			diffAndSetAttribute(inopText, 'y', '5%');
			diffAndSetAttribute(inopText, 'fill', 'var(--eicasWhite)');
			diffAndSetAttribute(inopText, 'fill', 'var(--eicasWhite)');
			diffAndSetAttribute(inopText, 'font-size', '45px');
			diffAndSetAttribute(inopText, 'text-anchor', 'middle');
			diffAndSetText(inopText, 'INOP');
			this.pageRoot.appendChild(inopText);
		}
	}

	update(_deltaTime) {
		if (this.active) {
			if (this.allTextValueComponents != null) {
				for (var i = 0; i < this.allTextValueComponents.length; ++i) {
					if (this.allTextValueComponents[i] != null) {
						this.allTextValueComponents[i].refresh();
					}
				}
			}
			this.updateChild(_deltaTime);
		}
	}

	trigger() {
		this.sys.onEvent('CHANGE_SYS_PAGE_' + this.getName());
	}

	getTotalFuelInMegagrams() {
		let factor = this.gallonToMegapounds;
		if (!HeavyDivision.configuration.useImperial())
			factor = this.gallonToMegagrams;
		return (SimVar.GetSimVarValue('FUEL TOTAL QUANTITY', 'gallons') * factor);
	}

	getMainTankFuelInMegagrams(_index) {
		let factor = this.gallonToMegapounds;
		if (!HeavyDivision.configuration.useImperial())
			factor = this.gallonToMegagrams;
		return (SimVar.GetSimVarValue('FUELSYSTEM TANK QUANTITY:' + _index, 'gallons') * factor);
	}
}

class B787_10_SYS_Page_STAT extends B787_10_SYS_Page {
	init() {
		if (this.pageRoot != null) {
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#box-content-value-rpm-apu'), this.getApuRPM.bind(this), 1));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#box-content-value-egt-apu-span'), this.getApuEGT.bind(this), 0));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#box-content-value-oil-press-apu-span'), this.getApuOilPress.bind(this), 0));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#box-content-value-oil-temp-apu-span'), this.getApuOilTemp.bind(this), 0));
		}
	}

	updateChild(_deltaTime) {
	}

	getName() {
		return 'STAT';
	}

	getApuRPM() {
		return SimVar.GetSimVarValue(B78XH_LocalVariables.APU.RPM, 'Percent');
	}

	getApuEGT() {
		let egt = SimVar.GetSimVarValue(B78XH_LocalVariables.APU.EGT, 'Celsius');
		return egt || SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'Celsius');
	}

	getApuOilPress() {
		return SimVar.GetSimVarValue(B78XH_LocalVariables.APU.OIL_PRESS, 'Number');
	}

	getApuOilTemp() {
		return SimVar.GetSimVarValue(B78XH_LocalVariables.APU.OIL_TEMP, 'Number');
	}
}

class B787_10_SYS_Page_ELEC extends B787_10_SYS_Page {

	init() {

		if (this.pageRoot != null) {
<<<<<<< Updated upstream
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#text-value-bat-volt'), this.getBatVolt.bind(this), 1));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#text-value-bat-amps'), this.getBatAmps.bind(this), 0));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#text-value-apu-volt'), this.getBatVolt.bind(this), 1));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#text-value-apu-amps'), this.getBatAmps.bind(this), 0));
=======
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#dynamic-bat-volt'), this.getBatVolt.bind(this), 1));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#dynamic-bat-amps'), this.getBatAmps.bind(this), 0));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#dynamic-apu-volt'), this.getBatVolt.bind(this), 1));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#dynamic-apu-amps'), this.getBatAmps.bind(this), 0));
			this.fwdExtBoxL = this.pageRoot.querySelector('#fwd-ext-l-pwr-box');
			this.fwdExtPwrLineL = this.pageRoot.querySelector('#fwd-ext-pwr-line-l');
			this.fwdExtPwrActiveL = this.pageRoot.querySelector('#fwd-ext-l-pwr-active');
			this.fwdExtBoxR = this.pageRoot.querySelector('#fwd-ext-r-pwr-box');
			this.fwdExtPwrLineR = this.pageRoot.querySelector('#fwd-ext-pwr-line-r');
			this.fwdExtPwrActiveR = this.pageRoot.querySelector('#fwd-ext-r-pwr-active');
			this.aftExtBox = this.pageRoot.querySelector('#aft-ext-pwr-box');
			this.aftExtPwrLine = this.pageRoot.querySelector('#aft-ext-pwr-line');
			this.aftExtPwrActive = this.pageRoot.querySelector('#aft-ext-pwr-active');
			this.apuStarterL = this.pageRoot.querySelector('#apu-l-starter-arrow');
			this.apuStarterR = this.pageRoot.querySelector('#apu-r-starter-arrow');
			this.apuPwrBoxL = this.pageRoot.querySelector('#apu-l-pwr-box');
			this.apuPwrBoxR = this.pageRoot.querySelector('#apu-r-pwr-box');
			this.apuPwrBoxActiveL = this.pageRoot.querySelector('#apu-l-pwr-active');
			this.apuPwrBoxActiveR = this.pageRoot.querySelector('#apu-r-pwr-active');
			this.ApuPwrLineL = this.pageRoot.querySelector('#apu-pwr-line-l');
			this.apuPwrLineR = this.pageRoot.querySelector('#apu-pwr-line-r')
			this.apuBusOut = this.pageRoot.querySelector('#apu-bus-pwr-out');
			this.apuStartArrow = this.pageRoot.querySelector('#apu-start-arrow');
			this.apuStartText1 = this.pageRoot.querySelector('#apu-start-text-1');
			this.apuStartText2 = this.pageRoot.querySelector('#apu-start-text-2');
			this.lEngPwrL = this.pageRoot.querySelector('#l-eng-pwr-box-l');
			this.lEngPwrR = this.pageRoot.querySelector('#l-eng-pwr-box-r');
			this.lEngStarterArrowL = this.pageRoot.querySelector('#l-eng-starter-arrow-l');
			this.lEngStarterArrowR = this.pageRoot.querySelector('#l-eng-starter-arrow-r');
			this.lEngPwrActiveL = this.pageRoot.querySelector('#l-eng-pwr-active-l');
			this.lEngPwrActiveR = this.pageRoot.querySelector('#l-eng-pwr-active-r');
			this.lEngDriveL = this.pageRoot.querySelector('#l-eng-drive-box-l');
			this.lEngDriveR = this.pageRoot.querySelector('#l-eng-drive-box-r');
			this.lEngPowerStartArrow = this.pageRoot.querySelector('#l-start-arrow');
			this.lEngPowerStartText = this.pageRoot.querySelector('#l-start-text');
			this.lEngOutPwrL1 = this.pageRoot.querySelector('#l1-gen-out-arrow');
			this.lEngOutPwrL2 = this.pageRoot.querySelector('#l2-gen-out-arrow');
			this.lEngBusOut = this.pageRoot.querySelector('#l-bus-pwr-out');
			this.l1EngPwrLine = this.pageRoot.querySelector('#l1-pwr-line');
			this.l2EngPwrLine = this.pageRoot.querySelector('#l2-pwr-line');
			this.rEngPwrL = this.pageRoot.querySelector('#r-eng-pwr-box-l');
			this.rEngPwrR = this.pageRoot.querySelector('#r-eng-gen-box-r');
			this.rEngStarterArrowL = this.pageRoot.querySelector('#r-eng-starter-arrow-l');
			this.rEngStarterArrowR = this.pageRoot.querySelector('#r-eng-starter-arrow-r');
			this.rEngPwrActiveL = this.pageRoot.querySelector('#r-eng-pwr-active-l');
			this.rEngPwrActiveR = this.pageRoot.querySelector('#r-eng-pwr-active-r');
			this.rEngDriveL = this.pageRoot.querySelector('#r-eng-drive-box-l');
			this.rEngDriveR = this.pageRoot.querySelector('#r-eng-drive-box-r');
			this.rEngPowerStartArrow = this.pageRoot.querySelector('#r-start-arrow');
			this.rEngPowerStartText = this.pageRoot.querySelector('#r-start-text');
			this.rEngOutPwrL1 = this.pageRoot.querySelector('#r1-gen-out-arrow');
			this.rEngOutPwrL2 = this.pageRoot.querySelector('#r2-gen-out-arrow');
			this.rEngBusOut = this.pageRoot.querySelector('#r-bus-pwr-out');
			this.r1EngPwrLine = this.pageRoot.querySelector('#r1-pwr-line');
			this.r2EngPwrLine = this.pageRoot.querySelector('#r2-pwr-line');
			this.batCharging = this.pageRoot.querySelector('#bat-status-chg');
			this.batDischarging = this.pageRoot.querySelector('#bat-status-disch');
			this.apuCharging = this.pageRoot.querySelector('#apu-status-chg');
			this.apuDischarging = this.pageRoot.querySelector('#apu-status-disch');
>>>>>>> Stashed changes
		}
	}
	updateChild(_deltaTime) {
		if (this.pageRoot != null) {
			this.getBatVolt();
			this.getBatAmps();
<<<<<<< Updated upstream
			this.updateAftExtPwrAvail();
			this.updateFwdExtPwrAvailL();
			this.updateFwdExtPwrAvailR();
			this.updateFwdExtPwrLStatus();
			this.updateFwdExtPwrRStatus();
			this.updateAftExtPwrStatus();
			this.updateApuGenStatus();
			this.updateLengGenStatus();
			this.updateRengGenStatus();
=======
			this.updateAftExtPwr();
			this.updateLeftFwdExtPwr();
			this.updateRightFwdExtPwr();
			this.updateLeftFwdExtPwrStatus();
			this.updateRightFwdExtPwrStatus();
			this.updateAftExtPwrStatus();
			this.updateApuGenStatus();
			this.updateLeftEngStatus();
			this.updateRightEngStatus();
>>>>>>> Stashed changes
		}
	}

	/* Update External Power Availability */
<<<<<<< Updated upstream
	updateFwdExtPwrAvailL()	{
		let FwdExtPwrAvailL = SimVar.GetSimVarValue('EXTERNAL POWER AVAILABLE:1', 'Bool');
		let avail = 'pwr-box-active';
		let unavail = 'pwr-box-inactive';
		let FwdBoxL = this.pageRoot.querySelector('#FwdExtBoxL');
		if (FwdExtPwrAvailL == 1) {
			FwdBoxL.setAttribute('class', avail);
		} else {
			FwdBoxL.setAttribute('class', unavail);
		}	

	}
	updateFwdExtPwrAvailR()	{
		let FwdExtPwrAvailR = SimVar.GetSimVarValue('EXTERNAL POWER AVAILABLE:2', 'Bool');
		let avail = 'pwr-box-active';
		let unavail = 'pwr-box-inactive';
		let FwdBoxR = this.pageRoot.querySelector('#FwdExtBoxR');
		if (FwdExtPwrAvailR == 1) {
			FwdBoxR.setAttribute('class', avail);
		} else {
			FwdBoxR.setAttribute('class', unavail);
        }

	}
	updateAftExtPwrAvail() {
		let AftExtPwrAvail = SimVar.GetSimVarValue('EXTERNAL POWER AVAILABLE:3', 'Bool');
		let avail = 'pwr-box-active';
		let unavail = 'pwr-box-inactive';
		let Aftbox = this.pageRoot.querySelector('#AftPwrBox');
		if (AftExtPwrAvail == 1) {
			Aftbox.setAttribute('class', avail);
		} else {
			Aftbox.setAttribute('class', unavail);
=======
	updateLeftFwdExtPwr()	{
		let leftFwdExtPwrAvail = SimVar.GetSimVarValue('EXTERNAL POWER AVAILABLE:1', 'Bool');
		let available = 'pwr-box-active';
		let unavailable = 'pwr-box-inactive';
		if (leftFwdExtPwrAvail == 1) {
			this.fwdExtBoxL.setAttribute('class', available);
		} else {
			this.fwdExtBoxL.setAttribute('class', unavailable);
		}	

	}
	updateRightFwdExtPwr()	{
		let rightFwdExtPwrAvail = SimVar.GetSimVarValue('EXTERNAL POWER AVAILABLE:2', 'Bool');
		let available = 'pwr-box-active';
		let unavailable = 'pwr-box-inactive;
		if (rightFwdExtPwrAvail == 1) {
			this.fwdExtBoxR.setAttribute('class', available);
		} else {
			this.fwdExtBoxR.setAttribute('class', unavailable);
        }

	}
	updateAftExtPwr() {
		let aftExtPwrAvail = SimVar.GetSimVarValue('EXTERNAL POWER AVAILABLE:3', 'Bool');
		let available = 'pwr-box-active';
		let unavailable = 'pwr-box-inactive';
		if (aftExtPwrAvail == 1) {
			this.aftExtBox.setAttribute('class', available);
		} else {
			this.aftExtBox.setAttribute('class', unavailable);
>>>>>>> Stashed changes
		}
	}

	/* Update External Power State*/
<<<<<<< Updated upstream
	updateFwdExtPwrLStatus() {
		let FwdExtPwrLStatus = SimVar.GetSimVarValue('EXTERNAL POWER ON:1', 'Bool');
		let active = '100';
		let inactive = '0';
		let lineActive = 'pwr-line-active';
		let lineInactive = 'pwr-line-inactive';
		let FwdPwrBoxLineL = this.pageRoot.querySelector('#FwdExtBoxL-active');
		let FwdPwrLineL = this.pageRoot.querySelector('#Fwd-ext-pwr-line-L');
		if (FwdExtPwrLStatus == 1) {
			FwdPwrBoxLineL.setAttribute('opacity', active);
			FwdPwrLineL.setAttribute('class', lineActive);
		} else {
			FwdPwrBoxLineL.setAttribute('opacity', inactive);
			FwdPwrLineL.setAttribute('class', lineInactive);
        }
	}
	updateFwdExtPwrRStatus() {
		let FwdExtPwrRStatus = SimVar.GetSimVarValue('EXTERNAL POWER ON:2', 'Bool');
		let active = '100';
		let inactive = '0';
		let lineActive = 'pwr-line-active';
		let lineInactive = 'pwr-line-inactive';
		let FwdPwrBoxLineR = this.pageRoot.querySelector('#FwdExtBoxR-active');
		let FwdPwrLineR = this.pageRoot.querySelector('#Fwd-ext-pwr-line-R');
		if (FwdExtPwrRStatus == 1) {
			FwdPwrBoxLineR.setAttribute('opacity', active);
			FwdPwrLineR.setAttribute('class', lineActive);
		} else {
			FwdPwrBoxLineR.setAttribute('opacity', inactive);
			FwdPwrLineR.setAttribute('class', lineInactive);
=======
	updateLeftFwdExtPwrStatus() {
		let leftFwdExtPwrStatus = SimVar.GetSimVarValue('EXTERNAL POWER ON:1', 'Bool');
		let active = 100;
		let inactive = 0;
		let lineActive = 'pwr-line-active';
		let lineInactive = 'pwr-line-inactive';
		if (leftFwdExtPwrStatus == 1) {
			this.fwdExtPwrActiveL.setAttribute('opacity', active);
			this.fwdExtPwrLineL.setAttribute('class', lineActive);
		} else {
			this.fwdExtPwrActiveL.setAttribute('opacity', inactive);
			this.fwdExtPwrLineL.setAttribute('class', lineInactive);
        }
	}
	updateRightFwdExtPwrStatus() {
		let rightFwdExtPwrStatus = SimVar.GetSimVarValue('EXTERNAL POWER ON:2', 'Bool');
		let active = 100;
		let inactive = 0;
		let lineActive = 'pwr-line-active';
		let lineInactive = 'pwr-line-inactive';
		if (rightFwdExtPwrStatus == 1) {
			this.fwdExtPwrActiveR.setAttribute('opacity', active);
			this.fwdExtPwrLineR.setAttribute('class', lineActive);
		} else {
			this.fwdExtPwrActiveR.setAttribute('opacity', inactive);
			this.fwdExtPwrLineR.setAttribute('class', lineInactive);
>>>>>>> Stashed changes
		}
	}
	updateAftExtPwrStatus() {
		let AftExtPwrStatus = SimVar.GetSimVarValue('EXTERNAL POWER ON:3', 'Bool');
<<<<<<< Updated upstream
		let active = '100';
		let inactive = '0';
		let lineActive = 'pwr-line-active';
		let lineInactive = 'pwr-line-inactive';
		let AftPwrBoxLine = this.pageRoot.querySelector('#AftExtBox-active');
		let AftPwrLine = this.pageRoot.querySelector('#Aft-ext-pwr-line');
		if (AftExtPwrStatus == 1) {
			AftPwrBoxLine.setAttribute('opacity', active);
			AftPwrLine.setAttribute('class', lineActive);
		} else {
			AftPwrBoxLine.setAttribute('opacity', inactive);
			AftPwrLine.setAttribute('class', lineInactive);
=======
		let active = 100;
		let inactive = 0;
		let lineActive = 'pwr-line-active';
		let lineInactive = 'pwr-line-inactive';
		if (AftExtPwrStatus == 1) {
			this.aftExtPwrActive.setAttribute('opacity', active);
			this.aftExtPwrLine.setAttribute('class', lineActive);
		} else {
			this.aftExtPwrActive.setAttribute('opacity', inactive);
			this.aftExtPwrLine.setAttribute('class', lineInactive);
>>>>>>> Stashed changes
		}
	}

	/* Update APU Gen Status*/
	updateApuGenStatus() {
<<<<<<< Updated upstream
		let ApuGenRpm = SimVar.GetSimVarValue('APU PCT RPM', 'percent over 100');
		let ApuKnob = SimVar.GetSimVarValue('APU SWITCH', 'Bool');
		let ApuGenSwitchL = SimVar.GetSimVarValue('APU GENERATOR SWITCH:1', 'Bool');
		let ApuGenSwitchR = SimVar.GetSimVarValue('APU GENERATOR SWITCH:2', 'Bool');
		let Active = '100';
		let Inactive = '0';
		let genStatActive = 'pwr-box-active';
		let genStatInactive = 'pwr-box-inactive';
		let pwrlineActive = 'pwr-line-active';
		let pwrlineInactive = 'pwr-line-inactive';
		let ApuGenL = this.pageRoot.querySelector('#APU-gen-start-L');
		let ApuGenR = this.pageRoot.querySelector('#APU-gen-start-R');
		let ApuStatL = this.pageRoot.querySelector('#APU-gen-stat-L');
		let ApuStatR = this.pageRoot.querySelector('#APU-gen-stat-R');
		let ApuPwrStatL = this.pageRoot.querySelector('#APU-pwr-box-line-L');
		let ApuPwrStatR = this.pageRoot.querySelector('#APU-pwr-box-line-R');
		let ApuPwrLineL = this.pageRoot.querySelector('#apu-pwr-line-L');
		let apuPwrLineR = this.pageRoot.querySelector('#apu-pwr-line-R')
		let apubusoutline = this.pageRoot.querySelector('#apu-bus-pwr-out-line');
		let apuArrow = this.pageRoot.querySelector('#apu-start-arrow');
		let apustartlabel1 = this.pageRoot.querySelector('#apu-start-title-1');
		let apustartlabel2 = this.pageRoot.querySelector('#apu-start-title-2');
		if (ApuKnob == 1) {
			if (ApuGenRpm > 0.05 && ApuGenRpm < 0.99) {
				ApuGenL.setAttribute('opacity', Active);
				ApuGenR.setAttribute('opacity', Active);
				apuArrow.setAttribute('opacity', Active);
				apustartlabel1.setAttribute('opacity', Active);
				apustartlabel2.setAttribute('opacity', Active);
				apubusoutline.setAttribute('opacity', Active);
			} else if (ApuGenRpm == 1) {
				ApuGenL.setAttribute('opacity', Inactive);
				ApuGenR.setAttribute('opacity', Inactive);
				apuArrow.setAttribute('opacity', Inactive);
				apustartlabel1.setAttribute('opacity', Inactive);
				apustartlabel2.setAttribute('opacity', Inactive);
				apubusoutline.setAttribute('opacity', Inactive);
				ApuStatL.setAttribute('class', genStatActive);
				ApuStatR.setAttribute('class', genStatActive);
			}
		} else {
			ApuGenL.setAttribute('opacity', Inactive);
			ApuGenR.setAttribute('opacity', Inactive);
			apuArrow.setAttribute('opacity', Inactive);
			apustartlabel1.setAttribute('opacity', Inactive);
			apustartlabel2.setAttribute('opacity', Inactive);
			apubusoutline.setAttribute('opacity', Inactive);
			ApuStatL.setAttribute('class', genStatInactive);
			ApuStatR.setAttribute('class', genStatInactive);
		}
		if (ApuGenRpm == 1) {
			if (ApuGenSwitchL == 1) {
				ApuPwrStatL.setAttribute('opacity', Active);
				ApuPwrLineL.setAttribute('class', pwrlineActive);
			} else {
				ApuPwrStatL.setAttribute('opacity', Inactive);
				ApuPwrLineL.setAttribute('class', pwrlineInactive);
			}
		} else {
			ApuPwrStatL.setAttribute('opacity', Inactive);
			ApuPwrLineL.setAttribute('class', pwrlineInactive);
		}
		if (ApuGenRpm == 1) {
			if (ApuGenSwitchR == 1) {
				ApuPwrStatR.setAttribute('opacity', Active);
				apuPwrLineR.setAttribute('class', pwrlineActive);
			} else {
				ApuPwrStatR.setAttribute('opacity', Inactive);
				apuPwrLineR.setAttribute('class', pwrlineInactive);
			}
		} else {
			ApuPwrStatR.setAttribute('opacity', Inactive);
			apuPwrLineR.setAttribute('class', pwrlineInactive);
=======
		let apuRpm = SimVar.GetSimVarValue('APU PCT RPM', 'percent over 100');
		let apuKnob = SimVar.GetSimVarValue('APU SWITCH', 'Bool');
		let apuGenSwitchL = SimVar.GetSimVarValue('APU GENERATOR SWITCH:1', 'Bool');
		let apuGenSwitchR = SimVar.GetSimVarValue('APU GENERATOR SWITCH:2', 'Bool');
		let active = 100;
		let inactive = 0;
		let pwrActive = 'pwr-box-active';
		let pwrInactive = 'pwr-box-inactive';
		let pwrlineActive = 'pwr-line-active';
		let pwrlineInactive = 'pwr-line-inactive';
		if (apuKnob == 1) {
			if (apuRpm > 0.05 && apuRpm < 0.99) {
				this.apuStarterL.setAttribute('opacity', active);
				this.apuStarterR.setAttribute('opacity', active);
				this.apuStartArrow.setAttribute('opacity', active);
				this.apuStartText1.setAttribute('opacity', active);
				this.apuStartText2.setAttribute('opacity', active);
				this.apuBusOut.setAttribute('opacity', active);
			} else if (apuRpm == 1) {
				this.apuStarterL.setAttribute('opacity', inactive);
				this.apuStarterR.setAttribute('opacity', inactive);
				this.apuStartArrow.setAttribute('opacity', inactive);
				this.apuStartText1.setAttribute('opacity', inactive);
				this.apuStartText2.setAttribute('opacity', inactive);
				this.apuBusOut.setAttribute('opacity', inactive);
				this.apuPwrBoxL.setAttribute('class', pwrActive);
				this.apuPwrBoxR.setAttribute('class', pwrActive);
			}
		} else {
			this.apuStarterL.setAttribute('opacity', inactive);
			this.apuStarterR.setAttribute('opacity', inactive);
			this.apuStartArrow.setAttribute('opacity', inactive);
			this.apuStartText1.setAttribute('opacity', inactive);
			this.apuStartText2.setAttribute('opacity', inactive);
			this.apuBusOut.setAttribute('opacity', inactive);
			this.apuPwrBoxL.setAttribute('class', pwrInactive);
			this.apuPwrBoxR.setAttribute('class', pwrInactive);
		}
		if (apuRpm == 1) {
			if (apuGenSwitchL == 1) {
				this.apuPwrBoxL.setAttribute('opacity', active);
				this.ApuPwrLineL.setAttribute('class', pwrlineActive);
			} else {
				this.apuPwrBoxL.setAttribute('opacity', inactive);
				this.ApuPwrLineL.setAttribute('class', pwrlineInactive);
			}
		} else {
			this.apuPwrBoxL.setAttribute('opacity', inactive);
			this.ApuPwrLineL.setAttribute('class', pwrlineInactive);
		}
		if (apuRpm == 1) {
			if (apuGenSwitchR == 1) {
				this.apuPwrBoxR.setAttribute('opacity', active);
				this.apuPwrLineR.setAttribute('class', pwrlineActive);
			} else {
				this.apuPwrBoxR.setAttribute('opacity', inactive);
				this.apuPwrLineR.setAttribute('class', pwrlineInactive);
			}
		} else {
			this.apuPwrBoxR.setAttribute('opacity', inactive);
			this.apuPwrLineR.setAttribute('class', pwrlineInactive);
>>>>>>> Stashed changes
		}
    }

	/* Update L Eng Gen Status */
<<<<<<< Updated upstream
	updateLengGenStatus() {
		let LengGenN2 = SimVar.GetSimVarValue('ENG N2 RPM:1', 'Bool');
		let LengStarter = SimVar.GetSimVarValue('GENERAL ENG STARTER ACTIVE:1', 'Bool');
		let LengFuelSwitch = SimVar.GetSimVarValue('FUELSYSTEM VALVE SWITCH:1', 'Bool');
		let L1engMaster = SimVar.GetSimVarValue('GENERAL ENG MASTER ALTERNATOR:1', 'Bool');
		let L2engMaster = SimVar.GetSimVarValue('GENERAL ENG MASTER ALTERNATOR:2', 'Bool');
		let active = '100';
		let inactive = '0';
		let genStatActive = 'pwr-box-active';
		let genStatInactive = 'pwr-box-inactive';
		let driveStatActive = 'drive-box-active';
		let LengGenL = this.pageRoot.querySelector('#L-eng-gen-box-L');
		let LengGenR = this.pageRoot.querySelector('#L-eng-gen-box-R');
		let LengStartL = this.pageRoot.querySelector('#L-eng-gen-start-L');
		let LengStartR = this.pageRoot.querySelector('#L-eng-gen-start-R');
		let LengPwrL = this.pageRoot.querySelector('#L-eng-pwr-box-line-L');
		let LengPwrR = this.pageRoot.querySelector('#L-eng-pwr-box-line-R');
		let LengDriveL = this.pageRoot.querySelector('#L-eng-drive-box-L');
		let LengDriveR = this.pageRoot.querySelector('#L-eng-drive-box-R');
		let startarrow = this.pageRoot.querySelector('#l-start-arrow');
		let starttitle = this.pageRoot.querySelector('#l-start-title');
		let L1outpwrline = this.pageRoot.querySelector('#l1-gen-arrow');
		let L2outpwrline = this.pageRoot.querySelector('#l2-gen-arrow');
		let Lbusoutline = this.pageRoot.querySelector('#l-bus-pwr-out-line');
		let L1pwrline = this.pageRoot.querySelector('#l1-pwr-line');
		let L2pwrline = this.pageRoot.querySelector('#l2-pwr-line');
		if (LengStarter == 1) {
			if (LengGenN2 > 0.008 && LengGenN2 < 0.59699) {
				LengStartL.setAttribute('opacity', active);
				LengStartR.setAttribute('opacity', active);
				startarrow.setAttribute('opacity', active);
				starttitle.setAttribute('opacity', active);
				Lbusoutline.setAttribute('opacity', active);
			} else if (LengGenN2 > 0.597) {
				LengStartL.setAttribute('opacity', inactive);
				LengStartR.setAttribute('opacity', inactive);
				startarrow.setAttribute('opacity', inactive);
				starttitle.setAttribute('opacity', inactive);
				Lbusoutline.setAttribute('opacity', inactive);
			}
		} else {
			LengStartL.setAttribute('opacity', inactive);
			LengStartR.setAttribute('opacity', inactive);
			startarrow.setAttribute('opacity', inactive);
			starttitle.setAttribute('opacity', inactive);
			Lbusoutline.setAttribute('opacity', inactive);
        }
		if (LengFuelSwitch == 1) {
			if (LengGenN2 > 0.596) {
				LengGenL.setAttribute('class', genStatActive);
				LengGenR.setAttribute('class', genStatActive);
				LengDriveL.setAttribute('class', driveStatActive);
				LengDriveR.setAttribute('class', driveStatActive);
			} else {
				LengGenL.setAttribute('class', genStatInactive);
				LengGenR.setAttribute('class', genStatInactive);
				LengDriveL.setAttribute('class', genStatInactive);
				LengDriveR.setAttribute('class', genStatInactive);
			}
		} else {
			LengGenL.setAttribute('class', genStatInactive);
			LengGenR.setAttribute('class', genStatInactive);
			LengDriveL.setAttribute('class', genStatInactive);
			LengDriveR.setAttribute('class', genStatInactive);
        }
		if (LengGenN2 > 0.597) {
			if (L1engMaster == 1) {
				LengPwrL.setAttribute('opacity', active);
				L1outpwrline.setAttribute('opacity', active);
				L1pwrline.setAttribute('opacity', inactive);				
			} else {
				LengPwrL.setAttribute('opacity', inactive);
				L1outpwrline.setAttribute('opacity', inactive);
				L1pwrline.setAttribute('opacity', active);				
			}
		} else {
			LengPwrL.setAttribute('opacity', inactive);
			L1outpwrline.setAttribute('opacity', inactive);
			L1pwrline.setAttribute('opacity', active);
		}
		if (LengGenN2 > 0.597) {
			if (L2engMaster == 1) {
				LengPwrR.setAttribute('opacity', active);
				L2outpwrline.setAttribute('opacity', active);
				L2pwrline.setAttribute('opacity', inactive);
			} else {
				LengPwrR.setAttribute('opacity', inactive);
				L2outpwrline.setAttribute('opacity', inactive)
				L2pwrline.setAttribute('opacity', active);
			}
		} else {
			LengPwrR.setAttribute('opacity', inactive);
			L2outpwrline.setAttribute('opacity', inactive)
			L2pwrline.setAttribute('opacity', active);
=======
	updateLeftEngStatus() {
		let lEngGenN2 = SimVar.GetSimVarValue('ENG N2 RPM:1', 'Bool');
		let lEngStarter = SimVar.GetSimVarValue('GENERAL ENG STARTER ACTIVE:1', 'Bool');
		let lEngFuelSwitch = SimVar.GetSimVarValue('FUELSYSTEM VALVE SWITCH:1', 'Bool');
		let l1EngMaster = SimVar.GetSimVarValue('GENERAL ENG MASTER ALTERNATOR:1', 'Bool');
		let l2EngMaster = SimVar.GetSimVarValue('GENERAL ENG MASTER ALTERNATOR:2', 'Bool');
		let active = 100;
		let inactive = 0;
		let genActive = 'pwr-box-active';
		let genInactive = 'pwr-box-inactive';
		let driveActive = 'drive-box-active';
		if (lEngStarter == 1) {
			if (lEngGenN2 > 0.008 && LengGenN2 < 0.59699) {
				this.lEngStarterArrowL.setAttribute('opacity', active);
				this.lEngStarterArrowR.setAttribute('opacity', active);
				this.lEngPowerStartArrow.setAttribute('opacity', active);
				this.lEngPowerStartText.setAttribute('opacity', active);
				this.lEngBusOut.setAttribute('opacity', active);
			} else if (lEngGenN2 > 0.597) {
				this.lEngStarterArrowL.setAttribute('opacity', inactive);
				this.lEngStarterArrowR.setAttribute('opacity', inactive);
				this.lEngPowerStartArrow.setAttribute('opacity', inactive);
				this.lEngPowerStartText.setAttribute('opacity', inactive);
				this.lEngBusOut.setAttribute('opacity', inactive);
			}
		} else {
			this.lEngStarterArrowL.setAttribute('opacity', inactive);
			this.lEngStarterArrowR.setAttribute('opacity', inactive);
			this.lEngPowerStartArrow.setAttribute('opacity', inactive);
			this.lEngPowerStartText.setAttribute('opacity', inactive);
			this.lEngBusOut.setAttribute('opacity', inactive);
        }
		if (lEngFuelSwitch == 1) {
			if (lEngGenN2 > 0.596) {
				this.lEngPwrL.setAttribute('class', genActive);
				this.lEngPwrR.setAttribute('class', genActive);
				this.lEngDriveL.setAttribute('class', driveActive);
				this.lEngDriveR.setAttribute('class', driveActive);
			} else {
				this.lEngPwrL.setAttribute('class', genInactive);
				this.lEngPwrR.setAttribute('class', genInactive);
				this.lEngDriveL.setAttribute('class', genInactive);
				this.lEngDriveR.setAttribute('class', genInactive);
			}
		} else {
			this.lEngPwrL.setAttribute('class', genInactive);
			this.lEngPwrR.setAttribute('class', genInactive);
			this.lEngDriveL.setAttribute('class', genInactive);
			this.lEngDriveR.setAttribute('class', genInactive);
        }
		if (lEngGenN2 > 0.597) {
			if (l1EngMaster == 1) {
				this.lEngPwrActiveL.setAttribute('opacity', active);
				this.lEngOutPwrL1.setAttribute('opacity', active);
				this.l1EngPwrLine.setAttribute('opacity', inactive);				
			} else {
				this.lEngPwrActiveL.setAttribute('opacity', inactive);
				this.lEngOutPwrL1.setAttribute('opacity', inactive);
				this.l1EngPwrLine.setAttribute('opacity', active);				
			}
		} else {
			this.lEngPwrActiveL.setAttribute('opacity', inactive);
			this.lEngOutPwrL1.setAttribute('opacity', inactive);
			this.l1EngPwrLine.setAttribute('opacity', active);
		}
		if (lEngGenN2 > 0.597) {
			if (l2EngMaster == 1) {
				this.lEngPwrActiveR.setAttribute('opacity', active);
				this.lEngOutPwrL2.setAttribute('opacity', active);
				this.l1EngPwrLine.setAttribute('opacity', inactive);
			} else {
				this.lEngPwrActiveR.setAttribute('opacity', inactive);
				this.lEngOutPwrL2.setAttribute('opacity', inactive)
				this.l1EngPwrLine.setAttribute('opacity', active);
			}
		} else {
			this.lEngPwrActiveR.setAttribute('opacity', inactive);
			this.lEngOutPwrL2.setAttribute('opacity', inactive)
			this.l1EngPwrLine.setAttribute('opacity', active);
>>>>>>> Stashed changes
		}
	}

	/* Update R Eng Gen Status */
<<<<<<< Updated upstream
	updateRengGenStatus() {
		let RengGenN2 = SimVar.GetSimVarValue('ENG N2 RPM:2', 'Bool');
		let RengStarter = SimVar.GetSimVarValue('GENERAL ENG STARTER ACTIVE:2', 'Bool');
		let RengFuelSwitch = SimVar.GetSimVarValue('FUELSYSTEM VALVE SWITCH:2', 'Bool');
		let R1engMaster = SimVar.GetSimVarValue('GENERAL ENG MASTER ALTERNATOR:3', 'Bool');
		let R2engMaster = SimVar.GetSimVarValue('GENERAL ENG MASTER ALTERNATOR:4', 'Bool');
		let active = '100';
		let inactive = '0';
		let genStatActive = 'pwr-box-active';
		let genStatInactive = 'pwr-box-inactive';
		let driveStatActive = 'drive-box-active';
		let RengGenL = this.pageRoot.querySelector('#R-eng-gen-box-L');
		let RengGenR = this.pageRoot.querySelector('#R-eng-gen-box-R');
		let RengStartL = this.pageRoot.querySelector('#R-eng-gen-start-L');
		let RengStartR = this.pageRoot.querySelector('#R-eng-gen-start-R');
		let RengPwrL = this.pageRoot.querySelector('#R-eng-pwr-box-line-L');
		let RengPwrR = this.pageRoot.querySelector('#R-eng-pwr-box-line-R');
		let RengDriveL = this.pageRoot.querySelector('#R-eng-drive-box-L');
		let RengDriveR = this.pageRoot.querySelector('#R-eng-drive-box-R');
		let startarrow = this.pageRoot.querySelector('#r-start-arrow');
		let starttitles = this.pageRoot.querySelector('#r-start-title');
		let R1outpwrline = this.pageRoot.querySelector('#r1-gen-arrow');
		let R2outpwrline = this.pageRoot.querySelector('#r2-gen-arrow');
		let Rbusoutline = this.pageRoot.querySelector('#r-bus-pwr-out-line');
		let r1pwrline = this.pageRoot.querySelector('#r1-pwr-line');
		let r2pwrline = this.pageRoot.querySelector('#r2-pwr-line');
		if (RengStarter == 1) {
			if (RengGenN2 > 0.008 && RengGenN2 < 0.59699) {
				RengStartL.setAttribute('opacity', active);
				RengStartR.setAttribute('opacity', active);
				startarrow.setAttribute('opacity', active);
				starttitles.setAttribute('opacity', active);
				Rbusoutline.setAttribute('opacity', active);
			} else if (RengGenN2 > 0.597) {
				RengStartL.setAttribute('opacity', inactive);
				RengStartR.setAttribute('opacity', inactive);
				startarrow.setAttribute('opacity', inactive);
				starttitles.setAttribute('opacity', inactive);
				Rbusoutline.setAttribute('opacity', inactive);
			}
		} else {
			RengStartL.setAttribute('opacity', inactive);
			RengStartR.setAttribute('opacity', inactive);
			startarrow.setAttribute('opacity', inactive);
			starttitles.setAttribute('opacity', inactive);
			Rbusoutline.setAttribute('opacity', inactive);
        }		
		if (RengFuelSwitch == 1) {
			if (RengGenN2 > 0.596) {
				RengGenL.setAttribute('class', genStatActive);
				RengGenR.setAttribute('class', genStatActive);
				RengDriveL.setAttribute('class', driveStatActive);
				RengDriveR.setAttribute('class', driveStatActive);
			} else {
				RengGenL.setAttribute('class', genStatInactive);
				RengGenR.setAttribute('class', genStatInactive);
				RengDriveL.setAttribute('class', genStatInactive);
				RengDriveR.setAttribute('class', genStatInactive);
			}
		} else {
			RengGenL.setAttribute('class', genStatInactive);
			RengGenR.setAttribute('class', genStatInactive);
			RengDriveL.setAttribute('class', genStatInactive);
			RengDriveR.setAttribute('class', genStatInactive);
		}
		if (RengGenN2 > 0.597) {
			if (R1engMaster == 1) {
				RengPwrL.setAttribute('opacity', active);
				R1outpwrline.setAttribute('opacity', active);
				r1pwrline.setAttribute('opacity', inactive);
			} else {
				RengPwrL.setAttribute('opacity', inactive);
				R1outpwrline.setAttribute('opacity', inactive);
				r1pwrline.setAttribute('opacity', active);
			}
		} else {
			RengPwrL.setAttribute('opacity', inactive);
			R1outpwrline.setAttribute('opacity', inactive);
			r1pwrline.setAttribute('opacity', active);
        }
		if (RengGenN2 > 0.597) {
			if (R2engMaster == 1) {
				RengPwrR.setAttribute('opacity', active);
				R2outpwrline.setAttribute('opacity', active);
				r2pwrline.setAttribute('opacity', inactive);
			} else {
				RengPwrR.setAttribute('opacity', inactive);
				R2outpwrline.setAttribute('opacity', inactive);
				r2pwrline.setAttribute('opacity', active);
			}
		} else {
			RengPwrR.setAttribute('opacity', inactive);
			R2outpwrline.setAttribute('opacity', inactive);
			r2pwrline.setAttribute('opacity', active);
=======
	updateRightEngStatus() {
		let rEngGenN2 = SimVar.GetSimVarValue('ENG N2 RPM:2', 'Bool');
		let rEngStarter = SimVar.GetSimVarValue('GENERAL ENG STARTER ACTIVE:2', 'Bool');
		let rEngFuelSwitch = SimVar.GetSimVarValue('FUELSYSTEM VALVE SWITCH:2', 'Bool');
		let r1EngMaster = SimVar.GetSimVarValue('GENERAL ENG MASTER ALTERNATOR:3', 'Bool');
		let r2EngMaster = SimVar.GetSimVarValue('GENERAL ENG MASTER ALTERNATOR:4', 'Bool');
		let active = '100';
		let inactive = '0';
		let genActive = 'pwr-box-active';
		let genInactive = 'pwr-box-inactive';
		let driveActive = 'drive-box-active';
		if (rEngStarter == 1) {
			if (rEngGenN2 > 0.008 && rEngGenN2 < 0.59699) {
				this.rEngStarterArrowL.setAttribute('opacity', active);
				this.rEngStarterArrowR.setAttribute('opacity', active);
				this.rEngPowerStartArrow.setAttribute('opacity', active);
				this.rEngPowerStartText.setAttribute('opacity', active);
				this.rEngBusOut.setAttribute('opacity', active);
			} else if (rEngGenN2 > 0.597) {
				this.rEngStarterArrowL.setAttribute('opacity', inactive);
				this.rEngStarterArrowR.setAttribute('opacity', inactive);
				this.rEngPowerStartArrow.setAttribute('opacity', inactive);
				this.rEngPowerStartText.setAttribute('opacity', inactive);
				this.rEngBusOut.setAttribute('opacity', inactive);
			}
		} else {
			this.rEngStarterArrowL.setAttribute('opacity', inactive);
			this.rEngStarterArrowR.setAttribute('opacity', inactive);
			this.rEngPowerStartArrow.setAttribute('opacity', inactive);
			this.rEngPowerStartText.setAttribute('opacity', inactive);
			this.rEngBusOut.setAttribute('opacity', inactive);
        }		
		if (rEngFuelSwitch == 1) {
			if (rEngGenN2 > 0.596) {
				this.rEngPwrL.setAttribute('class', genActive);
				this.rEngPwrR.setAttribute('class', genActive);
				this.rEngDriveL.setAttribute('class', driveActive);
				this.rEngDriveR.setAttribute('class', driveActive);
			} else {
				this.rEngPwrL.setAttribute('class', genInactive);
				this.rEngPwrR.setAttribute('class', genInactive);
				this.rEngDriveL.setAttribute('class', genInactive);
				this.rEngDriveR.setAttribute('class', genInactive);
			}
		} else {
			this.rEngPwrL.setAttribute('class', genInactive);
			this.rEngPwrR.setAttribute('class', genInactive);
			this.rEngDriveL.setAttribute('class', genInactive);
			this.rEngDriveR.setAttribute('class', genInactive);
		}
		if (rEngGenN2 > 0.597) {
			if (r1EngMaster == 1) {
				this.rEngPwrActiveL.setAttribute('opacity', active);
				this.rEngOutPwrL1.setAttribute('opacity', active);
				this.r1EngPwrLine.setAttribute('opacity', inactive);
			} else {
				this.rEngPwrActiveL.setAttribute('opacity', inactive);
				this.rEngOutPwrL1.setAttribute('opacity', inactive);
				this.r1EngPwrLine.setAttribute('opacity', active);
			}
		} else {
			this.rEngPwrActiveL.setAttribute('opacity', inactive);
			this.rEngOutPwrL1.setAttribute('opacity', inactive);
			this.r1EngPwrLine.setAttribute('opacity', active);
        }
		if (rEngGenN2 > 0.597) {
			if (r2EngMaster == 1) {
				this.rEngPwrActiveR.setAttribute('opacity', active);
				this.rEngOutPwrL2.setAttribute('opacity', active);
				this.r2EngPwrLine.setAttribute('opacity', inactive);
			} else {
				this.rEngPwrActiveR.setAttribute('opacity', inactive);
				this.rEngOutPwrL2.setAttribute('opacity', inactive);
				this.r2EngPwrLine.setAttribute('opacity', active);
			}
		} else {
			this.rEngPwrActiveR.setAttribute('opacity', inactive);
			this.rEngOutPwrL2.setAttribute('opacity', inactive);
			this.r2EngPwrLine.setAttribute('opacity', active);
>>>>>>> Stashed changes
        }
	}

	/* Update Main Bat Status*/
	getBatVolt() {
		return SimVar.GetSimVarValue(B78XH_LocalVariables.ELECSYS.BAT_V, 'volts');
	}
	getBatAmps() {
<<<<<<< Updated upstream
		let batstore = SimVar.GetSimVarValue('ELECTRICAL BATTERY ESTIMATED CAPACITY PCT', 'percent over 100')
		let batAmps = 0;
		let active = '100';
		let inactive = '0';
		let charging = this.pageRoot.querySelector('#text-bat-stat-chg');
		let discharge = this.pageRoot.querySelector('#text-bat-stat-disch');
		let apucharging = this.pageRoot.querySelector('#text-apu-stat-chg');
		let apudischarge = this.pageRoot.querySelector('#text-apu-stat-disch');
		batAmps = SimVar.GetSimVarValue('ELECTRICAL MAIN BUS AMPS', 'amperes');
		if (batstore == 1) {
			if (batAmps > 0) {
				batAmps = Math.floor(batAmps / 100);
				charging.setAttribute('opacity', inactive);
				apucharging.setAttribute('opacity', inactive);
			} else if (batAmps < 0) {
				batAmps = Math.abs(Math.floor(batAmps / 100));
				charging.setAttribute('opacity', inactive);
				apucharging.setAttribute('opacity', inactive);
			}
		}
		if (batstore < 1) {
			if (batAmps > 0) {
				batAmps = Math.floor(batAmps / 100);
				charging.setAttribute('opacity', active);
				apucharging.setAttribute('opacity', active);
				discharge.setAttribute('opacity', inactive);
				apudischarge.setAttribute('opacity', inactive);
			} else if (batAmps < 0) {
				batAmps = Math.abs(Math.floor(batAmps / 100));
				charging.setAttribute('opacity', inactive);
				apucharging.setAttribute('opacity', inactive);
				discharge.setAttribute('opacity', active);
				apudischarge.setAttribute('opacity', active);
=======
		let batStoragePct = SimVar.GetSimVarValue('ELECTRICAL BATTERY ESTIMATED CAPACITY PCT', 'percent over 100')
		let batAmps = 0;
		let active = 100;
		let inactive = 0;
		batAmps = SimVar.GetSimVarValue('ELECTRICAL MAIN BUS AMPS', 'amperes');
		if (batStoragePct == 1) {
			if (batAmps > 0) {
				batAmps = Math.floor(batAmps / 100);
				this.batCharging.setAttribute('opacity', inactive);
				this.apuCharging.setAttribute('opacity', inactive);
			} else if (batAmps < 0) {
				batAmps = Math.abs(Math.floor(batAmps / 100));
				this.batCharging.setAttribute('opacity', inactive);
				this.apuCharging.setAttribute('opacity', inactive);
			}
		}
		if (batStoragePct < 1) {
			if (batAmps > 0) {
				batAmps = Math.floor(batAmps / 100);
				this.batCharging.setAttribute('opacity', active);
				this.apuCharging.setAttribute('opacity', active);
				this.batDischarging.setAttribute('opacity', inactive);
				this.apuDischarging.setAttribute('opacity', inactive);
			} else if (batAmps < 0) {
				batAmps = Math.abs(Math.floor(batAmps / 100));
				this.batCharging.setAttribute('opacity', inactive);
				this.apuCharging.setAttribute('opacity', inactive);
				this.batDischarging.setAttribute('opacity', active);
				this.apuDischarging.setAttribute('opacity', active);
>>>>>>> Stashed changes
			}
		}
		return batAmps;
	}

	getName() {
		return 'ELEC';
	}
}

class B787_10_SYS_Page_HYD extends B787_10_SYS_Page {
	updateChild(_deltaTime) {
	}

	getName() {
		return 'HYD';
	}
}

class B787_10_SYS_Page_FUEL extends B787_10_SYS_Page {
	constructor() {
		super(...arguments);
		this.allFuelComponents = null;
	}

	init() {
		if (this.allFuelComponents == null) {
			this.allFuelComponents = new Array();
		}
		if (this.pageRoot != null) {
			this.unitTextSVG = this.pageRoot.querySelector('#TotalFuelUnits');
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#TotalFuelValue'), this.getTotalFuelInMegagrams.bind(this), 1));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#Tank1Quantity'), this.getMainTankFuelInMegagrams.bind(this, 1), 1));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#Tank2Quantity'), this.getMainTankFuelInMegagrams.bind(this, 2), 1));
			this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector('#Tank3Quantity'), this.getMainTankFuelInMegagrams.bind(this, 3), 1));
			this.allFuelComponents.push(new Boeing.FuelEngineState(this.pageRoot.querySelector('#Engine1FuelState'), 1));
			this.allFuelComponents.push(new Boeing.FuelEngineState(this.pageRoot.querySelector('#Engine2FuelState'), 2));
			var fuelPumpsGroup = this.pageRoot.querySelector('#FuelPumps');
			if (fuelPumpsGroup != null) {
				var allFuelPumps = fuelPumpsGroup.querySelectorAll('rect');
				if (allFuelPumps != null) {
					for (var i = 0; i < allFuelPumps.length; ++i) {
						this.allFuelComponents.push(new Boeing.FuelPump(allFuelPumps[i], parseInt(allFuelPumps[i].id.replace('FuelPump', ''))));
					}
				}
			}
			var fuelValvesGroup = this.pageRoot.querySelector('#FuelValves');
			if (fuelValvesGroup != null) {
				var fuelValveTemplate = this.pageRoot.querySelector('#FuelValveTemplate');
				if (fuelValveTemplate != null) {
					var allFuelValves = fuelValvesGroup.querySelectorAll('g');
					if (allFuelValves != null) {
						for (var i = 0; i < allFuelValves.length; ++i) {
							var clonedValve = fuelValveTemplate.cloneNode(true);
							clonedValve.removeAttribute('id');
							allFuelValves[i].appendChild(clonedValve);
							this.allFuelComponents.push(new Boeing.FuelValve(allFuelValves[i], parseInt(allFuelValves[i].id.replace('FuelValve', ''))));
						}
					}
					fuelValveTemplate.remove();
				}
			}
			var fuelLinesGroup = this.pageRoot.querySelector('#FuelLines');
			if (fuelLinesGroup != null) {
				var allFuelLines = fuelLinesGroup.querySelectorAll('line, polyline, g');
				if (allFuelLines != null) {
					for (var i = 0; i < allFuelLines.length; ++i) {
						var id = parseInt(allFuelLines[i].id.replace('FuelLine', ''));
						if ((id != NaN) && (id > 0)) {
							this.allFuelComponents.push(new Boeing.FuelLine(allFuelLines[i], id));
						}
					}
				}
			}
		}
		if (this.allFuelComponents != null) {
			for (var i = 0; i < this.allFuelComponents.length; ++i) {
				if (this.allFuelComponents[i] != null) {
					this.allFuelComponents[i].init();
				}
			}
		}
	}

	updateChild(_deltaTime) {
		if (this.allFuelComponents != null) {
			for (var i = 0; i < this.allFuelComponents.length; ++i) {
				if (this.allFuelComponents[i] != null) {
					this.allFuelComponents[i].update(_deltaTime);
				}
			}
		}
		if (this.unitTextSVG) {
			if (!HeavyDivision.configuration.useImperial())
				diffAndSetText(this.unitTextSVG, 'KGS X 1000');
			else
				diffAndSetText(this.unitTextSVG, 'LBS X 1000');
		}
	}

	getName() {
		return 'FUEL';
	}
}

class B787_10_SYS_Page_AIR extends B787_10_SYS_Page {

	init() {
	}

	updateChild(_deltaTime) {
	}

	getName() {
		return 'AIR';
	}
}

class B787_10_SYS_Page_DOOR extends B787_10_SYS_Page {
	/**
	 * Points:
	 * 0 -> Entry 1L
	 * 7 -> Entry 4R
	 * 8 -> FWD Cargo
	 * 11 -> Fuel
	 * 12 -> Power Unit (Front gear)
	 */
	init() {
		this.doors = {
			ENTRY_1L: null,
			ENTRY_2L: null,
			ENTRY_3L: null,
			ENTRY_4L: null,
			FWS_EE_ACCESS: null,
			REFUEL: null,
			AFT_EE_ACCESS: null,
			BULK_CARGO: null,
			ENTRY_1R: null,
			ENTRY_2R: null,
			ENTRY_3R: null,
			ENTRY_4R: null,
			FWD_ACCESS: null,
			FD_OVHD: null,
			FWD_CARGO: null,
			AFT_CARGO: null
		};

		this.doorsGroups = {
			ENTRY_1L: [['entry_1l_close'], ['entry_1l_open']],
			ENTRY_2L: [[], []],
			ENTRY_3L: [[], []],
			ENTRY_4L: null,
			FWS_EE_ACCESS: null,
			REFUEL: null,
			AFT_EE_ACCESS: null,
			BULK_CARGO: null,
			ENTRY_1R: null,
			ENTRY_2R: null,
			ENTRY_3R: null,
			ENTRY_4R: [['entry_4r_close'], ['entry_4r_open']],
			FWD_ACCESS: null,
			FD_OVHD: null,
			FWD_CARGO: [['fwd_cargo_open'], ['fwd_cargo_open']],
			AFT_CARGO: null
		};

		this.updateDoorPositions();
		this.updatePage();
	}

	updateChild(_deltaTime) {
		this.updateDoorPositions();
		this.updatePage();
	}

	updatePage() {
		if (this.pageRoot != null) {
			let closeRect1l = this.pageRoot.querySelector('#entry_1l_close_rect');
			let closeText1l = this.pageRoot.querySelector('#entry_1l_close_text');
			let openRect1l = this.pageRoot.querySelector('#entry_1l_open');

			if (this.doors['ENTRY_1L'] > 5) {
				closeRect1l.style.visibility = 'hidden';
				closeText1l.style.visibility = 'hidden';
				openRect1l.style.visibility = 'visible';
			} else {
				closeRect1l.style.visibility = 'visible';
				closeText1l.style.visibility = 'visible';
				openRect1l.style.visibility = 'hidden';
			}

			let closeRect4r = this.pageRoot.querySelector('#entry_4r_close_rect');
			let closeText4r = this.pageRoot.querySelector('#entry_4r_close_text');
			let openRect4r = this.pageRoot.querySelector('#entry_4r_open');
			if (this.doors['ENTRY_4R'] > 5) {
				closeRect4r.style.visibility = 'hidden';
				closeText4r.style.visibility = 'hidden';
				openRect4r.style.visibility = 'visible';
			} else {
				closeRect4r.style.visibility = 'visible';
				closeText4r.style.visibility = 'visible';
				openRect4r.style.visibility = 'hidden';
			}
			let closeRectFwdCargo = this.pageRoot.querySelector('#fwd_cargo_open');
			if (this.doors['FWD_CARGO'] > 5) {
				closeRectFwdCargo.style.visibility = 'visible';
			} else {
				closeRectFwdCargo.style.visibility = 'hidden';
			}
		}
	}

	updateDoorPositions() {
		this.doors['ENTRY_1L'] = SimVar.GetSimVarValue('INTERACTIVE POINT OPEN:0', 'Percent');
		this.doors['ENTRY_4R'] = SimVar.GetSimVarValue('INTERACTIVE POINT OPEN:7', 'Percent');
		this.doors['FWD_CARGO'] = SimVar.GetSimVarValue('INTERACTIVE POINT OPEN:8', 'Percent');
	}

	getName() {
		return 'DOOR';
	}
}

class B787_10_SYS_Page_GEAR extends B787_10_SYS_Page {

	init() {
		if (this.pageRoot != null) {
			this.gearDisplay = new Boeing.GearDisplay(this.pageRoot.querySelector('#gear-doors'));
		}
	}

	updateChild(_deltaTime) {
		if (this.gearDisplay != null) {
			this.gearDisplay.update(_deltaTime);
		}
	}

	getName() {
		return 'GEAR';
	}
}

class B787_10_SYS_Page_FCTL extends B787_10_SYS_Page {
	init() {
		if (this.pageRoot != null) {
			try {
				this.stabDisplay = new Boeing.StabDisplay(this.pageRoot.querySelector('#Stab'), 17, 2);
			} catch (e) {

			}

			try {
				this.rudderDisplay = new Boeing.RudderDisplay(this.pageRoot.querySelector('#Rudder'));
			} catch (e) {

			}
		}
	}


	updateChild(_deltaTime) {
		if (this.pageRoot != null) {
			this.updateAileronsPositions();
			this.updateSpoilersPositions();
			this.updateRudderPositions();
			this.updateElevatorsPositions();
			this.updateStabDisplay(_deltaTime);
			this.updateRudderDisplay(_deltaTime);
		}
	}

	updateStabDisplay(_deltaTime) {
		if (this.stabDisplay) {
			this.stabDisplay.update(_deltaTime);
		} else {
			try {
				this.stabDisplay = new Boeing.StabDisplay(this.pageRoot.querySelector('#Stab'), 17, 2);
			} catch (e) {
			}
		}
	}

	updateRudderDisplay(_deltaTime) {
		if (this.rudderDisplay) {
			this.rudderDisplay.update(_deltaTime);
		} else {
			try {
				this.rudderDisplay = new Boeing.RudderDisplay(this.pageRoot.querySelector('#Rudder'));
			} catch (e) {
			}
		}
	}

	updateAileronsPositions() {
		let leftAileronPointer = this.pageRoot.querySelector('#pointer-l-ail');
		let rightAileronPointer = this.pageRoot.querySelector('#pointer-r-ail');

		let leftAileronDeflection = SimVar.GetSimVarValue('AILERON LEFT DEFLECTION PCT', 'Percent over 100');
		let rightAileronDeflection = SimVar.GetSimVarValue('AILERON RIGHT DEFLECTION PCT', 'Percent over 100');


		let absoluteLeftAileronDeflection = Math.abs(leftAileronDeflection);
		let absoluteRightAileronDeflection = Math.abs(rightAileronDeflection);

		let direction = (leftAileronDeflection < 0 ? 1 : 0);

		let leftAileronPosition = 86 * absoluteLeftAileronDeflection;
		let rightAileronPosition = 86 * absoluteRightAileronDeflection;

		if (direction) {
			leftAileronPosition = leftAileronPosition * -1;
		} else {
			rightAileronPosition = rightAileronPosition * -1;
		}

		leftAileronPointer.setAttribute('transform', 'translate(0, ' + leftAileronPosition + ')');
		rightAileronPointer.setAttribute('transform', 'translate(0, ' + rightAileronPosition + ')');

		/** Flaperon logic (UP)
		 * Flaperon should be in 1.0 position when aileron position is > 0.65
		 * Aileron range is +- 86 pixels
		 * Flaperon range is +- 86 pixels
		 * Flaperon position at 65% of aileron is 55.9 pixels but should be at 86 pixels (fully extended)
		 * Constant for flaperon is 1.53846153846
		 * Flaperon position can be calculated as:
		 *
		 * ((aileronRange / 100) * aileronDeflection * flaperonConstant) * 100
		 * or
		 * (aileronPosition * flaperonConstant)
		 */

		/** Flaperon logic (DOWN)
		 * Flaperon position = Aileron position
		 */

		let leftFlaperonPointer = this.pageRoot.querySelector('#pointer-l-flprn');
		let rightFlaperonPointer = this.pageRoot.querySelector('#pointer-r-flprn');

		let flaperonConstant = 1.5384;

		let leftFlaperonPosition;
		let rightFlaperonPosition;

		if (direction) {
			let leftPosition = leftAileronPosition * flaperonConstant;
			leftPosition = (leftPosition <= -86 ? -86 : leftPosition);
			leftFlaperonPosition = leftPosition;
			rightFlaperonPosition = rightAileronPosition;
		} else {
			let rightPosition = rightAileronPosition * flaperonConstant;
			rightPosition = (rightPosition <= -86 ? -86 : rightPosition);
			leftFlaperonPosition = leftAileronPosition;
			rightFlaperonPosition = rightPosition;
		}

		leftFlaperonPointer.setAttribute('transform', 'translate(0, ' + leftFlaperonPosition + ')');
		rightFlaperonPointer.setAttribute('transform', 'translate(0, ' + rightFlaperonPosition + ')');
	}

	updateSpoilersPositions() {
		let leftSpoilersDeflection = SimVar.GetSimVarValue('SPOILERS LEFT POSITION', 'Position');
		let rightSpoilersDeflection = SimVar.GetSimVarValue('SPOILERS Right POSITION', 'Position');

		let leftSpoilersPosition = 86 * leftSpoilersDeflection;
		let rightSpoilersPosition = 86 * rightSpoilersDeflection;

		[
			this.pageRoot.querySelector('#left-spoiler-1'),
			this.pageRoot.querySelector('#left-spoiler-2'),
			this.pageRoot.querySelector('#left-spoiler-3'),
			this.pageRoot.querySelector('#left-spoiler-4'),
			this.pageRoot.querySelector('#left-spoiler-5'),
			this.pageRoot.querySelector('#left-spoiler-6'),
			this.pageRoot.querySelector('#left-spoiler-7')
		].forEach((spoiler) => {
			spoiler.setAttribute('height', leftSpoilersPosition);
			spoiler.setAttribute('y', 486 - leftSpoilersPosition);
		});

		[
			this.pageRoot.querySelector('#right-spoiler-1'),
			this.pageRoot.querySelector('#right-spoiler-2'),
			this.pageRoot.querySelector('#right-spoiler-3'),
			this.pageRoot.querySelector('#right-spoiler-4'),
			this.pageRoot.querySelector('#right-spoiler-5'),
			this.pageRoot.querySelector('#right-spoiler-6'),
			this.pageRoot.querySelector('#right-spoiler-7')
		].forEach((spoiler) => {
			spoiler.setAttribute('height', rightSpoilersPosition);
			spoiler.setAttribute('y', 486 - rightSpoilersPosition);
		});
	}

	updateRudderPositions() {
		let rudderPointer = this.pageRoot.querySelector('#pointer-rudder');

		let rudderDeflection = SimVar.GetSimVarValue('RUDDER DEFLECTION PCT', 'Percent over 100');
		let rudderPosition = 165 * rudderDeflection;
		rudderPointer.setAttribute('transform', 'translate(' + rudderPosition + ', 0)');
	}

	updateElevatorsPositions() {
		let elevatorDeflection = SimVar.GetSimVarValue('ELEVATOR DEFLECTION PCT', 'Percent over 100');
		let elevatorPosition = 74 * elevatorDeflection * -1;


		let direction = (elevatorDeflection <= 0 ? 1 : 0);
		let elevatorsConstant = 1.5;

		if (direction) {
			elevatorPosition = elevatorPosition * elevatorsConstant;
		}

		[
			this.pageRoot.querySelector('#pointer-l-elev'),
			this.pageRoot.querySelector('#pointer-r-elev')
		].forEach((elevator) => {
			elevator.setAttribute('transform', 'translate(0, ' + elevatorPosition + ')');
		});
	}

	getName() {
		return 'FCTL';
	}
}

class B787_10_SYS_Page_EFIS_DSP extends B787_10_SYS_Page {

	init() {
		if (this.pageRoot != null) {

			this.ctrButton = this.pageRoot.querySelector('#CTR_BUTTON');
			this.ctrButtonPath = this.pageRoot.querySelector('#CTR_BUTTON_PATH');
			this.ctrButtonPath.addEventListener('click', this.toggleNDCenter.bind(this));

			this.plusButtonPath = this.pageRoot.querySelector('#PLUS_BUTTON_PATH');
			this.plusButtonPath.addEventListener('click', this.increaseNDRange.bind(this));
			this.minusButtonPath = this.pageRoot.querySelector('#MINUS_BUTTON_PATH');
			this.minusButtonPath.addEventListener('click', this.decreaseNDRange.bind(this));


			this.rstButtonPath = this.pageRoot.querySelector('#RST_BUTTON_PATH');
			this.rstButtonPath.addEventListener('click', this.resetMinimumReference.bind(this));
			this.minimumReferenceValue = this.pageRoot.querySelector('#MINIMUM_REFERENCE_VALUE')

			this.radioSwitch = this.pageRoot.querySelector('#RADIO_SWITCH')
			this.radioSwitch.addEventListener('click', this.setMinsToRadio.bind(this));
			this.baroSwitch = this.pageRoot.querySelector('#BARO_SWITCH')
			this.baroSwitch.addEventListener('click', this.setMinsToBaro.bind(this));
			this.radioSwitchBackground = this.pageRoot.querySelector('#RADIO_SWITCH_BACKGROUND')
			this.baroSwitchBackground = this.pageRoot.querySelector('#BARO_SWITCH_BACKGROUND')

			this.stdButton = this.pageRoot.querySelector('#STD_BUTTON');
			this.stdButtonPath = this.pageRoot.querySelector('#STD_BUTTON_PATH');
			this.stdButtonPath.addEventListener('click', this.toggleBaroSTD.bind(this));
			this.baroPressureValue = this.pageRoot.querySelector('#BARO_PRESSURE_VALUE');
			this.pressureUnits = this.pageRoot.querySelector('#PRESSURE_UNITS');
			this.inSwitch = this.pageRoot.querySelector('#IN_SWITCH');
			this.inSwitch.addEventListener('click', this.setBaroToIN.bind(this));
			this.inSwitchBackground = this.pageRoot.querySelector('#IN_SWITCH_BACKGROUND');
			this.hpaSwitch = this.pageRoot.querySelector('#HPA_SWITCH');
			this.hpaSwitch.addEventListener('click', this.setBaroToHPA.bind(this));
			this.hpaSwitchBackground = this.pageRoot.querySelector('#HPA_SWITCH_BACKGROUND');

			this.wxrButton = this.pageRoot.querySelector('#WXR_BUTTON');
			this.wxrButtonPath = this.pageRoot.querySelector('#WXR_BUTTON_PATH');
			this.wxrButtonPath.addEventListener('click', this.toggleWXR.bind(this));
			this.tfcButton = this.pageRoot.querySelector('#TFC_BUTTON');
			this.tfcButtonPath = this.pageRoot.querySelector('#TFC_BUTTON_PATH');
			this.tfcButtonPath.addEventListener('click', this.toggleTFC.bind(this))
			this.terrButton = this.pageRoot.querySelector('#TERR_BUTTON');
			this.terrButtonPath = this.pageRoot.querySelector('#TERR_BUTTON_PATH');
			this.terrButtonPath.addEventListener('click', this.toggleTERR.bind(this))
		}
	}

	toggleNDCenter(){
		HeavyEventDispatcher.trigger(HeavyEventDispatcher.event.AUTOPILOT_CTR, HeavyEventDispatcher.target.MFD_1)
	}

	increaseNDRange(){
		HeavyEventDispatcher.trigger(HeavyEventDispatcher.event.Range_INC, HeavyEventDispatcher.target.MFD_1)
	}

	decreaseNDRange(){
		HeavyEventDispatcher.trigger(HeavyEventDispatcher.event.Range_DEC, HeavyEventDispatcher.target.MFD_1)
	}

	toggleWXR(){
		HeavyEventDispatcher.trigger(HeavyEventDispatcher.event.DSP_WXR, HeavyEventDispatcher.target.MFD_1)
	}

	toggleTFC(){
		HeavyEventDispatcher.trigger(HeavyEventDispatcher.event.DSP_TFC, HeavyEventDispatcher.target.MFD_1)
	}

	toggleTERR(){
		HeavyEventDispatcher.trigger(HeavyEventDispatcher.event.DSP_TERR, HeavyEventDispatcher.target.MFD_1)
	}

	resetMinimumReference(){
		HeavyEventDispatcher.trigger(HeavyEventDispatcher.event.Mins_RST, HeavyEventDispatcher.target.PFD);
	}

	getMinsValue(){
		return SimVar.GetSimVarValue('L:B78XH_MINIMUM_REFERENCE', 'Number');
	}

	areMinsInRadioPosition(){
		return !(!!SimVar.GetSimVarValue('L:XMLVAR_Mins_Selector_Baro', 'Number'));
	}

	setMinsToRadio(){
		if(!this.areMinsInRadioPositionValue){
			HeavyEventDispatcher.triggerValue(HeavyEventDispatcher.event.Mins_Selector_Set, HeavyEventDispatcher.target.GLOBAL, 0, 'Number')
		}
	}

	setMinsToBaro(){
		if(this.areMinsInRadioPositionValue){
			HeavyEventDispatcher.triggerValue(HeavyEventDispatcher.event.Mins_Selector_Set, HeavyEventDispatcher.target.GLOBAL, 1, 'Number')
		}
	}

	toggleBaroSTD() {
		if (this.isBaroSTD()) {
			SimVar.SetSimVarValue('L:XMLVAR_Baro1_ForcedToSTD', 'Number', 0);
		} else {
			SimVar.SetSimVarValue('L:XMLVAR_Baro1_ForcedToSTD', 'Number', 1);
			SimVar.SetSimVarValue('K:BAROMETRIC_STD_PRESSURE', 'Number', 1);
		}
	}

	setBaroToIN() {
		SimVar.SetSimVarValue('L:XMLVAR_Baro_Selector_HPA_1', 'Bool', false);
	}

	setBaroToHPA() {
		SimVar.SetSimVarValue('L:XMLVAR_Baro_Selector_HPA_1', 'Bool', true);
	}

	isBaroSTD() {
		return !!(SimVar.GetSimVarValue('L:XMLVAR_Baro1_ForcedToSTD', 'Number'));
	}

	isBaroUnitInchesOfMercury() {
		return (Simplane.getPressureSelectedUnits() === 'inches of mercury');
	}

	updateChild(_deltaTime) {
		const isNDCentered = SimVar.GetSimVarValue('L:B78XH_IS_ND_CENTERED:1', 'Bool');
		this.ctrButton.setAttribute('fill', (isNDCentered ? 'green' : 'none'));

		const wxRadarOn = SimVar.GetSimVarValue('L:BTN_WX_ACTIVE:1', 'bool');
		const terrainOn = SimVar.GetSimVarValue('L:BTN_TERRONND_ACTIVE:1', 'number');
		const trafficOn = SimVar.GetSimVarValue('L:BTN_TFCONND_ACTIVE:1', 'number');

		this.wxrButton.setAttribute('fill', (wxRadarOn ? 'green' : 'none'));
		this.tfcButton.setAttribute('fill', (trafficOn ? 'green' : 'none'));
		this.terrButton.setAttribute('fill', (terrainOn ? 'green' : 'none'));

		this.areMinsInRadioPositionValue = this.areMinsInRadioPosition()

		diffAndSetText(this.minimumReferenceValue, this.getMinsValue());

		diffAndSetAttribute(this.radioSwitchBackground, 'fill', (this.areMinsInRadioPositionValue ? '#155700' : 'none'));
		diffAndSetAttribute(this.baroSwitchBackground, 'fill', (this.areMinsInRadioPositionValue ? 'none' : '#155700'));

		const baroMode = this.isBaroSTD();
		const baroInInchesOfMercury = this.isBaroUnitInchesOfMercury();
		let baroValue;
		if (baroInInchesOfMercury) {
			baroValue = fastToFixed(Simplane.getPressureValue(), 2);
		} else {
			baroValue = fastToFixed(Simplane.getPressureValue('hectopascal'), 0);
		}

		diffAndSetText(this.baroPressureValue, (baroMode ? 'STD' : baroValue));
		this.stdButton.setAttribute('fill', (baroMode ? 'green' : 'none'));
		diffAndSetText(this.pressureUnits, (baroInInchesOfMercury ? 'IN' : 'HPA'));

		diffAndSetAttribute(this.inSwitchBackground, 'fill', (baroInInchesOfMercury ? '#155700' : 'none'));
		diffAndSetAttribute(this.hpaSwitchBackground, 'fill', (baroInInchesOfMercury ? 'none' : '#155700'));
	}

	getName() {
		return 'EFIS_DSP';
	}
}

class B787_10_SYS_Page_MAINT extends B787_10_SYS_Page {
	updateChild(_deltaTime) {
	}

	getName() {
		return 'MAINT';
	}
}

class B787_10_SYS_Page_CB extends B787_10_SYS_Page {
	updateChild(_deltaTime) {
	}

	getName() {
		return 'CB';
	}
}

customElements.define('b787-10-sys-element', B787_10_SYS);
//# sourceMappingURL=B787_10_SYS.js.map