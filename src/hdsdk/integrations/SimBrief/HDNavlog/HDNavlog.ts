import {HDOrigin} from './HDOrigin';
import {HDFix} from './HDFix';
import {HDNavlogInfo} from './HDNavlogInfo';
import {INavlogImporter} from '../INavlogImporter';
import {HDDestination} from './HDDestination';
import {B787_10_FMC} from '../../../../hdfmc';
import {HDLogger} from '../../../../hdlogger';
import {Level} from '../../../../hdlogger/levels/level';
import {HDFuel} from './HDFuel';
import {HDWeights} from './HDWeights';


export class HDNavlog {
	public origin: HDOrigin = undefined;
	public destination: HDDestination = undefined;
	public fixes: HDFix[] = undefined;
	public info: HDNavlogInfo = undefined;
	public fuel: HDFuel;
	public weights: HDWeights;
	private importer: INavlogImporter = undefined;
	private readonly fmc: B787_10_FMC;

	private _progress: string[][] = [
		['ORIGIN', '', ''],
		['', '', '[color=yellow]WAITING[/color]'],
		['DESTINATION', '', ''],
		['', '', '[color=yellow]WAITING[/color]'],
		['PAYLOAD', '', ''],
		['', '', '[color=yellow]WAITING[/color]'],
		['FUEL BLOCK', '', ''],
		['', '', '[color=yellow]WAITING[/color]'],
		['WAYPOINT', 'AIRWAY', 'PROGRESS'],
		['', '', '[color=yellow]WAITING[/color]'],
		['', '', ''],
		['', '', '']
	];

	private defaultConfiguration: { withSid: boolean, withStar: boolean, routeOnly: boolean } = {
		withSid: true,
		withStar: true,
		routeOnly: false
	};

	private preloadedAirwaysData: {};

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
					this.fuel = this.importer.getFuel();
					this.weights = this.importer.getWeights();
					this._progress[1][0] = this.origin.icao;
					this._progress[3][0] = this.destination.icao;
					this._progress[5][0] = String(this.weights.payload);
					this._progress[7][0] = String(this.fuel.plannedRamp);
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

