export class SimBriefOceanicWaypointConverter {
	/**
	 * Converts SimBrief oceanic waypoints to MSFS oceanic waypoints
	 * @param {string} value
	 * @returns {string}
	 */
	public static convert(value: string): string {
		let pattern1 = /([0-9]{2})N([0-9]{1})([0-9]{2})W/;
		if (pattern1.test(value)) {
			return value.replace(pattern1, '$1$3N');
		}
		return value;
	}
}