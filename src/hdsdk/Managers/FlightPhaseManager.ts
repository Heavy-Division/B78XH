import {HDLogger} from '../../hdlogger';
import {Level} from '../../hdlogger/levels/level';
import {AircraftPerformanceUtils} from '../utils/performance/AircraftPerformanceUtils';
import {MCPDirector} from '../../hdautopilot/directors/MCPDirector';

export class FlightPhaseManager {

	private _currentFlightPhase: FlightPhase = FlightPhase.FLIGHT_PHASE_TAKEOFF;
	private _lastFlightPhase: FlightPhase = FlightPhase.FLIGHT_PHASE_TAKEOFF;
	private _flightPlanManager: FlightPlanManager;
	private _mcpDirector: MCPDirector;

	/**
	 * TODO: MCPDirector should not be a dependency (Better to do some event based solution)
	 * @param {FlightPlanManager} fpm
	 * @param {MCPDirector} mcpDirector
	 */
	constructor(fpm: FlightPlanManager, mcpDirector: MCPDirector) {
		this._flightPlanManager = fpm;
		this._mcpDirector = mcpDirector;
	}

	public update() {
		if (this.shouldUpdateAndProcessFlightPhase()) {
			this.processFlightPhase();
			this.checkFlightPhase();
		}
		this.updateVariables();
	}

	private updateVariables() {
		if (this._currentFlightPhase <= FlightPhase.FLIGHT_PHASE_TAKEOFF) {
			let n1 = AircraftPerformanceUtils.getThrustTakeOffLimit(this._flightPlanManager.getOrigin()) / 100;
			//let n1 = this.getThrustTakeOffLimit() / 100;
			SimVar.SetSimVarValue('AUTOPILOT THROTTLE MAX THRUST', 'number', n1);
		}

		if (this._currentFlightPhase >= FlightPhase.FLIGHT_PHASE_CLIMB) {
			let n1 = AircraftPerformanceUtils.getThrustClimbLimit() / 100;
			//let n1 = this.getThrustClimbLimit() / 100;
			SimVar.SetSimVarValue('AUTOPILOT THROTTLE MAX THRUST', 'number', n1);
		}

		let vRef = 0;
		if (this._currentFlightPhase >= FlightPhase.FLIGHT_PHASE_DESCENT) {
			vRef = 1.3 * Simplane.getStallSpeed();
		}

		SimVar.SetSimVarValue('L:AIRLINER_VREF_SPEED', 'knots', vRef);

		if (this._currentFlightPhase > FlightPhase.FLIGHT_PHASE_CLIMB) {
			let altitude = Simplane.getAltitudeAboveGround();
			if (altitude < 20) {
				this._mcpDirector.deactivateSpeed();
			}
		}
	}

	private shouldUpdateAndProcessFlightPhase() {
		if (Simplane.getTrueSpeed() > 10) {
			if (this._currentFlightPhase == 0) {
				this._currentFlightPhase = FlightPhase.FLIGHT_PHASE_TAKEOFF;
			}
			return true;
		}
		return false;
	}

	private checkFlightPhase() {
		this._lastFlightPhase = Simplane.getCurrentFlightPhase();
		if (this._currentFlightPhase !== this._lastFlightPhase) {
			Simplane.setCurrentFlightPhase(this._currentFlightPhase);
			/**
			 * TODO: add flightPhaseOnChange event
			 */
		}
	}

	private processFlightPhase() {
		switch (this._currentFlightPhase) {
			case FlightPhase.FLIGHT_PHASE_PREFLIGHT:
			case FlightPhase.FLIGHT_PHASE_TAXI:
			case FlightPhase.FLIGHT_PHASE_TAKEOFF:
				this.processTakeoffPhase();
				this.processNotApproachPhase();
				break;
			case FlightPhase.FLIGHT_PHASE_CLIMB:
				this.processClimbPhase();
				this.processNotApproachPhase();
				break;
			case FlightPhase.FLIGHT_PHASE_CRUISE:
				this.processCruisePhase();
				this.processNotApproachPhase();
				break;
			case FlightPhase.FLIGHT_PHASE_DESCENT:
				this.processDescentPhase();
				this.processNotApproachPhase();
				break;
			case FlightPhase.FLIGHT_PHASE_APPROACH:
				this.processApproachPhase();
				break;
			case FlightPhase.FLIGHT_PHASE_GOAROUND:
				this.processGoAroundPhase();
				this.processNotApproachPhase();
				break;

		}
	}