	/**
	 * TODO: Use better name / make handlers with strategies
	 * @param {{}} configuration
	 * @returns {Promise<void>}
	 */
	public async setToGameIngame(configuration?: { withSid: boolean, withStar: boolean, routeOnly: boolean }) {
		if (!configuration) {
			configuration = this.defaultConfiguration;
		}
		this.fmc.cleanUpPage();
		this.updateProgress();
		await Promise.all([
			this.setInitialCruiseAltitude(this.info.initialAltitude),
			this.asyncSetCostIndex(this.info.costIndex)
		]).then(() => {
			HDLogger.log('INITIAL DATA SET');
		}).catch((error) => {
			HDLogger.log(error, Level.fatal);
		});

		let origin = undefined;
		for (let i = 0; i <= 5; i++) {
			origin = await this.setOrigin(this.origin.icao);
			if (origin) {
				break;
			}
		}

		if (!origin) {
			return Promise.reject(this.fmc.colorizeContent('FP IMPORT FAILED: ORIGIN NOT FOUND', 'red'));
		}


		let destination = undefined;
		for (let i = 0; i <= 5; i++) {
			destination = await this.setDestination(this.destination.icao);
			if (destination) {
				break;
			}
		}

		if (!destination) {
			return Promise.reject(this.fmc.colorizeContent('FAILED: DESTINATION NOT FOUND', 'red'));
		}

		await this.setOriginRunway(this.origin.plannedRunway);
		await this.setInitialCruiseAltitude(this.info.initialAltitude);
		/**
		 * Be aware! Payload has to set before FuelBlock
		 */
		if (!configuration.routeOnly) {
			await this.setPayload(this.weights);
			await this.setFuel(this.fuel);
		} else {
			this._progress[5][2] = this.fmc.colorizeContent('SKIPPED', 'orange');
			this._progress[7][2] = this.fmc.colorizeContent('SKIPPED', 'orange');
		}
		if (this.info.sid !== 'DCT' && configuration.withSid === true) {
			await this.setDeparture(this.info.sid);
		}


		this._progress[9][2] = this.fmc.colorizeContent('PREPARING', 'yellow');
		const fixesForPreload: any = this.getReferenceFixesForAirwaysPreload(this.fixes);
		const airways = {};

		for (const fix of fixesForPreload) {
			var icaos: string[] = [];
			let waypoint = undefined;
			this._progress[9][0] = this.fmc.colorizeContent(fix.ident, 'yellow');
			this._progress[10][0] = this.fmc.colorizeContent('PRELOADING', 'yellow');
			this.updateProgress();
			for (let i = 0; i <= 10; i++) {
				waypoint = await this.asyncGetOrSelectWaypointByIdentFast(fix.ident, fix);
				if (waypoint) {
					this._progress[9][0] = this.fmc.colorizeContent(fix.ident, 'green');
					this._progress[10][0] = this.fmc.colorizeContent('PRELOADED', 'green');
					this.updateProgress();
					break;
				}
			}

			if (!waypoint) {
				return Promise.reject(this.fmc.colorizeContent('FAILED: REFERENCE NOT FOUND', 'red'));
			}

			this._progress[9][1] = this.fmc.colorizeContent(fix.airway, 'yellow');
			this._progress[10][1] = this.fmc.colorizeContent('PRELOADING', 'yellow');
			this.updateProgress();
			if (waypoint.infos instanceof WayPointInfo) {
				await waypoint.infos.UpdateAirwayCustomLength(fix.airway, 400);
				for (const airway of waypoint.infos.airways) {
					for (const icao of airway.icaos) {
						icaos.push(String(icao.substring(7, 12)));
					}
					airways[airway.name] = icaos;
				}
			}
			this._progress[9][1] = this.fmc.colorizeContent(fix.airway, 'green');
			this._progress[10][1] = this.fmc.colorizeContent('PRELOADED', 'green');
			this.updateProgress();
		}

		this._progress[10][0] = '';
		this._progress[10][1] = '';
		this.updateProgress();

		this.preloadedAirwaysData = airways;

		if (this.isSimBriefRouteValidIngame(this.fixes)) {
			HDLogger.log('SB Route is valid ingame route: USING SB import strategy', Level.debug);
			await this.insertWaypoints(this.fixes);
		} else {
			HDLogger.log('SB Route is NOT valid ingame route: CHECKING errors', Level.debug);
			const errors = this.getProblemsOfRoute(this.fixes);
			this.fixRoute(errors, this.fixes);
			if (this.isSimBriefRouteValidIngame(this.fixes)) {
				HDLogger.log('SB Route is fixed and the route is valid ingame route now: USING SB import strategy', Level.debug);
				await this.insertWaypoints(this.fixes);
			} else {
				HDLogger.log('SB Route is NOT valid after fixes', Level.error);
			}
		}
	}

	fixRoute(errors: { fix: HDFix, index: number, reason: string, apply: string }[], fixes: HDFix[]) {
		for (const error of errors) {
			HDLogger.log('APPLYING FIX TO: ' + error.fix.ident + '; FIX TYPE: ' + error.apply, Level.info);
			fixes[error.index].airway = 'DCT';
		}
	}

