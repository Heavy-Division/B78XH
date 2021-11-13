import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_RoutePage} from './B787_10_FMC_RoutePage';
import * as HDSDK from './../../hdsdk/index';
import {RemoveTocParserMiddleware} from '../../hdsdk/integrations/SimBrief/ParserMiddlewares/RemoveTocParserMiddleware';
import {RemoveTodParserMiddleware} from '../../hdsdk/integrations/SimBrief/ParserMiddlewares/RemoveTodParserMiddleware';
import {RemoveOriginParserMiddleware} from '../../hdsdk/integrations/SimBrief/ParserMiddlewares/RemoveOriginParserMiddleware';
import {RemoveDestinationParserMiddleware} from '../../hdsdk/integrations/SimBrief/ParserMiddlewares/RemoveDestinationParserMiddleware';
import {RemoveSidParserMiddleware} from '../../hdsdk/integrations/SimBrief/ParserMiddlewares/RemoveSidParserMiddleware';
import {RemoveStarParserMiddleware} from '../../hdsdk/integrations/SimBrief/ParserMiddlewares/RemoveStarParserMiddleware';
import {BreakNatsParserMiddleware} from '../../hdsdk/integrations/SimBrief/ParserMiddlewares/BreakNatsParserMiddleware';
import {HDNavlog} from '../../hdsdk/integrations/SimBrief/HDNavlog/HDNavlog';
import {HDLogger} from '../../hdlogger';
import {Level} from '../../hdlogger/levels/level';

export class B787_10_FMC_RouteRequestPage {
	private readonly fmc: B787_10_FMC;
	private eventProtector: HTMLElement;
	private readonly progress: any[];
	private flightPlan: any;
	private waypoints: any[];


	constructor(fmc: B787_10_FMC) {
		this.fmc = fmc;
		this.eventProtector = this.fmc.querySelector('#event-protector');
		this.progress = [];
	}

	showPage() {
		this.fmc.cleanUpPage();

		this.fmc._renderer.renderTitle('FLIGHT PLANS');
		this.fmc._renderer.render([
			[''],
			['LOAD FP FROM SB'],
			[''],
			['LOAD FP FROM PFPX'],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			['<BACK']
		]);
		this.setupInputHandlers();
	}

	parseAirways(navlog) {
		let waypoints = [];
		for (let i = 0; i < navlog.length; i++) {
			let ident = HDSDK.SimBriefOceanicWaypointConverter.convert(navlog[i].ident);
			let airwayIn;
			let airwayOut;

			/**
			 * Direct waypoints has to have airway in always set to undefined
			 *
			 * ELSE
			 *
			 * AirwayIn has to be set to via_airway
			 */
			if (navlog[i].via_airway === 'DCT') {
				airwayIn = undefined;
			} else {
				airwayIn = navlog[i].via_airway;
			}


			/**
			 * Do we have next waypoint?
			 */
			if (navlog[i + 1]) {
				/**
				 * If next waypoint has airway DCT then airway out of current waypoint has to be undefined
				 */
				if (navlog[i + 1].via_airway === 'DCT') {
					airwayOut = undefined;
				} else {
					/**
					 * if next waypoint is on different airway then current waypoint airway out
					 * has to be same as next waypoint airway (airways cross)
					 */
					if (navlog[i + 1].via_airway !== navlog[i].via_airway) {
						airwayOut = navlog[i + 1].via_airway;
					} else {
						/**
						 * If next waypoint is direct then airwayOut of current waypoint has to be undefined
						 * (both waypoints are DCT)
						 *
						 * ELSE
						 *
						 * next waypoint is on airway so current waypoint exits to the airway
						 * (current waypoint is first waypoint on the airway)
						 */
						if (navlog[i + 1].via_airway === 'DCT') {
							airwayOut = undefined;
						} else {
							airwayOut = navlog[i + 1].via_airway;
						}
					}
				}
			}
			let waypointToPush = {
				ident: ident,
				airway: navlog[i].via_airway,
				airwayIn: airwayIn,
				airwayOut: airwayOut,
				altitude: navlog[i].altitude_feet,
				lat: navlog[i].pos_lat,
				long: navlog[i].pos_long
			};

			waypoints.push(waypointToPush);
		}

		return waypoints;
	}

