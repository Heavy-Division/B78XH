// prototype singleton, this needs to be different ofc
let LegsPageInstance = undefined;

// TODO OVERALL
// Because the page has a state now, we need to watch out to reset vars like activatingDirectTo etc after it is processed

class B787_10_FMC_LegsPage {

	constructor(fmc, isAddingHold) {
		this._fmc = fmc;
		this._isDirty = true; // render on first run ofc
		this._isAddingHold = isAddingHold;

		this._currentPage = 1;
		this._pageCount = 1;
		this._rows = [];

		this._activeWptIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
		this._distanceToActiveWpt = "0";

		this._lsk6Field = "";

		this._wayPointsToRender = [];

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
			[""], [""], [""], [""], [""], [""], [""], [""], [""], [""]
		];

		const offset = Math.floor((this._currentPage - 1) * 5);
		const allWaypoints = this._fmc.flightPlanManager.getAllWaypoints();
		this._wayPointsToRender = this.buildLegs(allWaypoints, this._activeWptIndex);
		let runwayIndex = undefined;
		const inhibitSequence = this._fmc._lnav.sequencingMode === FlightPlanSequencing.INHIBIT;
		const inhibitText = inhibitSequence ? "AUTO" + "/" + "INHIBIT" : "AUTO" + "/" + "INHIBIT";

		//FIND RUNWAY INDEX
		if (allWaypoints.length > 1 && allWaypoints[allWaypoints.length - 2].isRunway) {
			runwayIndex = this._wayPointsToRender.length - 2;
		}