	getProblemsOfRoute(fixes: HDFix[]): { fix: HDFix, index: number, reason: string, apply: string }[] {
		const errors: { fix: HDFix, index: number, reason: string, apply: string }[] = [];

		for (let i = 0; i < fixes.length - 1; i++) {
			if (fixes[i].airway === 'DCT') {
				continue;
			}
			this.logK(this.preloadedAirwaysData);
			if (!this.preloadedAirwaysData.hasOwnProperty(fixes[i].airway)) {
				errors.push({
					fix: fixes[i],
					index: i,
					reason: 'InGame waypoints does not use AIRWAY: ' + fixes[i].airway,
					apply: 'DIRECT'
				});
			} else {
				const isFixOnAirway = this.preloadedAirwaysData[fixes[i].airway].findIndex((icao) => {
					return icao == fixes[i].ident || icao.trim() == fixes[i].ident;
				});
				if (isFixOnAirway === -1) {
					errors.push({
						fix: fixes[i],
						index: i,
						reason: 'Waypoint ' + fixes[i] + ' is not on AIRWAY: ' + fixes[i].airway,
						apply: 'DIRECT'
					});
				}
			}
		}
		return errors;
	}


	isSimBriefRouteValidIngame(fixes: HDFix[]): boolean {
		for (const fix of fixes) {
			if (fix.airway === 'DCT') {
				continue;
			}
			if (this.preloadedAirwaysData.hasOwnProperty(fix.airway)) {
				const isFixOnAirway = this.preloadedAirwaysData[fix.airway].findIndex((icao) => {
					//HDLogger.log(icao + ':' + fix.ident, Level.debug);
					return icao == fix.ident || icao.trim() == fix.ident;
				});

				if (isFixOnAirway === -1) {
					return false;
				}
			}
		}
		return true;
	}

	private async preloadAirways() {

	}

	private getReferenceFixesForAirwaysPreload(fixes: HDFix[]) {
		const airways = [...new Set(fixes.map(fix => fix.airway))];
		const referenceWaypoints = [];
		for (const airway of airways) {
			const found = this.fixes.find((fix) => fix.airway === airway && airway !== 'DCT');
			if (found !== undefined) {
				referenceWaypoints.push(found);
			}
		}
		return referenceWaypoints;
	}

	async parseAirways(fixes: HDFix[]) {
		let waypoints = [];
		for (let i = 0; i <= fixes.length - 1; i++) {
			const prev = fixes[i - 1];
			const current = fixes[i];
			const next = fixes[i + 1];

			let waypointToPush = {
				ident: current.ident,
				airway: current.airway,
				airwayIn: undefined,
				airwayOut: undefined,
				lat: current.lat,
				long: current.lon
			};

			if (current.airway !== 'DCT') {
				current.airwayIn = current.airway;
			}

			if (next) {
				if (next.airway !== 'DCT') {
					current.airwayOut = next.airway;
				}
			}
		}
	}

