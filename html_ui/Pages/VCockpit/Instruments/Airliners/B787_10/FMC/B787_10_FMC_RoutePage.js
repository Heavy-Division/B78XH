// prototype singleton, this needs to be different ofc
let RoutePageInstance = undefined;

class B787_10_FMC_RoutePage {

	constructor(fmc) {
		this._fmc = fmc;
		this._isDirty = true;

		this._currentPage = 0;
		this._pageCount = 2;
		this._offset = 0;
		this._fplnVersion = -1;
		this._activeWptIndex = -1;

		this._lsk6Field = '';
		this._activateCell = '';
		this._modStr;
		this._originCell;
		this._destinationCell;
		this._distanceCell;
		this._flightNoCell;
		this._coRouteCell;
		this._airwayInput = '';
		this._airwayIndex = '';

		this._rows = [];
	}

	set currentPage(value) {
		this._currentPage = value;
		if (this._currentPage > (this._pageCount - 1)) {
			this._currentPage = 0;
		} else if (this._currentPage < 0) {
			this._currentPage = (this._pageCount - 1);
		}

		if (this._currentPage == 0) {
			this._offset = 0;
		} else {
			this._offset = ((this._currentPage - 1) * 5) + 1;
		}
	}

	gotoNextPage() {
		this.currentPage = this._currentPage + 1;
		this.update(true);
	}

	gotoPrevPage() {
		this.currentPage = this._currentPage - 1;
		this.update(true);
	}

