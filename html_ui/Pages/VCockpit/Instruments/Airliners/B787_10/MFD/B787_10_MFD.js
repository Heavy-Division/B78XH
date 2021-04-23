Include.addScript('/B78XH/Enums/B78XH_LocalVariables.js');

class B787_10_MFD extends BaseAirliners {
	constructor() {
		super();
		this.initDuration = 0;
	}

	get templateID() {
		return 'B787_10_MFD';
	}

	get instrumentAlias() {
		return 'AS01B_MFD';
	}

	get IsGlassCockpit() {
		return true;
	}

	get isInteractive() {
		return true;
	}

	connectedCallback() {
		super.connectedCallback();
		this.mfdPage = new MFDPage(this.instrumentIdentifier, 'Mainframe', this.instrumentIndex);
		this.pageGroups = [
			new NavSystemPageGroup('Main', this, [
				this.mfdPage
			])
		];
	}

	disconnectedCallback() {
	}

	onUpdate(_deltaTime) {
		super.onUpdate(_deltaTime);
	}

	reboot() {
		super.reboot();
		if (this.mfdPage)
			this.mfdPage.reset();
	}
}

var MFDPageType;
(function (MFDPageType) {
	MFDPageType[MFDPageType['SYS'] = 0] = 'SYS';
	MFDPageType[MFDPageType['CDU'] = 1] = 'CDU';
	MFDPageType[MFDPageType['INFO'] = 2] = 'INFO';
	MFDPageType[MFDPageType['CHKL'] = 3] = 'CHKL';
	MFDPageType[MFDPageType['COMM'] = 4] = 'COMM';
	MFDPageType[MFDPageType['ND'] = 5] = 'ND';
	MFDPageType[MFDPageType['EICAS'] = 6] = 'EICAS';
})(MFDPageType || (MFDPageType = {}));
var MFDPageSide;
(function (MFDPageSide) {
	MFDPageSide[MFDPageSide['LEFT'] = 0] = 'LEFT';
	MFDPageSide[MFDPageSide['RIGHT'] = 1] = 'RIGHT';
})(MFDPageSide || (MFDPageSide = {}));

class MFDPage extends NavSystemPage {
	constructor(_name, _root, _index) {
		super(_name, _root, null);
		this.index = 0;
		this.allElements = new Array();
		this.currentPage = new Array();
		this.hasEicas = false;
		this.mfdRight = false;
		this.index = _index;
		Coherent.on(_name.toUpperCase() + '_EXTERNAL_EVENT', this.onExternalEvent.bind(this));
		this.annunciations = new Cabin_Annunciations();
		this.warnings = new Cabin_Warnings();
		this.element = new NavSystemElementGroup([this.annunciations, this.warnings]);
	}

	init() {
		super.init();
		var root = this.gps.getChildById(this.htmlElemId);
		if (root != null) {
			let ndElement = root.querySelector('b787-10-nd-element');
			let cduElement = root.querySelector('b787-10-cdu-element');
			let sysElement = root.querySelector('b787-10-sys-element');
			let comElement = root.querySelector('b787-10-com-element');
			let chklElement = root.querySelector('b787-10-chkl-element');
			let infoElement = root.querySelector('b787-10-info-element');
			this.eicasElement = root.querySelector('b787-10-eicas-element');
			this.allElements.push(sysElement);
			this.allElements.push(cduElement);
			this.allElements.push(infoElement);
			this.allElements.push(chklElement);
			this.allElements.push(comElement);
			this.allElements.push(ndElement);
			this.allElements.push(this.eicasElement);
			for (var i = 0; i < this.allElements.length; ++i) {
				if (this.allElements[i] != null) {
					this.allElements[i].setGPS(this.gps);
					this.allElements[i].hide();
				}
			}
			this.hasEicas = (SimVar.GetSimVarValue('L:XMLVAR_EICAS_INDEX', 'number') == (this.index - 1)) ? true : false;
			this.InitPages();
		}
	}

	reset() {
		if (this.warnings)
			this.warnings.reset();
		if (this.annunciations)
			this.annunciations.reset();
	}

	onExternalEvent(..._args) {
		if ((_args != null) && (_args.length > 0)) {
			var strings = _args[0];
			if ((strings != null) && (strings.length > 0)) {
				this.onEvent(strings[0].toUpperCase());
			}
		}
	}

