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
		const activeFlightPlanSynchronizationStrategy = function () {
			return parseInt(HeavyDataStorage.get('FP_SYNCHRONIZATION_STRATEGY', '0'));
		};

		configuration.activeFlightPlanSynchronizationStrategy = activeFlightPlanSynchronizationStrategy;

		/**
		 * Is any synchronization of flight plan activated
		 * @returns {boolean}
		 */
		const isFlightPlanSynchronizationActive = function () {
			return !(activeFlightPlanSynchronizationStrategy == 0);
		};
		configuration.isFlightPlanSynchronizationActive = isFlightPlanSynchronizationActive;

		/**
		 * Is OneWay synchronization of flight plan activated
		 * @Description: Enforce oneway sync from world map to fp and then remove world map flight plan
		 * @returns {boolean}
		 */
		const isOneWaySynchronizationActive = function () {
			return (activeFlightPlanSynchronizationStrategy == 1);
		};
		configuration.isOneWaySynchronizationActive = isOneWaySynchronizationActive;

		/**
		 * Is non procedure synchronization of flight plan activated
		 * @Description: Enable syncing but with explode procedures to waypoints
		 * @returns {boolean}
		 */
		const isNonProcedureSynchronizationActive = function () {
			return (activeFlightPlanSynchronizationStrategy == 2);
		};
		configuration.isNonProcedureSynchronizationActive = isNonProcedureSynchronizationActive;

		/**
		 * Is normal flight plan synchronization activated
		 * TODO: FIX FPSync
		 * @returns {boolean}
		 */
		const isNormalFlightPlanSynchronizationActive = function () {
			return (activeFlightPlanSynchronizationStrategy == 3);
		};
		configuration.isNormalFlightPlanSynchronizationActive = isNormalFlightPlanSynchronizationActive;

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

		/**
		 * Should FMC import route with sid from SimBrief
		 * @returns {boolean}
		 */
		const importSid = function () {
			return (!!parseInt(HeavyDataStorage.get('SIMBRIEF_WITH_SID', 0)));
		};
		simbrief.importSid = importSid;

		/**
		 * Should FMC import route with star from SimBrief
		 * @returns {boolean}
		 */
		const importStar = function () {
			return (!!parseInt(HeavyDataStorage.get('SIMBRIEF_WITH_STAR', 0)));
		};
		simbrief.importStar = importStar;
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