	public async setToGame(configuration?: { withSid: boolean, withStar: boolean, routeOnly: boolean }) {
		if (!configuration) {
			configuration = this.defaultConfiguration;
		}
		this.fmc.cleanUpPage();
		this.updateProgress();
		await Promise.all([
			this.setInitialCruiseAltitude(this.info.initialAltitude),
			this.asyncSetCostIndex(this.info.costIndex)
		]).then(() => {
			HDLogger.log('INITIAL DATA SET');
		}).catch((error) => {
			HDLogger.log(error, Level.fatal);
		});

		/**
		 * TODO: It is not possible to use promiseAll for origin and destination
		 * need to figured out in future because await is not good for performance
		 */

		let origin = undefined;
		for (let i = 0; i <= 5; i++) {
			origin = await this.setOrigin(this.origin.icao);
			if (origin) {
				break;
			}
		}

		if (!origin) {
			return Promise.reject(this.fmc.colorizeContent('FP IMPORT FAILED: ORIGIN NOT FOUND', 'red'));
		}


		let destination = undefined;
		for (let i = 0; i <= 5; i++) {
			destination = await this.setDestination(this.destination.icao);
			if (destination) {
				break;
			}
		}

		if (!destination) {
			return Promise.reject(this.fmc.colorizeContent('FAILED: DESTINATION NOT FOUND', 'red'));
		}

		await this.setOriginRunway(this.origin.plannedRunway);
		/**
		 * Be aware! Payload has to set before FuelBlock
		 */
		if (!configuration.routeOnly) {
			await this.setPayload(this.weights);
			await this.setFuel(this.fuel);
		} else {
			this._progress[5][2] = this.fmc.colorizeContent('SKIPPED', 'orange');
			this._progress[7][2] = this.fmc.colorizeContent('SKIPPED', 'orange');
		}
		if (this.info.sid !== 'DCT' && configuration.withSid === true) {
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

	private async insertWaypoints(fixes: HDFix[]) {
		return new Promise<void>(async (resolve, reject) => {
			await this.parseAirways(fixes);
			this.updateProgress();
			const total = fixes.length;
			let iterator = 1;
			for (const fix of fixes) {
				this.updateProgress();
				this._progress[9][0] = fix.ident;
				this._progress[9][1] = fix.airway;
				this._progress[9][2] = this.fmc.colorizeContent('(' + iterator + '/' + total + ')', 'blue');
				const idx = this.fmc.flightPlanManager.getWaypointsCount() - 1;
				HDLogger.log(fix.ident + ' ADDING TO FP', Level.debug);
				await this.insertWaypoint(fix, idx);
				HDLogger.log(fix.ident + ' ADDED TO FP', Level.info);
				iterator++;
			}
			this._progress[9][2] = this.fmc.colorizeContent('DONE', 'green');
			this.updateProgress();
			resolve();
		});
	}

	private async setPayload(weights: HDWeights) {
		this._progress[5][2] = this.fmc.colorizeContent('IMPORTING', 'blue');
		this.updateProgress();

		const kgToPoundsCoefficient: number = 2.20462262;
		const payload: number = (this.info.units === 'kgs' ? weights.payload * kgToPoundsCoefficient : weights.payload);
		const emptyWeight: number = 298700;
		/**
		 * Fuel needed to be able to keep APU/Engines turned on
		 * @type {number}
		 */
		const fuel: number = 20;

		SimVar.SetSimVarValue('FUEL TANK CENTER QUANTITY', 'Pounds', 0);
		SimVar.SetSimVarValue('FUEL TANK LEFT MAIN QUANTITY', 'Pounds', fuel);
		SimVar.SetSimVarValue('FUEL TANK RIGHT MAIN QUANTITY', 'Pounds', fuel);
		SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:1', 'Pounds', 200);
		SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:2', 'Pounds', 200);
		SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:3', 'Pounds', 0);
		SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:4', 'Pounds', 0);
		SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:5', 'Pounds', 0);
		SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:6', 'Pounds', 0);
		SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:7', 'Pounds', 0);
		HDLogger.log('SETTING ZFW to: ' + (emptyWeight + payload), Level.debug);
		HDLogger.log('PAYLOAD : ' + (payload), Level.debug);
		HDLogger.log('ZFW: ' + (emptyWeight), Level.debug);
		this.fmc.trySetBlockFuel(0, true);
		this.fmc.setZeroFuelWeight((emptyWeight + payload) / 1000, EmptyCallback.Void, true);
		this._progress[5][2] = this.fmc.colorizeContent('DONE', 'green');
		this.updateProgress();
	}

	private async setFuel(fuel: HDFuel) {
		this._progress[7][2] = this.fmc.colorizeContent('IMPORTING', 'blue');
		this.updateProgress();

		const poundsPerGallonCoefficient = 6.699999809265137;
		const centerTankCapacity = 149034;
		const sideTankCapacity = 37319;
		const sideTanksTotalCapacity = sideTankCapacity * 2;
		const block = (this.info.units === 'kgs' ? fuel.plannedRamp * 2.20462262 : fuel.plannedRamp);
		const reserve = (this.info.units === 'kgs' ? fuel.reserve * 2.20462262 : fuel.reserve);
		const needCenterTank = block > sideTanksTotalCapacity;
		let leftToSet = 0;
		let rightToSet = 0;
		let centerToSet = 0;

		HDLogger.log('BLOCK TO SET: ' + block, Level.debug);
		HDLogger.log('RESERVES TO SET: ' + reserve, Level.debug);
		HDLogger.log('NEED CENTER TANK: ' + needCenterTank, Level.debug);

		if (!needCenterTank) {
			let reminder = block % 2;
			leftToSet = (block - reminder) / 2 + reminder;
			rightToSet = (block - reminder) / 2;
		} else {
			leftToSet = sideTankCapacity;
			rightToSet = sideTankCapacity;
			let remainingFuel = block - sideTanksTotalCapacity;
			centerToSet = Math.min(remainingFuel, centerTankCapacity);
		}

		HDLogger.log('CENTER TO SET: ' + centerToSet, Level.debug);

		HDLogger.log('LEFT TO SET: ' + leftToSet, Level.debug);

		HDLogger.log('RIGHT TO SET: ' + rightToSet, Level.debug);

		SimVar.SetSimVarValue('FUEL TANK CENTER QUANTITY', 'Gallons', centerToSet / poundsPerGallonCoefficient).catch(() => {
			HDLogger.log('SETTING OF FUEL TANK CENTER QUANTITY FAILED', Level.error);
		});
		SimVar.SetSimVarValue('FUEL TANK LEFT MAIN QUANTITY', 'Gallons', leftToSet / poundsPerGallonCoefficient).catch(() => {
			HDLogger.log('SETTING OF FUEL TANK LEFT QUANTITY FAILED', Level.error);
		});
		SimVar.SetSimVarValue('FUEL TANK RIGHT MAIN QUANTITY', 'Gallons', rightToSet / poundsPerGallonCoefficient).catch(() => {
			HDLogger.log('SETTING OF FUEL TANK RIGHT QUANTITY FAILED', Level.error);
		});

		let total = centerToSet + leftToSet + rightToSet;

		this.fmc.trySetBlockFuel(total, true);
		this.fmc.setFuelReserves(reserve / 1000, true);

		this._progress[7][2] = this.fmc.colorizeContent('DONE', 'green');
		this.updateProgress();
	}

	async insertWaypoint(fix: HDFix, index): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.fmc.ensureCurrentFlightPlanIsTemporary(async (result) => {
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
					let waypoint = undefined;
					for (let i = 0; i <= 10; i++) {
						waypoint = await this.asyncGetOrSelectWaypointByIdentFast(fix.ident, fix);
						if (waypoint) {
							break;
						}
					}

					if (!waypoint) {
						this.fmc.showErrorMessage('NOT IN DATABASE');
						return resolve(false);
					}

					const asyncAddWaypoint = (ident, index) => new Promise<void>(resolve => this.fmc.flightPlanManager.addWaypoint(ident, index, resolve));
					await asyncAddWaypoint(waypoint.icao, index).then(() => {
						const fpWaypoint = this.fmc.flightPlanManager.getWaypoint(index);
						fpWaypoint.infos.airwayIn = fix.airwayIn;
						fpWaypoint.infos.airwayOut = fix.airwayOut;
						resolve(true);
					});
				}
			});
		});
	}

	async GetWaypointsByIdent(ident) {
		let waypoints = [];
		let intersections = await this.fmc.dataManager.GetWaypointsByIdentAndType(ident, 'W');
		waypoints.push(...intersections);
		let vors = await this.fmc.dataManager.GetWaypointsByIdentAndType(ident, 'V');
		waypoints.push(...vors);
		let ndbs = await this.fmc.dataManager.GetWaypointsByIdentAndType(ident, 'N');
		waypoints.push(...ndbs);
		let airports = await this.fmc.dataManager.GetWaypointsByIdentAndType(ident, 'A');
		waypoints.push(...airports);
		let i = 0;
		while (i < waypoints.length) {
			let wp = waypoints[i];
			let j = i + 1;
			while (j < waypoints.length) {
				if (waypoints[j] && wp) {
					let other = waypoints[j];
					if (wp.icao === other.icao) {
						waypoints.splice(j, 1);
					} else {
						j++;
					}
				} else {
					j++;
				}
			}
			i++;
		}
		return waypoints;
	}

	async asyncGetOrSelectWaypointByIdentFast(ident, fix) {
		const waypoints: any = await this.GetWaypointsByIdent(ident);
		if (!waypoints || waypoints.length === 0) {
			return undefined;
		}

		const precisions = [4, 3, 2, 1];
		for (const precision of precisions) {
			for (let i = 0; i <= waypoints.length - 1; i++) {
				if (parseFloat(waypoints[i].infos.coordinates.lat).toFixed(precision) === parseFloat(fix.lat).toFixed(precision) && parseFloat(waypoints[i].infos.coordinates.long).toFixed(precision) === parseFloat(fix.lon).toFixed(precision)) {
					return waypoints[i];
				}
			}
		}
		return undefined;
	}

	async setDeparture(sid: string) {
		const index = await this.findSidIndex(sid);
		const [transIndex] = await Promise.all([this.findTransIndex(index), this.asyncSetDepartureIndex(index)]);
		await this.asyncSetDepartureEnrouteTransitionIndex(transIndex);
	}


	async setDepartureProcIndex(index): Promise<void> {
		await this.fmc.ensureCurrentFlightPlanIsTemporary(async () => {
			await this.fmc.flightPlanManager.setDepartureProcIndex(index);
			const transIndex = await this.findTransIndex(index);
			await this.fmc.setDepartureEnrouteTransitionIndex(transIndex, () => {
				console.log('TRANS SET: ' + transIndex);
			});
		});
	}

	logK(object: any) {
		Object.keys(object).forEach((key) => {
			console.log(key);
		});
	}

	private updateProgress() {
		this.fmc._renderer.renderTitle('FLIGHT PLAN');
		this.fmc._renderer.render(this._progress);
	}

	/**
	 * Promise like setInitialCruiseAltitude
	 * @param {number} cruiseAltitude
	 * @returns {Promise<boolean>}
	 */
	setInitialCruiseAltitude(cruiseAltitude: number): Promise<boolean> {
		const cruiseFlightLevel = Math.round(cruiseAltitude / 100);
		HDLogger.log('Setting CruiseAltitude to: ' + cruiseAltitude, Level.debug);
		return SimVar.SetSimVarValue('L:AIRLINER_CRUISE_ALTITUDE', 'number', cruiseFlightLevel)
		.then(() => {
			this.fmc._cruiseFlightLevel = cruiseFlightLevel;
			HDLogger.log('CruiseAltitude set to: ' + cruiseAltitude, Level.debug);
			return true;
		}).catch((error) => {
			HDLogger.log('Unable to set cruise altitude to LVAR');
			return false;
		});
	}

	/**
	 * Promise like setOrigin
	 * @param {string} icao
	 * @returns {Promise<boolean>}
	 */
	async setOrigin(icao: string): Promise<boolean> {
		this._progress[1][2] = this.fmc.colorizeContent('IMPORTING', 'blue');
		this.updateProgress();
		const airport = await this.fmc.dataManager.GetAirportByIdent(icao);
		if (!airport) {
			HDLogger.log('ORIGIN NOT IN DATABASE: ' + icao, Level.warning);
			this.fmc.showErrorMessage('NOT IN DATABASE');
			this._progress[1][2] = this.fmc.colorizeContent('FAILED', 'red');
			this.updateProgress();
			return false;
		}
		return await this.asyncSetOrigin(airport);
	}

	/**
	 * Promise like setDestination
	 * @param {string} icao
	 * @returns {Promise<boolean>}
	 */
	async setDestination(icao: string): Promise<boolean> {
		this._progress[3][2] = this.fmc.colorizeContent('IMPORTING', 'blue');
		this.updateProgress();
		const airport = await this.fmc.dataManager.GetAirportByIdent(icao);

		if (!airport) {
			HDLogger.log('DESTINATION NOT IN DATABASE: ' + icao, Level.warning);
			this.fmc.showErrorMessage('NOT IN DATABASE');
			this._progress[3][2] = this.fmc.colorizeContent('FAILED', 'red');
			this.updateProgress();
			return false;
		}

		return await this.asyncSetDestination(airport);
	}

	/**
	 * Promise like findSidIndex function
	 * @param {string} sid
	 * @returns {Promise<number>}
	 */
	findSidIndex(sid: string): Promise<number> {
		return new Promise<number>((resolve) => {
			const origin = this.fmc.flightPlanManager.getOrigin();
			if (origin.infos instanceof AirportInfo) {
				const index = origin.infos.departures.findIndex((departure) => {
					return departure.name === sid;
				});
				resolve(index);
			} else {
				resolve(-1);
			}
		});
	}

	/**
	 * Promise like findStarIndex function
	 * @param {string} star
	 * @returns {Promise<number>}
	 */
	findStarIndex(star: string): Promise<number> {
		return new Promise<number>((resolve) => {
			const destination = this.fmc.flightPlanManager.getDestination();
			if (destination.infos instanceof AirportInfo) {
				const index = destination.infos.arrivals.findIndex((arrival) => {
					return arrival.name === star;
				});
				resolve(index);
			} else {
				resolve(-1);
			}
		});
	}

	/**
	 * Promise like findTransIndex function
	 * @param {number} departureIndex
	 * @returns {Promise<number>}
	 */
	findTransIndex(departureIndex: number): Promise<number> {
		return new Promise<number>((resolve) => {
			const origin = this.fmc.flightPlanManager.getOrigin();
			if (origin.infos instanceof AirportInfo) {
				const index: number = origin.infos.departures[departureIndex].enRouteTransitions.findIndex((trans) => {
					return trans.name === this.info.enRouteTrans;
				});
				resolve(index);
			} else {
				resolve(-1);
			}
		});
	}

	/**
	 * Async wrapper for setDepartureIndex function
	 * @param index
	 * @returns {Promise<boolean>}
	 * @private
	 */

	private asyncSetDepartureIndex(index): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			this.fmc.setDepartureIndex(index, resolve);
		});
	}

	/**
	 * Async wrapper for setDepartureEnrouteTransitionIndex function
	 * @param index
	 * @returns {Promise<boolean>}
	 * @private
	 */
	private asyncSetDepartureEnrouteTransitionIndex(index): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			this.fmc.setDepartureEnrouteTransitionIndex(index, resolve);
		});
	}

	/**
	 * Async wraper for setCostIndex
	 * @param {number} costIndex
	 * @private
	 */
	private asyncSetCostIndex(costIndex: number) {
		return new Promise<boolean>(((resolve) => {
			if (this.fmc.tryUpdateCostIndex(costIndex, 10000)) {
				HDLogger.log('CostIndex has been set to: ' + costIndex, Level.debug);
				resolve(true);
			} else {
				HDLogger.log('CostIndex could not be updated (invalid value): ' + costIndex + '; CI RANGE 0 - 9999', Level.warning);
				resolve(false);
			}
		}));
	}

	private asyncSetOrigin(airport: any): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			this.fmc.flightPlanManager.setOrigin(airport.icao, () => {
				this.fmc.tmpOrigin = airport.ident;
				HDLogger.log('ORIGIN set to: ' + airport.icao, Level.debug);
				this._progress[1][2] = this.fmc.colorizeContent('DONE', 'green');
				this.updateProgress();
				resolve(true);
			});
		});
	}

	private asyncSetDestination(airport: any): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			this.fmc.flightPlanManager.setDestination(airport.icao, () => {
				this.fmc.tmpDestination = airport.ident;
				HDLogger.log('DESTINATION set to: ' + airport.icao, Level.debug);
				this._progress[3][2] = this.fmc.colorizeContent('DONE', 'green');
				this.updateProgress();
				resolve(true);
			});
		});
	}
}