	private processTakeoffPhase() {
		let enterClimbPhase = false;
		const agl = Simplane.getAltitude();
		const thrustReductionAltitude = SimVar.GetSimVarValue('L:AIRLINER_THR_RED_ALT', 'Number');
		let altValue = isFinite(thrustReductionAltitude) ? thrustReductionAltitude : 1500;
		if (agl > altValue) {
			this._currentFlightPhase = FlightPhase.FLIGHT_PHASE_CLIMB;
			enterClimbPhase = true;
		}
		if (enterClimbPhase) {
			let origin = this._flightPlanManager.getOrigin();
			if (origin) {
				origin.altitudeWasReached = Simplane.getAltitude();
				origin.timeWasReached = SimVar.GetGlobalVarValue('ZULU TIME', 'seconds');
				origin.fuelWasReached = SimVar.GetSimVarValue('FUEL TOTAL QUANTITY', 'gallons') * SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'kilograms') / 1000;
			}
			this.processClimbPhase();
		}
	}

	private processClimbPhase() {
		let altitude = SimVar.GetSimVarValue('PLANE ALTITUDE', 'feet');
		const cruiseAltitude = SimVar.GetSimVarValue('L:AIRLINER_CRUISE_ALTITUDE', 'number');
		if (isFinite(cruiseAltitude)) {
			if (altitude >= 0.96 * cruiseAltitude) {
				this._currentFlightPhase = FlightPhase.FLIGHT_PHASE_CRUISE;
				Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.AUTO).catch(console.error);
			}
		}
	}

	private processCruisePhase() {

		SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_CLIMB', 'number', 0);

		//console.log('TO TD: ' + SimVar.GetSimVarValue('L:WT_CJ4_TOD_REMAINING', 'number'));
		//console.log('DIS TD: ' + SimVar.GetSimVarValue('L:WT_CJ4_TOD_DISTANCE', 'number'));
		/**
		 * Basic TOD to destination
		 */
		let cruiseAltitude = SimVar.GetSimVarValue('L:AIRLINER_CRUISE_ALTITUDE', 'number');
		let showTopOfDescent = false;
		if (isFinite(cruiseAltitude)) {
			let destination = this._flightPlanManager.getDestination();
			if (destination) {
				let firstTODWaypoint = this.getWaypointForTODCalculation();
				if (firstTODWaypoint) {
					let totalDistance = 0;

					const destinationElevation = firstTODWaypoint.targetAltitude;
					const descentAltitudeDelta = Math.abs(destinationElevation - cruiseAltitude) / 100;
					const todDistance = descentAltitudeDelta / 3.3;
					const indicatedSpeed = Simplane.getIndicatedSpeed();
					let speedToLose = 0;
					if (indicatedSpeed > 220) {
						speedToLose = indicatedSpeed - 220;
					}

					const distanceForSpeedReducing = speedToLose / 10;

					totalDistance = todDistance + distanceForSpeedReducing + firstTODWaypoint.distanceFromDestinationToWaypoint;

					let todCoordinates = this._flightPlanManager.getCoordinatesAtNMFromDestinationAlongFlightPlan(totalDistance, true);
					let todLatLongAltCoordinates = new LatLongAlt(todCoordinates.lat, todCoordinates.long);
					let planeCoordinates = new LatLongAlt(SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude'), SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude'));
					let distanceToTOD = Avionics.Utils.computeGreatCircleDistance(planeCoordinates, todLatLongAltCoordinates);


					SimVar.SetSimVarValue('L:WT_CJ4_TOD_REMAINING', 'number', distanceToTOD);
					SimVar.SetSimVarValue('L:WT_CJ4_TOD_DISTANCE', 'number', totalDistance);

					if (distanceToTOD < 50) {
						if (!SimVar.GetSimVarValue('L:B78XH_DESCENT_NOW_AVAILABLE', 'Number')) {
							SimVar.SetSimVarValue('L:B78XH_DESCENT_NOW_AVAILABLE', 'Number', 1);
							SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
						}
					}

					if (distanceToTOD > 1) {
						showTopOfDescent = true;
					} else {
						showTopOfDescent = false;
						let lastFlightPhase = this._currentFlightPhase;
						this._currentFlightPhase = FlightPhase.FLIGHT_PHASE_DESCENT;
						Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.AUTO);
						if (lastFlightPhase !== FlightPhase.FLIGHT_PHASE_DESCENT) {
							SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
						}
					}

					if (showTopOfDescent) {
						SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_DSCNT', 'number', 1);
					} else {
						SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_DSCNT', 'number', 0);
					}
				}
			}
		}
	}

	private processDescentPhase() {

	}

	private processApproachPhase() {
		if (Simplane.getAutoPilotThrottleActive()) {
			let altitude = Simplane.getAltitudeAboveGround();
			if (altitude < 50) {
				if (Simplane.getEngineThrottleMode(0) != ThrottleMode.IDLE) {
					Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.IDLE);
				}
			}
		}
	}

	private processGoAroundPhase() {

	}

	private processNotApproachPhase() {
		/**
		 * TODO: FIX
		 */
		/*
		if (this._flightPlanManager.decelWaypoint) {
			let lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
			let long = Simplane.getCurrentLon();
			let planeLla = new LatLongAlt(lat, long);
			let dist = Avionics.Utils.computeGreatCircleDistance(this._flightPlanManager.decelWaypoint.infos.coordinates, planeLla);
			if (dist < 3) {
				this.tryGoInApproachPhase().catch(console.error);
			}
		}*/

		/*
			let destination = this.flightPlanManager.getDestination();
			if (destination) {
				let lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
				let long = Simplane.getCurrentLon();
				let planeLla = new LatLongAlt(lat, long);
				let dist = Avionics.Utils.computeGreatCircleDistance(destination.infos.coordinates, planeLla);
				if (dist < 20) {
					this.tryGoInApproachPhase().catch(console.error);
				}
			}
		 */
	}

	/**
	 * TODO: Move this to some AUX library / Utility Class
	 * @returns {any}
	 */
	getWaypointForTODCalculation(): any {
		let getWaypoint = (allWaypoints) => {
			let onlyNonStrict = true;
			/**
			 * 0 - NO
			 * 1 - AT
			 * 2 - A
			 * 3 - B
			 * 4 - AB
			 */

			for (let i = 0; i <= allWaypoints.length - 1; i++) {
				if (allWaypoints[i].legAltitudeDescription === 0) {
					continue;
				}
				if (allWaypoints[i].legAltitudeDescription === 1 && isFinite(allWaypoints[i].legAltitude1)) {
					return {fix: allWaypoints[i], targetAltitude: Math.round(allWaypoints[i].legAltitude1)};
				}

				if (allWaypoints[i].legAltitudeDescription === 2 && isFinite(allWaypoints[i].legAltitude1)) {
					//continue;
					return {fix: allWaypoints[i], targetAltitude: Math.round(allWaypoints[i].legAltitude1)};
				}

				if (allWaypoints[i].legAltitudeDescription === 3 && isFinite(allWaypoints[i].legAltitude1)) {
					return {fix: allWaypoints[i], targetAltitude: Math.round(allWaypoints[i].legAltitude1)};
				}

				if (allWaypoints[i].legAltitudeDescription === 4 && isFinite(allWaypoints[i].legAltitude1) && isFinite(allWaypoints[i].legAltitude2)) {
					if (allWaypoints[i].legAltitude1 === allWaypoints[i].legAltitude2) {
						return {fix: allWaypoints[i], targetAltitude: Math.round(allWaypoints[i].legAltitude1)};
					}

					if (allWaypoints[i].legAltitude1 < allWaypoints[i].legAltitude2) {
						let middle = (allWaypoints[i].legAltitude2 - allWaypoints[i].legAltitude1) / 2;
						return {
							fix: allWaypoints[i],
							targetAltitude: Math.round(allWaypoints[i].legAltitude1 + middle)
						};
					}

					if (allWaypoints[i].legAltitude1 > allWaypoints[i].legAltitude2) {
						let middle = (allWaypoints[i].legAltitude1 - allWaypoints[i].legAltitude2) / 2;
						return {
							fix: allWaypoints[i],
							targetAltitude: Math.round(allWaypoints[i].legAltitude2 + middle)
						};
					}
				}
			}
			return undefined;
		};
		let waypoint = undefined;

		let destination = this._flightPlanManager.getDestination();
		if (destination) {
			let arrivalSegment = this._flightPlanManager.getCurrentFlightPlan().arrival;
			let approachSegment = this._flightPlanManager.getCurrentFlightPlan().approach;

			waypoint = getWaypoint(arrivalSegment.waypoints);

			if (!waypoint) {
				waypoint = getWaypoint(approachSegment.waypoints);
			}

			if (!waypoint) {
				waypoint = {
					fix: destination,
					targetAltitude: Math.round(parseFloat(destination.infos.oneWayRunways[0].elevation) * 3.28)
				};
			}

			if (waypoint) {
				if (approachSegment.waypoints.length > 0) {
					const cumulativeToApproach = approachSegment.waypoints[approachSegment.waypoints.length - 1].cumulativeDistanceInFP;
					waypoint.distanceFromDestinationToWaypoint = cumulativeToApproach - waypoint.fix.cumulativeDistanceInFP;
				} else {
					waypoint.distanceFromDestinationToWaypoint = destination.cumulativeDistanceInFP - waypoint.fix.cumulativeDistanceInFP;
				}
			}
		}

		return waypoint;
	}
}