		this._pageCount = Math.floor((this._wayPointsToRender.length - 1) / 5) + 1;
		for (let i = 0; i < 5; i++) {

			const waypoint = this._wayPointsToRender[i + offset];

			//EXISTING ->
			if (waypoint && waypoint.fix && waypoint.fix.icao === "$EMPTY") {
				this._rows[2 * i + 1] = [""];
			} else if (waypoint && waypoint.fix) {
				const bearing = isFinite(waypoint.fix.bearingInFP) ? waypoint.fix.bearingInFP.toFixed(0).padStart(3, "0") + "°" : "";
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
				const verticalWaypoint = this._fmc._vnav._verticalFlightPlan[waypoint.index];
				const waypointFPA = verticalWaypoint ? this._fmc._vnav._verticalFlightPlan[waypoint.index].waypointFPA : undefined;
				let fpaText = "  ";

				if (waypoint.isMissedApproachStart) {
					fpaText = ' MISSED APPR';
				} else if (waypointFPA) {
					fpaText = waypointFPA > 0 ? "  " + waypointFPA.toFixed(1) + "°" : "";
				}

				// format distance
				distance = (distance < 100) ? distance.toFixed(1) : distance.toFixed(0);
				let segment = this._fmc.flightPlanManager.getSegmentFromWaypoint(waypoint)

				if (isActWpt) {
					if (waypoint.fix.icao === '$DISCO') {
						this._rows[2 * i] = [" THEN"];
						this._rows[2 * i + 1] = ["□□□□□ ----- ROUTE DISCONTINUITY -----"];
					} else if (waypoint.fix.hasHold) {
						this._rows[2 * i] = [" HOLD AT"];
						this._rows[2 * i + 1] = [`${waypoint.fix.ident != "" ? waypoint.fix.ident : "USR"}`];
					} else {
						this._rows[2 * i] = [" " + bearing.padStart(3, "0"), '', '' ,distance.padStart(4, " ") + "NM"];
						this._rows[2 * i + 1] = [waypoint.fix.ident != "" ? waypoint.fix.ident + "" : "USR"];
					}
				} else {
					if (waypoint.fix.icao === '$DISCO') {
						this._rows[2 * i] = [" THEN"];
						this._rows[2 * i + 1] = ["□□□□□ ----- ROUTE DISCONTINUITY -----"];
					} else if (waypoint.fix.hasHold) {
						this._rows[2 * i] = [" HOLD AT"];
						this._rows[2 * i + 1] = [waypoint.fix.ident != "" ? waypoint.fix.ident : "USR"];
					} else {
						this._rows[2 * i] = [" " + bearing.padStart(3, "0"), '', '' ,distance.padStart(4, " ") + "NM"];
						this._rows[2 * i + 1] = [waypoint.fix.ident != "" ? waypoint.fix.ident : "USR"];
					}
				}

				if (waypoint.fix.icao !== '$DISCO') {
					this._rows[2 * i + 1][1] = (SegmentType.Enroute === segment.type ? Math.round(this._fmc.getCrzManagedSpeed(true)) + "/" + (this._fmc.cruiseFlightLevel ? 'FL' + this._fmc.cruiseFlightLevel : '-----') : this.getAltSpeedRestriction(waypoint.fix));
				}
			}

		}
	}

	render() {

		this._lsk6Field = "";
		if (this._fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
			this._fmc.fpHasChanged = true;
			this._lsk6Field = "<CANCEL MOD";
		}

		const modStr = this._fmc.fpHasChanged ? "MOD" : "ACT";
		let holdActive = false;
		let holdExiting = false;

		const holdsDirector = this._fmc._lnav && this._fmc._lnav.holdsDirector;

		if (holdsDirector) {
			const holdIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
			holdActive = holdsDirector.isHoldActive(holdIndex);
			holdExiting = holdsDirector.isHoldExiting(holdIndex);
		}

		this._fmc.setTemplate([
			[" " + modStr + " LEGS", this._currentPage.toFixed(0) + "/" + Math.max(1, this._pageCount.toFixed(0)) + " "],
			...this._rows,
			[`${this._isAddingHold ? '---------HOLD AT--------' : holdExiting ? '-------EXIT ARMED-------' : '__FMCSEPARATOR'}`],
			[`${this._isAddingHold ? '□□□□□' : holdExiting ? '<CANCEL EXIT' : holdActive ? '<EXIT HOLD' : this._lsk6Field}`, "<RTE DATA"]
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

		//for (var i = Math.max(0, activeWaypointIndex - 1); i < waypoints.length; i++) {
		for (var i = Math.max(0, activeWaypointIndex); i < waypoints.length; i++) {

			const destination = this._fmc.flightPlanManager.getDestination();
			const currentSegment = this._fmc.flightPlanManager.getSegmentFromWaypoint(waypoints[i]).type;

			if (waypoints[i].isRunway && currentSegment === SegmentType.Approach) {
				runwayExists = true;
				runwayIndex = i;
			}
			if (runwayExists && waypoints[i] === destination) {
				//console.log("skipping destination waypoint");
			} else {
				const isFirstMissedApproachLeg = currentSegment === SegmentType.Missed && previousSegment === SegmentType.Approach;
				displayWaypoints.push({ index: i, fix: waypoints[i], isMissedApproachStart: isFirstMissedApproachLeg });

				if (waypoints[i].endsInDiscontinuity) {
					displayWaypoints.push({ index: i, fix: { icao: "$DISCO", isRemovable: waypoints[i].isVectors !== true } });
				}

				previousSegment = currentSegment;
			}
		}

		displayWaypoints.push({ index: -1, fix: { icao: "$EMPTY" } });
		return displayWaypoints;
	}

	bindInputs() {
		for (let i = 0; i < this._wayPointsToRender.length; i++) {

			const offsetRender = Math.floor((this._currentPage - 1) * 5);
			const wptRender = this._wayPointsToRender[i + offsetRender];
			// if its a real fix
			if (!(this._currentPage === 1 && i === 0) && wptRender && (wptRender.fix.ident !== "$EMPTY" || wptRender.fix.ident !== "$DISCO")) {
				this._fmc.onRightInput[i] = () => {
					const offset = Math.floor((this._currentPage - 1) * 5);
					const wptIndex = this._wayPointsToRender[i + offset].index;
					const waypoint = this._fmc.flightPlanManager.getWaypoint(wptIndex);
					const value = this._fmc.inOut;

					if (value === FMCMainDisplay.clrValue) {
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

			this._fmc.onLeftInput[i] = async () => {
				const offset = Math.floor((this._currentPage - 1) * 5);
				const waypoint = this._wayPointsToRender[i + offset];

				if (!waypoint) {
					return;
				}

				if (waypoint.fix.ident === "USR") {
					this._fmc.showErrorMessage("UNABLE MOD USR");
					return;
				}

				const value = this._fmc.inOut;
				let selectedWpIndex = waypoint.index;

				// Mode evaluation
				if (value == "") {
					this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NONE;
				} else if (value === FMCMainDisplay.clrValue) {
					this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.DELETE;
				} else if (value.includes("/") && this._fmc.selectMode === B787_10_FMC_LegsPage.SELECT_MODE.EXISTING) { // looks like user waypoint, go to new
					this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NEW;
				} else if (value.length > 0 && this._fmc.selectMode !== B787_10_FMC_LegsPage.SELECT_MODE.EXISTING) { // scratchpad not empty, nothing selected, must be new wpt
					this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NEW;
				}

				// only allow insert new on add line
				if (waypoint.fix === "$EMPTY" && this._fmc.selectMode !== B787_10_FMC_LegsPage.SELECT_MODE.NEW) {
					return;
				}
				switch (this._fmc.selectMode) {
					case B787_10_FMC_LegsPage.SELECT_MODE.NONE: {
						// CANT SELECT BLUE ON PAGE 1
						if (((i >= 0 && this._currentPage == 1) || (this._currentPage > 1))) {
							// SELECT EXISTING WAYPOINT FROM FLIGHT PLAN
							this._approachWaypoints = this._fmc.flightPlanManager.getApproachWaypoints();
							if (this._approachWaypoints.length > 0) {
								if (waypoint.fix.ident === this._approachWaypoints[this._approachWaypoints.length - 1].ident) {
									this._fmc.showErrorMessage("UNABLE MOD RW");
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
										this._fmc.showErrorMessage("INVALID DELETE");
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
						} else if (i == 0 && this._currentPage == 1) {
							const scratchPadWaypointIndex = this._fmc.selectedWaypoint.index;
							// console.log("modifying from line");
							// console.log("scratchPadWaypointIndex: " + scratchPadWaypointIndex);
							this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
								this._fmc.flightPlanManager.setActiveWaypointIndex(scratchPadWaypointIndex + 1, () => {
									this._fmc.activateRoute(false, () => {
										this.resetAfterOp();
									});
								});
							});
						}
						break;
					}
					case B787_10_FMC_LegsPage.SELECT_MODE.NEW: {
						if ((i >= 1 && this._currentPage == 1) || this._currentPage > 1) {
							if (waypoint && waypoint.fix) {
								if (waypoint.fix.icao === "$EMPTY") {
									selectedWpIndex = Infinity;
								}
								if (waypoint.fix.icao === '$DISCO') {
									if (waypoint.fix.isRemovable) {
										this._fmc.flightPlanManager.clearDiscontinuity(waypoint.index);
										selectedWpIndex += 1;
									} else {
										this._fmc.showErrorMessage("INVALID DELETE");

										return;
									}
								}
							}
							const scratchPadWaypointIndex = this._fmc.selectedWaypoint ? this._fmc.selectedWaypoint.index : undefined;
							const userWaypoint = await CJ4_FMC_PilotWaypointParser.parseInput(value, scratchPadWaypointIndex, this._fmc);
							if (userWaypoint) {
								const databaseDuplicate = await this._fmc._pilotWaypoints.checkDatabaseDuplicates(userWaypoint.wpt.ident);
								if (databaseDuplicate) {
									this._fmc.showErrorMessage("DUPLICATE IDENT");

									return;
								}
								let insertIndex = selectedWpIndex;
								if (userWaypoint.offset > 0) {
									if (scratchPadWaypointIndex !== selectedWpIndex || (i == 1 && this._currentPage == 1 && userWaypoint.offset <= 0)) {
										this._fmc.showErrorMessage("WPT NOT MATCHED");

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
						if ((i >= 0 && this._currentPage == 1) || this._currentPage > 1) {
							this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
								if (waypoint.fix.icao === '$DISCO') {
									if (waypoint.fix.isRemovable) {
										this._fmc.flightPlanManager.clearDiscontinuity(waypoint.index);
										this._fmc.activateRoute(false, () => {
											this.resetAfterOp();
										});
									} else {
										this._fmc.showErrorMessage("INVALID DELETE");
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
						}
						break;
					}
				}
			};
		}
	}

	resetAfterOp() {
		this._fmc.clearUserInput();

		this._fmc.selectedWaypoint = undefined;
		this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NONE;
		this.update(true);
	}

	bindEvents() {
		this._fmc.onLeftInput[5] = () => {
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
			} else if (this._lsk6Field == "<CANCEL MOD") {
				if (this._fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
					this._fmc.fpHasChanged = false;
					this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NONE;
					this._fmc.eraseTemporaryFlightPlan(() => {
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
		if (this._currentPage == 1) {
			this._fmc.onRightInput[0] = () => {
				const currentInhibit = this._fmc._lnav.sequencingMode === FlightPlanSequencing.INHIBIT;
				if (currentInhibit) {
					this._fmc._lnav.setAutoSequencing();
				} else {
					this._fmc._lnav.setInhibitSequencing();
				}

				this.resetAfterOp();
			};
		}

		// EXEC
		this._fmc.onExecPage = () => {
			if (this._fmc.fpHasChanged && this._fmc._isRouteActivated) {
				this._fmc.refreshPageCallback = () => {
					this.resetAfterOp();
				}; // TODO this seems annoying, but this is how stuff works in cj4_fmc right now
				this._fmc.onExecDefault();
			} else if (this._fmc.fpHasChanged) {
				this._fmc.fpHasChanged = false;
				this._fmc.activateRoute(() => {
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
	}

	addHold() {
		/** @type {{waypoint: WayPoint, index: number}} */
		const holdWaypoint = this._fmc.flightPlanManager.getAllWaypoints()
		.map((waypoint, index) => ({ waypoint, index }))
		.slice(this._activeWptIndex)
		.find(x => x.waypoint.ident === this._fmc.inOut);

		if (holdWaypoint !== undefined) {

			this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
				const details = HoldDetails.createDefault(holdWaypoint.waypoint.bearingInFP, holdWaypoint.waypoint.bearingInFP);
				this._fmc.flightPlanManager.addHoldAtWaypointIndex(holdWaypoint.index, details);
				this._fmc.fpHasChanged = true;

				this._fmc.inOut = '';
				CJ4_FMC_HoldsPage.showHoldPage(this._fmc, holdWaypoint.waypoint.ident);
			});
		} else {
			this._fmc.showErrorMessage('INVALID ENTRY');
		}
	}

	// TODO, later this could be in the base class
	invalidate() {
		this._isDirty = true;
		this._fmc.clearDisplay();
		this.updateLegs();
		this.render();
		this.bindInputs(); // TODO ideally this should only be called once, but clearDisplay clears everthing
		this.bindEvents(); // TODO     ""
		this._isDirty = false;
		this._fmc.updateSideButtonActiveStatus();
	}

	getAltSpeedRestriction(waypoint) {
		let speedConstraint = "---";
		let altitudeConstraint = "----- ";
		const wpt = waypoint;

		if (wpt.speedConstraint && wpt.speedConstraint > 100) {
			speedConstraint = wpt.speedConstraint;
		}
		if (wpt.legAltitudeDescription > 0) {
			if (wpt.legAltitudeDescription == 1) {
				altitudeConstraint = wpt.legAltitude1.toFixed(0) >= 18000 ? "FL" + wpt.legAltitude1.toFixed(0) / 100
					: wpt.legAltitude1.toFixed(0);
			} else if (wpt.legAltitudeDescription == 2) {
				altitudeConstraint = wpt.legAltitude1.toFixed(0) >= 18000 ? "FL" + wpt.legAltitude1.toFixed(0) / 100 + "A"
					: wpt.legAltitude1.toFixed(0) + "A";
			} else if (wpt.legAltitudeDescription == 3) {
				altitudeConstraint = wpt.legAltitude1.toFixed(0) >= 18000 ? "FL" + wpt.legAltitude1.toFixed(0) / 100 + "B"
					: wpt.legAltitude1.toFixed(0) + "B";
			} else if (wpt.legAltitudeDescription == 4) {
				const altitudeConstraintA = wpt.legAltitude2.toFixed(0) >= 18000 ? "FL" + wpt.legAltitude2.toFixed(0) / 100 + "A"
					: wpt.legAltitude2.toFixed(0) + "A";
				const altitudeConstraintB = wpt.legAltitude1.toFixed(0) >= 18000 ? "FL" + wpt.legAltitude1.toFixed(0) / 100 + "B"
					: wpt.legAltitude1.toFixed(0) + "B";
				altitudeConstraint = altitudeConstraintA + altitudeConstraintB;
			}

		}
		altitudeConstraint = altitudeConstraint.padStart(6, " ");

		return speedConstraint + "/" + altitudeConstraint + "";
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
			if (match[2] === "" && match[3] !== "" && isFinite(match[3])) {
				const speed = Number(match[3]);
				if (speed < 500) {
					match[1] = speed;
					match[3] = "";
				}
			}
		}

		// speed
		if (match[1] !== "") {
			const speed = Number(match[1]);
			if (isFinite(speed) && speed > 0 && speed < 500) {
				waypoint.speedConstraint = speed;
			}
		}

		// alt 1
		if (match[3] !== "") {
			const fl = match[2];
			let alt = Number(match[3]);
			if (isFinite(alt)) {
				const multi = (fl === "F" || fl === "FL") ? 100 : 1;
				alt *= multi;
				if (alt >= -1300 || alt <= 65000) {
					waypoint.legAltitude1 = alt;
				}
				// alt desc
				if (match[4] !== "") {
					waypoint.legAltitudeDescription = (match[4] === "A") ? 2 : 3;
				} else {
					waypoint.legAltitudeDescription = 1;
				}
			}
		}

		// alt 2
		if (match[6] !== "") {
			const fl = match[5];
			let alt = Number(match[6]);
			if (isFinite(alt)) {
				const multi = (fl === "F" || fl === "FL") ? 100 : 1;
				alt *= multi;
				if (alt >= -1300 || alt <= 65000) {
					waypoint.legAltitude2 = alt;
				}
				// alt desc
				if (match[7] !== "") {
					waypoint.legAltitudeDescription = 4;
				} else {
					waypoint.legAltitudeDescription = 1;
				}
			}
		}
	}

	static ShowPage1(fmc, isAddingHold = false) {
		fmc.clearDisplay();

		// create page instance and init
		LegsPageInstance = new B787_10_FMC_LegsPage(fmc, isAddingHold);
		LegsPageInstance.update();
	}

}

B787_10_FMC_LegsPage.SELECT_MODE = {
	NONE: "NONE",
	EXISTING: "EXISTING",
	NEW: "NEW",
	DELETE: "DELETE"
};
B787_10_FMC_LegsPage.DEBUG_SHOW_WAYPOINT_PHASE = false;














































// prototype singleton, this needs to be different ofc
let LegsPageInstance3 = undefined;

// TODO OVERALL
// Because the page has a state now, we need to watch out to reset vars like activatingDirectTo etc after it is processed

class B787_10_FMC_LegsPage3 {

	constructor(fmc, isAddingHold) {
		this._fmc = fmc;
		this._isDirty = true; // render on first run ofc
		this._isAddingHold = isAddingHold;

		this._currentPage = 1;
		this._pageCount = 1;
		this._rows = [];

		this._activeWptIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
		this._distanceToActiveWpt = "0";

		this._lsk6Field = "";

		this._wayPointsToRender = [];

		this._isMapModePlan = SimVar.GetSimVarValue('L:B787_MAP_MODE', 'number') === 3;

		this._step = 0;

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

		const all = this._fmc.flightPlanManager.getWaypoints();
		all.forEach((w) => {
			console.log(w.ident);
		})

		this._isMapModePlan = SimVar.GetSimVarValue('L:B787_MAP_MODE', 'number') === 3;

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
			[""], [""], [""], [""], [""], [""], [""], [""], [""], [""]
		];

		const offset = Math.floor((this._currentPage - 1) * 5);
		const allWaypoints = this._fmc.flightPlanManager.getAllWaypoints();
		this._wayPointsToRender = this.buildLegs(allWaypoints, this._activeWptIndex + 1);
		let runwayIndex = undefined;
		//const inhibitSequence = this._fmc._lnav.sequencingMode === FlightPlanSequencing.INHIBIT;
		//const inhibitText = inhibitSequence ? "AUTO" + "/" + "INHIBIT" : "AUTO" + "/" + "INHIBIT";

		//FIND RUNWAY INDEX
		if (allWaypoints.length > 1 && allWaypoints[allWaypoints.length - 2].isRunway) {
			runwayIndex = this._wayPointsToRender.length - 2;
		}

		this._pageCount = Math.floor((this._wayPointsToRender.length - 1) / 5) + 1;
		for (let i = 0; i < 5; i++) {

			const waypoint = this._wayPointsToRender[i + offset];

			//EXISTING ->
			if (waypoint && waypoint.fix && waypoint.fix.icao === "$EMPTY") {
				this._rows[2 * i + 1] = [""];
			} else if (waypoint && waypoint.fix) {
				const bearing = isFinite(waypoint.fix.bearingInFP) ? waypoint.fix.bearingInFP.toFixed(0).padStart(3, "0") + "°" : "";
				const prevWaypoint = this._wayPointsToRender[i + offset - 1];
				this._wayPointsToRender.forEach((w) => {
					console.log(w.fix.ident);
				});
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
				let fpaText = "  ";

				if (waypoint.isMissedApproachStart) {
					fpaText = ' MISSED APPR';
				} else if (waypointFPA) {
					fpaText = waypointFPA > 0 ? "  " + waypointFPA.toFixed(1) + "°" : "";
				}

				// format distance
				distance = (distance < 100) ? distance.toFixed(1) : distance.toFixed(0);

				let segment = this._fmc.flightPlanManager.getSegmentFromWaypoint(waypoint)

				console.log(segment.type)
				console.log(SegmentType.Enroute)

				if (isFromWpt) {
					if (this._fmc.flightPlanManager.getIsDirectTo()) {
						this._rows[2 * i + 1][0] = waypoint.fix.ident != "" ? waypoint.fix.ident + "" : "(DIR)";;
						this._rows[2 * i] = [" " + bearing.padStart(3, "0"), '', '' ,distance.padStart(4, " ") + "NM"];
						this._rows[2 * i + 1][1] = (SegmentType.Enroute === segment.type ? Math.round(this._fmc.getCrzManagedSpeed(true)) + "/" + (this._fmc.cruiseFlightLevel ? 'FL' + this._fmc.cruiseFlightLevel : '-----') : this.getAltSpeedRestriction(waypoint.fix));
					} else {
						this._rows[2 * i + 1][0] = waypoint.fix.ident != "" ? waypoint.fix.ident + "" : "USR";
						this._rows[2 * i] = [" " + bearing.padStart(3, "0"), '', '' ,distance.padStart(4, " ") + "NM"];
						//this._rows[2 * i + 1][1] = (SegmentType.Enroute == segment ? this._fmc.getCrzManagedSpeed() + "/" + this._fmc.cruiseFlightLevel : this.getAltSpeedRestriction(waypoint.fix));
						this._rows[2 * i + 1][1] = (SegmentType.Enroute === segment.type ? Math.round(this._fmc.getCrzManagedSpeed(true)) + "/" + (this._fmc.cruiseFlightLevel ? 'FL' + this._fmc.cruiseFlightLevel : '-----') : this.getAltSpeedRestriction(waypoint.fix));
					}
				} else if (isActWpt) {
					if (waypoint.fix.icao === '$DISCO') {
						this._rows[2 * i] = [" THEN"];
						this._rows[2 * i + 1] = ["□□□□□ ----- ROUTE DISCONTINUITY -----"];
					} else if (waypoint.fix.hasHold) {
						this._rows[2 * i] = [" HOLD AT"];
						this._rows[2 * i + 1] = [`${waypoint.fix.ident != "" ? waypoint.fix.ident : "USR"}`];
					} else {
						this._rows[2 * i] = [" " + bearing.padStart(3, "0"), '', '' ,distance.padStart(4, " ") + "NM"];
						this._rows[2 * i + 1] = [waypoint.fix.ident != "" ? waypoint.fix.ident + "" : "USR"];
					}
				} else {
					if (waypoint.fix.icao === '$DISCO') {
						this._rows[2 * i] = [" THEN"];
						this._rows[2 * i + 1] = ["□□□□□ ----- ROUTE DISCONTINUITY -----"];
					} else if (waypoint.fix.hasHold) {
						this._rows[2 * i] = [" HOLD AT"];
						this._rows[2 * i + 1] = [waypoint.fix.ident != "" ? waypoint.fix.ident : "USR"];
					} else {
						this._rows[2 * i] = [" " + bearing.padStart(3, "0"), '', '' ,distance.padStart(4, " ") + "NM"];
						this._rows[2 * i + 1] = [waypoint.fix.ident != "" ? waypoint.fix.ident : "USR"];
					}
				}

				if (!isFromWpt && waypoint.fix.icao !== '$DISCO') {
					this._rows[2 * i + 1][1] = (SegmentType.Enroute === segment.type ? Math.round(this._fmc.getCrzManagedSpeed(true)) + "/" + (this._fmc.cruiseFlightLevel ? 'FL' + this._fmc.cruiseFlightLevel : '-----') : this.getAltSpeedRestriction(waypoint.fix));
				}
			}
/*
			if (this._isMapModePlan) {
				if(this._rows[2 * this._step + 1][0] === '□□□□□ ----- ROUTE DISCONTINUITY -----'){
					const dis = this._step;
					this._fmc.currentFlightPlanWaypointIndex = this._activeWptIndex + offset + dis - 2;
					console.log(this._fmc.currentFlightPlanWaypointIndex)
					this._step++;
				} else {
					console.log(this._fmc.currentFlightPlanWaypointIndex)
					this._fmc.currentFlightPlanWaypointIndex = this._activeWptIndex + offset + this._step;
				}
				if (this._rows[2 * this._step + 1][0] != '') {
					console.log("Step: " + this._step);
					if (!this._rows[2 * this._step + 1][1]) {
						this._rows[2 * this._step + 1][1] = '';
					}
					this._rows[2 * this._step + 1][2] = '<CTR>';
				} else {
					//return B787_10_FMC_LegsPage.ShowPage1(fmc, 1, 0);
				}

				this._fmc.onRightInput[5] = () => {
					let newStep = this._step + 1;
					let newPage = this._currentPage;
					if (newStep > 4) {
						newStep = 0;
						newPage++;
					}
					if (newPage > this._pageCount) {
						newPage = 1;
					}
					console.log("newstep: " + newStep);
					console.log("newPage: " + newPage);
					this._step = newStep;
					this._currentPage = newPage;
					this.update(true);
					//B787_10_FMC_LegsPage.ShowPage1(fmc, newPage, newStep);
				};


			} else {

				this._fmc.onRightInput[5] = () => {
					new B787_10_FMC_RouteDataPage(this._fmc).showPage();
				};
			}
*/
		}
	}

	render() {

		this._lsk6Field = "";
		if (this._fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
			this._fmc.fpHasChanged = true;
			this._lsk6Field = "<ERASE";
		}

		const modStr = this._fmc.fpHasChanged ? "MOD" : "ACT";
		let holdActive = false;
		let holdExiting = false;

		const holdsDirector = undefined //this._fmc._lnav && this._fmc._lnav.holdsDirector;

		if (holdsDirector) {
			const holdIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
			holdActive = holdsDirector.isHoldActive(holdIndex);
			holdExiting = holdsDirector.isHoldExiting(holdIndex);
		}

		this._fmc.setTemplate([
			[" " + modStr + " LEGS", this._currentPage.toFixed(0) + "/" + Math.max(1, this._pageCount.toFixed(0)) + ""],
			...this._rows,
			[`${this._isAddingHold ? '---------HOLD AT--------' : holdExiting ? '-------EXIT ARMED-------' : '__FMCSEPARATOR'}`],
			[`${this._isAddingHold ? '□□□□□' : holdExiting ? '<CANCEL EXIT' : holdActive ? '<EXIT HOLD' : this._lsk6Field}`, "<RTE DATA"]
		]);
	}

	buildLegs(waypoints, activeWaypointIndex) {
		const displayWaypoints = [];
		let runwayExists = false;
		let runwayIndex = 0;

		let holdExited = false;
		const holdsDirector = undefined //this._fmc._lnav && this._fmc._lnav.holdsDirector;

		if (holdsDirector) {
			const holdIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
			holdExited = holdsDirector.isHoldExited(holdIndex);
		}

		let previousSegment = undefined;

		for (var i = Math.max(0, activeWaypointIndex - 1); i < waypoints.length; i++) {

			const destination = this._fmc.flightPlanManager.getDestination();
			const currentSegment = this._fmc.flightPlanManager.getSegmentFromWaypoint(waypoints[i]).type;

			if (waypoints[i].isRunway && currentSegment === SegmentType.Approach) {
				runwayExists = true;
				runwayIndex = i;
			}
			if (runwayExists && waypoints[i] === destination) {
				//console.log("skipping destination waypoint");
			} else {
				const isFirstMissedApproachLeg = currentSegment === SegmentType.Missed && previousSegment === SegmentType.Approach;
				displayWaypoints.push({ index: i, fix: waypoints[i], isMissedApproachStart: isFirstMissedApproachLeg });

				if (waypoints[i].endsInDiscontinuity) {
					displayWaypoints.push({ index: i, fix: { icao: "$DISCO", isRemovable: waypoints[i].isVectors !== true } });
				}

				previousSegment = currentSegment;
			}
		}

		displayWaypoints.push({ index: -1, fix: { icao: "$EMPTY" } });
		return displayWaypoints;
	}

	bindInputs() {
		for (let i = 0; i < this._wayPointsToRender.length; i++) {

			const offsetRender = Math.floor((this._currentPage - 1) * 5);
			const wptRender = this._wayPointsToRender[i + offsetRender];
			// if its a real fix
			if (!(this._currentPage === 1 && i === 0) && wptRender && (wptRender.fix.ident !== "$EMPTY" || wptRender.fix.ident !== "$DISCO")) {
				this._fmc.onRightInput[i] = () => {
					const offset = Math.floor((this._currentPage - 1) * 5);
					const wptIndex = this._wayPointsToRender[i + offset].index;
					const waypoint = this._fmc.flightPlanManager.getWaypoint(wptIndex);
					const value = this._fmc.inOut;

					if (value === FMCMainDisplay.clrValue) {
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

			this._fmc.onLeftInput[i] = async () => {
				const offset = Math.floor((this._currentPage - 1) * 5);
				const waypoint = this._wayPointsToRender[i + offset];

				if (!waypoint) {
					return;
				}

				if (waypoint.fix.ident === "USR") {
					this._fmc.showErrorMessage("UNABLE MOD USR");
					return;
				}

				const value = this._fmc.inOut;
				let selectedWpIndex = waypoint.index;

				// Mode evaluation
				if (value == "") {
					this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NONE;
				} else if (value === FMCMainDisplay.clrValue) {
					this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.DELETE;
				} else if (value.includes("/") && this._fmc.selectMode === B787_10_FMC_LegsPage.SELECT_MODE.EXISTING) { // looks like user waypoint, go to new
					this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NEW;
				} else if (value.length > 0 && this._fmc.selectMode !== B787_10_FMC_LegsPage.SELECT_MODE.EXISTING) { // scratchpad not empty, nothing selected, must be new wpt
					this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NEW;
				}

				// only allow insert new on add line
				if (waypoint.fix === "$EMPTY" && this._fmc.selectMode !== B787_10_FMC_LegsPage.SELECT_MODE.NEW) {
					return;
				}
				switch (this._fmc.selectMode) {
					case B787_10_FMC_LegsPage.SELECT_MODE.NONE: {
						// CANT SELECT BLUE ON PAGE 1
						if (((i >= 0 && this._currentPage == 1) || (this._currentPage > 1))) {
							// SELECT EXISTING WAYPOINT FROM FLIGHT PLAN
							this._approachWaypoints = this._fmc.flightPlanManager.getApproachWaypoints();
							if (this._approachWaypoints.length > 0) {
								if (waypoint.fix.ident === this._approachWaypoints[this._approachWaypoints.length - 1].ident) {
									this._fmc.showErrorMessage("UNABLE MOD RW");
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
										this._fmc.showErrorMessage("INVALID DELETE");
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
											this._fmc.flightPlanManager.removeWaypoint(lskWaypointIndex - 1, false, () => {
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
						} else if (i == 0 && this._currentPage == 1) {
							const scratchPadWaypointIndex = this._fmc.selectedWaypoint.index;
							// console.log("modifying from line");
							// console.log("scratchPadWaypointIndex: " + scratchPadWaypointIndex);

							this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
								this._fmc.flightPlanManager.setActiveWaypointIndex(scratchPadWaypointIndex + 1, () => {
									this._fmc.activateRoute(false, () => {
										this.resetAfterOp();
									});
								});
							});
						}
						break;
					}
					case B787_10_FMC_LegsPage.SELECT_MODE.NEW: {
						if ((i >= 1 && this._currentPage == 1) || this._currentPage > 1) {

							if (waypoint && waypoint.fix) {
								if (waypoint.fix.icao === "$EMPTY") {
									selectedWpIndex = Infinity;
								}
								if (waypoint.fix.icao === '$DISCO') {
									if (waypoint.fix.isRemovable) {
										this._fmc.flightPlanManager.clearDiscontinuity(waypoint.index);
										selectedWpIndex += 1;
									} else {
										this._fmc.showErrorMessage("INVALID DELETE");

										return;
									}
								}
							}
							const scratchPadWaypointIndex = this._fmc.selectedWaypoint ? this._fmc.selectedWaypoint.index : undefined;
							const userWaypoint = await CJ4_FMC_PilotWaypointParser.parseInput(value, scratchPadWaypointIndex, this._fmc);
							if (userWaypoint) {
								const databaseDuplicate = await this._fmc._pilotWaypoints.checkDatabaseDuplicates(userWaypoint.wpt.ident);
								if (databaseDuplicate) {
									this._fmc.showErrorMessage("DUPLICATE IDENT");

									return;
								}
								let insertIndex = selectedWpIndex;
								if (userWaypoint.offset > 0) {
									if (scratchPadWaypointIndex !== selectedWpIndex || (i == 1 && this._currentPage == 1 && userWaypoint.offset <= 0)) {
										this._fmc.showErrorMessage("WPT NOT MATCHED");

										return;
									} else {
										insertIndex = userWaypoint.offset >= 0 ? selectedWpIndex + 1 : selectedWpIndex;
									}
								}
								this._fmc._pilotWaypoints.addPilotWaypointWithOverwrite(userWaypoint.wpt.ident, userWaypoint.wpt.infos.coordinates.lat, userWaypoint.wpt.infos.coordinates.long);
								this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
									this._fmc.flightPlanManager.addUserWaypoint(userWaypoint.wpt, insertIndex, () => {
										const isDirectTo = (i == 1 && this._currentPage == 1);
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
											const isDirectTo = (i == 1 && this._currentPage == 1);
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
												const isDirectTo = (i == 1 && this._currentPage == 1);
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
						} else if (i == 0 && this._currentPage == 1) {
							this._fmc.showErrorMessage("UNABLE ADD FROM WPT");
						}
						break;
					}
					case B787_10_FMC_LegsPage.SELECT_MODE.DELETE: {
						// DELETE WAYPOINT
						if ((i > 1 && this._currentPage == 1) || this._currentPage > 1) {

							this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
								if (waypoint.fix.icao === '$DISCO') {
									if (waypoint.fix.isRemovable) {
										this._fmc.flightPlanManager.clearDiscontinuity(waypoint.index);
										this._fmc.activateRoute(false, () => {
											this.resetAfterOp();
										});
									} else {
										this._fmc.showErrorMessage("INVALID DELETE");
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
							this._fmc.showErrorMessage("UNABLE DEL WPT");
						}
						break;
					}
				}
			};
		}
	}

	resetAfterOp() {
		this._fmc.clearUserInput();

		this._fmc.selectedWaypoint = undefined;
		this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NONE;
		this.update(true);
	}

	bindEvents() {

		this._fmc.onRightInput[5] = () => {
			new B787_10_FMC_RouteDataPage(this._fmc).showPage();
		};

		this._fmc.onLeftInput[5] = () => {
			let holdActive = false;
			let holdExiting = false;

			const holdsDirector = undefined //this._fmc._lnav && this._fmc._lnav.holdsDirector;

			if (holdsDirector) {
				const holdIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
				holdActive = holdsDirector.isHoldActive(holdIndex);
				holdExiting = holdsDirector.isHoldExiting(holdIndex);
			}

			if (this._isAddingHold) {
				this.addHold();
			} else if (this._lsk6Field == "<ERASE") {
				if (this._fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
					this._fmc.fpHasChanged = false;
					this._fmc.selectMode = B787_10_FMC_LegsPage.SELECT_MODE.NONE;
					this._fmc.eraseTemporaryFlightPlan(() => {
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
		if (this._currentPage == 1) {
			this._fmc.onRightInput[0] = () => {
				const currentInhibit = undefined //this._fmc._lnav.sequencingMode === FlightPlanSequencing.INHIBIT;
				if (currentInhibit) {
					//this._fmc._lnav.setAutoSequencing();
				} else {
					//this._fmc._lnav.setInhibitSequencing();
				}

				this.resetAfterOp();
			};
		}

		// EXEC
		this._fmc.onExecPage = () => {
			if (this._fmc.fpHasChanged && this._fmc._isRouteActivated) {
				this._fmc.refreshPageCallback = () => {
					this.resetAfterOp();
				}; // TODO this seems annoying, but this is how stuff works in cj4_fmc right now
				this._fmc.onExecDefault();
			} else if (this._fmc.fpHasChanged) {
				this._fmc.fpHasChanged = false;
				this._fmc.activateRoute(() => {
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

		this._fmc.updateSideButtonActiveStatus();
	}

	addHold() {
		/** @type {{waypoint: WayPoint, index: number}} */
		const holdWaypoint = this._fmc.flightPlanManager.getAllWaypoints()
		.map((waypoint, index) => ({ waypoint, index }))
		.slice(this._activeWptIndex)
		.find(x => x.waypoint.ident === this._fmc.inOut);

		if (holdWaypoint !== undefined) {

			this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
				const details = HoldDetails.createDefault(holdWaypoint.waypoint.bearingInFP, holdWaypoint.waypoint.bearingInFP);
				this._fmc.flightPlanManager.addHoldAtWaypointIndex(holdWaypoint.index, details);
				this._fmc.fpHasChanged = true;

				this._fmc.inOut = '';
				CJ4_FMC_HoldsPage.showHoldPage(this._fmc, holdWaypoint.waypoint.ident);
			});
		} else {
			this._fmc.showErrorMessage('INVALID ENTRY');
		}
	}

	// TODO, later this could be in the base class
	invalidate() {
		this._isDirty = true;
		this._fmc.clearDisplay();
		this.updateLegs();
		this.render();
		this.bindInputs(); // TODO ideally this should only be called once, but clearDisplay clears everthing
		this.bindEvents(); // TODO     ""
		this._isDirty = false;
	}

	getAltSpeedRestriction(waypoint) {
		let speedConstraint = "---";
		let altitudeConstraint = "----- ";
		const wpt = waypoint;

		if (wpt.speedConstraint && wpt.speedConstraint > 100) {
			speedConstraint = wpt.speedConstraint;
		}
		if (wpt.legAltitudeDescription > 0) {
			if (wpt.legAltitudeDescription == 1) {
				altitudeConstraint = wpt.legAltitude1.toFixed(0) >= 18000 ? "FL" + wpt.legAltitude1.toFixed(0) / 100
					: wpt.legAltitude1.toFixed(0);
			} else if (wpt.legAltitudeDescription == 2) {
				altitudeConstraint = wpt.legAltitude1.toFixed(0) >= 18000 ? "FL" + wpt.legAltitude1.toFixed(0) / 100 + "A"
					: wpt.legAltitude1.toFixed(0) + "A";
			} else if (wpt.legAltitudeDescription == 3) {
				altitudeConstraint = wpt.legAltitude1.toFixed(0) >= 18000 ? "FL" + wpt.legAltitude1.toFixed(0) / 100 + "B"
					: wpt.legAltitude1.toFixed(0) + "B";
			} else if (wpt.legAltitudeDescription == 4) {
				const altitudeConstraintA = wpt.legAltitude2.toFixed(0) >= 18000 ? "FL" + wpt.legAltitude2.toFixed(0) / 100 + "A"
					: wpt.legAltitude2.toFixed(0) + "A";
				const altitudeConstraintB = wpt.legAltitude1.toFixed(0) >= 18000 ? "FL" + wpt.legAltitude1.toFixed(0) / 100 + "B"
					: wpt.legAltitude1.toFixed(0) + "B";
				altitudeConstraint = altitudeConstraintA + altitudeConstraintB;
			}

		}
		altitudeConstraint = altitudeConstraint.padStart(6, " ");

		return speedConstraint + "/" + altitudeConstraint + "";
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
			if (match[2] === "" && match[3] !== "" && isFinite(match[3])) {
				const speed = Number(match[3]);
				if (speed < 500) {
					match[1] = speed;
					match[3] = "";
				}
			}
		}

		// speed
		if (match[1] !== "") {
			const speed = Number(match[1]);
			if (isFinite(speed) && speed > 0 && speed < 500) {
				waypoint.speedConstraint = speed;
			}
		}

		// alt 1
		if (match[3] !== "") {
			const fl = match[2];
			let alt = Number(match[3]);
			if (isFinite(alt)) {
				const multi = (fl === "F" || fl === "FL") ? 100 : 1;
				alt *= multi;
				if (alt >= -1300 || alt <= 65000) {
					waypoint.legAltitude1 = alt;
				}
				// alt desc
				if (match[4] !== "") {
					waypoint.legAltitudeDescription = (match[4] === "A") ? 2 : 3;
				} else {
					waypoint.legAltitudeDescription = 1;
				}
			}
		}

		// alt 2
		if (match[6] !== "") {
			const fl = match[5];
			let alt = Number(match[6]);
			if (isFinite(alt)) {
				const multi = (fl === "F" || fl === "FL") ? 100 : 1;
				alt *= multi;
				if (alt >= -1300 || alt <= 65000) {
					waypoint.legAltitude2 = alt;
				}
				// alt desc
				if (match[7] !== "") {
					waypoint.legAltitudeDescription = 4;
				} else {
					waypoint.legAltitudeDescription = 1;
				}
			}
		}
	}

	static ShowPage1(fmc, isAddingHold = false) {
		fmc.clearDisplay();

		// create page instance and init
		LegsPageInstance = new B787_10_FMC_LegsPage(fmc, isAddingHold);
		LegsPageInstance.update();
	}

}

B787_10_FMC_LegsPage.SELECT_MODE = {
	NONE: "NONE",
	EXISTING: "EXISTING",
	NEW: "NEW",
	DELETE: "DELETE"
};
B787_10_FMC_LegsPage.DEBUG_SHOW_WAYPOINT_PHASE = false;





































class B787_10_FMC_LegsPage2 {
	static ShowPage1(fmc, currentPage = 1, step = 0) {
		fmc.clearDisplay();
		B787_10_FMC_LegsPage._updateCounter = 0;
		fmc.pageUpdate = () => {
			if (B787_10_FMC_LegsPage._updateCounter >= 50) {
				B787_10_FMC_LegsPage.ShowPage1(fmc, currentPage, step);
			} else {
				B787_10_FMC_LegsPage._updateCounter++;
			}
		};
		fmc.refreshPageCallback = () => {
			B787_10_FMC_LegsPage.ShowPage1(fmc, currentPage, step);
		};
		let pageCount = 1;
		let rows = [
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			['']
		];
		let offset = Math.floor((currentPage - 1) * 5);
		let activeWaypoint = 0;
		let flightPlanManagerWaypoints = fmc.flightPlanManager.getWaypoints();
		if (flightPlanManagerWaypoints) {
			let waypoints = [...fmc.flightPlanManager.getWaypoints()];
			if (waypoints.length > 2) {
				activeWaypoint = fmc.flightPlanManager.getActiveWaypointIndex();
				waypoints.pop();
				let firstApproachWaypointIndex = waypoints.length;
				let approachWaypoints = fmc.flightPlanManager.getApproachWaypoints();
				if (fmc.flightPlanManager.isActiveApproach()) {
					activeWaypoint += waypoints.length;
					firstApproachWaypointIndex = 0;
				}
				for (let i = 0; i < approachWaypoints.length; i++) {
					waypoints.push(approachWaypoints[i]);
				}
				activeWaypoint = waypoints.findIndex((w) => {
					return w.ident === fmc.flightPlanManager.getActiveWaypointIdent();
				});

				waypoints.splice(0, activeWaypoint);

				pageCount = Math.floor((waypoints.length - 1) / 5) + 1;
				for (let i = 0; i < 5; i++) {
					let waypointFPIndex = i + offset + 1;
					let waypoint = waypoints[i + offset];
					if (waypoint) {
						let isEnRouteWaypoint = false;
						let isDepartureWaypoint = false;
						let isLastDepartureWaypoint = false;
						let isArrivalWaypoint = false;
						let isFirstArrivalWaypoint = false;
						let isApproachWaypoint = false;
						if (i + offset >= fmc.flightPlanManager.getDepartureWaypointsCount() - activeWaypoint) {
							if (i + offset < fmc.flightPlanManager.getEnRouteWaypointsLastIndex() - activeWaypoint) {
								isEnRouteWaypoint = true;
							} else {
								if (i + offset < firstApproachWaypointIndex) {
									if (waypointFPIndex === fmc.flightPlanManager.getEnRouteWaypointsLastIndex() + 1 - activeWaypoint) {
										isFirstArrivalWaypoint = true;
									}
									isArrivalWaypoint = true;
								} else {
									isApproachWaypoint = true;
								}
							}
						} else {
							if (waypointFPIndex === fmc.flightPlanManager.getDepartureWaypointsCount() - activeWaypoint) {
								isLastDepartureWaypoint = true;
							}
							isDepartureWaypoint = true;
						}
						let bearing = isFinite(waypoint.bearingInFP) ? waypoint.bearingInFP.toFixed(0) + '°' : '';
						let distance = isFinite(waypoint.cumulativeDistanceInFP) ? waypoint.cumulativeDistanceInFP.toFixed(0) + 'NM' : '';
						rows[2 * i] = [bearing, '', '', distance];
						rows[2 * i + 1] = [waypoint.ident != '' ? waypoint.ident : 'USR'];
						let ii = i;
						fmc.onLeftInput[i] = () => {
							let value = fmc.inOut;
							if (value === 'DELETE') {
								fmc.inOut = '';
								fmc.removeWaypoint(waypointFPIndex, () => {
									fmc.activateRoute();
									B787_10_FMC_LegsPage.ShowPage1(fmc, currentPage);
								});
							} else if (value.length > 0) {
								fmc.clearUserInput();

								/**
								 * Modified default ASOBO
								 */
								if (currentPage === 1 && ii === 0) {
									if (!value.startsWith('RW')) {
										fmc.setMyBoeingDirectTo(value, ii + 1, (result) => {
											if (result) {
												fmc.activateRoute();
											}
											B787_10_FMC_LegsPage.ShowPage1(fmc);
										});
									}
								}
							} else {
								fmc.inOut = waypoint.ident;
							}
						};
						if (B787_10_FMC_LegsPage.DEBUG_SHOW_WAYPOINT_PHASE) {
							if (isDepartureWaypoint) {
								rows[2 * i + 1][0] += ' [DP]';
								if (isLastDepartureWaypoint) {
									rows[2 * i + 1][0] += '*';
								}
							} else if (isEnRouteWaypoint) {
								rows[2 * i + 1][0] += ' [ER]';
							} else if (isArrivalWaypoint) {
								rows[2 * i + 1][0] += ' [AR]';
								if (isFirstArrivalWaypoint) {
									rows[2 * i + 1][0] += '*';
								}
							} else if (isApproachWaypoint) {
								rows[2 * i + 1][0] += ' [AP]';
							}
						}
						if (isEnRouteWaypoint) {
							rows[2 * i + 1][1] = fmc.getCrzManagedSpeed(true).toFixed(0) + '/ FL' + fmc.cruiseFlightLevel;
						} else {
							let speedConstraint = '---';
							if (waypoint.speedConstraint > 0) {
								speedConstraint = waypoint.speedConstraint.toFixed(0);
							} else {
								if (isLastDepartureWaypoint || isArrivalWaypoint) {
									speedConstraint = fmc.getCrzManagedSpeed().toFixed(0);
								} else if (isDepartureWaypoint) {
									let d = (waypointFPIndex - 1) / (fmc.flightPlanManager.getDepartureWaypointsCount() - 1 - activeWaypoint);
									speedConstraint = (fmc.v2Speed * (1 - d) + fmc.getCrzManagedSpeed() * d).toFixed(0);
								} else if (isApproachWaypoint) {
									let predictedFlapsIndex = i + offset - (waypoints.length - 1) + 2;
									predictedFlapsIndex = Math.max(0, predictedFlapsIndex);
									console.log(waypoint.ident + ' ' + predictedFlapsIndex);
									speedConstraint = fmc.getManagedApproachSpeed(predictedFlapsIndex).toFixed(0);
								}
							}
							let altitudeConstraint = '-----';
							if (waypoint.legAltitudeDescription !== 0) {
								if (waypoint.legAltitudeDescription === 1) {
									if (waypoint.legAltitude1 >= fmc.transitionAltitude) {
										altitudeConstraint = 'FL' + (waypoint.legAltitude1 / 100).toFixed(0);
									} else {
										altitudeConstraint = waypoint.legAltitude1.toFixed(0);
									}
								}
								if (waypoint.legAltitudeDescription === 2) {
									altitudeConstraint = waypoint.legAltitude1.toFixed(0) + 'A';
								}
								if (waypoint.legAltitudeDescription === 3) {
									altitudeConstraint = waypoint.legAltitude1.toFixed(0) + 'B';
								} else if (waypoint.legAltitudeDescription === 4) {
									altitudeConstraint = 'FL' + ((waypoint.legAltitude1 + waypoint.legAltitude2) * 0.5 / 100).toFixed(0);
								}
							} else if (isDepartureWaypoint) {
								if (isLastDepartureWaypoint) {
									altitudeConstraint = 'FL' + fmc.cruiseFlightLevel;
								} else {
									altitudeConstraint = Math.floor(waypoint.cumulativeDistanceInFP * 0.14 * 6076.118 / 10).toFixed(0) + '0';
								}
							} else {
								if (isLastDepartureWaypoint || isFirstArrivalWaypoint) {
									altitudeConstraint = 'FL' + fmc.cruiseFlightLevel;
								}
							}
							rows[2 * i + 1][1] = speedConstraint + '/ ' + altitudeConstraint;
						}
					}
				}
			}
		}
		fmc.currentFlightPlanWaypointIndex = activeWaypoint + offset + step;
		let isMapModePlan = SimVar.GetSimVarValue('L:B787_MAP_MODE', 'number') === 3;
		if (isMapModePlan) {
			if (rows[2 * step + 1][0] != '') {
				if (!rows[2 * step + 1][1]) {
					rows[2 * step + 1][1] = '';
				}
				rows[2 * step + 1][2] = '<CTR>';
			} else {
				return B787_10_FMC_LegsPage.ShowPage1(fmc, 1, 0);
			}
			/*
			fmc.onRightInput[5] = () => {
				let newStep = step + 1;
				let newPage = currentPage;
				if (newStep > 4) {
					newStep = 0;
					newPage++;
				}
				if (newPage > pageCount) {
					newPage = 1;
				}
				B787_10_FMC_LegsPage.ShowPage1(fmc, newPage, newStep);
			};

			 */
		} else {
			/*
			fmc.onRightInput[5] = () => {
				new B787_10_FMC_RouteDataPage(fmc).showPage();
			};

			 */
		}

		/**
		 *
		 * TODO: Add "ActivateDirectTo" for enroute and departure waypoints
		 *
		 */

		let route2Legs = '\<RTE 2 LEGS';

		if (fmc.getIsRouteActivated()) {
			route2Legs = '\<ERASE';
			fmc.onLeftInput[5] = () => {
				fmc.flightPlanManager.setCurrentFlightPlanIndex(0, () => {
					SimVar.SetSimVarValue('L:FMC_FLIGHT_PLAN_IS_TEMPORARY', 'number', 0);
					SimVar.SetSimVarValue('L:MAP_SHOW_TEMPORARY_FLIGHT_PLAN', 'number', 0);
					fmc._isRouteActivated = false;
					SimVar.SetSimVarValue('L:FMC_EXEC_ACTIVE', 'number', 0);
					B787_10_FMC_LegsPage.ShowPage1(fmc, currentPage);
				});
				/* This is for extended DIRECT TO
				let setLocalVariables = async (callback = EmptyCallback.Void) => {
					delete fmc._activeExecHandlers['B78XH_DIRECT_TO_HANDLER'];
					fmc._shouldBeExecEmisssive = false;
					await SimVar.SetSimVarValue('L:FMC_EXEC_ACTIVE', 'Number', 0);
					await SimVar.SetSimVarValue("L:B78XH_PREVIEW_DIRECT_TO", "number", 0);
					callback();
				}

				setLocalVariables(() => {
					B787_10_FMC_LegsPage.ShowPage1(fmc, currentPage, step);
				})

				*/
			};
		}

		fmc.setTemplate([
			[(fmc.getIsRouteActivated() ? 'MOD' : 'ACT') + ' RTE 1 LEGS', currentPage.toFixed(0), pageCount.toFixed(0)],
			...rows,
			['__FMCSEPARATOR'],
			[route2Legs, isMapModePlan ? '<STEP' : '<RTE DATA']
		]);
		fmc.onPrevPage = () => {
			if (currentPage > 1) {
				B787_10_FMC_LegsPage.ShowPage1(fmc, currentPage - 1);
			}
		};
		fmc.onNextPage = () => {
			if (currentPage < pageCount) {
				B787_10_FMC_LegsPage.ShowPage1(fmc, currentPage + 1);
			}
		};
		fmc.updateSideButtonActiveStatus();
	}
}

B787_10_FMC_LegsPage._updateCounter = 0;
B787_10_FMC_LegsPage.DEBUG_SHOW_WAYPOINT_PHASE = false;
//# sourceMappingURL=B787_10_FMC_LegsPage.js.map