import {HDOrigin} from './HDOrigin';
import {HDFix} from './HDFix';
import {HDNavlogInfo} from './HDNavlogInfo';
import {INavlogImporter} from '../INavlogImporter';
import {HDDestination} from './HDDestination';
import {B787_10_FMC} from '../../../../hdfmc';
import {HDLogger} from '../../../../hdlogger';
import {Level} from '../../../../hdlogger/levels/level';


export class HDNavlog {
	public origin: HDOrigin = undefined;
	public destination: HDDestination = undefined;
	public fixes: HDFix[] = undefined;
	public info: HDNavlogInfo = undefined;
	private importer: INavlogImporter = undefined;
	private readonly fmc: B787_10_FMC;

	private defaultConfiguration = {
		withSid: true,
		withStar: true
	};

	constructor(fmc: B787_10_FMC) {
		this.fmc = fmc;
	}

	public import() {
		return new Promise<void>((resolve, reject) => {
			if (this.importer !== undefined) {
				this.importer.execute().then(() => {
					this.origin = this.importer.getOrigin();
					this.destination = this.importer.getDestination();
					this.fixes = this.importer.getFixes();
					this.info = this.importer.getInfo();
					resolve();
				});
			} else {
				reject(new Error('Importer is not set!'));
			}
		});
	}

	public setImporter(importer: INavlogImporter) {
		this.importer = importer;
	}

	public async setToGame(configuration?: {}) {
		if (!configuration) {
			configuration = this.defaultConfiguration;
		}
		console.log(this.info.sid);
		console.log(this.origin.icao);
		console.log(this.destination.icao);
		this.fmc.cleanUpPage();
		await this.setOrigin(this.origin.icao);
		await this.setDestination(this.destination.icao);
		await this.setOriginRunway(this.origin.plannedRunway);
		await this.setInitialCruiseAltitude(this.info.initialAltitude);
		if (this.info.sid !== 'DCT') {
			await this.setDeparture(this.info.sid);
		}
		await this.insertWaypoints(this.fixes);
	}

	public async airportDump() {

		let houston = await this.fmc.dataManager.GetAirportByIdent('KIAH');

		/**
		 * All departures for airport
		 */
		//console.log('AVAILABLE DEPARTURES');
		houston.infos.departures.forEach((departure) => {
			//console.log('--DEPARTURE: ' + departure.name);
			/**
			 * All compatible runways with departure
			 */
			//console.log('----ALL RUNWAY TRANSITIONS');
			departure.runwayTransitions.forEach((runwayTransition) => {
				//console.log('------AVAILABLE RUNWAY TRANS: ' + runwayTransition.name);
			});

			/**
			 * All EnRoute TRANS (Does not include default one: RITAA6 -> RITAA is not in the list)
			 */
			departure.enRouteTransitions.forEach((trans) => {
				//console.log('------AVAILABLE TRANS: ' + trans.name);
			});
		});

		houston.infos.arrivals.forEach((arrival) => {
			//console.log('--ARRIVAL: ' + arrival.name);

			/**
			 * All compatible runways with arrival
			 */
			//console.log('----ALL RUNWAY TRANSITIONS');
			arrival.runwayTransitions.forEach((runwayTransition) => {
				//console.log('------AVAILABLE RUNWAY TRANS: ' + runwayTransition.name);
			});

			/**
			 * All EnRoute TRANS (Does not include default one: same as departure)
			 */
			arrival.enRouteTransitions.forEach((trans) => {
				//console.log('------AVAILABLE TRANS: ' + trans.name);
			});
		});

		houston.infos.approaches.forEach((approach) => {
			console.log('--APPROACH: ' + approach.name);
			this.logK(approach);

			/**
			 * All EnRoute TRANS (Does not include default one: same as departure)
			 */
			approach.transitions.forEach((trans) => {
				this.logK(trans);
				console.log('------AVAILABLE TRANS: ' + trans.name);
			});
		});

		//departure.runwayTransitions[j].name.indexOf(selectedRunway.designation) !== -1

		await this.setDeparture(this.info.sid);
	}

	async setInitialCruiseAltitude(cruiseAltitude: number) {
		HDLogger.log('Setting CruiseAltitude to: ' + cruiseAltitude, Level.debug);
		this.fmc._cruiseFlightLevel = Math.round(cruiseAltitude / 100);
		SimVar.SetSimVarValue('L:AIRLINER_CRUISE_ALTITUDE', 'number', this.fmc._cruiseFlightLevel).catch((error) => {
			HDLogger.log('Unable to set cruise altitude to LVAR');
		});
	}