	update(forceUpdate = false) {
		// check if active wpt changed
		const actWptIndex = this._fmc.flightPlanManager.getActiveWaypointIndex();
		if (this._activeWptIndex != actWptIndex) {
			this._activeWptIndex = actWptIndex;
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

	invalidate() {
		this._isDirty = true;
		this._fmc.clearDisplay();
		this.prerender();
		this.render();
		this.bindEvents();
		this._isDirty = false;
	}


	prerender() {
		const currentFp = this._fmc.flightPlanManager.getCurrentFlightPlan();

		if (this._currentPage == 0) {
			this._originCell = '□□□□';
			if (currentFp.hasOrigin) {
				this._originCell = this._fmc.flightPlanManager.getOrigin().ident;
			}

			this._originCell = this._fmc.makeSettable(this._originCell);

			this._destinationCell = '□□□□';
			if (currentFp.hasDestination) {
				this._destinationCell = this._fmc.flightPlanManager.getDestination().ident;
			}

			this._destinationCell = this._fmc.makeSettable(this._destinationCell);

			this._distanceCell = '----';
			if (currentFp.hasDestination && currentFp.hasOrigin) {
				this._distanceCell = Avionics.Utils.computeGreatCircleDistance(this._fmc.flightPlanManager.getOrigin().infos.coordinates, this._fmc.flightPlanManager.getDestination().infos.coordinates).toFixed(0);
			}

			this._flightNoCell = '--------';
			const flightNoValue = SimVar.GetSimVarValue('ATC FLIGHT NUMBER', 'string');
			if (flightNoValue) {
				this._flightNoCell = flightNoValue;
			}

			this._flightNoCell = this._fmc.makeSettable(this._flightNoCell);
			this._depRwyCell = '-----';
			const selectedDepRunway = this._fmc.flightPlanManager.getDepartureRunway();
			if (selectedDepRunway) {
				this._depRwyCell = 'RW' + selectedDepRunway.designation;
			}
			this._depRwyCell = this._fmc.makeSettable(this._depRwyCell);

			this._coRouteCell = '--------';
			if (this._fmc.coRoute) {
				this._coRouteCell = this._fmc.coRoute;
			}
			this._coRouteCell = this._fmc.makeSettable(this._coRouteCell);
		}

		if (this._fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
			this._fmc.fpHasChanged = true;
			this._lsk6Field = '<ERASE';
			this._activateCell = '<ACTIVATE';
		} else if (this._fmc.flightPlanManager.getCurrentFlightPlanIndex() === 0) {
			this._fmc.fpHasChanged = false;
			this._activateCell = '<PERF INIT';
			this._lsk6Field = '<RTE 2';
		}

		const currFplnVer = SimVar.GetSimVarValue(FlightPlanManager.FlightPlanVersionKey, 'number');
		if (this._fmc.fpHasChanged === true || this._fplnVersion < currFplnVer) {
			this._rows = B787_10_FMC_RoutePage._GetAllRows(this._fmc);
			this._fplnVersion = currFplnVer;

			// fill in empty row
			const emptyRow = new FpRow();
			const prevRow = this._rows[this._rows.length - 1];
			if (prevRow !== undefined) {
				if (this._airwayInput !== '') {
					emptyRow.airwayIn = this._airwayInput;
					emptyRow.fpIdx = this._airwayIndex;
					const idx = this._rows.findIndex(x => x.fpIdx === this._airwayIndex) + 1;
					this._rows.splice(idx, 0, emptyRow);
				} else {
					emptyRow.fpIdx = (prevRow.fpIdx + 2);
					this._rows.push(emptyRow);
				}
			} else {
				let emptyFixIndex = 1;
				const firstFix = this._fmc.flightPlanManager.getWaypoint(emptyFixIndex);
				if (firstFix && firstFix.isRunway) {
					emptyFixIndex++;
				}

				emptyRow.fpIdx = emptyFixIndex;
				this._rows.push(emptyRow);
			}
		}

		this._pageCount = Math.max(2, (Math.ceil((this._rows.length - 1) / 5) + 1));

		this._modStr = this._fmc.fpHasChanged ? 'MOD' : 'ACT';
	}

	render() {
		if (this._currentPage == 0) {
			this.renderMainPage();
		} else {
			this.renderRoutePage();
		}
	}

	renderMainPage() {
		this._fmc.setTemplate([
			['RTE 1', '1', this._pageCount.toFixed(0)],
			['ORIGIN', 'DEST'],
			[this._originCell, this._destinationCell],
			['RUNWAY', 'FLT NO'],
			[this._depRwyCell, this._flightNoCell],
			['ROUTE', 'CO ROUTE'],
			['\<REQUEST', this._coRouteCell],
			['ROUTE'],
			['\<REPORT', '<RTE COPY'],
			['ROUTE ---------------------------------'],
			['\<PRINT', '<ALTN'],
			[''],
			[this._lsk6Field, this._activateCell]
		]);
	}

	renderRoutePage() {
		const idx = this._offset;

		this._fmc.setTemplate([
			[this._modStr + ' RTE 1', (this._currentPage + 1) + '/' + this._pageCount],
			['VIA', 'TO'],
			this._rows[idx] ? this._rows[idx].getTemplate()[0] : [''],
			this._rows[idx] ? this._rows[idx].getTemplate()[1] : [''],
			this._rows[idx + 1] ? this._rows[idx + 1].getTemplate()[0] : [''],
			this._rows[idx + 1] ? this._rows[idx + 1].getTemplate()[1] : [''],
			this._rows[idx + 2] ? this._rows[idx + 2].getTemplate()[0] : [''],
			this._rows[idx + 2] ? this._rows[idx + 2].getTemplate()[1] : [''],
			this._rows[idx + 3] ? this._rows[idx + 3].getTemplate()[0] : [''],
			this._rows[idx + 3] ? this._rows[idx + 3].getTemplate()[1] : [''],
			this._rows[idx + 4] ? this._rows[idx + 4].getTemplate()[0] : [''],
			['__FMCSEPARATOR'],
			[this._lsk6Field, this._activateCell]
		]);
	}

	bindEvents() {
		if (this._currentPage == 0) {
			// main page
			this._fmc.onLeftInput[0] = () => {
				const value = this._fmc.inOut;
				if (value == '') {
					if (this._fmc.flightPlanManager.getOrigin()) {
						this._fmc.inOut = this._fmc.flightPlanManager.getOrigin().ident;
					}
				} else {
					this._fmc.clearUserInput();
					this.setOrigin(value.padEnd(4));
				}
			};

			this._fmc.onRightInput[0] = () => {
				const value = this._fmc.inOut;
				if (value == '') {
					if (this._fmc.flightPlanManager.getDestination()) {
						this._fmc.inOut = this._fmc.flightPlanManager.getDestination().ident;
					}
				} else {
					this._fmc.clearUserInput();
					this.setDestination(value.padEnd(4));
				}
			};

			if (this._fmc.flightPlanManager.getOrigin()) {
				this._fmc.onLeftInput[1] = () => {
					let value = this._fmc.inOut;
					this._fmc.clearUserInput();
					this._fmc.setOriginRunway(value, (result) => {
						if (result) {
							this.update(true);
						}
					});
				};
			}

			this._fmc.onRightInput[1] = () => {
				const value = this._fmc.inOut;
				this._fmc.clearUserInput();
				this._fmc.updateFlightNo(value, (result) => {
					if (result) {
						this.update(true);
					}
				});
			};

			if (HeavyDataStorage.get('SIMBRIEF_USERNAME') || HeavyDataStorage.get('SIMBRIEF_USERID')) {
				this._fmc.onLeftInput[2] = () => {
					new B787_10_FMC_RouteRequestPage(this._fmc).showPage();
				};
			}

		} else {
			// other pages
			for (let i = 0; i < 5; i++) {
				if (this._rows[i + this._offset]) {
					this.bindRowEvents(i);
				}
			}
		}

		// paging
		this._fmc.onPrevPage = () => {
			this.gotoPrevPage();
		};
		this._fmc.onNextPage = () => {
			this.gotoNextPage();
		};

		// exec stuff
		this._fmc.onLeftInput[5] = () => {
			if (this._lsk6Field === '<ACTIVATE') {
				if (this._fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
					this._airwayInput = '';
					this._airwayIndex = -1;
					this._fmc.fpHasChanged = false;
					this._fmc.eraseTemporaryFlightPlan(() => {
						this.update(true);
					});
				}
			}
		};

		this._fmc.onRightInput[5] = () => {
			if (this._activateCell == '<PERF INIT') {
				B787_10_FMC_PerfInitPage.ShowPage1(this._fmc);
			}
		};

		this._fmc.onExecPage = () => {
			if (this._fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
				this._airwayInput = '';
				this._airwayIndex = -1;
				if (!this._fmc.getIsRouteActivated()) {
					this._fmc.activateRoute();
				}
				this._fmc.refreshPageCallback = () => this.update(true); // TODO see why this would be needed
				this._fmc.onExecDefault();
			} else {
				this._fmc._isRouteActivated = false;
				this._fmc.fpHasChanged = false;
				this._fmc._activatingDirectTo = false;
			}
		};
		this._fmc.updateSideButtonActiveStatus();
	}

	/**
	 * Bind the LSK events to a plan row.
	 * @param {Number} lskIdx
	 */
	bindRowEvents(lskIdx) {
		if (this._currentPage > 0) {
			this._fmc.onLeftInput[lskIdx] = () => {
				const value = this._fmc.inOut;
				this._fmc.clearUserInput();
				this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
					const idx = lskIdx;
					const lastWpIdx = this._rows[idx + this._offset - 1].fpIdx;

					const lastWaypoint = this._fmc.flightPlanManager.getWaypoints()[lastWpIdx];
					if (lastWaypoint.infos instanceof WayPointInfo) {
						lastWaypoint.infos.UpdateAirway(value).then(() => {
							const airway = lastWaypoint.infos.airways.find(a => {
								return a.name === value;
							});
							if (airway) {
								this._airwayInput = airway.name;
								this._airwayIndex = lastWpIdx;
								this.update(true);
							} else {
								this._fmc.showErrorMessage('NO AIRWAY MATCH');
							}
						});
					}
				});
			};
		}

		this._fmc.onRightInput[lskIdx] = () => {
			const value = this._fmc.inOut;
			const idx = (this._currentPage > 0) ? lskIdx : 0;
			const row = this._rows[idx + this._offset];
			const wpIdx = row.fpIdx;

			if (value === FMCMainDisplay.clrValue) {
				this._fmc.clearUserInput();
				this._fmc.removeWaypoint(wpIdx, () => {
					this.update(true);
				});
			} else if (value.length > 0) {
				this._fmc.clearUserInput();
				if (this._airwayInput !== '') {
					this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
						this._fmc.getOrSelectWaypointByIdent(value, (wpt) => {
							if (!wpt) {
								this._fmc.showErrorMessage('NOT IN DATABASE');
							}
							const lastWpIdx = this._rows[idx + this._offset - 1].fpIdx;
							const lastWaypoint = this._fmc.flightPlanManager.getWaypoints()[lastWpIdx];
							lastWaypoint.infos.airwayOut = this._airwayInput;
							B787_10_FMC_RoutePage.insertWaypointsAlongAirway(this._fmc, wpt.ident, lastWpIdx, this._airwayInput, (result) => {
								if (result) {
									this._airwayInput = '';
									this._airwayIndex = -1;
									// console.log("added " + wpt.ident);
									this.update(true);
								} else {
									this._fmc.showErrorMessage('NOT ON AIRWAY');
								}
							});
						});
					});
				} else {
					const pilotWaypoint = this._fmc._pilotWaypoints._pilotWaypointArray.find(w => w.id == value);
					if (pilotWaypoint) {
						const pilotWaypointObject = CJ4_FMC_PilotWaypointParser.buildPilotWaypointFromExisting(pilotWaypoint.id, parseFloat(pilotWaypoint.la), parseFloat(pilotWaypoint.lo), this._fmc);
						this._fmc.ensureCurrentFlightPlanIsTemporary(() => {
							this._fmc.flightPlanManager.addUserWaypoint(pilotWaypointObject, wpIdx, () => {
								this._fmc.activateRoute(false, () => {
									this.update(true);
								});
							});
						});
					} else {
						this._fmc.insertWaypoint(value, wpIdx, (isSuccess) => {
							if (isSuccess) {
								this.update(true);
							}
						});
					}
				}
			} else {

			}
		};
	}

	setDestination(icao) {
		this._fmc.updateRouteDestination(icao, (result) => {
			if (result) {
				this._fmc.flightPlanManager.setApproachTransitionIndex(-1, () => {
					this._fmc.flightPlanManager.setArrivalProcIndex(-1, () => {
						this._fmc.flightPlanManager.setApproachIndex(-1, () => {
							this._fmc.fpHasChanged = true;
							this.update(true);
						});
					});
				});
			}
		});
	}

	setOrigin(icao) {
		if (!SimVar.GetSimVarValue('SIM ON GROUND', 'boolean')) {
			this._fmc.showErrorMessage('NOT ON GROUND');
			return;
		}

		this._fmc.tmpDestination = undefined;
		this._fmc.flightPlanManager.createNewFlightPlan(() => {
			this._fmc.updateRouteOrigin(icao, (result) => {
				if (result) {
					this._fmc.fpHasChanged = true;
					SimVar.SetSimVarValue('L:WT_CJ4_INHIBIT_SEQUENCE', 'number', 0);
					//this._fmc.updateVSpeeds();
					this._fmc.updateFuelVars();
					this.update(true);
				}
			});
		});
	}

	static ShowPage1(fmc) {
		fmc.clearDisplay();
		RoutePageInstance = new B787_10_FMC_RoutePage(fmc);
		RoutePageInstance.update();
	}

	static async insertWaypointsAlongAirway(fmc, lastWaypointIdent, index, airwayName, callback = EmptyCallback.Boolean) {
		const referenceWaypoint = fmc.flightPlanManager.getWaypoint(index);
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
								const syncInsertWaypointByIcao = async (icao, idx) => {
									return new Promise(resolve => {
										console.log('add icao:' + icao + ' @ ' + idx);
										fmc.flightPlanManager.addWaypoint(icao, idx, () => {
											const waypoint = fmc.flightPlanManager.getWaypoint(idx);
											waypoint.infos.UpdateAirway(airwayName).then(() => {
												waypoint.infos.airwayIn = airwayName;
												if (i < count) {
													waypoint.infos.airwayOut = airwayName;
												}
												console.log('icao:' + icao + ' added');
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
						fmc.showErrorMessage('2ND INDEX NOT FOUND');
						return callback(false);
					}
					fmc.showErrorMessage('1ST INDEX NOT FOUND');
					return callback(false);
				}
				fmc.showErrorMessage('NO REF WAYPOINT');
				return callback(false);
			}
			fmc.showErrorMessage('NO WAYPOINT INFOS');
			return callback(false);
		}
		fmc.showErrorMessage('NO REF WAYPOINT');
		return callback(false);
	}

	static _GetAllRows(fmc) {
		const allRows = [];
		const flightPlanManager = fmc.flightPlanManager;
		let lastDepartureWaypoint = undefined;
		let foundActive = false; // haaaaackyyy
		if (flightPlanManager) {
			const departure = flightPlanManager.getDeparture();
			if (departure) {
				const departureWaypoints = flightPlanManager.getDepartureWaypointsMap();
				const lastDepartureIdx = departureWaypoints.length - 1;
				lastDepartureWaypoint = departureWaypoints[lastDepartureIdx];
				if (lastDepartureWaypoint) {
					foundActive = flightPlanManager.getActiveWaypointIndex() <= lastDepartureIdx;
					allRows.push(new FpRow(lastDepartureWaypoint.ident, lastDepartureIdx + 1, departure.name, undefined, foundActive));
				}
			} else {
				allRows.push(new FpRow());
			}
			const fpIndexes = [];
			const routeWaypoints = flightPlanManager.getEnRouteWaypoints(fpIndexes);
			let tmpFoundActive = false;
			for (let i = 0; i < routeWaypoints.length; i++) {
				const prev = (i == 0) ? lastDepartureWaypoint : routeWaypoints[i - 1]; // check with dep on first waypoint
				const wp = routeWaypoints[i];
				if (wp) {

					tmpFoundActive = tmpFoundActive || (!foundActive && flightPlanManager.getActiveWaypointIndex() <= fpIndexes[i]);
					if (tmpFoundActive) {
						foundActive = true;
					}

					if (wp.infos.airwayIn !== undefined && prev && prev.infos.airwayOut === wp.infos.airwayIn) {
						// is there a next waypoint?
						const nextWp = routeWaypoints[i + 1];
						if (nextWp) {
							const airwayContinues = (wp.infos.airwayIn === wp.infos.airwayOut && nextWp.infos.airwayIn === wp.infos.airwayOut);
							if (airwayContinues) {
								continue;
							}
						}
						allRows.push(new FpRow(wp.ident, fpIndexes[i], wp.infos.airwayIn, wp.infos.airwayOut, tmpFoundActive));
						tmpFoundActive = false;
					} else {
						allRows.push(new FpRow(wp.ident, fpIndexes[i], undefined, wp.infos.airwayOut, tmpFoundActive));
						tmpFoundActive = false;
					}
				}
			}

			/** @type {ManagedFlightPlan} */
			const fpln = flightPlanManager.getCurrentFlightPlan();

			const arrivalSeg = fpln.getSegment(SegmentType.Arrival);
			if (arrivalSeg !== FlightPlanSegment.Empty) {
				const arrival = flightPlanManager.getArrival();
				const currentWaypointIndex = fpln.activeWaypointIndex;

				if (arrival) {
					const transitionIndex = fpln.procedureDetails.arrivalTransitionIndex;
					const transition = arrival.enRouteTransitions[transitionIndex];
					const arrivalName = transitionIndex !== -1 && transition
						? `${transition.name}.${arrival.name}`
						: `${arrival.name}`;

					const finalFix = arrivalSeg.waypoints[arrivalSeg.waypoints.length - 1];
					const isSegmentActive = currentWaypointIndex >= arrivalSeg.offset && currentWaypointIndex < arrivalSeg.offset + arrivalSeg.waypoints.length;

					allRows.push(new FpRow(finalFix.ident, arrivalSeg.offset, arrivalName, undefined, isSegmentActive));
				}
			}

			/** @type {FlightPlanSegment} */
			const approachSeg = fpln.getSegment(SegmentType.Approach);
			if (approachSeg !== FlightPlanSegment.Empty) {
				// first app fix
				const fWp = approachSeg.waypoints[0];
				const fFpIdx = approachSeg.offset;
				let tmpFoundActive = !foundActive && flightPlanManager.getActiveWaypointIndex() <= fFpIdx;
				if (tmpFoundActive) {
					foundActive = true;
				}
				allRows.push(new FpRow(fWp.ident, fFpIdx, undefined, undefined, tmpFoundActive));

				// last app fix
				let appName = (flightPlanManager.getAirportApproach() !== undefined) ? flightPlanManager.getAirportApproach().name : 'APP';
				appName = `${allRows[allRows.length - 1].ident}.${appName}`;
				const wp = approachSeg.waypoints[approachSeg.waypoints.length - 1];
				const fpIdx = approachSeg.offset + (approachSeg.waypoints.length - 1);
				tmpFoundActive = !foundActive && flightPlanManager.getActiveWaypointIndex() <= fpIdx;
				if (tmpFoundActive) {
					foundActive = true;
				}
				allRows.push(new FpRow(wp.ident, fpIdx, appName, undefined, tmpFoundActive));
			}

		}
		return allRows;
	}
}


class B787_10_FMC_RoutePage2 {
	static ShowPage1(fmc) {
		fmc.clearDisplay();
		let originCell = '□□□□';
		if (fmc && fmc.flightPlanManager) {
			let origin = fmc.flightPlanManager.getOrigin();
			if (origin) {
				originCell = origin.ident;
			} else if (fmc.tmpOrigin) {
				originCell = fmc.tmpOrigin;
			}
		}

		originCell = fmc.makeSettable(originCell);
		fmc.onLeftInput[0] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			fmc.updateRouteOrigin(value, (result) => {
				if (result) {
					B787_10_FMC_RoutePage.ShowPage1(fmc);
				}
			});
		};
		let destinationCell = '□□□□';
		if (fmc && fmc.flightPlanManager) {
			let destination = fmc.flightPlanManager.getDestination();
			if (destination) {
				destinationCell = destination.ident;
			} else if (fmc.tmpDestination) {
				destinationCell = fmc.tmpDestination;
			}
		}

		destinationCell = fmc.makeSettable(destinationCell);
		fmc.onRightInput[0] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			fmc.updateRouteDestination(value, (result) => {
				if (result) {
					B787_10_FMC_RoutePage.ShowPage1(fmc);
				}
			});
		};
		let flightNoCell = '--------';
		let flightNoValue = SimVar.GetSimVarValue('ATC FLIGHT NUMBER', 'string');
		if (flightNoValue) {
			flightNoCell = flightNoValue;
		}

		flightNoCell = fmc.makeSettable(flightNoCell);
		fmc.onRightInput[1] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			fmc.updateFlightNo(value, (result) => {
				if (result) {
					B787_10_FMC_RoutePage.ShowPage1(fmc);
				}
			});
		};
		let coRouteCell = '--------';
		if (fmc.coRoute) {
			coRouteCell = fmc.coRoute;
		}
		coRouteCell = fmc.makeSettable(coRouteCell);
		fmc.onRightInput[2] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			fmc.updateCoRoute(value, (result) => {
				if (result) {
					B787_10_FMC_RoutePage.ShowPage1(fmc);
				}
			});
		};
		let allRows = B787_10_FMC_RoutePage._GetAllRows(fmc);
		let pageCount = (Math.floor(allRows.length / 4) + 2);
		let activateCell = '';
		if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
			if (!fmc.getIsRouteActivated()) {
				activateCell = '<ACTIVATE';
				fmc.onRightInput[5] = () => {
					fmc.activateRoute();
					B787_10_FMC_RoutePage.ShowPage1(fmc);
				};
			}
		}
		if (activateCell === '') {
			activateCell = '<PERF INIT';
			fmc.onRightInput[5] = () => {
				B787_10_FMC_PerfInitPage.ShowPage1(fmc);
			};
		}
		let runwayCell = '-----';
		let runway = fmc.flightPlanManager.getDepartureRunway();
		if (runway) {
			runwayCell = Avionics.Utils.formatRunway(runway.designation);
		}

		runwayCell = fmc.makeSettable(runwayCell);
		if (fmc.flightPlanManager.getOrigin()) {
			fmc.onLeftInput[1] = () => {
				let value = fmc.inOut;
				fmc.clearUserInput();
				fmc.setOriginRunway(value, (result) => {
					if (result) {
						B787_10_FMC_RoutePage.ShowPage1(fmc);
					}
				});
			};
		}

		if (HeavyDataStorage.get('SIMBRIEF_USERNAME') || HeavyDataStorage.get('SIMBRIEF_USERID')) {
			fmc.onLeftInput[2] = () => {
				new B787_10_FMC_RouteRequestPage(fmc).showPage();
			};
		}

		fmc.setTemplate([
			['RTE 1', '1', pageCount.toFixed(0)],
			['ORIGIN', 'DEST'],
			[originCell, destinationCell],
			['RUNWAY', 'FLT NO'],
			[runwayCell, flightNoCell],
			['ROUTE', 'CO ROUTE'],
			['\<REQUEST', coRouteCell],
			['ROUTE'],
			['\<REPORT', '<RTE COPY'],
			['ROUTE ---------------------------------'],
			['\<PRINT', '<ALTN'],
			[''],
			['\<RTE 2', activateCell]
		]);
		fmc.onNextPage = () => {
			B787_10_FMC_RoutePage.ShowPage2(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}


	static ShowPage2(fmc, offset = 0, pendingAirway, discontinuity = -1) {
		fmc.clearDisplay();
		const currentFp = fmc.flightPlanManager.getCurrentFlightPlan();

		if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
			fmc.fpHasChanged = true;
			this._lsk6Field = '<ERASE';
			this._activateCell = '<ACTIVATE';
		} else if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 0) {
			fmc.fpHasChanged = false;
			this._activateCell = '<PERF INIT';
			this._lsk6Field = '<RTE 2';
		}

		const currFplnVer = SimVar.GetSimVarValue(FlightPlanManager.FlightPlanVersionKey, 'number');


		if (fmc.fpHasChanged === true || this._fplnVersion < currFplnVer) {
			this._rows = B787_10_FMC_RoutePage._GetAllRows(fmc);
			this._fplnVersion = currFplnVer;

			// fill in empty row
			const emptyRow = new FpRow();
			const prevRow = this._rows[this._rows.length - 1];
			if (prevRow !== undefined) {
				if (this._airwayInput !== '') {
					emptyRow.airwayIn = this._airwayInput;
					emptyRow.fpIdx = this._airwayIndex;
					const idx = this._rows.findIndex(x => x.fpIdx === this._airwayIndex) + 1;
					this._rows.splice(idx, 0, emptyRow);
				} else {
					emptyRow.fpIdx = (prevRow.fpIdx + 2);
					this._rows.push(emptyRow);
				}
			} else {
				let emptyFixIndex = 1;
				const firstFix = this._fmc.flightPlanManager.getWaypoint(emptyFixIndex);
				if (firstFix && firstFix.isRunway) {
					emptyFixIndex++;
				}

				emptyRow.fpIdx = emptyFixIndex;
				this._rows.push(emptyRow);
			}
		}

		let pageCount = Math.max(2, (Math.ceil((this._rows.length - 1) / 5) + 1));

		let page = (2 + (Math.floor(offset / 4)));

		let idx = offset;

		fmc.setTemplate([
			['RTE 1', page.toFixed(0), pageCount.toFixed(0)],
			['VIA', 'TO'],
			this._rows[idx] ? this._rows[idx].getTemplate()[0] : [''],
			this._rows[idx] ? this._rows[idx].getTemplate()[1] : [''],
			this._rows[idx + 1] ? this._rows[idx + 1].getTemplate()[0] : [''],
			this._rows[idx + 1] ? this._rows[idx + 1].getTemplate()[1] : [''],
			this._rows[idx + 2] ? this._rows[idx + 2].getTemplate()[0] : [''],
			this._rows[idx + 2] ? this._rows[idx + 2].getTemplate()[1] : [''],
			this._rows[idx + 3] ? this._rows[idx + 3].getTemplate()[0] : [''],
			this._rows[idx + 3] ? this._rows[idx + 3].getTemplate()[1] : [''],
			this._rows[idx + 4] ? this._rows[idx + 4].getTemplate()[0] : [''],
			[this._lsk6Field, this._activateCell]
		]);

		fmc.updateSideButtonActiveStatus();
	}


	static ShowPage2Old(fmc, offset = 0, pendingAirway, discontinuity = -1) {
		fmc.clearDisplay();
		let rows = [['----'], [''], [''], [''], ['']];
		let allRows = B787_10_FMC_RoutePage._GetAllRows(fmc);
		let page = (2 + (Math.floor(offset / 4)));
		let pageCount = (Math.floor(allRows.length / 4) + 2);
		let showInput = false;
		let discontinued = false;
		if (discontinuity >= allRows.length) {
			discontinuity = -1;
		}
		for (let i = 0; i < rows.length; i++) {
			let ii = i + offset + (discontinued ? -1 : 0);
			if (allRows[ii]) {
				rows[i] = [allRows[ii][0], allRows[ii][1]];
				let waypointFlightPlanIndex = ii + fmc.flightPlanManager.getDepartureWaypointsCount() + (fmc.flightPlanManager.getDepartureProcIndex() > -1 ? 0 : 1);
				if (!discontinued && i + offset === discontinuity) {
					rows[i] = ['-----', '-----'];
					discontinued = true;
					fmc.onRightInput[i] = () => {
						let value = fmc.inOut;
						if (value.length > 0) {
							fmc.clearUserInput();
							fmc.insertWaypoint(value, waypointFlightPlanIndex, () => {
								B787_10_FMC_RoutePage.ShowPage2(fmc, offset);
							});
						}
					};
				} else {
					fmc.onLeftInput[i] = () => {
						let value = fmc.inOut;
						if (value === 'DELETE') {
							fmc.inOut = '';
							let toDelete = allRows[ii][2] + fmc.flightPlanManager.getDepartureWaypointsCount() + (fmc.flightPlanManager.getDepartureProcIndex() > -1 ? 0 : 1);
							let count = allRows[ii][3];
							let departure = fmc.flightPlanManager.getDeparture();
							let lastDepartureWaypoint;

							if (departure) {
								let departureWaypoints = fmc.flightPlanManager.getDepartureWaypointsMap();
								lastDepartureWaypoint = departureWaypoints[departureWaypoints.length - 1];
								if (lastDepartureWaypoint && allRows[ii][1] === lastDepartureWaypoint.ident) {
									fmc.flightPlanManager.removeDeparture(() => {
										B787_10_FMC_RoutePage.ShowPage2(fmc, offset, pendingAirway, ii);
									});
								} else {
									for (i = toDelete; i > toDelete - count; i--) {
										fmc.removeWaypoint(i, () => {
											B787_10_FMC_RoutePage.ShowPage2(fmc, offset, pendingAirway, ii);
										});
									}
								}
							}
						}
					};

					fmc.onRightInput[i] = () => {
						let value = fmc.inOut;
						if (value === 'DELETE') {
							fmc.inOut = '';
							let toDelete = allRows[ii][2] + fmc.flightPlanManager.getDepartureWaypointsCount() + (fmc.flightPlanManager.getDepartureProcIndex() > -1 ? 0 : 1);
							let count = allRows[ii][3];
							let departure = fmc.flightPlanManager.getDeparture();
							let lastDepartureWaypoint;

							if (departure) {
								let departureWaypoints = fmc.flightPlanManager.getDepartureWaypointsMap();
								lastDepartureWaypoint = departureWaypoints[departureWaypoints.length - 1];
								if (lastDepartureWaypoint && allRows[ii][1] === lastDepartureWaypoint.ident) {
									fmc.flightPlanManager.removeDeparture(() => {
										B787_10_FMC_RoutePage.ShowPage2(fmc, offset, pendingAirway, ii);
									});
								} else {
									for (i = toDelete; i > toDelete - count; i--) {
										fmc.removeWaypoint(i, () => {
											B787_10_FMC_RoutePage.ShowPage2(fmc, offset, pendingAirway, ii);
										});
									}
								}
							}
						} else if (value.length > 0) {
							fmc.clearUserInput();
							fmc.insertWaypoint(value, waypointFlightPlanIndex, () => {
								B787_10_FMC_RoutePage.ShowPage2(fmc, offset);
							});
						}
					};
				}
			} else if (!showInput) {
				showInput = true;
				if (!pendingAirway) {
					rows[i] = ['-----', '-----'];
					fmc.onRightInput[i] = async () => {
						let value = fmc.inOut;
						if (value.length > 0) {
							fmc.clearUserInput();
							fmc.insertWaypoint(value, fmc.flightPlanManager.getEnRouteWaypointsLastIndex() + 1, () => {
								B787_10_FMC_RoutePage.ShowPage2(fmc, offset);
							});
						}
					};
					fmc.onLeftInput[i] = async () => {
						let value = fmc.inOut;
						if (value.length > 0) {
							fmc.clearUserInput();
							let lastWaypoint = fmc.flightPlanManager.getWaypoints()[fmc.flightPlanManager.getEnRouteWaypointsLastIndex()];
							if (lastWaypoint.infos instanceof IntersectionInfo || lastWaypoint.infos instanceof VORInfo || lastWaypoint.infos instanceof NDBInfo) {
								lastWaypoint.infos.UpdateAirway(value).then(() => {
									let airway = lastWaypoint.infos.airways.find(a => {
										return a.name === value;
									});
									if (airway) {
										B787_10_FMC_RoutePage.ShowPage2(fmc, offset, airway);
									} else {
										fmc.showErrorMessage('NOT IN DATABASE');
									}
								});
							}
						}
					};
				} else {
					rows[i] = [pendingAirway.name, '-----'];
					fmc.onRightInput[i] = () => {
						let value = fmc.inOut;
						if (value.length > 0) {
							fmc.clearUserInput();
							fmc.insertWaypointsAlongAirway(value, fmc.flightPlanManager.getEnRouteWaypointsLastIndex() + 1, pendingAirway.name, (result) => {
								if (result) {
									B787_10_FMC_RoutePage.ShowPage2(fmc, offset);
								}
							});
						}
					};
					if (rows[i + 1]) {
						rows[i + 1] = ['-----'];
					}
				}
			}
		}
		let activateCell = '';
		if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
			if (!fmc.getIsRouteActivated()) {
				activateCell = '<ACTIVATE';
				fmc.onRightInput[5] = () => {
					fmc.activateRoute();
					B787_10_FMC_RoutePage.ShowPage1(fmc);
				};
			}
		} else {
			activateCell = '<PERF INIT';
			fmc.onRightInput[5] = () => {
				fmc.activateRoute();
				B787_10_FMC_PerfInitPage.ShowPage1(fmc);
			};
		}
		fmc.setTemplate([
			['RTE 1', page.toFixed(0), pageCount.toFixed(0)],
			['VIA', 'TO'],
			rows[0],
			[''],
			rows[1],
			[''],
			rows[2],
			[''],
			rows[3],
			[''],
			rows[4],
			[''],
			['\<RTE 2', activateCell]
		]);
		fmc.onPrevPage = () => {
			if (offset === 0) {
				B787_10_FMC_RoutePage.ShowPage1(fmc);
			} else {
				B787_10_FMC_RoutePage.ShowPage2(fmc, offset - 4, pendingAirway, discontinuity);
			}
		};
		fmc.onNextPage = () => {
			if (offset + 4 < allRows.length) {
				B787_10_FMC_RoutePage.ShowPage2(fmc, offset + 4, pendingAirway, discontinuity);
			}
		};
		fmc.updateSideButtonActiveStatus();
	}

	static _GetAllRows(fmc) {
		const allRows = [];
		const flightPlanManager = fmc.flightPlanManager;
		let lastDepartureWaypoint = undefined;
		let foundActive = false; // haaaaackyyy
		if (flightPlanManager) {
			const departure = flightPlanManager.getDeparture();
			if (departure) {
				const departureWaypoints = flightPlanManager.getDepartureWaypointsMap();
				const lastDepartureIdx = departureWaypoints.length - 1;
				lastDepartureWaypoint = departureWaypoints[lastDepartureIdx];
				if (lastDepartureWaypoint) {
					foundActive = flightPlanManager.getActiveWaypointIndex() <= lastDepartureIdx;
					allRows.push(new FpRow(lastDepartureWaypoint.ident, lastDepartureIdx + 1, departure.name, undefined, foundActive));
				}
			}
			const fpIndexes = [];
			const routeWaypoints = flightPlanManager.getEnRouteWaypoints(fpIndexes);
			let tmpFoundActive = false;
			for (let i = 0; i < routeWaypoints.length; i++) {
				const prev = (i == 0) ? lastDepartureWaypoint : routeWaypoints[i - 1]; // check with dep on first waypoint
				const wp = routeWaypoints[i];
				if (wp) {

					tmpFoundActive = tmpFoundActive || (!foundActive && flightPlanManager.getActiveWaypointIndex() <= fpIndexes[i]);
					if (tmpFoundActive) {
						foundActive = true;
					}

					if (wp.infos.airwayIn !== undefined && prev && prev.infos.airwayOut === wp.infos.airwayIn) {
						// is there a next waypoint?
						const nextWp = routeWaypoints[i + 1];
						if (nextWp) {
							const airwayContinues = (wp.infos.airwayIn === wp.infos.airwayOut && nextWp.infos.airwayIn === wp.infos.airwayOut);
							if (airwayContinues) {
								continue;
							}
						}
						allRows.push(new FpRow(wp.ident, fpIndexes[i], wp.infos.airwayIn, wp.infos.airwayOut, tmpFoundActive));
						tmpFoundActive = false;
					} else {
						allRows.push(new FpRow(wp.ident, fpIndexes[i], undefined, wp.infos.airwayOut, tmpFoundActive));
						tmpFoundActive = false;
					}
				}
			}

			/** @type {ManagedFlightPlan} */
			const fpln = flightPlanManager.getCurrentFlightPlan();

			const arrivalSeg = fpln.getSegment(SegmentType.Arrival);
			if (arrivalSeg !== FlightPlanSegment.Empty) {
				const arrival = flightPlanManager.getArrival();
				const currentWaypointIndex = fpln.activeWaypointIndex;

				if (arrival) {
					const transitionIndex = fpln.procedureDetails.arrivalTransitionIndex;
					const transition = arrival.enRouteTransitions[transitionIndex];
					const arrivalName = transitionIndex !== -1 && transition
						? `${transition.name}.${arrival.name}`
						: `${arrival.name}`;

					const finalFix = arrivalSeg.waypoints[arrivalSeg.waypoints.length - 1];
					const isSegmentActive = currentWaypointIndex >= arrivalSeg.offset && currentWaypointIndex < arrivalSeg.offset + arrivalSeg.waypoints.length;

					allRows.push(new FpRow(finalFix.ident, arrivalSeg.offset, arrivalName, undefined, isSegmentActive));
				}
			}

			/** @type {FlightPlanSegment} */
			const approachSeg = fpln.getSegment(SegmentType.Approach);
			if (approachSeg !== FlightPlanSegment.Empty) {
				// first app fix
				const fWp = approachSeg.waypoints[0];
				const fFpIdx = approachSeg.offset;
				let tmpFoundActive = !foundActive && flightPlanManager.getActiveWaypointIndex() <= fFpIdx;
				if (tmpFoundActive) {
					foundActive = true;
				}
				allRows.push(new FpRow(fWp.ident, fFpIdx, undefined, undefined, tmpFoundActive));

				// last app fix
				let appName = (flightPlanManager.getAirportApproach() !== undefined) ? flightPlanManager.getAirportApproach().name : 'APP';
				appName = `${allRows[allRows.length - 1].ident}.${appName}`;
				const wp = approachSeg.waypoints[approachSeg.waypoints.length - 1];
				const fpIdx = approachSeg.offset + (approachSeg.waypoints.length - 1);
				tmpFoundActive = !foundActive && flightPlanManager.getActiveWaypointIndex() <= fpIdx;
				if (tmpFoundActive) {
					foundActive = true;
				}
				allRows.push(new FpRow(wp.ident, fpIdx, appName, undefined, tmpFoundActive));
			}

		}
		return allRows;
	}

	static _GetAllRows2(fmc) {
		let allRows = [];
		let flightPlan = fmc.flightPlanManager;
		if (flightPlan) {
			let departure = flightPlan.getDeparture();
			let lastDepartureWaypoint;
			if (departure) {
				let departureWaypoints = flightPlan.getDepartureWaypointsMap();
				lastDepartureWaypoint = departureWaypoints[departureWaypoints.length - 1];
				if (lastDepartureWaypoint) {
					allRows.push([departure.name, lastDepartureWaypoint.ident, 0, departureWaypoints.length]);
				}
			}
			let routeWaypoints = flightPlan.getEnRouteWaypoints();
			let lastAirwayName = '';
			let lastInserted = undefined;
			let airwayCount = 1;
			let popNext = true;
			for (let i = 0; i < routeWaypoints.length; i++) {
				let prev = routeWaypoints[i - 1];
				if (i === 0 && lastDepartureWaypoint) {
					prev = lastDepartureWaypoint;
				}
				let wp = routeWaypoints[i];
				let legIndex = (departure ? i + 1 : i);
				if (wp) {
					let prevAirway = wp.infos.airwayIn;
					if (!prevAirway) {
						airwayCount = 1;
						lastInserted = ['DIRECT', wp.ident, legIndex, airwayCount];
						allRows.push(lastInserted);
					} else {
						if (lastAirwayName === prevAirway) {
							if (popNext) {
								airwayCount = airwayCount + 1;
								allRows.pop();
							}
							popNext = true;
							lastInserted = [prevAirway, wp.ident, legIndex, airwayCount];
						} else {
							airwayCount = 1;
							lastInserted = [prevAirway, wp.ident, legIndex, airwayCount];
						}
						lastAirwayName = prevAirway;
						allRows.push(lastInserted);
					}
				}
			}
		}
		return allRows;
	}
}

