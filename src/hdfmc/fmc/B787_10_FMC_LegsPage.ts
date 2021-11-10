// prototype singleton, this needs to be different ofc
import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_HoldsPage} from './B787_10_FMC_HoldsPage';
import {B787_10_FMC_RouteDataPage} from './B787_10_FMC_RouteDataPage';
import {BaseFMC} from './BaseFMC';

let LegsPageInstance = undefined;

// TODO OVERALL
// Because the page has a state now, we need to watch out to reset vars like activatingDirectTo etc after it is processed

export class B787_10_FMC_LegsPage {

	static SELECT_MODE = {
		NONE: 'NONE',
		EXISTING: 'EXISTING',
		NEW: 'NEW',
		DELETE: 'DELETE'
	};

	static DEBUG_SHOW_WAYPOINT_PHASE = false;
	private _fmc: B787_10_FMC;
	private _rows: any[];
	private _isDirty: boolean;
	private _isAddingHold: boolean;
	private _currentPage: number;
	private _pageCount: number;
	private _distanceToActiveWpt: number;
	private _activeWptIndex: number;
	private _wayPointsToRender: any[];
	private _lsk6Field: string;
	private _isMapModePlan: boolean;
	private _step: { index: number; page: number; position: number; icao: string; };
	private _rsk6Field: string;
	private _approachWaypoints: WayPoint[];

	constructor(fmc: B787_10_FMC, isAddingHold: boolean) {
		this._fmc = fmc;
		this._isDirty = true; // render on first run ofc
		this._isAddingHold = isAddingHold;

		this._currentPage = 1;
		this._pageCount = 1;
		this._rows = [];

		this._activeWptIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
		this._distanceToActiveWpt = 0;

		this._lsk6Field = '';

		this._wayPointsToRender = [];

		this._isMapModePlan = undefined;
		this._step = undefined;

		this.prepare();
	}

	prepare() {
		// Noop as there is no preparation with this
		this.update(true);
	}

	update(forceUpdate = false) {
		// check if active wpt changed
		// TODO: possible that i renders twice as we change index while editing, could cut that out too
		const actWptIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
		if (this._activeWptIndex != actWptIndex) {
			this._activeWptIndex = actWptIndex;
			this._isDirty = true;
		}

		const isMapModePlan = SimVar.GetSimVarValue('L:B787_MAP_MODE', 'number') === 3;

		if (this._isMapModePlan !== isMapModePlan) {
			this._isMapModePlan = isMapModePlan;
			this._step = undefined;
			this._isDirty = true;
		}

		// get and format distance
		const distanceToActWpt = this._fmc.flightPlanManager.getDistanceToActiveWaypoint();
		if (distanceToActWpt !== this._distanceToActiveWpt) {
			this._distanceToActiveWpt = distanceToActWpt;
			this._isDirty = true;
		}

		if (this._isDirty || forceUpdate) {
			this.invalidate();
		}

		// register refresh and bind to update which will only render on changes
		this._fmc.registerPeriodicPageRefresh(() => {
			this.update();
			return true;
		}, 1000, false);
	}