	async setOrigin(icao: string): Promise<boolean> {
		const airport = await this.fmc.dataManager.GetAirportByIdent(icao);
		const fmc = this.fmc;
		return new Promise((resolve, reject) => {
			if (!airport) {
				fmc.showErrorMessage('NOT IN DATABASE');
				resolve(false);
			}
			fmc.flightPlanManager.setOrigin(airport.icao, () => {
				fmc.tmpOrigin = airport.ident;
				resolve(true);
			});
		});
	}

	async setOriginRunway(runwayName: string) {
		return new Promise<boolean>((resolve, reject) => {
			const origin = this.fmc.flightPlanManager.getOrigin();
			if (origin && origin.infos instanceof AirportInfo) {
				let runwayIndex = origin.infos.oneWayRunways.findIndex(r => {
					return Avionics.Utils.formatRunway(r.designation) === Avionics.Utils.formatRunway(runwayName);
				});
				if (runwayIndex >= 0) {
					this.fmc.ensureCurrentFlightPlanIsTemporary(() => {
						this.fmc.flightPlanManager.setOriginRunwayIndex(runwayIndex, () => {
							return resolve(true);
						});
					});
				} else {
					this.fmc.showErrorMessage('NOT IN DATABASE');
					return resolve(false);
				}
			} else {
				this.fmc.showErrorMessage('NO ORIGIN AIRPORT');
				return resolve(false);
			}
		});
	}

	async setDestination(icao: string): Promise<boolean> {
		const airport = await this.fmc.dataManager.GetAirportByIdent(icao);
		const fmc = this.fmc;
		return new Promise((resolve, reject) => {
			if (!airport) {
				fmc.showErrorMessage('NOT IN DATABASE');
				resolve(false);
			}
			fmc.flightPlanManager.setDestination(airport.icao, () => {
				fmc.tmpOrigin = airport.ident;
				resolve(true);
			});
		});
	}

	async insertWaypoints(fixes: HDFix[]) {
		return new Promise<void>(async (resolve, reject) => {
			const total = fixes.length;
			let iterator = 1;
			for (const fix of fixes) {
				const idx = this.fmc.flightPlanManager.getWaypointsCount() - 1;
				this.fmc.cleanUpPage();
				this.fmc._renderer.render(this.getProgress(fix, iterator, total));
				HDLogger.log(fix.ident + ' ADDING TO FP', Level.debug);
				await this.insertWaypoint(fix, idx);
				HDLogger.log(fix.ident + ' ADDED TO FP', Level.info);
				iterator++;
			}
			resolve();
		});
	}

	async setCostIndex() {

	}