	onEvent(_event) {
		super.onEvent(_event);
		switch (_event) {
			case 'SYS':
				this.togglePage(MFDPageType.SYS);
				break;
			case 'CDU':
				this.togglePage(MFDPageType.CDU);
				break;
			case 'INFO':
				this.togglePage(MFDPageType.INFO);
				break;
			case 'CHKL':
				this.togglePage(MFDPageType.CHKL);
				break;
			case 'COMM':
				this.togglePage(MFDPageType.COMM);
				break;
			case 'ND':
				this.togglePage(MFDPageType.ND);
				break;
			case 'EICAS':
				let index = SimVar.GetSimVarValue('L:XMLVAR_EICAS_INDEX', 'number');
				SimVar.SetSimVarValue('L:XMLVAR_EICAS_INDEX', 'number', (1 - index));
				break;
		}
		if (this.allElements != null) {
			for (var i = 0; i < this.allElements.length; ++i) {
				if (this.allElements[i] != null) {
					this.allElements[i].onEvent(_event);
				}
			}
		}
	}

	onUpdate(_deltaTime) {
		super.onUpdate(_deltaTime);
		if (this.allElements != null) {
			for (var i = 0; i < this.allElements.length; ++i) {
				if (this.allElements[i] != null) {
					this.allElements[i].update(_deltaTime);
				}
			}
		}
		let mfdRight = SimVar.GetSimVarValue('L:XMLVAR_MFD_SIDE_' + this.index, 'bool');
		if (mfdRight != this.mfdRight) {
			this.mfdRight = mfdRight;
			this.checkMFDSide();
		}
		let hasEicas = (SimVar.GetSimVarValue('L:XMLVAR_EICAS_INDEX', 'number') == (this.index - 1)) ? true : false;
		if (hasEicas != this.hasEicas) {
			this.hasEicas = hasEicas;
			if (this.hasEicas) {
				this.checkMFDSide();
				this.refreshPages();
			} else {
				let side = (this.index == 1) ? MFDPageSide.RIGHT : MFDPageSide.LEFT;
				this.setPage(side, this.currentPage[side]);
			}
		}
		this.updateAnnunciations();
	}

	checkMFDSide() {
		if (this.hasEicas) {
			if (this.index == 1 && this.mfdRight) {
				SimVar.SetSimVarValue('L:XMLVAR_MFD_SIDE_' + this.index, 'number', 0);
			} else if (this.index == 2 && !this.mfdRight) {
				SimVar.SetSimVarValue('L:XMLVAR_MFD_SIDE_' + this.index, 'number', 1);
			}
		}
	}

	InitPages() {
		if (this.index == 1) {
			this.currentPage[MFDPageSide.LEFT] = MFDPageType.ND;
			this.currentPage[MFDPageSide.RIGHT] = null;
		} else if (this.index == 2) {
			this.currentPage[MFDPageSide.LEFT] = null;
			this.currentPage[MFDPageSide.RIGHT] = MFDPageType.ND;
		} else if (this.index == 3) {
			this.currentPage[MFDPageSide.LEFT] = MFDPageType.CDU;
			this.currentPage[MFDPageSide.RIGHT] = MFDPageType.CDU;
		}
		this.refreshPages();
	}

	setDefaultPage(_side) {
		switch (_side) {
			case MFDPageSide.LEFT:
				if (this.index == 1) {
					if (this.currentPage[MFDPageSide.RIGHT] == MFDPageType.ND) {
						this.currentPage[MFDPageSide.RIGHT] = null;
					}
					this.currentPage[_side] = MFDPageType.ND;
				} else if (this.index == 2) {
					if (this.currentPage[MFDPageSide.RIGHT] == MFDPageType.ND) {
						this.currentPage[_side] = null;
					} else {
						this.currentPage[_side] = MFDPageType.ND;
					}
				} else if (this.index == 3) {
					this.currentPage[_side] = MFDPageType.CDU;
				}
				break;
			case MFDPageSide.RIGHT:
				if (this.index == 1) {
					if (this.currentPage[MFDPageSide.LEFT] == MFDPageType.ND) {
						this.currentPage[MFDPageSide.RIGHT] = null;
					} else {
						this.currentPage[_side] = MFDPageType.ND;
					}
				} else if (this.index == 2) {
					if (this.currentPage[MFDPageSide.LEFT] == MFDPageType.ND) {
						this.currentPage[MFDPageSide.LEFT] = null;
					}
					this.currentPage[_side] = MFDPageType.ND;
				} else if (this.index == 3) {
					this.currentPage[_side] = MFDPageType.CDU;
				}
				break;
		}
		this.refreshPages();
	}

