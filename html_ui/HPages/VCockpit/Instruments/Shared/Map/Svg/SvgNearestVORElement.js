class SvgNearestVORElement extends SvgWaypointElement {
	get vorType() {
		if (this._vorType) {
			return this._vorType;
		}
		if (this.source) {
			return this.source.vorType;
		}
	}

	set vorType(v) {
		this._vorType = v;
	}

	constructor(source) {
		super(source);
		this.sortIndex = 2;
	}

	id(map) {
		return 'nrst-vor-' + this.ident + '-map-' + map.index;
	}

	class() {
		return 'map-nrst-vor';
	}

	imageFileName() {
		let fName = '';
		if (this.source) {
			fName = this.source.imageFileName();
		} else {
			switch (this.vorType) {
				case 1:
					fName = 'ICON_MAP_VOR.svg';
					break;
				case 2:
					fName = 'ICON_MAP_VOR_DME.svg';
					break;
				case 3:
					fName = 'ICON_MAP_VOR_DME.svg';
					break;
				case 4:
					fName = 'ICON_MAP_VOR_TACAN.svg';
					break;
				case 5:
					fName = 'ICON_MAP_VOR_VORTAC.svg';
					break;
				case 6:
					fName = 'ICON_MAP_VOR.svg';
					break;
			}
		}
		if (BaseInstrument.useSvgImages) {
			return fName;
		}
		return fName.replace('.svg', '.png');
	}

	getLabelPriority() {
		return 10;
	}
}