	async insertWaypoint(fix: HDFix, index): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.fmc.ensureCurrentFlightPlanIsTemporary((result) => {
				if (!result) {
					reject();
				}

				if (fix.isCoordinatesWaypoint) {
					const waypoint = new WayPoint(this.fmc);
					waypoint.type = 'W';
					waypoint.ident = fix.ident;
					waypoint.infos = new IntersectionInfo(this.fmc);
					waypoint.infos.ident = fix.ident;
					waypoint.infos.coordinates = new LatLongAlt(Number(fix.lat), Number(fix.lon), 0);
					this.fmc.flightPlanManager.addUserWaypoint(waypoint, index, () => {
						resolve(true);
					});
				} else {
					this.getOrSelectWaypointByIdentFast(fix.ident, fix, (waypoint) => {
						if (!waypoint) {
							this.fmc.showErrorMessage('NOT IN DATABASE');
							return resolve(false);
						}
						this.fmc.flightPlanManager.addWaypoint(waypoint.icao, index, () => {
							return resolve(true);
						});
					});
				}
			});
		});
	}

	getOrSelectWaypointByIdentFast(ident, waypoint, callback) {
		this.fmc.dataManager.GetWaypointsByIdent(ident).then((waypoints) => {
			if (!waypoints || waypoints.length === 0) {
				return callback(undefined);
			}
			if (waypoints.length === 1) {
				return callback(waypoints[0]);
			}

			const precisions = [4, 3, 2, 1];
			for (const precision of precisions) {
				for (let i = 0; i <= waypoints.length - 1; i++) {
					if (parseFloat(waypoints[i].infos.coordinates.lat).toFixed(precision) === parseFloat(waypoint.lat).toFixed(precision) && parseFloat(waypoints[i].infos.coordinates.long).toFixed(precision) === parseFloat(waypoint.lon).toFixed(precision)) {
						return callback(waypoints[i]);
					}
				}
			}
		});
	}

	/**
	 * TODO: Not IMPLEMENTED
	 * @param {HDFix[]} fixes
	 * @returns {Promise<void>}
	 */
	async insertWaypointsIngame(fixes: HDFix[]) {
		return new Promise<void>(async (resolve) => {
			for (const fix of fixes) {
				if (fix.airway !== 'DCT') {
					const lastWaypoint = this.fmc.flightPlanManager.getWaypoint(this.fmc.flightPlanManager.getWaypointsCount() - 1);
					if (lastWaypoint.infos instanceof WayPointInfo) {
						lastWaypoint.infos.UpdateAirway(fix.airway).then(async () => {
							const airway = lastWaypoint.infos.airways.find(a => {
								return a.name === fix.airway;
							});

							if (airway) {
								//await this.insertWaypointsAlongAirway(fix.ident, this.fmc.flightPlanManager.getWaypointsCount() - 1, fix.airway);
							}
						});
					}
				} else {
					const idx = this.fmc.flightPlanManager.getWaypointsCount() - 1;
					await this.insertWaypoint(fix, idx);
				}
			}
		});
	}

	async findSidIndex(sid: string): Promise<number> {
		const origin = await this.fmc.dataManager.GetAirportByIdent(this.origin.icao);
		let index: number = -1;
		if (origin.infos instanceof AirportInfo) {
			index = origin.infos.departures.findIndex((departure) => {
				return departure.name === sid;
			});
		}

		return index;
	}


	async findStarIndex(star: string): Promise<number> {
		const destination = await this.fmc.dataManager.GetAirportByIdent(this.destination.icao);
		let index: number = -1;

		if (destination.infos instanceof AirportInfo) {
			index = destination.infos.arrivals.findIndex((arrival) => {
				return arrival.name === star;
			});
		}

		return index;
	}

	async setDeparture(sid: string) {
		const index = await this.findSidIndex(sid);
		await this.fmc.setDepartureIndex(index);
		const trans = await this.findTransIndex(index);
		await this.fmc.setDepartureEnrouteTransitionIndex(trans);
	}


	async setEnRouteTrans() {

	}


	async setDepartureProcIndex(index): Promise<void> {
		// SIDS console.log(airport.departures[0].name);
		//
		// Last leg is TRANS
		// console.log(airport.departures[0].runwayTransitions[0].legs[0].fixIcao);
		// Where is fucking difference??
		// console.log(airport.departures[0].enRouteTransitions[0].name);
		await this.fmc.ensureCurrentFlightPlanIsTemporary(async () => {
			await this.fmc.flightPlanManager.setDepartureProcIndex(index);
			const transIndex = await this.findTransIndex(index);
			await this.fmc.setDepartureEnrouteTransitionIndex(transIndex, () => {
				console.log('TRANS SET: ' + transIndex);
			});
			//await this.fmc.flightPlanManager.setDepartureRunwayIndex(0);
		});
	}

	async findTransIndex(departureIndex: number): Promise<number> {
		return new Promise(async (resolve) => {
			const origin = await this.fmc.dataManager.GetAirportByIdent(this.origin.icao) as any;
			if (origin.infos instanceof AirportInfo) {
				const index = origin.infos.departures[departureIndex].enRouteTransitions.findIndex((trans) => {
					return trans.name === this.info.enRouteTrans;
				});
				resolve(index);
			}
			resolve(-1);
		});

	}

	logK(object: any) {
		Object.keys(object).forEach((key) => {
			console.log(key);
		});
	}

	/**
	 *
	 * setDepartureProcIndex -> SID
	 * setDepartureRunwayIndex -> Enroute Trans
	 *
	 */

	/*
		setDepartureIndex(departureIndex: number, callback = EmptyCallback.Boolean) {
			this.ensureCurrentFlightPlanIsTemporary(() => {
				let currentRunway = this.flightPlanManager.getDepartureRunway();
				this.flightPlanManager.setDepartureProcIndex(departureIndex, () => {
					if (currentRunway) {
						let departure = this.flightPlanManager.getDeparture();
						if (departure) {
							let departureRunwayIndex = departure.runwayTransitions.findIndex(t => {
								return t.name.indexOf(currentRunway.designation) != -1;
							});
							if (departureRunwayIndex >= -1) {
								return this.flightPlanManager.setDepartureRunwayIndex(departureRunwayIndex, () => {
									return callback(true);
								});
							}
						}
					}
					return callback(true);
				});
			});
		}
	*/
	public getProgress(fix, iterator, total): string[][] {
		this.fmc._renderer.renderPages(iterator, total);
		this.fmc._renderer.renderTitle('PROGRESS PAGE');
		return [
			['', '', '', ''],
			['', '', '', ''],
			['', '', '', ''],
			['', '', '', ''],
			['', '', '', ''],
			['', '', '', ''],
			['Adding', fix.ident],
			['', '', '', ''],
			['', '', '', ''],
			['', '', '', ''],
			['', '', '', ''],
			['', '', '', ''],
			['', '', '', ''],
			['', '', '', '']
		];
	}
}