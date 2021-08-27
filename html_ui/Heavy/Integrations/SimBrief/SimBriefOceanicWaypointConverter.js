class SimBriefOceanicWaypointConverter {
	/**
	 * Patterns
	 *
	 * 51N050W -> 5150N
	 * 64N00
	 * @param waypoint
	 */

	static convert(waypoint) {
		let pattern1 = /([0-9]{2})N([0-9]{1})([0-9]{2})W/;
		if (pattern1.test(waypoint)) {
			return waypoint.replace(pattern1, '$1$3N');
		}

		return waypoint;
	}
}