	setupInputHandlers() {
		this.fmc._renderer.lsk(6).event = () => {
			//this.eventProtector.style.display = 'none';
			B787_10_FMC_RoutePage.ShowPage1(this.fmc);
		};

		this.fmc._renderer.lsk(1).event = async () => {
			this.fmc.messageManager.showMessage('STANDBY ONE', 'FMC PROCESSING <br> LAST ENTRY <br>PLEASE WAIT');

			/**
			 * Callback hell
			 */
			if (!Simplane.getIsGrounded()) {
				return;
			}

			const parser: HDSDK.SimBriefNavlogParser = new HDSDK.SimBriefNavlogParser(new HDSDK.SimBrief());
			parser.use(new RemoveTocParserMiddleware());
			parser.use(new RemoveTodParserMiddleware());
			parser.use(new RemoveOriginParserMiddleware());
			parser.use(new RemoveDestinationParserMiddleware());
			parser.use(new RemoveSidParserMiddleware());
			parser.use(new RemoveStarParserMiddleware());
			parser.use(new BreakNatsParserMiddleware());

			const importer = new HDSDK.SimBriefImporter(parser);
			const navlog = new HDNavlog(this.fmc);
			navlog.setImporter(importer);
			await navlog.import().catch((error) => {
				HDLogger.log(error, Level.error);
			});

			const configuration = {
				withSid: HDSDK.HeavyDivision.SimBrief.importSid(),
				withStar: HDSDK.HeavyDivision.SimBrief.importStar(),
				routeOnly: HDSDK.HeavyDivision.SimBrief.importRouteOnly()
			};


			if (HDSDK.HeavyDivision.SimBrief.importStrategy() === 'INGAME') {
				navlog.setToGameIngame(configuration).then(() => {
					B787_10_FMC_RoutePage.ShowPage1(this.fmc);
				}).catch((reason => {
					this.fmc.cleanUpPage();
					this.fmc._renderer.renderTitle(reason);
				}));
			} else {
				navlog.setToGame(configuration).then(() => {
					B787_10_FMC_RoutePage.ShowPage1(this.fmc);
				}).catch((reason => {
					this.fmc.cleanUpPage();
					this.fmc._renderer.renderTitle(reason);
				}));
				;
			}
		};

		/**
		 * TODO: TEMPORARY REMOVED
		 */
		let x = () => {
			/**
			 * Protect all events
			 */
			//this.eventProtector.style.display = 'block';

			this.fmc.messageManager.showMessage('STANDBY ONE', 'FMC PROCESSING <br> LAST ENTRY <br>PLEASE WAIT');

			/**
			 * Callback hell
			 */
			if (!Simplane.getIsGrounded()) {
				return;
			}

			let updateFlightPlan = () => {
				updateFlightNumber();
				updateCostIndex();
				updateCruiseAltitude();
				if (!HDSDK.HeavyDivision.SimBrief.importRouteOnly()) {
					updatePayload();
					updateBlock();
				}
				this.fmc.flightPlanManager.pauseSync();
				updateRoute();
			};

			let updatePayload = () => {
				let emptyWeight = 298700;
				let payload = this.flightPlan.weights['payload'];
				if (this.flightPlan.params['units'] == 'kgs') {
					payload = payload * 2.20462262;
				}

				SimVar.SetSimVarValue('FUEL TANK CENTER QUANTITY', 'Pounds', 0);
				SimVar.SetSimVarValue('FUEL TANK LEFT MAIN QUANTITY', 'Pounds', 0);
				SimVar.SetSimVarValue('FUEL TANK RIGHT MAIN QUANTITY', 'Pounds', 0);
				SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:1', 'Pounds', 200);
				SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:2', 'Pounds', 200);
				SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:3', 'Pounds', 0);
				SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:4', 'Pounds', 0);
				SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:5', 'Pounds', 0);
				SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:6', 'Pounds', 0);
				SimVar.SetSimVarValue('PAYLOAD STATION WEIGHT:7', 'Pounds', 0);
				this.fmc.trySetBlockFuel(0, true);
				this.fmc.setZeroFuelWeight((emptyWeight + parseInt(payload)) / 1000, EmptyCallback.Void, true);
			};

			let updateBlock = () => {
				let centerCap = 22244;
				let leftCap = 5570;
				let rightCap = 5570;
				let leftToSet = 0;
				let rightToSet = 0;
				let centerToSet = 0;

				let fuel = this.flightPlan.fuel['plan_ramp'];
				let reserve = this.flightPlan.fuel['reserve'];
				if (this.flightPlan.params['units'] == 'kgs') {
					fuel = fuel * 2.20462262;
					reserve = reserve * 2.20462262;
				}
				fuel = Math.round(fuel / SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'Pounds'));
				let remainingFuel = 0;
				let tanksCapacity = (leftCap * 2);

				if (fuel > tanksCapacity) {
					remainingFuel = fuel - tanksCapacity;
					fuel = tanksCapacity;
				}

				let reminder = fuel % 2;
				let quotient = (fuel - reminder) / 2;

				leftToSet = quotient;
				rightToSet = quotient;

				if (reminder) {
					leftToSet++;
					reminder--;
				}
				if (reminder) {
					rightToSet++;
					reminder--;
				}


				if (remainingFuel >= centerCap) {
					centerToSet = centerCap;
				} else {
					centerToSet = remainingFuel;
				}

				SimVar.SetSimVarValue('FUEL TANK CENTER QUANTITY', 'Gallons', centerToSet);
				SimVar.SetSimVarValue('FUEL TANK LEFT MAIN QUANTITY', 'Gallons', leftToSet);
				SimVar.SetSimVarValue('FUEL TANK RIGHT MAIN QUANTITY', 'Gallons', rightToSet);
				let total = centerToSet + leftToSet + rightToSet;

				this.fmc.trySetBlockFuel(total * SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'Pounds'), true);
				this.fmc.setFuelReserves(reserve / 1000, true);
			};

			let updateRoute = () => {
				updateOrigin();
			};

			let updateOrigin = () => {

				if (Simplane.getIsGrounded()) {
					if (this.fmc.currentFlightPhase <= FlightPhase.FLIGHT_PHASE_TAKEOFF) {
						this.fmc.tmpDestination = undefined;
						this.fmc.flightPlanManager.createNewFlightPlan(() => {
							this.fmc.updateRouteOrigin(this.flightPlan.origin['icao_code'], (result) => {
								if (result) {
									this.fmc.fpHasChanged = true;
									SimVar.SetSimVarValue('L:WT_CJ4_INHIBIT_SEQUENCE', 'number', 0);
									this.fmc.updateFuelVars();
									updateDestination();
								}
							});
						});
					} else {
						this.fmc.clearUserInput();
						/**
						 * TODO: Uncomment after reimplementation
						 */
						/*
						 this.fmc.prepareForTurnAround(() => {
						 this.fmc.tmpDestination = undefined;
						 this.fmc.flightPlanManager.createNewFlightPlan(() => {
						 this.fmc.updateRouteOrigin(this.flightPlan.origin['icao_code'], (result) => {
						 if (result) {
						 this.fmc.fpHasChanged = true;
						 SimVar.SetSimVarValue('L:WT_CJ4_INHIBIT_SEQUENCE', 'number', 0);
						 this.fmc.updateFuelVars();
						 updateDestination();
						 }
						 });
						 });
						 });
						 */
					}
				} else {
					this.fmc.showErrorMessage('NOT ON GROUND');
					return;
				}
			};

			let updateDestination = () => {
				this.fmc.updateRouteDestination(this.flightPlan.destination['icao_code'], () => {
					//parseNavlog();
					if (HDSDK.HeavyDivision.SimBrief.importSid()) {
						updateDepartureRunway();
					} else if (!HDSDK.HeavyDivision.SimBrief.importSid() && HDSDK.HeavyDivision.SimBrief.importStar()) {
						updateStar();
					} else {
						if (HDSDK.HeavyDivision.SimBrief.importStrategy() === 'STRICT') {
							updateWaypoints();
						} else {
							updateWaypointsFast();
						}
					}
				});
			};

