class B787_10_FMC_RouteRequestPage {
	constructor(fmc) {
		this.fmc = fmc;
		this.progress = [];
	}

	showPage() {
		this.fmc.clearDisplay();

		this.fmc.setTemplate([
			['FLIGHT PLANS'],
			[''],
			['LOAD FP FROM SB'],
			[''],
			['LOAD FP FROM GAME'],
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

		this.fmc.updateSideButtonActiveStatus();
	}

	setupInputHandlers() {
		this.fmc.onLeftInput[5] = () => {
			B787_10_FMC_RoutePage.ShowPage1(this.fmc);
		};

		this.fmc.onLeftInput[0] = () => {
			/**
			 * Callback hell
			 */
			if(!Simplane.getIsGrounded()){
				return;
			}

			let updateFlightPlan = () => {
				updateFlightNumber();
				updateCostIndex();
				updateCruiseAltitude();
				this.fmc.flightPlanManager.pauseSync();
				updateRoute();
			};

			let updateRoute = () => {
				updateOrigin();
			};

			let updateOrigin = () => {

				if(Simplane.getIsGrounded()){
					if(this.fmc.currentFlightPhase <= FlightPhase.FLIGHT_PHASE_TAKEOFF){
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
				this.fmc.tryUpdateCostIndex(this.flightPlan.general['cruise_profile'].replace('CI', ''));
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
				const nats = ['NATA', 'NATB', 'NATC', 'NATD', 'NATE', 'NATF', 'NATG', 'NATH', 'NATJ', 'NATK', 'NATL', 'NATM', 'NATN', 'NATP', 'NATQ', 'NATR', 'NATS', 'NATT', 'NATU', 'NATV', 'NATW', 'NATX', 'NATY', 'NATZ']
				let out = [];
				navlog.forEach((fix) => {
					let index = nats.findIndex((nat) => {
						return nat === fix.via_airway;
					})
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
					let ident = SimBriefOceanicWaypointConverter.convert(fix.ident);
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
						B787_10_FMC_RoutePage.ShowPage1(this.fmc);
						return;
					}
					if (!this.waypoints[iterator]) {
						iterator = 20000;
						this.fmc.flightPlanManager.resumeSync();
						B787_10_FMC_RoutePage.ShowPage1(this.fmc);
						return;
					}

					if (iterator >= this.waypoints.length) {
						this.fmc.flightPlanManager.resumeSync();
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

			let simBrief = new SimBrief();
			let fp = simBrief.getFlightPlan();

			fp.then((flightPlan) => {
				this.flightPlan = flightPlan;
				updateFlightPlan();
			});
		};

		this.fmc.onLeftInput[1] = async () => {
			this.fmc.flightPlanManager.pauseSync();
			FlightPlanAsoboSync.LoadFromGame(this.fmc.flightPlanManager).catch((err) => {
				console.log("ERROR " + err);
				this.fmc.flightPlanManager.resumeSync();
			}).then(() => {
				this.fmc.flightPlanManager.resumeSync();
				this.fmc.flightPlanManager.setActiveWaypointIndex(1);
				B787_10_FMC_RoutePage.ShowPage1(this.fmc);
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

		this.fmc.clearDisplay();

		this.fmc.setTemplate(rows);
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
					const lastWaypointIcao = airway.icaos.find(icao => icao.substring(7, 12) === lastWaypointIdent.padEnd(5, " "));
					const lastIndex = airway.icaos.indexOf(lastWaypointIcao);
					if (firstIndex >= 0) {
						if (lastIndex >= 0) {
							let inc = 1;
							if (lastIndex < firstIndex) {
								inc = -1;
							}

							const count = Math.abs(lastIndex - firstIndex);
							for (let i = 1; i < count + 1; i++) { // 9 -> 6
								const syncInsertWaypointByIcao = async (icao, idx) => {
									return new Promise(resolve => {

										let progressIndex = this.progress.findIndex((w) => {
											return w[1] === lastWaypointIdent;
										});

										if (progressIndex) {
											this.progress[progressIndex][2] = icao.trim().split(' ').pop();
											this.updateProgress(progressIndex);
										}
										console.log("add icao:" + icao + " @ " + idx);
										this.fmc.flightPlanManager.addWaypoint(icao, idx, () => {
											const waypoint = this.fmc.flightPlanManager.getWaypoint(idx);
											waypoint.infos.UpdateAirway(airwayName).then(() => {
												waypoint.infos.airwayIn = airwayName;
												if (i < count) {
													waypoint.infos.airwayOut = airwayName;
												}
												console.log("icao:" + icao + " added");
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
						this.fmc.showErrorMessage("2ND INDEX NOT FOUND");
						return callback(false);
					}
					this.fmc.showErrorMessage("1ST INDEX NOT FOUND");
					return callback(false);
				}
				this.fmc.showErrorMessage("NO REF WAYPOINT");
				return callback(false);
			}
			this.fmc.showErrorMessage("NO WAYPOINT INFOS");
			return callback(false);
		}
		this.fmc.showErrorMessage("NO REF WAYPOINT");
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
								let asyncInsertWaypointByIcao = async (icao, index) => {
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