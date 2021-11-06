import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_RoutePage} from './B787_10_FMC_RoutePage';

export class B787_10_FMC_DepArrPage {
	static ShowPage1(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
		let rowOrigin = [''];
		let origin = fmc.flightPlanManager.getOrigin();
		if (origin) {
			rowOrigin = ['<DEP', origin.ident, '', ''];
			fmc._renderer.lsk(1).event = () => {
				B787_10_FMC_DepArrPage.ShowDeparturePage(fmc);
			};
		}
		let rowDestination = [''];
		let destination = fmc.flightPlanManager.getDestination();
		if (destination) {
			rowDestination = ['', '', destination.ident, 'ARR>'];
			fmc._renderer.rsk(2).event = () => {
				B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
			};
		}

		fmc._renderer.renderTitle('DEP/ARR INDEX');
		fmc._renderer.render([
			['', 'ACT FPLN', ''],
			rowOrigin,
			[''],
			rowDestination,
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			['']
		]);
	}

	static ShowDeparturePage(fmc: B787_10_FMC, currentPage = 1) {
		fmc.cleanUpPage();
		let originIdent = '';
		let modStr = 'ACT';
		let origin = fmc.flightPlanManager.getOrigin();
		if (origin) {
			originIdent = origin.ident;
		}
		let rows = [
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
		let runways = [];
		let displayableRunwaysCount = 0;
		let departures = [];
		let selectedDeparture;
		let displayableDeparturesCount = 0;
		let displayableDpEnrouteTransitionsCount = 0;
		let selectedRunway = fmc.flightPlanManager.getDepartureRunway();
		if (origin) {
			let airportInfo = origin.infos;
			if (airportInfo instanceof AirportInfo) {
				let departureRunway = fmc.flightPlanManager.getDepartureRunway();
				if (departureRunway) {
					selectedRunway = departureRunway;
				}
				runways = airportInfo.oneWayRunways;
				selectedDeparture = airportInfo.departures[fmc.flightPlanManager.getDepartureProcIndex()];
				departures = airportInfo.departures;
			}
		}
		if (selectedRunway) {
			rows[0] = ['', '', '<SEL>', Avionics.Utils.formatRunway(selectedRunway.designation)];
			fmc._renderer.rsk(1).event = () => {
				fmc.flightPlanManager.pauseSync();
				fmc.setRunwayIndex(-1, () => {
					fmc.setDepartureIndex(-1, () => {
						fmc.flightPlanManager.resumeSync();
						fmc.activateRoute();
						B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, currentPage);
					});
				});
			};
		} else {
			let runwayPages = [[]];
			let rowIndex = 0;
			let pageIndex = 0;
			for (let i = 0; i < runways.length; i++) {
				let runway = runways[i];
				let appendRow = false;
				let index = i;
				if (!selectedDeparture) {
					appendRow = true;
					displayableRunwaysCount++;
				} else {
					for (let j = 0; j < selectedDeparture.runwayTransitions.length; j++) {
						if (selectedDeparture.runwayTransitions[j].name.indexOf(runway.designation) !== -1) {
							appendRow = true;
							displayableRunwaysCount++;
							index = j;
							break;
						}
					}
				}
				if (appendRow) {
					if (rowIndex === 5) {
						pageIndex++;
						rowIndex = 0;
						runwayPages[pageIndex] = [];
					}
					runwayPages[pageIndex][rowIndex] = {
						text: Avionics.Utils.formatRunway(runway.designation),
						runwayIndex: index
					};
					rowIndex++;
				}
			}
			let displayedPageIndex = Math.min(currentPage, runwayPages.length) - 1;
			for (let i = 0; i < runwayPages[displayedPageIndex].length; i++) {
				let runwayIndex = runwayPages[displayedPageIndex][i].runwayIndex;
				rows[2 * i] = ['', runwayPages[displayedPageIndex][i].text];
				fmc._renderer.rsk(i + 1).event = () => {
					if (fmc.flightPlanManager.getDepartureProcIndex() === -1) {
						fmc.setOriginRunwayIndex(runwayIndex, () => {
							fmc.activateRoute();
							B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, undefined);
						});
					} else {
						fmc.setRunwayIndex(runwayIndex, () => {
							fmc.activateRoute();
							B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, undefined);
						});
					}
				};
			}
		}

		if (selectedDeparture) {
			rows[0][0] = selectedDeparture.name;
			rows[0][1] = '<SEL>';
			fmc._renderer.lsk(1).event = () => {
				fmc.flightPlanManager.pauseSync();
				fmc.setRunwayIndex(-1, () => {
					fmc.setDepartureIndex(-1, () => {
						fmc.flightPlanManager.resumeSync();
						fmc.activateRoute();
						B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, currentPage);
					});
				});
			};
			rows[1][0] = ' TRANS';
			let selectedDpEnrouteTransitionIndex = fmc.flightPlanManager.getDepartureEnRouteTransitionIndex();
			let selectedDpEnrouteTransition = selectedDeparture.enRouteTransitions[selectedDpEnrouteTransitionIndex];
			if (selectedDpEnrouteTransition) {
				rows[2][0] = selectedDpEnrouteTransition.name.trim();
				fmc._renderer.lsk(2).event = () => {
					fmc.setDepartureEnrouteTransitionIndex(-1, () => {
						fmc.activateRoute();
						B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, currentPage);
					});
				};
			} else {
				displayableDpEnrouteTransitionsCount = selectedDeparture.enRouteTransitions.length;
				let maxDpEnrouteTransitionPageIndex = Math.max(Math.ceil(displayableDpEnrouteTransitionsCount / 4), 1) - 1;
				let displayedDpEnrouteTransitionPageIndex = Math.min(currentPage - 1, maxDpEnrouteTransitionPageIndex);
				for (let i = 0; i < 4; i++) {
					let enrouteDpTransitionIndex = 4 * displayedDpEnrouteTransitionPageIndex + i;
					let enrouteDpTransition = selectedDeparture.enRouteTransitions[enrouteDpTransitionIndex];
					if (enrouteDpTransition) {
						let enrouteDpTransitionName = enrouteDpTransition.name.trim();
						rows[2 * (i + 1)][0] = enrouteDpTransitionName;
						fmc._renderer.lsk(i + 2).event = () => {
							fmc.setDepartureEnrouteTransitionIndex(enrouteDpTransitionIndex, () => {
								fmc.activateRoute();
								B787_10_FMC_DepArrPage.ShowDeparturePage(fmc);
							});
						};
					}
				}
			}

		} else {
			let departurePages = [[]];
			let rowIndex = 0;
			let pageIndex = 0;
			for (let i = 0; i < departures.length; i++) {
				let departure = departures[i];
				let appendRow = false;
				// No runway selected? -> show all departures
				if (!selectedRunway) {
					appendRow = true;
					displayableDeparturesCount++;
				}
				// runway selected? -> show applicable departures
				else {
					for (let j = 0; j < departure.runwayTransitions.length; j++) {
						if (departure.runwayTransitions[j].name.indexOf(selectedRunway.designation) !== -1) {
							appendRow = true;
							displayableDeparturesCount++;
							break;
						}
					}
				}
				// distribute rows accross pages
				if (appendRow) {
					if (rowIndex === 5) {
						pageIndex++;
						rowIndex = 0;
						departurePages[pageIndex] = [];
					}
					departurePages[pageIndex][rowIndex] = {
						text: departure.name,
						departureIndex: i
					};
					rowIndex++;
				}
			}
			// choose page to display: normally "currentPage", but fall back to the last page with data, if necessary
			let displayedPageIndex = Math.min(currentPage, departurePages.length) - 1;
			for (let i = 0; i < departurePages[displayedPageIndex].length; i++) {
				let departureIndex = departurePages[displayedPageIndex][i].departureIndex;
				rows[2 * i][0] = departurePages[displayedPageIndex][i].text;
				fmc._renderer.lsk(i + 1).event = () => {
					fmc.flightPlanManager.pauseSync();
					fmc.setDepartureIndex(departureIndex, () => {
						fmc.flightPlanManager.resumeSync();
						fmc.activateRoute();
						B787_10_FMC_DepArrPage.ShowDeparturePage(fmc);
					});
				};
			}
		}

		let rowsCountOf5RowsPerPageData = Math.max(displayableRunwaysCount, displayableDeparturesCount);
		let rowsCountOf4RowsPerPageData = displayableDpEnrouteTransitionsCount;
		let pageCountOf5RowsPerPageData = Math.ceil(rowsCountOf5RowsPerPageData / 5);
		let pageCountOf4RowsPerPageData = Math.ceil(rowsCountOf4RowsPerPageData / 4);
		let pageCount = Math.max(Math.max(pageCountOf5RowsPerPageData, pageCountOf4RowsPerPageData), 1);


		//start of CWB EXEC handling
		let lsk6Field = '';
		if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
			fmc.fpHasChanged = true;
			lsk6Field = '<ERASE';
		} else if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 0) {
			lsk6Field = '<INDEX';
			fmc.fpHasChanged = false;
		}
		fmc.onExecPage = () => {
			if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
				if (!fmc.getIsRouteActivated()) {
					fmc.activateRoute();
				}
				fmc.onExecDefault();
			}
		};

		fmc.refreshPageCallback = () => {
			B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, currentPage);
		};

		//end of CWB EXEC handling

		fmc._renderer.renderTitle(originIdent + ' DEPARTURES');
		fmc._renderer.renderPages(currentPage, pageCount);

		fmc._renderer.render([
			['SIDS', 'RTE 1', 'RUNWAYS'],
			...rows,
			['__FMCSEPARATOR'],
			[lsk6Field, 'ROUTE>']
		]);

		fmc._renderer.rsk(6).event = () => {
			B787_10_FMC_RoutePage.ShowPage1(fmc);
		};

		//start of CWB CANCEL MOD handling
		fmc._renderer.lsk(6).event = () => {
			if (lsk6Field == '<ERASE') {
				if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
					fmc.eraseTemporaryFlightPlan(() => {
						fmc.eraseRouteModifications();
						B787_10_FMC_DepArrPage.ShowDeparturePage(fmc);
					});
				}
			} else {
				B787_10_FMC_DepArrPage.ShowPage1(fmc);
			}
		};
		//end of CWB CANCEL MOD handling


		fmc.onPrevPage = () => {
			if (currentPage > 1) {
				B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, currentPage - 1);
			} else {
				B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, pageCount);
			}
		};
		fmc.onNextPage = () => {
			if (currentPage < pageCount) {
				B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, currentPage + 1);
			} else {
				B787_10_FMC_DepArrPage.ShowDeparturePage(fmc);
			}
		};
	}


	static ShowArrivalPage(fmc: B787_10_FMC, currentPage = 1) {
		fmc.cleanUpPage();
		let destinationIdent = '';
		let modStr = 'ACT';
		let headStr = 'APPROACHES';
		let destination = fmc.flightPlanManager.getDestination();
		if (destination) {
			destinationIdent = destination.ident;
		}
		let rows = [
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
		let approaches = [];
		let selectedApproach;
		let displayableApproachesCount = 0;
		let arrivals = [];
		let selectedArrival;
		let displayableArrivalsCount = 0;
		let displayableTransitionsCount = 0;
		let lastApproachPage = 0;
		let firstRunwayPage = 0;
		let firstRunwayTitleRow = 0;
		let runways = [];
		let displayableRunwaysCount = 0;
		let displayableEnrouteTransitionsCount = 0;

		let selectedRunway = fmc.vfrLandingRunway;

		if (destination) {
			let airportInfo = destination.infos;
			if (airportInfo instanceof AirportInfo) {
				selectedApproach = airportInfo.approaches[fmc.flightPlanManager.getApproachIndex()];
				approaches = airportInfo.approaches;
				selectedArrival = airportInfo.arrivals[fmc.flightPlanManager.getArrivalProcIndex()];
				arrivals = airportInfo.arrivals;
				runways = airportInfo.oneWayRunways;
			}
		}
		if (selectedApproach) {
			rows[0] = ['  NONE', Avionics.Utils.formatRunway(selectedApproach.name).trim()];
			fmc._renderer.rsk(1).event = () => {
				fmc.flightPlanManager.pauseSync();
				fmc.setApproachIndex(-1, () => {
					fmc.flightPlanManager.resumeSync();
					fmc.activateRoute();
					B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage);
				});
			};
			rows[1] = ['', 'TRANS'];
			let selectedTransitionIndex = fmc.flightPlanManager.getApproachTransitionIndex();
			let selectedTransition = selectedApproach.transitions[selectedTransitionIndex];
			if (selectedTransition) {
				rows[2] = ['', selectedTransition.name.trim()];
				fmc._renderer.rsk(2).event = () => {
					fmc.flightPlanManager.pauseSync();
					fmc.setApproachTransitionIndex(-1, () => {
						fmc.flightPlanManager.resumeSync();
						fmc.activateRoute();
						B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage);
					});
				};
			} else {
				displayableTransitionsCount = selectedApproach.transitions.length;
				let maxTransitionPageIndex = Math.max(Math.ceil(displayableTransitionsCount / 4), 1) - 1;
				let displayedTransitionPageIndex = Math.min(currentPage - 1, maxTransitionPageIndex);
				for (let i = 0; i < 4; i++) {
					let transitionIndex = 4 * displayedTransitionPageIndex + i;
					let transition = selectedApproach.transitions[transitionIndex];
					if (transition) {
						let name = transition.name.trim();
						rows[2 * (i + 1)][1] = name;
						fmc._renderer.rsk(i + 2).event = () => {
							fmc.flightPlanManager.pauseSync();
							fmc.setApproachTransitionIndex(transitionIndex, () => {
								fmc.flightPlanManager.resumeSync();
								fmc.activateRoute();
								B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
							});
						};
					}
				}
			}
		} else if (selectedRunway) {
			headStr = 'RUNWAYS';
			rows[0][1] = 'RW' + Avionics.Utils.formatRunway(selectedRunway.designation);
			rows[1][1] = 'RWY EXT';
			rows[2][1] = (fmc.vfrRunwayExtension && fmc.vfrRunwayExtension.toFixed(1)) + 'NM';
			fmc._renderer.rsk(1).event = () => {
				fmc.flightPlanManager.pauseSync();
				fmc.ensureCurrentFlightPlanIsTemporary(() => {
					fmc.deletedVfrLandingRunway = selectedRunway;
					fmc.vfrLandingRunway = undefined;
					fmc.modVfrRunway = true;
					fmc.flightPlanManager.setDestinationRunwayIndex(-1, -1, () => {
						fmc.flightPlanManager.resumeSync();
						fmc.activateRoute();
						B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage);
					});
				});
			};
			fmc._renderer.rsk(2).event = () => {
				let vfrRunwayExtension = parseFloat(fmc.inOut);
				if (isNaN(vfrRunwayExtension) || vfrRunwayExtension < 1 || vfrRunwayExtension > 25) {
					fmc.showErrorMessage('INVALID');
					return;
				} else {
					fmc.vfrRunwayExtension = vfrRunwayExtension;
				}
				fmc.flightPlanManager.pauseSync();
				fmc.ensureCurrentFlightPlanIsTemporary(() => {
					let runwayIndex = fmc.flightPlanManager.getFlightPlan(1).procedureDetails.destinationRunwayIndex;
					fmc.flightPlanManager.setDestinationRunwayIndex(runwayIndex, fmc.vfrRunwayExtension, () => {
						fmc.flightPlanManager.resumeSync();
						fmc.inOut = '';
						fmc.activateRoute();
						B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage);
					});
				});
			};
		} else {
			let approachPages = [[]];
			let rowIndex = 0;
			let pageIndex = 0;
			let lastApproachIndex = -1;
			for (let i = 0; i < approaches.length; i++) {
				let approach = approaches[i];
				let appendRow = false;
				if (!selectedArrival) {
					appendRow = true;
					displayableApproachesCount++;
				} else {
					for (let j = 0; j < selectedArrival.runwayTransitions.length; j++) {
						let matchingApproachRunways;
						if (approach.runway.endsWith(' ')) {
							// Approach runways ending with a space are wildcard approches: They are compatible with all matching arrivals
							// e.g. approach runway "4 " is compatible with arrival runwayTransitions "RW4", "RW4L", "RW4R" and "RW4C"
							matchingApproachRunways = [approach.runway.trim(), approach.runway.trim() + 'L', approach.runway.trim() + 'R', approach.runway.trim() + 'C'];
						} else {
							// Specific Approach runways not ending with a space are compatible only with that specific arrival
							// e.g. approach runway "4L" is compatible only with arrival runwayTransition "RW4L"
							matchingApproachRunways = [approach.runway];
						}
						if (matchingApproachRunways.includes(selectedArrival.runwayTransitions[j].name.replace('RW', ''))) {
							appendRow = true;
							displayableApproachesCount++;
							break;
						}
					}
					if (selectedArrival.runwayTransitions.length === 0) {
						appendRow = true;
						displayableApproachesCount++;
					}
				}
				if (appendRow) {
					if (rowIndex === 5) {
						pageIndex++;
						rowIndex = 0;
						approachPages[pageIndex] = [];
					}
					approachPages[pageIndex][rowIndex] = {
						text: Avionics.Utils.formatRunway(approach.name).trim(),
						approachIndex: i
					};
					rowIndex++;
					firstRunwayTitleRow = rowIndex == 5 ? 0 : rowIndex;
					lastApproachIndex = i;
				}
			}
			let firstMatchingRunway = true;
			for (let k = 0; k < runways.length; k++) {
				let runway = runways[k];
				let appendRow = false;
				if (!selectedArrival) {
					appendRow = true;
				} else {
					for (let l = 0; l < selectedArrival.runwayTransitions.length; l++) {
						if (selectedArrival.runwayTransitions[l].name == 'RW' + runway.designation.trim()) {
							appendRow = true;
							break;
						}
					}
					if (selectedArrival.runwayTransitions.length === 0) {
						appendRow = true;
					}
				}
				if (appendRow) {
					displayableRunwaysCount++;
					if (firstMatchingRunway) {
						lastApproachPage = pageIndex + 1;
					}
					if (rowIndex === 5) {
						pageIndex++;
						rowIndex = 0;
						approachPages[pageIndex] = [];
					}
					approachPages[pageIndex][rowIndex] = {
						text: 'RW' + Avionics.Utils.formatRunway(runway.designation).trim(),
						approachIndex: k + approaches.length,
						runwayIndex: k
					};
					if (firstMatchingRunway) {
						firstRunwayPage = pageIndex + 1;
					}
					firstMatchingRunway = false;
					rowIndex++;
				}
			}
			let displayedPageIndex = Math.min(currentPage, approachPages.length) - 1;
			for (let i = 0; i < approachPages[displayedPageIndex].length; i++) {
				let approachIndex = approachPages[displayedPageIndex][i].approachIndex;
				console.log('approachIndex ' + approachIndex);
				rows[2 * i] = ['', approachPages[displayedPageIndex][i].text];
				fmc._renderer.rsk(i + 1).event = () => {
					if (approachIndex <= lastApproachIndex) {
						console.log('approachIndex <= lastApproachIndex');
						fmc.flightPlanManager.pauseSync();
						console.log('approachIndex ' + approachIndex);
						fmc.setApproachIndex(approachIndex, () => {
							console.log('approach index set, selecting arrival');
							if (selectedArrival) {
								let landingRunway = fmc.flightPlanManager.getApproachRunway();
								console.log('approach runway: ' + landingRunway.designation);
								if (landingRunway) {
									let arrivalRunwayIndex = selectedArrival.runwayTransitions.findIndex(t => {
										return t.name.indexOf('RW' + landingRunway.designation) != -1;
									});
									console.log('arrivalRunwayIndex ' + arrivalRunwayIndex);
									if (arrivalRunwayIndex >= -1) {
										fmc.flightPlanManager.setArrivalRunwayIndex(arrivalRunwayIndex, () => {
											fmc.flightPlanManager.resumeSync();
											fmc.activateRoute();
											B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
										});
									}
								}
							}
							fmc.flightPlanManager.resumeSync();
							fmc.activateRoute();
							B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
						});
					} else if (approachIndex > lastApproachIndex) {
						console.log('approachIndex > lastApproachIndex');
						let runwayApproachIndex = approachPages[displayedPageIndex][i].runwayIndex;
						console.log('approachIndex ' + approachIndex);
						fmc.flightPlanManager.pauseSync();
						fmc.ensureCurrentFlightPlanIsTemporary(() => {
							console.log('starting to set vfrLandingRunway');

							fmc.modVfrRunway = true;
							fmc.vfrLandingRunway = runways[runwayApproachIndex];
							fmc.vfrRunwayExtension = 5;

							fmc.flightPlanManager.setDestinationRunwayIndex(runwayApproachIndex, fmc.vfrRunwayExtension, () => {
								if (selectedArrival) {
									let landingRunway = fmc.vfrLandingRunway;
									if (landingRunway) {
										let arrivalRunwayIndex = selectedArrival.runwayTransitions.findIndex(t => {
											return t.name.indexOf('RW' + landingRunway.designation) != -1;
										});
										if (arrivalRunwayIndex >= -1) {
											fmc.flightPlanManager.setArrivalRunwayIndex(arrivalRunwayIndex, () => {
												fmc.inOut = '';
												fmc.flightPlanManager.resumeSync();
												fmc.activateRoute();
												B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
											});
										}
									}
								}
								console.log('completed setting vfrLandingRunway');
								fmc.flightPlanManager.resumeSync();
								fmc.activateRoute();
								B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
							});
						});
					}

				};
			}
			if (currentPage > lastApproachPage || lastApproachIndex == -1) {
				headStr = 'RUNWAYS';
			} else if (currentPage == firstRunwayPage && firstRunwayPage == lastApproachPage && firstRunwayTitleRow > 0) {
				let runwaysTitleRow = (firstRunwayTitleRow * 2) - 1;
				rows[runwaysTitleRow][1] = 'RUNWAYS';
			}
		}
		if (selectedArrival) {
			console.log('Selected Arrival');
			rows[0][0] = selectedArrival.name;
			fmc._renderer.lsk(1).event = () => {
				fmc.flightPlanManager.pauseSync();
				fmc.setArrivalProcIndex(-1, () => {
					fmc.flightPlanManager.resumeSync();
					fmc.activateRoute();
					B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage);
				});
			};
			let selectedArrivalIndex = fmc.flightPlanManager.getArrivalProcIndex();
			rows[1][0] = ' TRANS';
			let selectedEnrouteTransitionIndex = fmc.flightPlanManager.getArrivalTransitionIndex();
			let selectedEnrouteTransition = selectedArrival.enRouteTransitions[selectedEnrouteTransitionIndex];
			if (selectedEnrouteTransition) {
				rows[2][0] = selectedEnrouteTransition.name.trim();
				fmc._renderer.lsk(2).event = () => {
					fmc.setArrivalAndRunwayIndex(selectedArrivalIndex, -1, () => {
						fmc.activateRoute();
						B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage);
					});
				};
			} else {
				displayableEnrouteTransitionsCount = selectedArrival.enRouteTransitions.length;
				let maxEnrouteTransitionPageIndex = Math.max(Math.ceil(displayableEnrouteTransitionsCount / 4), 1) - 1;
				let displayedEnrouteTransitionPageIndex = Math.min(currentPage - 1, maxEnrouteTransitionPageIndex);
				for (let i = 0; i < 4; i++) {
					let enrouteTransitionIndex = 4 * displayedEnrouteTransitionPageIndex + i;
					let enrouteTransition = selectedArrival.enRouteTransitions[enrouteTransitionIndex];
					if (enrouteTransition) {
						let enrouteTransitionName = enrouteTransition.name.trim();
						rows[2 * (i + 1)][0] = enrouteTransitionName;
						fmc._renderer.lsk(i + 2).event = () => {
							fmc.flightPlanManager.pauseSync();
							fmc.setArrivalAndRunwayIndex(selectedArrivalIndex, enrouteTransitionIndex, () => {
								fmc.flightPlanManager.resumeSync();
								fmc.activateRoute();
								B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
							});
						};

					}
				}
			}
		} else {
			let arrivalPages = [[]];
			let rowIndex = 0;
			let pageIndex = 0;
			for (let i = 0; i < arrivals.length; i++) {
				let arrival = arrivals[i];
				let appendRow = false;
				if (!selectedApproach && !selectedRunway) {
					appendRow = true;
					displayableArrivalsCount++;
				} else {
					for (let j = 0; j < arrival.runwayTransitions.length; j++) {
						if (selectedApproach) {
							let matchingApproachRunways;
							if (selectedApproach.runway.endsWith(' ')) {
								matchingApproachRunways = [selectedApproach.runway.trim(), selectedApproach.runway.trim() + 'L', selectedApproach.runway.trim() + 'R', selectedApproach.runway.trim() + 'C'];
							} else {
								matchingApproachRunways = [selectedApproach.runway];
							}
							if (matchingApproachRunways.includes(arrival.runwayTransitions[j].name.replace('RW', ''))) {
								appendRow = true;
								displayableArrivalsCount++;
								break;
							}
						} else if (selectedRunway && arrival.runwayTransitions[j].name == 'RW' + selectedRunway.designation.trim()) {
							appendRow = true;
							displayableArrivalsCount++;
							break;
						}
					}
					if (arrival.runwayTransitions.length === 0) {
						appendRow = true;
						displayableArrivalsCount++;
					}
				}
				if (appendRow) {
					if (rowIndex === 5) {
						pageIndex++;
						rowIndex = 0;
						arrivalPages[pageIndex] = [];
					}
					arrivalPages[pageIndex][rowIndex] = {
						text: arrival.name,
						arrivalIndex: i
					};
					rowIndex++;
				}
			}
			let displayedPageIndex = Math.min(currentPage, arrivalPages.length) - 1;
			for (let i = 0; i < arrivalPages[displayedPageIndex].length; i++) {
				let arrivalIndex = arrivalPages[displayedPageIndex][i].arrivalIndex;
				rows[2 * i][0] = arrivalPages[displayedPageIndex][i].text;
				fmc._renderer.lsk(i + 1).event = () => {
					console.log('rows length before reload' + rows.length);
					fmc.flightPlanManager.pauseSync();
					fmc.setArrivalAndRunwayIndex(arrivalIndex, -1, () => {
						console.log('Setting Arrival and Runway Index');
						fmc.flightPlanManager.resumeSync();
						fmc.activateRoute();
						B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
					});
				};
			}
		}

		let rowsCountOf5RowsPerPageData = Math.max(displayableApproachesCount + displayableRunwaysCount, displayableArrivalsCount);
		let rowsCountOf4RowsPerPageData = Math.max(displayableTransitionsCount, displayableEnrouteTransitionsCount);
		let pageCountOf5RowsPerPageData = Math.ceil(rowsCountOf5RowsPerPageData / 5);
		let pageCountOf4RowsPerPageData = Math.ceil(rowsCountOf4RowsPerPageData / 4);
		let pageCount = Math.max(Math.max(pageCountOf5RowsPerPageData, pageCountOf4RowsPerPageData), 1);

		//start of CWB EXEC handling
		let lsk6Field = '';
		if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
			fmc.fpHasChanged = true;
			lsk6Field = '<ERASE';
		} else if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 0) {
			lsk6Field = '<INDEX';
			fmc.fpHasChanged = false;
		}
		fmc.onExecPage = () => {
			if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
				fmc.modVfrRunway = false;
				fmc.deletedVfrLandingRunway = undefined;
				if (!fmc.getIsRouteActivated()) {
					fmc.activateRoute();
				}
				fmc.onExecDefault();
			}
			B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
			fmc.refreshPageCallback = () => B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
		};
		//end of CWB EXEC handling

		fmc._renderer.renderTitle(destinationIdent + ' ARRIVALS');
		fmc._renderer.renderPages(currentPage, pageCount);

		fmc._renderer.render([
			['STAR', 'RTE 1', 'APPROACH'],
			...rows,
			['__FMCSEPARATOR'],
			[lsk6Field, 'ROUTE>']
		]);

		fmc._renderer.rsk(6).event = () => {
			B787_10_FMC_DepArrPage.ShowPage1(fmc);
		};

		//start of CWB CANCEL MOD handling
		fmc._renderer.lsk(6).event = () => {
			if (lsk6Field == '<ERASE') {
				if (fmc.modVfrRunway == true && fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
					fmc.eraseTemporaryFlightPlan(() => {
						fmc.vfrLandingRunway = fmc.vfrLandingRunway == undefined ? fmc.deletedVfrLandingRunway : undefined;
						fmc.modVfrRunway = false;
						fmc.eraseRouteModifications();
						B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
					});
				} else if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
					fmc.eraseTemporaryFlightPlan(() => {
						fmc.eraseRouteModifications();
						B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
					});
				}
			} else {
				B787_10_FMC_DepArrPage.ShowPage1(fmc);
			}
		};
		//end of CWB CANCEL MOD handling


		fmc.onPrevPage = () => {
			if (currentPage > 1) {
				B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage - 1);
			} else {
				B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, pageCount);
			}
		};
		fmc.onNextPage = () => {
			if (currentPage < pageCount) {
				B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage + 1);
			} else {
				B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
			}
		};

	}
}