	updateLegs() {
		this._rows = [
			[''], [''], [''], [''], [''], [''], [''], [''], [''], ['']
		];

		const offset = Math.floor((this._currentPage - 1) * 5);
		const allWaypoints = this._fmc.flightPlanManager.getAllWaypoints();
		this._wayPointsToRender = this.buildLegs(allWaypoints, this._activeWptIndex);
		let runwayIndex = undefined;

		//FIND RUNWAY INDEX
		if (allWaypoints.length > 1 && allWaypoints[allWaypoints.length - 2].isRunway) {
			runwayIndex = this._wayPointsToRender.length - 2;
		}

		this._pageCount = Math.floor((this._wayPointsToRender.length - 1) / 5) + 1;
		for (let i = 0; i < 5; i++) {

			const waypoint = this._wayPointsToRender[i + offset];

			//EXISTING ->
			if (waypoint && waypoint.fix && waypoint.fix.icao === '$EMPTY') {
				this._rows[2 * i + 1] = [''];
			} else if (waypoint && waypoint.fix) {
				const bearing = isFinite(waypoint.fix.bearingInFP) ? waypoint.fix.bearingInFP.toFixed(0).padStart(3, '0') + '°' : '';
				const prevWaypoint = this._wayPointsToRender[i + offset - 1];
				let distance = 0;
				//const isFromWpt = (i == 0 && this._currentPage == 1);
				const isActWpt = (i == 0 && this._currentPage == 1);
				if (isActWpt) {
					distance = this._distanceToActiveWpt;
				} else if (prevWaypoint && prevWaypoint.fix.infos && waypoint.fix.infos) {
					distance = Avionics.Utils.computeGreatCircleDistance(prevWaypoint.fix.infos.coordinates, waypoint.fix.infos.coordinates);
				}

				//GET FPA
				//const verticalWaypoint = this._fmc._vnav._verticalFlightPlan[waypoint.index];
				//const waypointFPA = verticalWaypoint ? this._fmc._vnav._verticalFlightPlan[waypoint.index].waypointFPA : undefined;
				const waypointFPA = undefined;
				let fpaText = '  ';

				if (waypoint.isMissedApproachStart) {
					fpaText = ' MISSED APPR';
				} else if (waypointFPA) {
					fpaText = waypointFPA > 0 ? '  ' + waypointFPA.toFixed(1) + '°' : '';
				}

				// format distance
				let distanceString = (distance < 100) ? distance.toFixed(1) : distance.toFixed(0);

				let waypointSegment = this._fmc.flightPlanManager.getSegmentFromWaypoint(waypoint.fix);

				if (isActWpt) {
					if (waypoint.fix.icao === '$DISCO') {
						this._rows[2 * i] = [' THEN'];
						this._rows[2 * i + 1] = [this._fmc.makeSettable('□□□□□') + ' ----- ROUTE DISCONTINUITY ----'];
					} else if (waypoint.fix.hasHold) {
						this._rows[2 * i] = [' HOLD AT'];
						this._rows[2 * i + 1] = [`${waypoint.fix.ident != '' ? this._fmc.makeSettable(waypoint.fix.ident, 100) : this._fmc.makeSettable('USR')}`];
					} else {
						this._rows[2 * i] = [' ' + bearing.padStart(3, '0'), distanceString.padStart(4, ' ') + 'NM', ''];
						this._rows[2 * i + 1] = [waypoint.fix.ident != '' ? this._fmc.makeSettable(waypoint.fix.ident + '', 100) : this._fmc.makeSettable('USR')];
					}
				} else {
					if (waypoint.fix.icao === '$DISCO') {
						this._rows[2 * i] = [' THEN'];
						this._rows[2 * i + 1] = [this._fmc.makeSettable('□□□□□') + ' ----- ROUTE DISCONTINUITY ----'];
						;
					} else if (waypoint.fix.hasHold) {
						this._rows[2 * i] = [' HOLD AT'];
						this._rows[2 * i + 1] = [waypoint.fix.ident != '' ? this._fmc.makeSettable(waypoint.fix.ident, 100) : this._fmc.makeSettable('USR')];
					} else {
						this._rows[2 * i] = [' ' + bearing.padStart(3, '0'), distanceString.padStart(4, ' ') + 'NM', ''];
						this._rows[2 * i + 1] = [waypoint.fix.ident != '' ? this._fmc.makeSettable(waypoint.fix.ident, 100) : this._fmc.makeSettable('USR')];
					}
				}

				if (waypoint.fix.icao !== '$DISCO') {
					let row = '';

					if (SegmentType.Enroute === waypointSegment.type) {
						row = Math.round(this._fmc.speedManager.getCrzManagedSpeed(this._fmc.getCostIndexFactor(), true)) + '/';
						if (this._fmc.cruiseFlightLevel) {
							row += 'FL' + this._fmc.cruiseFlightLevel;
						} else {
							row += '-----';
						}

					} else {
						row += this.getAltSpeedRestriction(waypoint.fix);
					}

					/*
					 if (SegmentType.Enroute === waypointSegment.type) {
					 let speedConstraint = -1;
					 if (waypoint.fix.speedConstraint && waypoint.fix.speedConstraint > 100) {
					 speedConstraint = waypoint.fix.speedConstraint;
					 }

					 if (this._fmc._speedDirector._commandedSpeedType === SpeedType.SPEED_TYPE_ECON) {
					 row = this._fmc.colorizeContent(this._fmc._speedDirector.speed, 'magenta');
					 } else if (this._fmc._speedDirector._commandedSpeedType === SpeedType.SPEED_TYPE_WAYPOINT && isActWpt) {
					 row = this._fmc.colorizeContent(this._fmc._speedDirector.speed, 'magenta');
					 } else {
					 if (speedConstraint !== -1) {
					 row = speedConstraint;
					 } else {
					 row = this._fmc._speedDirector.speed;
					 }
					 }
					 //row = Math.round(this._fmc.getCrzManagedSpeed(true)) + '/';
					 row = row + '/';
					 if (this._fmc.cruiseFlightLevel) {
					 row += 'FL' + this._fmc.cruiseFlightLevel;
					 } else {
					 row += '-----';
					 }

					 } else {
					 row += this.getAltSpeedRestriction(waypoint.fix, isActWpt);
					 }
					 */


					// (SegmentType.Enroute === waypointSegment.type ? Math.round(this._fmc.getCrzManagedSpeed(true)) + '/' + (this._fmc.cruiseFlightLevel ? 'FL' + this._fmc.cruiseFlightLevel : '-----') : this.getAltSpeedRestriction(waypoint.fix))

					this._rows[2 * i + 1][1] = this._fmc.makeSettable(row, 190);
				}
			}
		}
	}

