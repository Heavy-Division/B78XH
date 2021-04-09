class SvgNearestIntersectionElement extends SvgWaypointElement {
	id(map) {
		return 'nrst-intersection-' + this.icaoNoSpace + '-map-' + map.index;
	}

	class() {
		return 'map-nrst-intersection';
	}

	imageFileName() {
		let fName = '';
		if (this.source) {
			fName = this.source.imageFileName();
		}
		if (!fName) {
			fName = 'ICON_MAP_INTERSECTION';

            if (this.isInFlightPlan) {
                fName += '_FLIGHTPLAN';
            }
            if (this.isActiveInFlightPlan) {
                fName += '_ACTIVE';
            }

            if (BaseInstrument.useSvgImages) {
                fName += '.svg';
            } else {
                fName += '.png';
            }
		}

		if (BaseInstrument.useSvgImages) {
			return fName;
		}
		return fName.replace('.svg', '.png');
	}
}

//# sourceMappingURL=SvgNearestIntersectionElement.js.map