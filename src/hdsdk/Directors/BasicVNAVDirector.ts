import {B787_10_FMC} from '../../hdfmc';
import {HDLogger} from '../../hdlogger';
import {Level} from '../../hdlogger/levels/level';

export class BasicVNAVDirector {
	private _fmc: B787_10_FMC;
	private nextWaypoint = undefined;
	private selectedAltitude: number;

	/**
	 * TODO FMC should be removed
	 * @param {B787_10_FMC} fmc
	 */
	constructor(fmc: B787_10_FMC) {
		this._fmc = fmc;
	}

	public update() {
		if (this.isVNAVActive()) {
			this.nextWaypoint = this._fmc.flightPlanManager.getActiveWaypoint();
			this.selectedAltitude = Simplane.getAutoPilotSelectedAltitudeLockValue('feet');
			if (this.nextWaypoint && (this.nextWaypoint.legAltitudeDescription === 3 || this.nextWaypoint.legAltitudeDescription === 4)) {
				if (!this._fmc.flightPlanManager.getIsDirectTo() &&
					isFinite(this.nextWaypoint.legAltitude1) &&
					this.nextWaypoint.legAltitude1 < 20000 &&
					this.nextWaypoint.legAltitude1 > this.selectedAltitude &&
					Simplane.getAltitude() > this.nextWaypoint.legAltitude1 - 200) {
					Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, this.nextWaypoint.legAltitude1, this._fmc._forceNextAltitudeUpdate);
					this._fmc._forceNextAltitudeUpdate = false;
					SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 1);
				} else {
					if (isFinite(this.selectedAltitude)) {
						Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, this._fmc.cruiseFlightLevel * 100, this._fmc._forceNextAltitudeUpdate);
						this._fmc._forceNextAltitudeUpdate = false;
						SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
					}
				}
			} else {
				if (isFinite(this.selectedAltitude)) {
					let isLevelOffActive = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number');
					if ((this.selectedAltitude < this._fmc.cruiseFlightLevel * 100 || isLevelOffActive) && this._fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
						if (Simplane.getAutoPilotAltitudeLockActive()) {
							SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number', 1);
						}
						if (!isLevelOffActive) {
							Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, this.selectedAltitude, this._fmc._forceNextAltitudeUpdate);
							this._fmc._forceNextAltitudeUpdate = false;
							SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
						}
					} else if (this._fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT || this._fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_APPROACH) {
						/**
						 * Descent new implementation
						 */
						this.controlDescent();

					} else {
						Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, this._fmc.cruiseFlightLevel * 100, this._fmc._forceNextAltitudeUpdate);
						this._fmc._forceNextAltitudeUpdate = false;
						SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
					}
				}
			}
		}
	}

	isVNAVActive(): boolean {
		return SimVar.GetSimVarValue('L:AP_VNAV_ACTIVE', 'number') === 1;
	}

	executeCustomVNAVDescent(rate, targetAltitude) {


		SimVar.SetSimVarValue('L:B78XH_CUSTOM_VNAV_DESCENT_ENABLED', 'Number', 1);

		/**
		 * Disable FLCH mode
		 */
		SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE_ON', 'Number', 0);

		/**
		 * Enable AIRSPEED mode
		 */
		SimVar.SetSimVarValue('K:AP_AIRSPEED_ON', 'Number', 1);

		/**
		 * Round (ceil) vertical speed
		 */

		const shouldCeil = !(rate < 30);

		if (shouldCeil) {
			rate = -1 * Math.ceil(Math.abs(rate) / 50) * 50;
		}

		/**
		 * Do not descent during descent
		 */
		if (rate > -5) {
			rate = 0;
		}

		/**
		 * Set vertical speed and add 150 feet per minute (better be on altitude sooner)
		 */
		SimVar.SetSimVarValue('K:AP_VS_VAR_SET_ENGLISH', 'Feet per minute', rate);

		/**
		 * Set next target altitude
		 */
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, targetAltitude, this._fmc._forceNextAltitudeUpdate);
		SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 1);

		/**
		 * Enable AP vertical speed hold
		 * NOTE: K:AP_VS_ON can be used instead of K:AP_VS_HOLD
		 */
		SimVar.SetSimVarValue('K:AP_VS_HOLD', 'Number', 1);
	}

	controlDescent() {
		/**
		 * Descent new implementation
		 */
		let altitude = Simplane.getAltitude();
		let targetAltitudeAndDistance = this.getNextDescentAltitude();


		this.executeCustomVNAVDescent(this.calculateFpmToNextWaypoint(altitude, targetAltitudeAndDistance.targetAltitude, targetAltitudeAndDistance.distance, targetAltitudeAndDistance.waypoint, targetAltitudeAndDistance.targetType), targetAltitudeAndDistance.targetAltitude);
	}

	getNextDescentAltitude() {
		let fp = this._fmc.flightPlanManager.getCurrentFlightPlan();
		let allWaypoints = fp.waypoints.slice(fp.activeWaypointIndex);

		let targetAltitude: number = undefined;
		let targetIndex = undefined;
		let targetType = undefined;

		for (let i = 0; i <= allWaypoints.length - 1; i++) {
			if (allWaypoints[i].legAltitudeDescription === 0) {
				continue;
			}
			if (allWaypoints[i].legAltitudeDescription === 1 && isFinite(allWaypoints[i].legAltitude1)) {
				targetAltitude = Math.round(allWaypoints[i].legAltitude1);
				targetIndex = i;
				targetType = 'AT';
				break;
			}

			if (allWaypoints[i].legAltitudeDescription === 2 && isFinite(allWaypoints[i].legAltitude1)) {
				targetAltitude = Math.round(allWaypoints[i].legAltitude1);
				targetIndex = i;
				targetType = 'A';
				break;
			}

			if (allWaypoints[i].legAltitudeDescription === 3 && isFinite(allWaypoints[i].legAltitude1)) {
				targetAltitude = Math.round(allWaypoints[i].legAltitude1);
				targetIndex = i;
				targetType = 'B';
				break;
			}

			if (allWaypoints[i].legAltitudeDescription === 4 && isFinite(allWaypoints[i].legAltitude1) && isFinite(allWaypoints[i].legAltitude2)) {
				if (allWaypoints[i].legAltitude1 === allWaypoints[i].legAltitude2) {
					targetAltitude = Math.round(allWaypoints[i].legAltitude1);
					targetIndex = i;
					targetType = 'AT';
					break;
				}

				if (allWaypoints[i].legAltitude1 < allWaypoints[i].legAltitude2) {
					let middle = (allWaypoints[i].legAltitude2 - allWaypoints[i].legAltitude1) / 2;
					targetAltitude = Math.round(allWaypoints[i].legAltitude1 + middle);
					targetIndex = i;
					targetType = 'AB';
					break;
				}

				if (allWaypoints[i].legAltitude1 > allWaypoints[i].legAltitude2) {
					let middle = (allWaypoints[i].legAltitude1 - allWaypoints[i].legAltitude2) / 2;
					targetAltitude = Math.round(allWaypoints[i].legAltitude2 + middle);
					targetIndex = i;
					targetType = 'AB';
					break;
				}
			}
		}
		const lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
		const long = SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude');
		const ll = new LatLongAlt(lat, long);

		let distance = Avionics.Utils.computeGreatCircleDistance(ll, allWaypoints[0].infos.coordinates);

		if (targetIndex !== 0) {
			for (let i = 1; i < allWaypoints.length; i++) {
				distance += Avionics.Utils.computeGreatCircleDistance(allWaypoints[i - 1].infos.coordinates, allWaypoints[i].infos.coordinates);
				if (i === targetIndex) {
					break;
				}
			}
		}

		if (targetAltitude) {
			return {
				targetAltitude: targetAltitude,
				distance: distance,
				waypoint: allWaypoints[targetIndex],
				targetType: targetType
			};
		}
		return {
			targetAltitude: NaN,
			distance: NaN,
			waypoint: allWaypoints[targetIndex],
			targetType: targetType
		};
	}

	calculateFpmToNextWaypoint(altitude, targetAltitude, distance, waypoint, targetType) {
		HDLogger.log('ALTITUDE: ' + altitude, Level.debug);
		HDLogger.log('TARGET ALTITUDE: ' + targetAltitude, Level.debug);
		HDLogger.log('TARGET DISTANCE: ' + distance, Level.debug);
		HDLogger.log('TARGET TYPE: ' + targetType, Level.debug);
		HDLogger.log('TARGET WAYPOINT: ' + waypoint.ident, Level.debug);
		HDLogger.log('TARGET WAYPOINT: ' + waypoint.ident, Level.debug);

		let groundSpeed = Simplane.getGroundSpeed();
		if (targetAltitude === 'B') {
			targetAltitude = targetAltitude - 300;
		} else if (targetType === 'A') {
			targetAltitude = targetAltitude + 300;
		}

		if (waypoint.isRunway) {
			targetAltitude += 100;
		}
		let altitudeDelta = Math.abs(altitude - targetAltitude);
		let knotsToMilesCoef = 0.0191796575;
		let milesPerMinute = groundSpeed * knotsToMilesCoef;

		let minutesToWaypoint = distance / milesPerMinute;
		let rate = altitudeDelta / minutesToWaypoint;
		HDLogger.log('ALTITUDE DELTA: ' + altitudeDelta, Level.debug);
		HDLogger.log('MILES PER MINUTE: ' + milesPerMinute, Level.debug);
		HDLogger.log('DESCENT RATE: ' + rate, Level.debug);
		return rate;
	}
}