	render() {
		this._lsk6Field = '';
		if (this._fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
			this._fmc.fpHasChanged = true;
			this._lsk6Field = '<ERASE';
		} else {
			this._lsk6Field = '<RTE 2 LEGS';
		}

		if (this._isMapModePlan) {
			this._rsk6Field = 'STEP>';

			let canStep = true;

			if (this._step === undefined) {
				canStep = false;
				const steps = this.buildSteps();
				/**
				 * TODO: Better handling (This should set first step on page and not first step)
				 */
				if (steps.length > 0) {
					const stepIndex = steps.findIndex((step) => {
						return step.page === this._currentPage;
					});
					this._step = steps[stepIndex];
					if (this._step !== undefined) {
						SimVar.SetSimVarValue('L:B78XH_MCDU_CURRENT_FPLN_WAYPOINT', 'number', this._step.index + this._activeWptIndex);
					}
					canStep = true;
				}
			}

			if (canStep === true) {
				if (this._rows[2 * this._step.position + 1][0] != '') {
					if (!this._rows[2 * this._step.position + 1][0]) {
						this._rows[2 * this._step.position + 1][0] = '';
					}
					/**
					 * This is not good fix
					 */
					//this._rows[2 * this._step.position + 1][1] = '<CTR>' + this._rows[2 * this._step.position + 1][1];

					/**
					 * TODO: Check this for complicated constraints
					 * @type {any}
					 */
					this._rows[2 * this._step.position + 1][2] = this._rows[2 * this._step.position + 1][1];
					this._rows[2 * this._step.position + 1][1] = '<CTR>';
				}
			}
		} else {
			this._rsk6Field = 'RTE DATA>';
		}

		const modStr = this._fmc.fpHasChanged ? 'MOD' : 'ACT';
		let holdActive = false;
		let holdExiting = false;

		const holdsDirector = this._fmc._lnav && this._fmc._lnav.holdsDirector;

		if (holdsDirector) {
			const holdIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
			holdActive = holdsDirector.isHoldActive(holdIndex);
			holdExiting = holdsDirector.isHoldExiting(holdIndex);
		}

		this._fmc._renderer.renderTitle(' ' + modStr + ' LEGS');
		this._fmc._renderer.renderPages(this._currentPage, Math.max(1, this._pageCount));
		this._fmc._renderer.render([
			...this._rows,
			['', `${this._isAddingHold ? '------------------HOLD AT-----------------' : holdExiting ? '----------------EXIT ARMED----------------' : '__FMCSEPARATOR'}`, ''],
			[`${this._isAddingHold ? this._fmc.makeSettable('□□□□□') : holdExiting ? '<CANCEL EXIT' : holdActive ? '<EXIT HOLD' : this._lsk6Field}`, this._rsk6Field]
		]);
	}