class FpRow {
	constructor(ident = '-----', fpIdx = Infinity, airwayIn = undefined, airwayOut = undefined, isActive = false) {
		this._ident = ident;
		this._fpIdx = fpIdx;
		this._airwayIn = airwayIn;
		this._airwayOut = airwayOut;
		this._isActive = isActive;
	}

	get ident() {
		return this._ident;
	}

	set ident(val) {
		this._ident = val;
	}

	get fpIdx() {
		return this._fpIdx;
	}

	set fpIdx(val) {
		this._fpIdx = val;
	}

	get airwayOut() {
		return this._airwayOut;
	}

	set airwayOut(val) {
		this._airwayOut = val;
	}

	get airwayIn() {
		return this._airwayIn;
	}

	set airwayIn(val) {
		this._airwayIn = val;
	}

	getTemplate() {
		let row1tmpl, row2tmpl = ['', ''];
		if (this._airwayIn === undefined) {
			if (this._ident !== '-----') {
				row1tmpl = ['DIRECT', this._ident];
			} else {
				row1tmpl = ['-----', this._ident];

			}
		} else {
			row1tmpl = [this._airwayIn, this._ident];
			if (this._ident === '-----') {
				row1tmpl[1] = '□□□□□';
				row2tmpl = ['----', '----', 'DISCONTINUITY'];
			}
		}

		if (this._isActive) {
			row1tmpl[0] += '';
			row1tmpl[1] += '';
		}

		return [row1tmpl, row2tmpl];
	}
}

//# sourceMappingURL=B787_10_FMC_RoutePage.js.map