	togglePage(_page) {
		let side = (this.mfdRight) ? 1 : 0;
		if (this.currentPage[side] == _page) {
			this.setDefaultPage(side);
		} else {
			this.setPage(side, _page);
		}
	}

	setPage(_side, _page) {
		if (_page == null) {
			this.setDefaultPage(_side);
		} else {
			let otherSide = 1 - _side;
			if (this.currentPage[_side] != null && this.currentPage[otherSide] == null) {
				this.currentPage[otherSide] = this.currentPage[_side];
				this.currentPage[_side] = _page;
			} else if (this.currentPage[otherSide] == _page) {
				this.currentPage[otherSide] = this.currentPage[_side];
				this.currentPage[_side] = _page;
				if (this.currentPage[otherSide] == null) {
					this.setDefaultPage(otherSide);
				}
			} else {
				this.currentPage[_side] = _page;
			}
			this.refreshPages();
		}
	}

	refreshPages() {
		for (var i = 0; i < this.allElements.length; ++i) {
			if (this.allElements[i] != null) {
				this.allElements[i].hide();
			}
		}
		if (this.hasEicas) {
			if (this.index == 1) {
				this.showPage(this.currentPage[0], 0, 50);
				this.showPage(MFDPageType.EICAS, 50, 50);
			} else {
				this.showPage(MFDPageType.EICAS, 0, 50);
				this.showPage(this.currentPage[1], 50, 50);
			}
		} else {
			if ((this.currentPage[0] == MFDPageType.ND && this.currentPage[1] == null) || (this.currentPage[1] == MFDPageType.ND && this.currentPage[0] == null)) {
				this.showPage(MFDPageType.ND, 0, 100);
			} else {
				this.showPage(this.currentPage[0], 0, 50);
				this.showPage(this.currentPage[1], 50, 50);
			}
		}
	}

	showPage(_page, _xPercent, _widthPercent) {
		for (var i = 0; i < this.allElements.length; ++i) {
			if ((this.allElements[i] != null) && (this.allElements[i].pageIdentifier == _page)) {
				this.allElements[i].show(_xPercent, _widthPercent);
			}
		}
	}

	updateAnnunciations() {
		if (this.eicasElement) {
			let infoPanelManager = this.eicasElement.getInfoPanelManager();
			if (infoPanelManager) {
				infoPanelManager.clearScreen(Airliners.EICAS_INFO_PANEL_ID.PRIMARY);
				if (this.warnings) {
					let text = this.warnings.getCurrentWarningText();
					if (text && text != '') {
						let level = this.warnings.getCurrentWarningLevel();
						switch (level) {
							case 1:
								infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.INDICATION);
								break;
							case 2:
								infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.CAUTION);
								break;
							case 3:
								infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.WARNING);
								break;
						}
					}
				}
				if (this.annunciations) {
					for (let i = this.annunciations.displayWarning.length - 1; i >= 0; i--) {
						if (!this.annunciations.displayWarning[i].Acknowledged)
							infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, this.annunciations.displayWarning[i].Text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.WARNING);
					}
					for (let i = this.annunciations.displayCaution.length - 1; i >= 0; i--) {
						if (!this.annunciations.displayCaution[i].Acknowledged)
							infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, this.annunciations.displayCaution[i].Text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.CAUTION);
					}
					for (let i = this.annunciations.displayAdvisory.length - 1; i >= 0; i--) {
						if (!this.annunciations.displayAdvisory[i].Acknowledged)
							infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, this.annunciations.displayAdvisory[i].Text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.INDICATION);
					}
				}
			}
		}
	}
}

registerInstrument('b787-10-mfd-element', B787_10_MFD);
//# sourceMappingURL=B787_10_MFD.js.map