	buildLegs(waypoints, activeWaypointIndex) {
		const displayWaypoints = [];
		let runwayExists = false;
		let runwayIndex = 0;

		let holdExited = false;
		const holdsDirector = this._fmc._lnav && this._fmc._lnav.holdsDirector;

		if (holdsDirector) {
			const holdIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
			holdExited = holdsDirector.isHoldExited(holdIndex);
		}

		let previousSegment = undefined;

		const destination = this._fmc.flightPlanManager.getDestination();

		for (var i = Math.max(0, activeWaypointIndex - 1); i < waypoints.length; i++) {

			const currentSegment = this._fmc.flightPlanManager.getSegmentFromWaypoint(waypoints[i]).type;

			if (waypoints[i].isRunway && currentSegment === SegmentType.Approach) {
				runwayExists = true;
				runwayIndex = i;
			}
			if (runwayExists && waypoints[i] === destination) {
				//console.log("skipping destination waypoint");
			} else {
				const isFirstMissedApproachLeg = currentSegment === SegmentType.Missed && previousSegment === SegmentType.Approach;
				displayWaypoints.push({index: i, fix: waypoints[i], isMissedApproachStart: isFirstMissedApproachLeg});
				if (waypoints[i].endsInDiscontinuity) {
					displayWaypoints.push({
						index: i,
						fix: {icao: '$DISCO', isRemovable: waypoints[i].isVectors !== true}
					});
				}

				previousSegment = currentSegment;
			}
		}

		displayWaypoints.shift();
		return displayWaypoints;
	}

