class B787_10_FMC_RouteRequestPage {
	constructor(fmc) {
		this.fmc = fmc;
	}

	showPage() {
		this.fmc.clearDisplay();

		this.fmc.setTemplate([
			['FLIGHT PLANS'],
			[''],
			['LOAD FP FROM SB'],
			[''],
			[''],
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

			let updateFlightPlan = () => {
				updateFlightNumber();
				updateCostIndex();
				updateCruiseAltitude();
				updateRoute();
			};

			let updateRoute = () => {
				updateOrigin();
			};

			let updateOrigin = () => {
				this.fmc.updateRouteOrigin(this.flightPlan.origin['icao_code'], () => {
					updateDestination();
				});
			};

			let updateDestination = () => {
				this.fmc.updateRouteDestination(this.flightPlan.destination['icao_code'], () => {
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

			let parseNavlog = () => {
				let waypoints = [];
				let finalWaypoints = [];
				this.flightPlan.navlog.fix.forEach((fix) => {
					if (fix.ident !== 'TOD' && fix.ident !== 'TOC' && fix.is_sid_star != 1) {
						waypoints.push({ident: fix.ident, airway: fix.via_airway, altitude: fix.altitude_feet});
					}
				});

				let lastAirway = '';
				let position = 0;
				waypoints.forEach((waypoint) => {
					if (lastAirway === waypoint.airway && waypoint.airway !== 'DCT') {
						finalWaypoints.pop();
					}
					finalWaypoints.push(waypoint);
					lastAirway = waypoint.airway;
				});

				finalWaypoints.shift();
				if (finalWaypoints[0].airway !== 'DCT') {
					let firstIndex = waypoints.findIndex((w) => {
						return w.airway === finalWaypoints[0].airway;
					});

					if (firstIndex >= 0) {
						let firstWaypoint = waypoints[firstIndex];
						firstWaypoint.airway = 'DCT';
						finalWaypoints.unshift(firstWaypoint);
					}
				}


				this.waypoints = finalWaypoints;
			};

			let updateWaypoints = async () => {
				let iterator = 0;
				parseNavlog();
				// TRUKN2 TIPRE Q126 GAROT DCT EKR J84 SNY DCT FOD DCT DBQ DCT KG75M DCT DAFLU J70 LVZ LENDY6
				// TRUKN2 TIPRE Q126 GAROT EKR J84 SNY FOD DBQ KG75M DAFLU J70 MAGIO J70 LVZ LENDY6

				this.waypoints.forEach((waypoint) => {
					console.log(waypoint.ident + ' : ' + waypoint.airway);
				});

				let insertWaypoint = async () => {
					if (iterator >= this.waypoints.length) {
						B787_10_FMC_RoutePage.ShowPage1(this.fmc);
					}

					if (this.waypoints[iterator].airway !== 'DCT') {
						await this.fmc.insertWaypointsAlongAirway(this.waypoints[iterator].ident, this.fmc.flightPlanManager.getWaypointsCount() - 1, this.waypoints[iterator].airway, () => {
							iterator++;
							insertWaypoint();
						});
					} else {
						console.log(this.waypoints[iterator].ident);
						this.fmc.insertWaypoint(this.waypoints[iterator].ident, this.fmc.flightPlanManager.getWaypointsCount() - 1, () => {
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
	}
}