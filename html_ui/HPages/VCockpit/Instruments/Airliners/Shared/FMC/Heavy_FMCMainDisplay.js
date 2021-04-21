class Heavy_FMCMainDisplay extends FMCMainDisplay {
	constructor() {
		super();

		this._shouldBeExecEmisssive = false;
		this._activeExecHandlers = {};

		FMCMainDisplay.DEBUG_INSTANCE = this;
	}

	makeSettable(content) {
		return '[settable]' + content + '[/settable]';
	}

	colorizeContent(content, color) {
		return '[color=' + color + ']' + content + '[/color]';
	}

	resizeContent(content, size) {
		return '[size=' + size + ']' + content + '[/size]';
	}

	setTitle(content) {
		if (content !== '') {
			let re3 = /\[settable\](.*?)\[\/settable\]/g;
			content = content.replace(re3, '<div class="settable"><span>$1</span></div>');

			let re2 = /\[size=([a-z-]+)\](.*?)\[\/size\]/g;
			content = content.replace(re2, '<tspan class="$1">$2</tspan>');

			let re = /\[color=([a-z-]+)\](.*?)\[\/color\]/g;
			content = content.replace(re, '<tspan class="$1">$2</tspan>');
			let color = content.split('[color]')[1];
		}
		let color = content.split('[color]')[1];
		if (!color) {
			color = 'white';
		}
		this._title = content.split('[color]')[0];
		this._titleElement.classList.remove('white', 'blue', 'yellow', 'green', 'red');
		this._titleElement.classList.add(color);
		this._titleElement.innerHTML = this._title;
	}

	setLabel(label, row, col = -1) {
		if (col >= this._labelElements[row].length) {
			return;
		}
		if (!this._labels[row]) {
			this._labels[row] = [];
		}
		if (!label) {
			label = '';
		}
		if (col === -1) {
			for (let i = 0; i < this._labelElements[row].length; i++) {
				this._labels[row][i] = '';
				this._labelElements[row][i].textContent = '';
			}
			col = 0;
		}
		if (label === '__FMCSEPARATOR') {
			label = '---------------------------------------';
		}
		if (label !== '') {
			label = label.replace('\<', '&lt');
			let re3 = /\[settable\](.*?)\[\/settable\]/g;
			//content = content.replace(re3, '<div style="padding-top: 4px"><span class="settable">$1</span></div>')
			label = label.replace(re3, '<div class="settable"><span>$1</span></div>');

			let re2 = /\[size=([a-z-]+)\](.*?)\[\/size\]/g;
			label = label.replace(re2, '<tspan class="$1">$2</tspan>');

			let re = /\[color=([a-z-]+)\](.*?)\[\/color\]/g;
			label = label.replace(re, '<tspan class="$1">$2</tspan>');

			let color = label.split('[color]')[1];
			if (!color) {
				color = 'white';
			}
			let e = this._labelElements[row][col];
			e.classList.remove('white', 'blue', 'yellow', 'green', 'red');
			e.classList.add(color);
			label = label.split('[color]')[0];
		}
		this._labels[row][col] = label;
		this._labelElements[row][col].innerHTML = label;
	}

	setLine(content, row, col = -1) {
		if (col >= this._lineElements[row].length) {
			return;
		}
		if (!content) {
			content = '';
		}
		if (!this._lines[row]) {
			this._lines[row] = [];
		}
		if (col === -1) {
			for (let i = 0; i < this._lineElements[row].length; i++) {
				this._lines[row][i] = '';
				this._lineElements[row][i].textContent = '';
			}
			col = 0;
		}
		if (content === '__FMCSEPARATOR') {
			content = '---------------------------------------';
		}
		if (content !== '') {
			content = content.replace('\<', '&lt');
			if (content.indexOf('[s-text]') !== -1) {
				content = content.replace('[s-text]', '');
				this._lineElements[row][col].classList.add('s-text');
			} else {
				this._lineElements[row][col].classList.remove('s-text');
			}

			let re3 = /\[settable\](.*?)\[\/settable\]/g;
			//content = content.replace(re3, '<div style="padding-top: 4px"><span class="settable">$1</span></div>')
			content = content.replace(re3, '<div class="settable"><span>$1</span></div>');

			let re2 = /\[size=([a-z-]+)\](.*?)\[\/size\]/g;
			content = content.replace(re2, '<tspan class="$1">$2</tspan>');

			let re = /\[color=([a-z-]+)\](.*?)\[\/color\]/g;
			content = content.replace(re, '<tspan class="$1">$2</tspan>');
			let color = content.split('[color]')[1];
			if (!color) {
				color = 'white';
			}
			let e = this._lineElements[row][col];
			e.classList.remove('white', 'blue', 'yellow', 'green', 'red', 'magenta');
			e.classList.add(color);
			content = content.split('[color]')[0];
		}
		this._lines[row][col] = content;
		this._lineElements[row][col].innerHTML = this._lines[row][col];
	}

	setDepartureIndex(departureIndex, callback = EmptyCallback.Boolean) {
		this.ensureCurrentFlightPlanIsTemporary(() => {
			let currentRunway = this.flightPlanManager.getDepartureRunway();
			this.flightPlanManager.setDepartureProcIndex(departureIndex, () => {
				if (currentRunway) {
					let departure = this.flightPlanManager.getDeparture();
					let departureRunwayIndex = -1;
					if (departure) {
						departureRunwayIndex = departure.runwayTransitions.findIndex(t => {
							return t.name.indexOf(currentRunway.designation) != -1;
						});
					}
					if (departureRunwayIndex >= -1) {
						return this.flightPlanManager.setDepartureRunwayIndex(departureRunwayIndex, () => {
							return callback(true);
						});
					}
				}
				return callback(true);
			});
		});
	}

	async insertWaypointsAlongAirway(lastWaypointIdent, index, airwayName, callback = EmptyCallback.Boolean) {
		let referenceWaypoint = this.flightPlanManager.getWaypoint(index - 1);
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
										this.flightPlanManager.addWaypoint(icao, index, () => {
											const waypoint = this.flightPlanManager.getWaypoint(index);
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
						this.showErrorMessage('2ND INDEX NOT FOUND');
						return callback(false);
					}
					this.showErrorMessage('1ST INDEX NOT FOUND');
					return callback(false);
				}
				this.showErrorMessage('NO REF WAYPOINT');
				return callback(false);
			}
			this.showErrorMessage('NO WAYPOINT INFOS');
			return callback(false);
		}
		this.showErrorMessage('NO REF WAYPOINT');
		return callback(false);
	}

	insertTemporaryFlightPlan(callback = EmptyCallback.Void) {
		if (this.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
			this.flightPlanManager.copyCurrentFlightPlanInto(0, () => {
				this.flightPlanManager.setCurrentFlightPlanIndex(0, () => {
					this.synchronizeTemporaryAndActiveFlightPlanWaypoints();
					SimVar.SetSimVarValue('L:FMC_FLIGHT_PLAN_IS_TEMPORARY', 'number', 0);
					SimVar.SetSimVarValue('L:MAP_SHOW_TEMPORARY_FLIGHT_PLAN', 'number', 0);
					if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_APPROACH) {
						this.flightPlanManager.activateApproach();
					}
					callback();
				});
			});
		}
	}


	async synchronizeTemporaryAndActiveFlightPlanWaypoints() {
		const temporaryFPWaypoints = this.flightPlanManager.getWaypoints(1);
		const activeFPWaypoints = this.flightPlanManager.getWaypoints(0);

		for (let i = 0; i < activeFPWaypoints.length; i++) {
			if (temporaryFPWaypoints[i] && activeFPWaypoints[i]) {
				await this._synchronizeAirways(temporaryFPWaypoints[i], activeFPWaypoints[i]);
			}
		}
	}

	_synchronizeAirways(temporaryWaypoint, activeWaypoint) {
		if (temporaryWaypoint.infos && activeWaypoint.infos && temporaryWaypoint.icao === activeWaypoint.icao) {
			activeWaypoint.infos.airwayIn = temporaryWaypoint.infos.airwayIn;
			activeWaypoint.infos.airwayOut = temporaryWaypoint.infos.airwayOut;
		}
	}

	trySetClimbSpeedRestriction(speed, altitude) {
		speed = parseFloat(speed);
		altitude = parseFloat(altitude);
		if (isFinite(speed) && isFinite(altitude)) {
			this._climbSpeedRestriction = {speed: speed, altitude: altitude};
			let handler = () => {
				if (isFinite(this._climbSpeedRestriction.speed) && isFinite(this._climbSpeedRestriction.altitude)) {
					this.climbSpeedRestriction = this._climbSpeedRestriction;
					this._climbSpeedRestriction = null;
					return true;
				}
				return false;
			};
			this._activeExecHandlers['CLIMB_SPEED_RESTRICTION_HANDLER'] = handler;
			return true;
		}
		this.showErrorMessage(this.defaultInputErrorMessage);
		return false;
	}


	checkUpdateFlightPhase() {
		let airSpeed = SimVar.GetSimVarValue('AIRSPEED TRUE', 'knots');
		if (airSpeed > 10) {
			if (this.currentFlightPhase === 0) {
				this.currentFlightPhase = FlightPhase.FLIGHT_PHASE_TAKEOFF;
			}
			if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_TAKEOFF) {
				let enterClimbPhase = false;
				let agl = Simplane.getAltitude();
				let altValue = isFinite(this.thrustReductionAltitude) ? this.thrustReductionAltitude : 1500;
				if (agl > altValue) {
					this.currentFlightPhase = FlightPhase.FLIGHT_PHASE_CLIMB;
					enterClimbPhase = true;
					SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
				}
				if (enterClimbPhase) {
					let origin = this.flightPlanManager.getOrigin();
					if (origin) {
						origin.altitudeWasReached = Simplane.getAltitude();
						origin.timeWasReached = SimVar.GetGlobalVarValue('ZULU TIME', 'seconds');
						origin.fuelWasReached = SimVar.GetSimVarValue('FUEL TOTAL QUANTITY', 'gallons') * SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'kilograms') / 1000;
					}
				}
			}
			if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
				let altitude = SimVar.GetSimVarValue('PLANE ALTITUDE', 'feet');
				let cruiseFlightLevel = this.cruiseFlightLevel * 100;
				if (isFinite(cruiseFlightLevel)) {
					if (altitude >= 0.96 * cruiseFlightLevel) {
						let lastFlightPhase = this.currentFlightPhase;
						this.currentFlightPhase = FlightPhase.FLIGHT_PHASE_CRUISE;
						Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.AUTO);
						if (lastFlightPhase !== FlightPhase.FLIGHT_PHASE_CRUISE) {
							SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
						}
					}
				}

				/**
				 * Basic ToC
				 */

				let showTopOfClimb = false;
				let topOfClimbLlaHeading;
				let groundSpeed = Simplane.getGroundSpeed();
				if (cruiseFlightLevel > altitude + 40) {
					const vSpeed = Simplane.getVerticalSpeed();
					const climbDuration = (cruiseFlightLevel - altitude) / vSpeed / 60;
					const climbDistance = climbDuration * groundSpeed;
					if (climbDistance > 1 || vSpeed > 150) {
						topOfClimbLlaHeading = this.flightPlanManager.getCoordinatesHeadingAtDistanceAlongFlightPlan(climbDistance);
						if (topOfClimbLlaHeading) {
							showTopOfClimb = true;
						}
					}
				}
				if (showTopOfClimb) {
					SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_CLIMB', 'number', 1);
					SimVar.SetSimVarValue('L:AIRLINER_FMS_LAT_TOP_CLIMB', 'number', topOfClimbLlaHeading.lla.lat);
					SimVar.SetSimVarValue('L:AIRLINER_FMS_LONG_TOP_CLIMB', 'number', topOfClimbLlaHeading.lla.long);
					SimVar.SetSimVarValue('L:AIRLINER_FMS_HEADING_TOP_CLIMB', 'number', topOfClimbLlaHeading.heading);
				} else {
					SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_CLIMB', 'number', 0);
				}

			}
			if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
				SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_CLIMB', 'number', 0);


				/**
				 * Basic TOD to destination
				 */
				/*
					let vSpeed = 1500;
					let cruiseFlightLevel = this.cruiseFlightLevel * 100;
					let groundSpeed = Simplane.getGroundSpeed();
					let todCoordinates;
					let showTopOfDescent = false;

					if (isFinite(cruiseFlightLevel)) {
						let destination = this.flightPlanManager.getDestination();
						if (destination) {
							let descentDuration = Math.abs(destination.altitudeinFP - this.cruiseFlightLevel * 100) / vSpeed / 60;
							let descentDistance = descentDuration * groundSpeed;
							todCoordinates = this.flightPlanManager.getCoordinatesAtNMFromDestinationAlongFlightPlan(descentDistance);
							let planeCoordinates = new LatLong(SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude'), SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude'));
							let distanceToTOD = Avionics.Utils.computeGreatCircleDistance(planeCoordinates, todCoordinates.lla);

							if (distanceToTOD < 50) {
								if (!SimVar.GetSimVarValue('L:B78XH_DESCENT_NOW_AVAILABLE', 'Number')) {
									SimVar.SetSimVarValue('L:B78XH_DESCENT_NOW_AVAILABLE', 'Number', 1);
									SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
								}
							}

							if (distanceToTOD > 1) {
								if (todCoordinates) {
									showTopOfDescent = true;
								}
							} else {
								let lastFlightPhase = this.currentFlightPhase;
								this.currentFlightPhase = FlightPhase.FLIGHT_PHASE_DESCENT;
								Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.AUTO);
								if (lastFlightPhase !== FlightPhase.FLIGHT_PHASE_DESCENT) {
									SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
								}
							}
						}
					}

					if (showTopOfDescent) {
						SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_DSCNT', 'number', 1);
						SimVar.SetSimVarValue('L:AIRLINER_FMS_LAT_TOP_DSCNT', 'number', todCoordinates.lla.lat);
						SimVar.SetSimVarValue('L:AIRLINER_FMS_LONG_TOP_DSCNT', 'number', todCoordinates.lla.long);
					} else {
						SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_DSCNT', 'number', 0);
					}
*/
			}
			if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT) {
				SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_DSCNT', 'number', 0);
			}

			if (this.currentFlightPhase != FlightPhase.FLIGHT_PHASE_APPROACH) {
				if (this.flightPlanManager.decelWaypoint) {
					let lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
					let long = SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude');
					let planeLla = new LatLongAlt(lat, long);
					let dist = Avionics.Utils.computeGreatCircleDistance(this.flightPlanManager.decelWaypoint.infos.coordinates, planeLla);
					if (dist < 3) {
						this.tryGoInApproachPhase();
					}
				}
			}
			if (this.currentFlightPhase != FlightPhase.FLIGHT_PHASE_APPROACH) {
				let destination = this.flightPlanManager.getDestination();
				if (destination) {
					let lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
					let long = SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude');
					let planeLla = new LatLongAlt(lat, long);
					let dist = Avionics.Utils.computeGreatCircleDistance(destination.infos.coordinates, planeLla);
					if (dist < 20) {
						this.tryGoInApproachPhase();
					}
				}
			}
		}
		if (SimVar.GetSimVarValue('L:AIRLINER_FLIGHT_PHASE', 'number') != this.currentFlightPhase) {
			SimVar.SetSimVarValue('L:AIRLINER_FLIGHT_PHASE', 'number', this.currentFlightPhase);
			this.onFlightPhaseChanged();
		}
	}
}