	bindInputs() {
		for (let i = 0; i < this._wayPointsToRender.length; i++) {
			const offsetRender = Math.floor((this._currentPage - 1) * 5);
			const wptRender = this._wayPointsToRender[i + offsetRender];
			// if its a real fix
			if (wptRender && (wptRender.fix.ident !== '$EMPTY' || wptRender.fix.ident !== '$DISCO')) {
				if (i >= 5) {
					break;
				}
				this._fmc._renderer.rsk(i + 1).event = () => {
					const offset = Math.floor((this._currentPage - 1) * 5);
					const wptIndex = this._wayPointsToRender[i + offset].index;
					const waypoint = this._fmc.flightPlanManager.getWaypoint(wptIndex);
					const value = this._fmc.inOut;

					if (value === BaseFMC.clrValue) {
						waypoint.legAltitudeDescription = -1;
						waypoint.speedConstraint = -1;
						this._fmc.flightPlanManager._updateFlightPlanVersion();
						this.resetAfterOp();
						return;
					}

					this.parseConstraintInput(value, waypoint);

					this._fmc.flightPlanManager._updateFlightPlanVersion();
					this.resetAfterOp();
				};
			}

			const lsk = this._fmc._renderer.lsk(i + 1);
			if (wptRender && lsk !== undefined) {
				lsk.event = async () => {
					const offset = Math.floor((this._currentPage - 1) * 5);
					const waypoint = this._wayPointsToRender[i + offset];

					if (!waypoint) {
						return;
					}

					if (waypoint.fix.ident === 'USR') {
						this._fmc.showErrorMessage('UNABLE MOD USR');
						return;
					}

					const value = this._fmc.inOut;
					let selectedWpIndex = waypoint.index;

					// Mode evaluation
					if (value == '') {
						this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NONE;
					} else if (value === BaseFMC.clrValue) {
						this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.DELETE;
					} else if (value.includes('/') && this._fmc.selectMode === B787_10_FMC_LegsPage.SELECT_MODE.EXISTING) { // looks like user waypoint, go to new
						this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NEW;
					} else if (value.length > 0 && this._fmc.selectMode !== B787_10_FMC_LegsPage.SELECT_MODE.EXISTING) { // scratchpad not empty, nothing selected, must be new wpt
						this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NEW;
					}

					switch (this._fmc.selectMode) {
						case B787_10_FMC_LegsPage.SELECT_MODE.NONE: {
							if (((i >= 0 && this._currentPage == 1) || (this._currentPage > 1))) {
								// SELECT EXISTING WAYPOINT FROM FLIGHT PLAN
								this._approachWaypoints = this._fmc.flightPlanManager.getApproachWaypoints();
								if (this._approachWaypoints.length > 0) {
									if (waypoint.fix.ident === this._approachWaypoints[this._approachWaypoints.length - 1].ident) {
										this._fmc.showErrorMessage('UNABLE MOD RW');
										return;
									}
								}

								this._fmc.selectedWaypoint = waypoint;
								this._fmc.inOut = waypoint.fix.ident;
								this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.EXISTING;
							}
							break;
						}
						case B787_10_FMC_LegsPage.SELECT_MODE.EXISTING: {
							if ((i >= 0 && this._currentPage == 1) || this._currentPage > 1) {

								let scratchPadWaypointIndex = this._fmc.selectedWaypoint.index;

								// MOVE EXISTING WAYPOINT WITH LEGS AFTER
								let lskWaypointIndex = selectedWpIndex;
								const isDirectTo = (i == 0 && this._currentPage == 1);

								if (isDirectTo) { // DIRECT TO
									this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
										this._fmc.flightPlanManager.activateDirectToByIndex(scratchPadWaypointIndex, () => {
											this._fmc.activateRoute(true, () => {
												this.resetAfterOp();
											});
										});
									});
								} else { // MOVE TO POSITION IN FPLN
									let isMovable = true;
									if (waypoint.fix.icao === '$DISCO') {
										if (waypoint.fix.isRemovable) {
											this._fmc.flightPlanManager.clearDiscontinuity(waypoint.index);
											lskWaypointIndex += 1;
										} else {
											this._fmc.clearUserInput();
											this._fmc.messageManager.showMessage('INVALID DELETE', 'SELECTED LINE CAN NOT <br> BE DELETED');
											isMovable = false;
										}
									}

									if (waypoint.fix.isHold) {
										this._fmc.flightPlanManager.deleteHoldAtWaypointIndex(waypoint.index);
										lskWaypointIndex += 1;
									}

									if (isMovable) {
										const removeWaypointForLegsMethod = (callback = EmptyCallback.Void) => {
											if (lskWaypointIndex < scratchPadWaypointIndex) {
												this._fmc.flightPlanManager.removeWaypoint(lskWaypointIndex, false, () => {
													scratchPadWaypointIndex--;
													removeWaypointForLegsMethod(callback);
												});
											} else {
												callback();
											}
										};
										this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
											removeWaypointForLegsMethod(() => {
												this._fmc.activateRoute(false, () => {
													this.resetAfterOp();
												});
											});
										});
									}
								}
							}
							break;
						}
						case B787_10_FMC_LegsPage.SELECT_MODE.NEW: {
							if ((i >= 0 && this._currentPage == 1) || this._currentPage > 1) {
								if (waypoint && waypoint.fix) {
									if (waypoint.fix.icao === '$EMPTY') {
										selectedWpIndex = Infinity;
									}
									if (waypoint.fix.icao === '$DISCO') {
										if (waypoint.fix.isRemovable) {
											this._fmc.flightPlanManager.clearDiscontinuity(waypoint.index);
											selectedWpIndex += 1;
										} else {
											this._fmc.clearUserInput();
											this._fmc.messageManager.showMessage('INVALID DELETE', 'SELECTED LINE CAN NOT <br> BE DELETED');
											return;
										}
									}
								}
								const scratchPadWaypointIndex = this._fmc.selectedWaypoint ? this._fmc.selectedWaypoint.index : undefined;
								const userWaypoint = await CJ4_FMC_PilotWaypointParser.parseInput(value, scratchPadWaypointIndex, this._fmc);
								if (userWaypoint) {
									const databaseDuplicate = await this._fmc._pilotWaypoints.checkDatabaseDuplicates(userWaypoint.wpt.ident);
									if (databaseDuplicate) {
										this._fmc.showErrorMessage('DUPLICATE IDENT');
										return;
									}
									let insertIndex = selectedWpIndex;
									if (userWaypoint.offset > 0) {
										if (scratchPadWaypointIndex !== selectedWpIndex || (i == 1 && this._currentPage == 1 && userWaypoint.offset <= 0)) {
											this._fmc.showErrorMessage('WPT NOT MATCHED');
											return;
										} else {
											insertIndex = userWaypoint.offset >= 0 ? selectedWpIndex + 1 : selectedWpIndex;
										}
									}
									this._fmc._pilotWaypoints.addPilotWaypointWithOverwrite(userWaypoint.wpt.ident, userWaypoint.wpt.infos.coordinates.lat, userWaypoint.wpt.infos.coordinates.long);
									this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
										this._fmc.flightPlanManager.addUserWaypoint(userWaypoint.wpt, insertIndex, () => {
											const isDirectTo = (i == 0 && this._currentPage == 1);
											if (isDirectTo) {
												this._fmc.flightPlanManager.activateDirectToByIndex(insertIndex, () => {
													this._fmc.activateRoute(true, () => {
														this.resetAfterOp();
													});
												});
											} else {
												this._fmc.activateRoute(false, () => {
													this.resetAfterOp();
												});
											}
										});
									});
								} else {
									const pilotWaypoint = this._fmc._pilotWaypoints._pilotWaypointArray.find(w => w.id == value);
									if (pilotWaypoint) {
										const pilotWaypointObject = CJ4_FMC_PilotWaypointParser.buildPilotWaypointFromExisting(pilotWaypoint.id, parseFloat(pilotWaypoint.la), parseFloat(pilotWaypoint.lo), this._fmc);
										this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
											this._fmc.flightPlanManager.addUserWaypoint(pilotWaypointObject, selectedWpIndex, () => {
												const isDirectTo = (i == 0 && this._currentPage == 1);
												if (isDirectTo) {
													this._fmc.flightPlanManager.activateDirectToByIndex(selectedWpIndex, () => {
														this._fmc.activateRoute(true, () => {
															this.resetAfterOp();
														});
													});
												} else {
													this._fmc.activateRoute(false, () => {
														this.resetAfterOp();
													});
												}
											});
										});
									} else {
										this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
											this._fmc.insertWaypoint(value, selectedWpIndex, (isSuccess) => {
												if (isSuccess) {
													const isDirectTo = (i == 0 && this._currentPage == 1);
													if (isDirectTo) {
														this._fmc.flightPlanManager.activateDirectToByIndex(selectedWpIndex, () => {
															this._fmc.activateRoute(true, () => {
																this.resetAfterOp();
															});
														});
													} else {
														this._fmc.activateRoute(false, () => {
															this.resetAfterOp();
														});
													}
												} else {
													this._fmc.fpHasChanged = false;
													this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NONE;
													this._fmc.eraseTemporaryFlightPlan(() => {
														this.resetAfterOp();
													});
												}
											});
										});
									}
								}
							}
							break;
						}
						case B787_10_FMC_LegsPage.SELECT_MODE.DELETE: {
							// DELETE WAYPOINT
							if ((i > 0 && this._currentPage == 1) || this._currentPage > 1) {
								this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
									if (waypoint.fix.icao === '$DISCO') {
										if (waypoint.fix.isRemovable) {
											this._fmc.flightPlanManager.clearDiscontinuity(waypoint.index);
											this._fmc.activateRoute(false, () => {
												this.resetAfterOp();
											});
										} else {
											this._fmc.clearUserInput();
											this._fmc.messageManager.showMessage('INVALID DELETE', 'SELECTED LINE CAN NOT <br> BE DELETED');
										}
									} else if (waypoint.fix.isHold) {
										this._fmc.flightPlanManager.deleteHoldAtWaypointIndex(waypoint.index);
										this._fmc.activateRoute(false, () => {
											this.resetAfterOp();
										});
									} else {
										this._fmc.flightPlanManager.removeWaypoint(selectedWpIndex, false, () => {
											this._fmc.activateRoute(false, () => {
												this.resetAfterOp();
											});
										});
									}
								});
							} else {
								this._fmc.clearUserInput();
								this._fmc.messageManager.showMessage('INVALID DELETE', 'SELECTED LINE CAN NOT <br> BE DELETED');
							}
							break;
						}
					}
				};
			}
		}
	}

	resetAfterOp() {
		this._fmc.clearUserInput();
		this._fmc.selectedWaypoint = undefined;
		this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NONE;
		this.update(true);
	}

	bindEvents() {
		this._fmc._renderer.lsk(6).event = () => {
			let holdActive = false;
			let holdExiting = false;

			const holdsDirector = this._fmc._lnav && this._fmc._lnav.holdsDirector;

			if (holdsDirector) {
				const holdIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
				holdActive = holdsDirector.isHoldActive(holdIndex);
				holdExiting = holdsDirector.isHoldExiting(holdIndex);
			}

			if (this._isAddingHold) {
				this.addHold();
			} else if (this._lsk6Field == '<ERASE') {
				if (this._fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
					this._fmc.fpHasChanged = false;
					this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NONE;
					this._fmc.eraseTemporaryFlightPlan(() => {
						this._fmc.eraseRouteModifications();
						this.resetAfterOp();
					});
				}
			} else if (holdExiting) {
				holdsDirector.cancelHoldExit();
				this.update(true);
			} else if (holdActive) {
				holdsDirector.exitActiveHold();
				this.update(true);
			}
		};

		// EXEC
		this._fmc.onExecPage = () => {
			if (this._fmc.fpHasChanged && this._fmc._isRouteActivated) {
				this._fmc.refreshPageCallback = () => {
					this.resetAfterOp();
				}; // TODO this seems annoying, but this is how stuff works in cj4_fmc right now
				this._fmc.onExecDefault();
			} else if (this._fmc.fpHasChanged) {
				this._fmc.fpHasChanged = false;
				this._fmc.activateRoute(false, () => {
					//this._fmc.activatingDirectTo = false;
					this._fmc.refreshPageCallback = () => {
						this.resetAfterOp();
					}; // TODO this seems annoying, but this is how stuff works in cj4_fmc right now
					this._fmc.onExecDefault();
				});
			}
		};

		this._fmc.onPrevPage = () => {
			if (this._currentPage > 1) {
				this._currentPage--;
				this.update(true);
			} else {
				this._currentPage = this._pageCount;
				this.update(true);
			}
		};
		this._fmc.onNextPage = () => {
			if (this._currentPage < this._pageCount) {
				this._currentPage++;
				this.update(true);
			} else {
				this._currentPage = 1;
				this.update(true);
			}
		};

		if (this._isMapModePlan) {
			//this._fmc.currentFlightPlanWaypointIndex = this._activeWptIndex + offset + this._step - this._discoOffset;
			const steps = this.buildSteps();
			if (steps.length > 0) {
				this._fmc._renderer.rsk(6).event = () => {
					let nextStep;
					if (steps[this._step.index + 1]) {
						nextStep = steps[this._step.index + 1];
					} else {
						nextStep = steps[0];
					}
					this._step = nextStep;
					this._currentPage = nextStep.page;
					SimVar.SetSimVarValue('L:B78XH_MCDU_CURRENT_FPLN_WAYPOINT', 'number', this._activeWptIndex + nextStep.index);
					this.update(true);
				};
			}


		} else {
			this._fmc._renderer.rsk(6).event = () => {
				new B787_10_FMC_RouteDataPage(this._fmc).showPage();
			};
		}
	}

	/**
	 * Build steps array
	 * @returns {*[]}
	 */
	buildSteps(): {
		index: number, page: number, position: number, icao: string
	}[] {
		let steps = [];
		for (let i = 0; i < this._wayPointsToRender.length; i++) {
			/**
			 * Skip discontinuities
			 */
			if (this._wayPointsToRender[i] && this._wayPointsToRender[i].fix.icao === '$DISCO') {
				continue;
			}

			/**
			 * Build step
			 */
			const page = Math.ceil((i + 1) / 5);
			const positionOffset = (page - 1) * 5;
			const position = i - positionOffset;
			const index = steps.length;
			steps.push({
				/**
				 * Index of step
				 */
				index: index,
				/**
				 * Page of step
				 */
				page: page,
				/**
				 * Position on page
				 */
				position: position,
				/**
				 * ICAO of waypoint (just for debug purpose)
				 */
				icao: this._wayPointsToRender[i].fix.icao
			});
		}
		return steps;
	}

	addHold() {
		/** @type {{waypoint: WayPoint, index: number}} */
		const holdWaypoint = this._fmc.flightPlanManager.getAllWaypoints()
		.map((waypoint, index) => ({waypoint, index}))
		.slice(this._activeWptIndex)
		.find(x => x.waypoint.ident === this._fmc.inOut);

		if (holdWaypoint !== undefined) {

			this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
				const details = HoldDetails.createDefault(holdWaypoint.waypoint.bearingInFP, holdWaypoint.waypoint.bearingInFP);
				this._fmc.flightPlanManager.addHoldAtWaypointIndex(holdWaypoint.index, details);

				this._fmc.inOut = '';

				this._fmc.activateRoute(false, () => {
					B787_10_FMC_HoldsPage.showHoldPage(this._fmc, holdWaypoint.waypoint.ident);
				});
			});
		} else {
			this._fmc.showErrorMessage('INVALID ENTRY');
		}
	}

	// TODO, later this could be in the base class
	invalidate() {
		this._isDirty = true;
		this._fmc.cleanUpPage();
		this.updateLegs();
		this.render();
		this.bindInputs(); // TODO ideally this should only be called once, but clearDisplay clears everthing
		this.bindEvents(); // TODO     ""
		this._isDirty = false;
	}

	getAltSpeedRestriction(waypoint, isActive = false) {
		let speedConstraint = '---';
		let altitudeConstraint = '----- ';
		const wpt = waypoint;

		if (wpt.speedConstraint && wpt.speedConstraint > 100) {
			speedConstraint = wpt.speedConstraint;
		}
		if (wpt.legAltitudeDescription > 0) {
			if (wpt.legAltitudeDescription == 1) {
				altitudeConstraint = wpt.legAltitude1.toFixed(0) >= 18000 ? 'FL' + wpt.legAltitude1.toFixed(0) / 100
					: wpt.legAltitude1.toFixed(0);
			} else if (wpt.legAltitudeDescription == 2) {
				altitudeConstraint = wpt.legAltitude1.toFixed(0) >= 18000 ? 'FL' + wpt.legAltitude1.toFixed(0) / 100 + 'A'
					: wpt.legAltitude1.toFixed(0) + 'A';
			} else if (wpt.legAltitudeDescription == 3) {
				altitudeConstraint = wpt.legAltitude1.toFixed(0) >= 18000 ? 'FL' + wpt.legAltitude1.toFixed(0) / 100 + 'B'
					: wpt.legAltitude1.toFixed(0) + 'B';
			} else if (wpt.legAltitudeDescription == 4) {
				const altitudeConstraintA = wpt.legAltitude2.toFixed(0) >= 18000 ? 'FL' + wpt.legAltitude2.toFixed(0) / 100 + 'A'
					: wpt.legAltitude2.toFixed(0) + 'A';
				const altitudeConstraintB = wpt.legAltitude1.toFixed(0) >= 18000 ? 'FL' + wpt.legAltitude1.toFixed(0) / 100 + 'B'
					: wpt.legAltitude1.toFixed(0) + 'B';
				altitudeConstraint = altitudeConstraintA + altitudeConstraintB;
			}

		}
		altitudeConstraint = altitudeConstraint.padStart(6, ' ');

		//if (this._fmc._speedDirector._commandedSpeedType === SpeedType.SPEED_TYPE_WAYPOINT && isActive) {
		//	speedConstraint = this._fmc.colorizeContent(speedConstraint, 'magenta');
		//}

		return speedConstraint + '/' + altitudeConstraint + '';
	}

	parseConstraintInput(value, waypoint) {
		let re = /(\d*)\/(F?|FL?)(\d+)([AB]?)(F?|FL?)(\d+)?([AB]?)/;
		// 1 = speed
		// 2 = F/FL
		// 3 = ALT
		// 4 = A/B
		// 5 = F/FL
		// 6 = ALT
		// 7 = A/B
		let match = value.match(re);
		if (!match) {
			// no match, input without speed?
			re = /()(F?|FL?)(\d+)([AB]?)(F?|FL?)(\d+)?([AB]?)/;
			match = value.match(re);
			if (!match) {
				return;
			}
			// if "alt" is < 500 and no FL its a speed
			if (match[2] === '' && match[3] !== '' && isFinite(match[3])) {
				const speed = Number(match[3]);
				if (speed < 500) {
					match[1] = speed;
					match[3] = '';
				}
			}
		}

		// speed
		if (match[1] !== '') {
			const speed = Number(match[1]);
			if (isFinite(speed) && speed > 0 && speed < 500) {
				waypoint.speedConstraint = speed;
			}
		}

		// alt 1
		if (match[3] !== '') {
			const fl = match[2];
			let alt = Number(match[3]);
			if (isFinite(alt)) {
				const multi = (fl === 'F' || fl === 'FL') ? 100 : 1;
				alt *= multi;
				if (alt >= -1300 || alt <= 65000) {
					waypoint.legAltitude1 = alt;
				}
				// alt desc
				if (match[4] !== '') {
					waypoint.legAltitudeDescription = (match[4] === 'A') ? 2 : 3;
				} else {
					waypoint.legAltitudeDescription = 1;
				}
			}
		}

		// alt 2
		if (match[6] !== '') {
			const fl = match[5];
			let alt = Number(match[6]);
			if (isFinite(alt)) {
				const multi = (fl === 'F' || fl === 'FL') ? 100 : 1;
				alt *= multi;
				if (alt >= -1300 || alt <= 65000) {
					waypoint.legAltitude2 = alt;
				}
				// alt desc
				if (match[7] !== '') {
					waypoint.legAltitudeDescription = 4;
				} else {
					waypoint.legAltitudeDescription = 1;
				}
			}
		}
	}

	static ShowPage1(fmc, isAddingHold = false) {
		fmc.cleanUpPage();

		// create page instance and init
		LegsPageInstance = new B787_10_FMC_LegsPage(fmc, isAddingHold);
		LegsPageInstance.update();
	}

}