			let updateFlightNumber = () => {
				this.fmc.updateFlightNo(this.flightPlan.general['flight_number']);
			};

			let updateCostIndex = () => {
				//this.fmc.tryUpdateCostIndex(this.flightPlan.general['cruise_profile'].replace('CI', ''));
			};

			let updateCruiseAltitude = () => {
				this.fmc.setCruiseFlightLevelAndTemperature(this.flightPlan.general['initial_altitude']);
			};

			let removeOriginAndDestination = (navlog) => {
				let out = [];

				navlog.forEach((fix) => {
					if (fix.ident !== this.flightPlan.origin.icao_code && fix.ident !== this.flightPlan.destination.icao_code) {
						out.push(fix);
					}
				});
				return out;
			};

			let removeSidAndStar = (navlog) => {
				let out = [];
				let sid = (this.flightPlan.navlog.fix[0] !== 'DCT' ? this.flightPlan.navlog.fix[0].via_airway : '');
				let star = (this.flightPlan.navlog.fix[this.flightPlan.navlog.fix.length - 1] !== 'DCT' ? this.flightPlan.navlog.fix[this.flightPlan.navlog.fix.length - 1].via_airway : '');
				navlog.forEach((fix) => {
					if ((fix.is_sid_star !== 1 && fix.via_airway !== sid && fix.via_airway !== star) || fix.via_airway === 'DCT') {
						out.push(fix);
					}
				});
				return out;
			};
			let removeTocAndTod = (navlog) => {
				let out = [];
				navlog.forEach((fix) => {
					if (fix.ident !== 'TOD' && fix.ident !== 'TOC') {
						out.push(fix);
					}
				});
				return out;
			};

			let breakAPartNAT = (navlog) => {
				const nats = ['NATA', 'NATB', 'NATC', 'NATD', 'NATE', 'NATF', 'NATG', 'NATH', 'NATJ', 'NATK', 'NATL', 'NATM', 'NATN', 'NATP', 'NATQ', 'NATR', 'NATS', 'NATT', 'NATU', 'NATV', 'NATW', 'NATX', 'NATY', 'NATZ'];
				let out = [];
				navlog.forEach((fix) => {
					let index = nats.findIndex((nat) => {
						return nat === fix.via_airway;
					});
					if (index !== -1) {
						fix.via_airway = 'DCT';
					}

					out.push(fix);
				});
				return out;
			};

			let getSidAndStarIndex = () => {
				let sidAndStar = [this.flightPlan.navlog.fix[0].via_airway, this.flightPlan.navlog.fix[this.flightPlan.navlog.fix.length - 1].via_airway];
				let originAirportInfo = this.fmc.flightPlanManager.getOrigin().infos;
				let destinationAirportInfo = this.fmc.flightPlanManager.getDestination().infos;
				let sidIndex = undefined;
				let starIndex = undefined;

				if (originAirportInfo instanceof AirportInfo) {
					for (let i = 0; i <= originAirportInfo.departures.length - 1; i++) {
						if (originAirportInfo.departures[i].name == sidAndStar[0]) {
							sidIndex = i;
							break;
						}
					}
				}

				if (destinationAirportInfo instanceof AirportInfo) {
					for (let i = 0; i <= destinationAirportInfo.arrivals.length - 1; i++) {
						if (destinationAirportInfo.arrivals[i].name == sidAndStar[1]) {
							starIndex = i;
							break;
						}
					}
				}

				return [sidIndex, starIndex];
			};

			let getDepartureRunway = () => {
				return this.flightPlan.origin['plan_rwy'];
			};

			let updateDepartureRunway = () => {
				let departureRunway = getDepartureRunway();
				this.fmc.setOriginRunway(departureRunway, () => {
					updateSid();
				});
			};

			let updateSid = () => {
				let sidAndStar = getSidAndStarIndex();
				if (sidAndStar[0] !== undefined) {
					this.fmc.flightPlanManager.pauseSync();
					this.fmc.setDepartureIndex(sidAndStar[0], () => {
						this.fmc.flightPlanManager.resumeSync();
						if (HDSDK.HeavyDivision.SimBrief.importStar()) {
							updateStar();
						} else {
							updateWaypoints();
						}
					});
				} else if (sidAndStar[0] === undefined && HDSDK.HeavyDivision.SimBrief.importStar()) {
					updateStar();
				} else {
					updateWaypoints();
				}
			};

			let updateStar = () => {
				let sidAndStar = getSidAndStarIndex();
				if (sidAndStar[1] !== undefined) {
					this.fmc.flightPlanManager.pauseSync();
					this.fmc.setArrivalAndRunwayIndex(sidAndStar[1], -1, () => {
						this.fmc.flightPlanManager.resumeSync();
						updateWaypoints();
					});
				} else {
					updateWaypoints();
				}
			};

			let parseNavlog = () => {
				let navlog = this.flightPlan.navlog.fix;
				let waypoints = [];
				let finalWaypoints = [];

				navlog = removeOriginAndDestination(navlog);
				navlog = removeSidAndStar(navlog);
				navlog = removeTocAndTod(navlog);
				navlog = breakAPartNAT(navlog);


				waypoints = this.parseAirways(navlog);

				/*
				 navlog.forEach((fix) => {
				 let ident = SimBriefOceanicWaypointConverter.convert(fix.ident);
				 waypoints.push({
				 ident: ident,
				 airway: fix.via_airway,
				 altitude: fix.altitude_feet,
				 lat: fix.pos_lat,
				 long: fix.pos_long
				 });
				 });
				 */
				/**
				 * SET first waypoint to DCT
				 * first waypoint also has to have airwayIn set to undefined
				 */

				waypoints[0].airway = 'DCT';
				waypoints[0].airwayIn = undefined;

				/**
				 * GROUP BY Airway
				 */

				let lastAirway = '';
				waypoints.forEach((waypoint) => {
					if (lastAirway === waypoint.airway && waypoint.airway !== 'DCT') {
						finalWaypoints.pop();
					}
					finalWaypoints.push(waypoint);
					lastAirway = waypoint.airway;
				});

				this.waypoints = finalWaypoints;

				this.waypoints.forEach((waypoint) => {
					this.progress.push([waypoint.airway, waypoint.ident, '', false, waypoint.airwayIn, waypoint.airwayOut]);
				});
			};


