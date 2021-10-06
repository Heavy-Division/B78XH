export class SimBriefOceanicWaypointConverter {
	/**
	 * Converts SimBrief oceanic waypoints to MSFS oceanic waypoints
	 * @param {string} value
	 * @returns {string}
	 */
	public static convert(waypoint: string): string {
		const pattern = /([0-9]{2})(N|S)([0-9]{3})(W|E)/;
		const match = waypoint.match(pattern);
		if (match !== null) {
			const lat = parseInt(match[1], 10);
			const lathem = match[2];
			const long = parseInt(match[3], 10);
			const longhem = match[4];
			const sep = {
				'NW': 'N',
				'NE': 'E',
				'SW': 'W',
				'SE': 'S',
			}[`${lathem}${longhem}`]

			return long < 100 ?
				`${lat}${long}${sep}` : `${lat}${sep}${long % 100}`
		}

		return waypoint;
	}
}
