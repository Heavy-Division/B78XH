import {HeavyDataStorage} from './HeavyDataStorage';

export namespace HeavyDivision {
	export class Configuration {
		static activeFlightPlanSynchronizationStrategy(): number {
			return parseInt(HeavyDataStorage.get('FP_SYNCHRONIZATION_STRATEGY', '0') as string);
		}

		static isFlightPlanSynchronizationActive(): boolean {
			return !(Configuration.activeFlightPlanSynchronizationStrategy() == 0);
		}

		static isOneWaySynchronizationActive(): boolean {
			return (Configuration.activeFlightPlanSynchronizationStrategy() == 1);
		}

		static isNonProcedureSynchronizationActive(): boolean {
			return (Configuration.activeFlightPlanSynchronizationStrategy() == 2);
		}

		static isNormalFlightPlanSynchronizationActive(): boolean {
			return (Configuration.activeFlightPlanSynchronizationStrategy() == 3);
		}

		static useImperial(): boolean {
			return (!!parseInt(HeavyDataStorage.get('USE_IMPERIAL', 1) as string));
		}

		static useMetric(): boolean {
			return !Configuration.useImperial();
		}
	}

	export class SimBrief {
		static importRouteOnly(): boolean {
			return (!!parseInt(HeavyDataStorage.get('SIMBRIEF_ROUTE_ONLY', 0) as string));
		}

		static importSid(): boolean {
			return (!!parseInt(HeavyDataStorage.get('SIMBRIEF_WITH_SID', 0) as string));
		}

		static importStar(): boolean {
			return (!!parseInt(HeavyDataStorage.get('SIMBRIEF_WITH_STAR', 0) as string));
		}

		static importStrategy(): string {
			return HeavyDataStorage.get('SIMBRIEF_IMPORT_STRATEGY', 'INGAME') as string;
		}

	}
}