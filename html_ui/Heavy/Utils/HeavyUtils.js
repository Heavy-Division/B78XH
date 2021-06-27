/**
 * Heavy Division utility wrapper
 */

let HeavyDivision;
(function (HeavyDivision) {

	/**
	 * Heavy configuration
	 */
	let configuration;
	(function (configuration) {
		/**
		 * Is flight plan synchronization activated
		 * @returns {boolean}
		 */
		const isFlightPlanSynchronizationActive = function () {
			return false;
			return (!!parseInt(WTDataStore.get('WT_CJ4_FPSYNC', 0)));
		};
		configuration.isFlightPlanSynchronizationActive = isFlightPlanSynchronizationActive;

		/**
		 * Should aircraft use imperial units
		 * @returns {boolean}
		 */
		const useImperial = function () {
			return (!!parseInt(HeavyDataStorage.get('USE_IMPERIAL', 1)));
		};
		configuration.useImperial = useImperial;

		/**
		 * Should aircraft use metric units
		 * @returns {boolean}
		 */
		const useMetric = function () {
			return !configuration.useImperial();
		};
		configuration.useMetric = useMetric;
	})(configuration || (configuration = {}));

	HeavyDivision.configuration = configuration;


	/**
	 * Heavy configuration
	 */
	let simbrief;
	(function (simbrief) {
		/**
		 * Should FMC import route only from SimBrief
		 * @returns {boolean}
		 */
		const importRouteOnly = function () {
			return (!!parseInt(HeavyDataStorage.get('SIMBRIEF_ROUTE_ONLY', 0)));
		};
		simbrief.importRouteOnly = importRouteOnly;
	})(simbrief || (simbrief = {}));

	HeavyDivision.simbrief = simbrief;

	/**
	 * Heavy log
	 */
	let log;
	(function (log) {

	})(log || (log = {}));

	HeavyDivision.log = log;

})(HeavyDivision || (HeavyDivision = {}));

Object.freeze(HeavyDivision);