			let updateWaypoints = async () => {
				let iterator = 0;
				let protection = 0;
				parseNavlog();

				let insertWaypoint = async () => {
					protection++;
					if (protection > 400) {
						iterator = 20000;
						this.fmc.flightPlanManager.resumeSync();
						//this.eventProtector.style.display = 'none';
						this.fmc.messageManager.removeLastMessage();
						B787_10_FMC_RoutePage.ShowPage1(this.fmc);
						return;
					}
					if (!this.waypoints[iterator]) {
						iterator = 20000;
						this.fmc.flightPlanManager.resumeSync();
						//this.eventProtector.style.display = 'none';
						this.fmc.messageManager.removeLastMessage();
						B787_10_FMC_RoutePage.ShowPage1(this.fmc);
						return;
					}

					if (iterator >= this.waypoints.length) {
						this.fmc.flightPlanManager.resumeSync();
						//this.eventProtector.style.display = 'none';
						this.fmc.messageManager.removeLastMessage();
						B787_10_FMC_RoutePage.ShowPage1(this.fmc);
					}

					this.updateProgress(iterator);
					if (this.waypoints[iterator].airway !== 'DCT') {
						let lastWaypoint = this.fmc.flightPlanManager.getWaypoints()[this.fmc.flightPlanManager.getEnRouteWaypointsLastIndex()];
						if (lastWaypoint.infos instanceof WayPointInfo) {
							lastWaypoint.infos.UpdateAirway(this.waypoints[iterator].airway).then(() => {
								let airway = lastWaypoint.infos.airways.find(a => {
									return a.name === this.waypoints[iterator].airway;
								});
								if (airway) {
									this.fmc.onLeftInput = [];
									this.fmc.onRightInput = [];
									this.fmc.updateSideButtonActiveStatus();
									/**
									 * TODO: Fuck this???
									 *
									 * Because airways are parsed and we know all waypoints we could insert the waypoints directly with addWaypoint()
									 * + It would be extremely fast because airways need to be cached to be able to get all waypoints along airway
									 *   and we would not need to load the airways to the cache
									 * - It could be a problem for users who do not use same AIRAC on simbrief and in MSFS
									 *   because the FMC would think that waypoints are on same airway but MSFS would not know about it (possible problem for ingame ATC)
									 *
									 */
									this.insertWaypointsAlongAirway(this.waypoints[iterator].ident, this.fmc.flightPlanManager.getWaypointsCount() - 1, this.waypoints[iterator].airway, () => {
										iterator++;
										insertWaypoint();
									});
								} else {
									iterator++;
									insertWaypoint();
								}
							});
						}
					} else {
						this.fmc.onLeftInput = [];
						this.fmc.onRightInput = [];
						this.fmc.updateSideButtonActiveStatus();
						this.progress[iterator][2] = this.waypoints[iterator].ident;
						let idx = this.fmc.flightPlanManager.getWaypointsCount() - 1;
						this.insertWaypoint(this.waypoints[iterator].ident, idx, iterator, () => {
							/**
							 * The waypoint is direct -> insert parsed airways (only airwayOut should be needed)
							 */
							const waypoint = this.fmc.flightPlanManager.getWaypoint(idx);
							waypoint.infos.airwayIn = this.progress[iterator][4];
							waypoint.infos.airwayOut = this.progress[iterator][5];
							iterator++;
							insertWaypoint();
						});
					}
				};

				await insertWaypoint();
			};

			/**
			 * TODO: move it to some other place
			 * @returns {Promise<void>}
			 */
			let updateWaypointsFast = async () => {
				let iterator = 0;
				let protection = 0;
				const waypoints = parseNavlogFast();

				/**
				 * 			let waypointToPush = {
				ident: ident,
				airway: navlog[i].via_airway,
				airwayIn: airwayIn,
				airwayOut: airwayOut,
				altitude: navlog[i].altitude_feet,
				lat: navlog[i].pos_lat,
				long: navlog[i].pos_long
			};
				 */

				waypoints.forEach((waypoint) => {
					HDLogger.log('IDENT: ' + waypoint.ident + '; AirwayIn: ' + waypoint.airwayIn + '; AirwayOut: ' + waypoint.airwayOut + '; Airway: ' + waypoint.airway, Level.debug);
				});

				/*
								let insertWaypoint = async (id) => {
									const ii = id;
									//console.log('TRYING INSERT WAYPOINT: ' + waypoints[id].ident);
									this.insertWaypointFast(id, 1, () => {
										//console.log('WAYPOINT ADDED: ' + waypoints[id].ident);
										let idx = this.fmc.flightPlanManager.getWaypointsCount() - 1;
										const waypoint = this.fmc.flightPlanManager.getWaypoint(idx);
										waypoint.infos.airwayIn = waypoints[id].airwayIn;
										waypoint.infos.airwayOut = waypoints[id].airwayOut;
									});
								};

								for (let i = 0; i <= waypoints.length; i++) {
									await insertWaypoint(waypoints[i].ident);
								}
				*/
				const data = waypoints;

				var iter = 0;

				const insert = async () => {
					let idx = this.fmc.flightPlanManager.getWaypointsCount() - 1;
					await this.insertWaypointFast(waypoints[iter], this.fmc.flightPlanManager.getWaypointsCount() - 1, () => {
						const waypoint = this.fmc.flightPlanManager.getWaypoint(idx);
						waypoint.infos.airwayIn = waypoints[iter].airwayIn;
						waypoint.infos.airwayOut = waypoints[iter].airwayOut;
						iter++;
						insert();
					});
				};

				await insert();
			};


			let parseNavlogFast = () => {
				let navlog = this.flightPlan.navlog.fix;
				let waypoints = [];
				let finalWaypoints = [];

				navlog = removeOriginAndDestination(navlog);
				navlog = removeSidAndStar(navlog);
				navlog = removeTocAndTod(navlog);
				navlog = breakAPartNAT(navlog);


				waypoints = this.parseAirways(navlog);

				/*
				 navlog.forEach((fix) => {
				 let ident = SimBriefOceanicWaypointConverter.convert(fix.ident);
				 waypoints.push({
				 ident: ident,
				 airway: fix.via_airway,
				 altitude: fix.altitude_feet,
				 lat: fix.pos_lat,
				 long: fix.pos_long
				 });
				 });
				 */
				/**
				 * SET first waypoint to DCT
				 * first waypoint also has to have airwayIn set to undefined
				 */

				waypoints[0].airway = 'DCT';
				waypoints[0].airwayIn = undefined;

				return waypoints;
			};


			let simBrief = new HDSDK.SimBrief();
			let fp = simBrief.getFlightPlan();
			/*
						fp.then((flightPlan) => {
							this.flightPlan = flightPlan;
							updateFlightPlan();
						});*/
		};

		/**
		 * TODO: Refactor this... It is same as SimBrief just parsing log is different
		 */
		this.fmc._renderer.lsk(2).event = () => {

			/**
			 * Protect all events
			 */
			//this.eventProtector.style.display = 'block';

			this.fmc.messageManager.showMessage('STANDBY ONE', 'FMC PROCESSING <br> LAST ENTRY <br>PLEASE WAIT');

			/**
			 * Callback hell
			 */
			if (!Simplane.getIsGrounded()) {
				return;
			}

			let updateFlightPlan = () => {
				//updateFlightNumber();
				//updateCostIndex();
				updateCruiseAltitude();
				this.fmc.flightPlanManager.pauseSync();
				updateRoute();
			};

			let updateRoute = () => {
				updateOrigin();
			};

			let updateOrigin = () => {

				if (Simplane.getIsGrounded()) {
					if (this.fmc.currentFlightPhase <= FlightPhase.FLIGHT_PHASE_TAKEOFF) {
						this.fmc.tmpDestination = undefined;
						this.fmc.flightPlanManager.createNewFlightPlan(() => {
							this.fmc.updateRouteOrigin(this.flightPlan.origin['icao_code'], (result) => {
								if (result) {
									this.fmc.fpHasChanged = true;
									SimVar.SetSimVarValue('L:WT_CJ4_INHIBIT_SEQUENCE', 'number', 0);
									this.fmc.updateFuelVars();
									updateDestination();
								}
							});
						});
					} else {
						this.fmc.clearUserInput();
						/**
						 * TODO: Uncomment after reimplementation
						 */
						/*
						this.fmc.prepareForTurnAround(() => {
							this.fmc.tmpDestination = undefined;
							this.fmc.flightPlanManager.createNewFlightPlan(() => {
								this.fmc.updateRouteOrigin(this.flightPlan.origin['icao_code'], (result) => {
									if (result) {
										this.fmc.fpHasChanged = true;
										SimVar.SetSimVarValue('L:WT_CJ4_INHIBIT_SEQUENCE', 'number', 0);
										this.fmc.updateFuelVars();
										updateDestination();
									}
								});
							});
						});
						*/
					}
				} else {
					this.fmc.showErrorMessage('NOT ON GROUND');
					return;
				}
			};

			let updateDestination = () => {
				this.fmc.updateRouteDestination(this.flightPlan.destination['icao_code'], () => {
					//parseNavlog();
					updateWaypoints();
				});
			};

			let updateFlightNumber = () => {
				this.fmc.updateFlightNo(this.flightPlan.general['flight_number']);
			};

			let updateCostIndex = () => {
				//this.fmc.tryUpdateCostIndex(this.flightPlan.general['cruise_profile'].replace('CI', ''));
			};

			let updateCruiseAltitude = () => {
				this.fmc.setCruiseFlightLevelAndTemperature(this.flightPlan.general['initial_altitude']);
			};

			let removeOriginAndDestination = (navlog) => {
				let out = [];

				navlog.forEach((fix) => {
					if (fix.ident !== this.flightPlan.origin.icao_code && fix.ident !== this.flightPlan.destination.icao_code) {
						out.push(fix);
					}
				});
				return out;
			};

			let removeSidAndStar = (navlog) => {
				let out = [];
				let sid = (navlog[0].via_airway !== 'DCT' ? navlog[0].via_airway : '');
				let star = (this.flightPlan.navlog.fix[this.flightPlan.navlog.fix.length - 1].via_airway !== 'DCT' ? this.flightPlan.navlog.fix[this.flightPlan.navlog.fix.length - 1].via_airway : '');
				navlog.forEach((fix) => {
					if ((fix.via_airway !== sid && fix.via_airway !== star) || fix.via_airway === 'DCT') {
						out.push(fix);
					}
				});
				return out;
			};
			let removeTocAndTod = (navlog) => {
				let out = [];
				navlog.forEach((fix) => {
					if (fix.ident !== 'TOD' && fix.ident !== 'TOC') {
						out.push(fix);
					}
				});
				return out;
			};

			let breakAPartNAT = (navlog) => {
				const nats = ['NATA', 'NATB', 'NATC', 'NATD', 'NATE', 'NATF', 'NATG', 'NATH', 'NATJ', 'NATK', 'NATL', 'NATM', 'NATN', 'NATP', 'NATQ', 'NATR', 'NATS', 'NATT', 'NATU', 'NATV', 'NATW', 'NATX', 'NATY', 'NATZ'];
				let out = [];
				navlog.forEach((fix) => {
					let index = nats.findIndex((nat) => {
						return nat === fix.via_airway;
					});
					if (index !== -1) {
						fix.via_airway = 'DCT';
					}

					out.push(fix);
				});
				return out;
			};

			let parseNavlog = () => {
				let navlog = this.flightPlan.navlog.fix;
				let waypoints = [];
				let finalWaypoints = [];

				navlog = removeOriginAndDestination(navlog);
				navlog = removeSidAndStar(navlog);
				navlog = removeTocAndTod(navlog);
				navlog = breakAPartNAT(navlog);

				navlog.forEach((fix) => {
					let ident = HDSDK.SimBriefOceanicWaypointConverter.convert(fix.ident);
					waypoints.push({
						ident: ident,
						airway: fix.via_airway,
						altitude: fix.altitude_feet,
						lat: fix.pos_lat,
						long: fix.pos_long
					});
				});

				/**
				 * SET first waypoint to DCT
				 */

				waypoints[0].airway = 'DCT';

				/**
				 * GROUP BY Airway
				 */

				let lastAirway = '';
				waypoints.forEach((waypoint) => {
					if (lastAirway === waypoint.airway && waypoint.airway !== 'DCT') {
						finalWaypoints.pop();
					}
					finalWaypoints.push(waypoint);
					lastAirway = waypoint.airway;
				});

				this.waypoints = finalWaypoints;

				this.waypoints.forEach((waypoint) => {
					this.progress.push([waypoint.airway, waypoint.ident, '', false]);
				});
			};

			let updateWaypoints = async () => {
				let iterator = 0;
				let protection = 0;
				parseNavlog();

				let insertWaypoint = async () => {
					protection++;
					if (protection > 400) {
						iterator = 20000;
						this.fmc.flightPlanManager.resumeSync();
						//this.eventProtector.style.display = 'none';
						this.fmc.messageManager.removeLastMessage();
						B787_10_FMC_RoutePage.ShowPage1(this.fmc);
						return;
					}
					if (!this.waypoints[iterator]) {
						iterator = 20000;
						this.fmc.flightPlanManager.resumeSync();
						//this.eventProtector.style.display = 'none';
						this.fmc.messageManager.removeLastMessage();
						B787_10_FMC_RoutePage.ShowPage1(this.fmc);
						return;
					}

					if (iterator >= this.waypoints.length) {
						this.fmc.flightPlanManager.resumeSync();
						//this.eventProtector.style.display = 'none';
						this.fmc.messageManager.removeLastMessage();
						B787_10_FMC_RoutePage.ShowPage1(this.fmc);
					}

					this.updateProgress(iterator);
					if (this.waypoints[iterator].airway !== 'DCT') {
						let lastWaypoint = this.fmc.flightPlanManager.getWaypoints()[this.fmc.flightPlanManager.getEnRouteWaypointsLastIndex()];
						if (lastWaypoint.infos instanceof WayPointInfo) {
							lastWaypoint.infos.UpdateAirway(this.waypoints[iterator].airway).then(() => {
								let airway = lastWaypoint.infos.airways.find(a => {
									return a.name === this.waypoints[iterator].airway;
								});
								if (airway) {
									this.fmc.onLeftInput = [];
									this.fmc.onRightInput = [];
									this.fmc.updateSideButtonActiveStatus();
									this.insertWaypointsAlongAirway(this.waypoints[iterator].ident, this.fmc.flightPlanManager.getWaypointsCount() - 1, this.waypoints[iterator].airway, () => {
										iterator++;
										insertWaypoint();
									});
								} else {
									iterator++;
									insertWaypoint();
								}
							});
						}
					} else {
						this.fmc.onLeftInput = [];
						this.fmc.onRightInput = [];
						this.fmc.updateSideButtonActiveStatus();
						this.progress[iterator][2] = this.waypoints[iterator].ident;
						this.insertWaypoint(this.waypoints[iterator].ident, this.fmc.flightPlanManager.getWaypointsCount() - 1, iterator, () => {
							iterator++;
							insertWaypoint();
						});
					}
				};

				await insertWaypoint();
			};

			let convertPlnToFlightPlan = (callback) => {
				Utils.loadFile('coui://html_UI/plans/plan.pln', (content) => {
					let parser = new DOMParser();
					let object = parser.parseFromString(content, 'text/xml');
					let crzAltitude = object.getElementsByTagName('CruisingAlt')[0].textContent;
					let origin = object.getElementsByTagName('DepartureID')[0].textContent;
					let destination = object.getElementsByTagName('DestinationID')[0].textContent;
					let output: {
						general: {
							initial_altitude: any
						},
						origin: {
							icao_code: any
						},
						destination: {
							icao_code: any
						},
						navlog: any
					} = undefined;

					output.general = {
						initial_altitude: crzAltitude
					};
					output.origin = {
						icao_code: origin
					};
					output.destination = {
						icao_code: destination
					};

					let finalWaypoints = [];

					/**
					 * TODO: Suppressed type error by ANY
					 * @type {any}
					 */
					let waypoints = object.getElementsByTagName('ATCWaypoint') as any;
					for (let item of waypoints) {
						let waypoint: { ident: string, via_airway: string, lat: any, long: any } = undefined;
						waypoint.ident = item.id;
						for (let airway of item.getElementsByTagName('ATCAirway')) {
							waypoint.via_airway = airway.textContent;
							break;
						}
						if (!waypoint.via_airway) {
							waypoint.via_airway = 'DCT';
						}
						waypoint.lat = 0;
						waypoint.long = 0;
						finalWaypoints.push(waypoint);
					}

					output.navlog = {
						fix: finalWaypoints
					};

					this.flightPlan = output;
					callback();
				});
			};

			convertPlnToFlightPlan(() => {
				updateFlightPlan();
			});
		};
	}

	updateProgress(iterator) {
		let actualPage = Math.floor((iterator) / 5);

		let rows = [['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', '']];
		rows[0][0] = 'FLIGHT PLANS';
		for (let i = 1; i <= 5; i++) {
			if (this.progress[i + (5 * actualPage) - 1]) {
				if (iterator > i + (5 * actualPage) - 1) {
					rows[i * 2][0] = '[color=green]' + this.progress[i + (5 * actualPage) - 1][0] + '[/color]';
					rows[i * 2][1] = '[color=green]' + this.progress[i + (5 * actualPage) - 1][1] + '[/color]';
				} else if (iterator === i + (5 * actualPage) - 1) {
					rows[i * 2][0] = '[color=yellow]' + this.progress[i + (5 * actualPage) - 1][0] + '[/color]';
					rows[i * 2][1] = '[color=yellow]' + this.progress[i + (5 * actualPage) - 1][1] + '[/color]';
				} else {
					rows[i * 2][0] = this.progress[i + (5 * actualPage) - 1][0];
					rows[i * 2][1] = this.progress[i + (5 * actualPage) - 1][1];
				}
				if (this.progress[i - 1][3] === false && iterator === i + (5 * actualPage) - 1) {
					rows[i * 2 + 1][0] = '[color=yellow]' + this.progress[i + (5 * actualPage) - 1][2] + '[/color]';
					rows[i * 2 + 1][1] = '[color=yellow]adding[/color]';
				} else if (this.progress[i + (5 * actualPage) - 1][3] === false && iterator < i + (5 * actualPage) - 1) {
					rows[i * 2 + 1][0] = this.progress[i + (5 * actualPage) - 1][2];
					rows[i * 2 + 1][1] = 'waiting';
				} else if (this.progress[i + (5 * actualPage) - 1][3] === false && iterator > i + (5 * actualPage) - 1) {
					rows[i * 2 + 1][0] = '[color=green]' + this.progress[i + (5 * actualPage) - 1][2] + '[/color]';
					rows[i * 2 + 1][1] = '[color=green]done[/color]';
				}
			}
		}

		this.fmc.cleanUpPage();
		/**
		 * Title need to be removed (before refactoring hotfix)
		 */
		rows.splice(1, 1);
		this.fmc._renderer.render(rows);
	}

	async insertWaypointsAlongAirway(lastWaypointIdent, index, airwayName, callback = EmptyCallback.Boolean) {
		const referenceWaypoint = this.fmc.flightPlanManager.getWaypoint(index - 1);
		if (referenceWaypoint) {
			const infos = referenceWaypoint.infos;
			if (infos instanceof WayPointInfo) {
				const airway = infos.airways.find(a => {
					return a.name === airwayName;
				});
				if (airway) {
					const firstIndex = airway.icaos.indexOf(referenceWaypoint.icao);
					const lastWaypointIcao = airway.icaos.find(icao => icao.substring(7, 12) === lastWaypointIdent.padEnd(5, ' '));
					const lastIndex = airway.icaos.indexOf(lastWaypointIcao);
					if (firstIndex >= 0) {
						if (lastIndex >= 0) {
							let inc = 1;
							if (lastIndex < firstIndex) {
								inc = -1;
							}

							const count = Math.abs(lastIndex - firstIndex);
							for (let i = 1; i < count + 1; i++) { // 9 -> 6
								const syncInsertWaypointByIcao = async (icao, idx): Promise<void> => {
									return new Promise(resolve => {

										let progressIndex = this.progress.findIndex((w) => {
											return w[1] === lastWaypointIdent;
										});

										if (progressIndex) {
											this.progress[progressIndex][2] = icao.trim().split(' ').pop();
											this.updateProgress(progressIndex);
										}
										//console.log('add icao:' + icao + ' @ ' + idx);
										this.fmc.flightPlanManager.addWaypoint(icao, idx, () => {
											const waypoint = this.fmc.flightPlanManager.getWaypoint(idx - 1);
											const ident = waypoint.infos.ident;
											waypoint.infos.UpdateAirway(airwayName).then(() => {
												waypoint.infos.airwayIn = airwayName;
												if (i < count) {
													waypoint.infos.airwayOut = airwayName;
												}

												/**
												 * If it is last waypoint on airway override airways by parsed airways
												 */
												if (lastWaypointIdent === waypoint.infos.ident) {
													waypoint.infos.airwayIn = this.progress[progressIndex][4];
													waypoint.infos.airwayOut = this.progress[progressIndex][5];
												}
												//console.log('icao:' + icao + ' added; Ident:' + lastWaypointIdent + '; Airway in: ' + waypoint.infos.airwayIn + '; Airway out: ' + waypoint.infos.airwayOut);
												resolve();
											});
										});
									});
								};

								await syncInsertWaypointByIcao(airway.icaos[firstIndex + i * inc], index + i);
							}
							callback(true);
							return;
						}
						this.fmc.showErrorMessage('2ND INDEX NOT FOUND');
						return callback(false);
					}
					this.fmc.showErrorMessage('1ST INDEX NOT FOUND');
					return callback(false);
				}
				this.fmc.showErrorMessage('NO REF WAYPOINT');
				return callback(false);
			}
			this.fmc.showErrorMessage('NO WAYPOINT INFOS');
			return callback(false);
		}
		this.fmc.showErrorMessage('NO REF WAYPOINT');
		return callback(false);
	}

	async insertWaypointsAlongAirway2(lastWaypointIdent, index, airwayName, callback = EmptyCallback.Boolean) {
		let referenceWaypoint = this.fmc.flightPlanManager.getWaypoint(index - 1);
		if (referenceWaypoint) {
			let infos = referenceWaypoint.infos;
			if (infos instanceof WayPointInfo) {
				let airway = infos.airways.find(a => {
					return a.name === airwayName;
				});
				if (airway) {
					let firstIndex = airway.icaos.indexOf(referenceWaypoint.icao);
					let lastWaypointIcao = airway.icaos.find(icao => {
						return icao.trim().split(' ').pop() === lastWaypointIdent;
					});
					let lastIndex = airway.icaos.indexOf(lastWaypointIcao);
					if (firstIndex >= 0) {
						if (lastIndex >= 0) {
							let inc = 1;
							if (lastIndex < firstIndex) {
								inc = -1;
							}
							let count = Math.abs(lastIndex - firstIndex);

							for (let i = 1; i < count + 1; i++) {
								let asyncInsertWaypointByIcao = async (icao, index): Promise<void> => {
									return new Promise(resolve => {

										let progressIndex = this.progress.findIndex((w) => {
											return w[1] === lastWaypointIdent;
										});

										if (progressIndex) {
											this.progress[progressIndex][2] = icao.trim().split(' ').pop();
											this.updateProgress(progressIndex);
										}


										this.fmc.flightPlanManager.addWaypoint(icao, index, () => {
											const waypoint = this.fmc.flightPlanManager.getWaypoint(index);
											waypoint.infos.UpdateAirway(airwayName).then(() => {
												waypoint.infos.airwayIn = airwayName;
												if (i < count) {
													waypoint.infos.airwayOut = airwayName;
												}
												resolve();
											});
										});
									});
								};
								let outOfSync = async (icaoIndex, realIndex) => {
									await asyncInsertWaypointByIcao(airway.icaos[icaoIndex], realIndex);
								};

								await outOfSync(firstIndex + i * inc, index - 1 + i);
							}
							return callback(true);
						}
						this.fmc.showErrorMessage('2ND INDEX NOT FOUND');
						return callback(false);
					}
					this.fmc.showErrorMessage('1ST INDEX NOT FOUND');
					return callback(false);
				}
				this.fmc.showErrorMessage('NO REF WAYPOINT');
				return callback(false);
			}
			this.fmc.showErrorMessage('NO WAYPOINT INFOS');
			return callback(false);
		}
		this.fmc.showErrorMessage('NO REF WAYPOINT');
		return callback(false);
	}

	insertWaypointFast(newWaypointTo, index, callback = EmptyCallback.Boolean) {
		this.fmc.ensureCurrentFlightPlanIsTemporary(async () => {
			this.getOrSelectWaypointByIdentFast(newWaypointTo.ident, newWaypointTo, (waypoint) => {
				if (!waypoint) {
					this.fmc.showErrorMessage('NOT IN DATABASE');
					return callback(false);
				}
				this.fmc.flightPlanManager.addWaypoint(waypoint.icao, index, () => {
					return callback(true);
				});
			});
		});
	}

	insertWaypoint(newWaypointTo, index, iterator, callback = EmptyCallback.Boolean) {
		this.fmc.ensureCurrentFlightPlanIsTemporary(async () => {
			this.getOrSelectWaypointByIdent(newWaypointTo, iterator, (waypoint) => {
				if (!waypoint) {
					this.fmc.showErrorMessage('NOT IN DATABASE');
					return callback(false);
				}
				this.fmc.flightPlanManager.addWaypoint(waypoint.icao, index, () => {
					return callback(true);
				});
			});
		});
	}

	getOrSelectWaypointByIdentFast(ident, waypoint, callback) {
		console.log('CHECKING FOR SAME NAME: ' + ident);
		this.fmc.dataManager.GetWaypointsByIdent(ident).then((waypoints) => {
			if (!waypoints || waypoints.length === 0) {
				console.log('WAYPOINT NOT FOUND');
				return callback(undefined);
			}
			if (waypoints.length === 1) {
				console.log('ONLY ONE WAYPOINT WITH THE NAME');
				return callback(waypoints[0]);
			}

			console.log('MORE WAYPOINTS WITH SAME NAME');

			/**
			 * Precision 10m
			 */
			for (let i = 0; i <= waypoints.length - 1; i++) {
				if (parseFloat(waypoints[i].infos.coordinates.lat).toFixed(4) === parseFloat(waypoint.lat).toFixed(4) && parseFloat(waypoints[i].infos.coordinates.long).toFixed(4) === parseFloat(waypoint.long).toFixed(4)) {
					return callback(waypoints[i]);
				}
			}

			/**
			 * Precision 100m
			 */
			for (let i = 0; i <= waypoints.length - 1; i++) {
				console.log('CHECK LAT: ' + waypoints[i].infos.coordinates.lat + ':' + waypoint.lat + '; CHECK LONG: ' + waypoints[i].infos.coordinates.long + ':' + waypoint.long, waypoint.ident);

				if (parseFloat(waypoints[i].infos.coordinates.lat).toFixed(3) === parseFloat(waypoint.lat).toFixed(3) && parseFloat(waypoints[i].infos.coordinates.long).toFixed(3) === parseFloat(waypoint.long).toFixed(3)) {
					return callback(waypoints[i]);
				}
			}

			/**
			 * Precision 1000m
			 */
			for (let i = 0; i <= waypoints.length - 1; i++) {
				console.log('CHECK LAT: ' + waypoints[i].infos.coordinates.lat + ':' + waypoint.lat + '; CHECK LONG: ' + waypoints[i].infos.coordinates.long + ':' + waypoint.long, waypoint.ident);

				if (parseFloat(waypoints[i].infos.coordinates.lat).toFixed(2) === parseFloat(waypoint.lat).toFixed(2) && parseFloat(waypoints[i].infos.coordinates.long).toFixed(2) === parseFloat(waypoint.long).toFixed(2)) {
					return callback(waypoints[i]);
				}
			}

			console.log('WAYPOINT BY LAT/LONG NOT FOUND');

			B787_10_FMC_SelectWptPage.ShowPage(this.fmc, waypoints, callback);
		});
	}

	getOrSelectWaypointByIdent(ident, iterator, callback) {
		this.fmc.dataManager.GetWaypointsByIdent(ident).then((waypoints) => {
			if (!waypoints || waypoints.length === 0) {
				return callback(undefined);
			}
			if (waypoints.length === 1) {
				return callback(waypoints[0]);
			}

			for (let i = 0; i <= waypoints.length - 1; i++) {
				if (parseFloat(waypoints[i].infos.coordinates.lat).toFixed(5) === parseFloat(this.waypoints[iterator].lat).toFixed(5) && parseFloat(waypoints[i].infos.coordinates.long).toFixed(5) === parseFloat(this.waypoints[iterator].long).toFixed(5)) {
					return callback(waypoints[i]);
				}
			}

			B787_10_FMC_SelectWptPage.ShowPage(this.fmc, waypoints, callback);
		});
	}
}