class B787_10_FMC_DepArrPage {
	static ShowPage1(fmc) {
		fmc.clearDisplay();
		let rowOrigin = [''];
		let origin = fmc.flightPlanManager.getOrigin();
		if (origin) {
			rowOrigin = ['\<DEP', '', origin.ident];
			fmc.onLeftInput[0] = () => {
				//new B787_10_FMC_DeparturesPage(fmc).showPage()
				B787_10_FMC_DepArrPage.ShowDeparturePage(fmc);
			};
		}
		let rowDestination = [''];
		let destination = fmc.flightPlanManager.getDestination();
		if (destination) {
			rowDestination = ['', '<ARR', destination.ident];
			fmc.onRightInput[1] = () => {
				B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
			};
		}
		fmc.setTemplate([
			['DEP/ARR INDEX'],
			['', '', 'ACT FPLN'],
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
		fmc.updateSideButtonActiveStatus();
	}

	static ShowDeparturePage(fmc, currentPage = 1) {
		fmc.clearDisplay();
		let originIdent = '';
		let origin = fmc.flightPlanManager.getOrigin();
		if (origin) {
			originIdent = origin.ident;
		}
		let rows = [[''], [''], [''], [''], [''], [''], [''], [''], ['']];
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
			rows[0] = ['', Avionics.Utils.formatRunway(selectedRunway.designation), '', '<SEL>'];
			fmc.onRightInput[0] = () => {
				fmc.flightPlanManager.pauseSync();
				fmc.setRunwayIndex(-1, () => {
					fmc.setDepartureIndex(-1, () => {
						fmc.flightPlanManager.resumeSync();
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
						text: Avionics.Utils.formatRunway(runway.designation) + '[s-text]',
						runwayIndex: index
					};
					rowIndex++;
				}
			}
			let displayedPageIndex = Math.min(currentPage, runwayPages.length) - 1;
			for (let i = 0; i < runwayPages[displayedPageIndex].length; i++) {
				let runwayIndex = runwayPages[displayedPageIndex][i].runwayIndex;
				rows[2 * i] = ['', runwayPages[displayedPageIndex][i].text];
				fmc.onRightInput[i] = () => {
					if (fmc.flightPlanManager.getDepartureProcIndex() === -1) {
						fmc.setOriginRunwayIndex(runwayIndex, () => {
							B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, undefined);
						});
					} else {
						fmc.setRunwayIndex(runwayIndex, () => {
							B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, undefined);
						});
					}
				};
			}
		}

		if (selectedDeparture) {
			rows[0][0] = selectedDeparture.name;
			rows[0][2] = '<SEL>';
			fmc.onLeftInput[0] = () => {
				fmc.flightPlanManager.pauseSync();
				fmc.setRunwayIndex(-1, () => {
					fmc.setDepartureIndex(-1, () => {
						fmc.flightPlanManager.resumeSync();
						B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, currentPage);
					});
				});
			};
			rows[1][0] = ' TRANS';
			let selectedDpEnrouteTransitionIndex = fmc.flightPlanManager.getDepartureEnRouteTransitionIndex();
			let selectedDpEnrouteTransition = selectedDeparture.enRouteTransitions[selectedDpEnrouteTransitionIndex];
			if (selectedDpEnrouteTransition) {
				rows[2][0] = selectedDpEnrouteTransition.name.trim();
				fmc.onLeftInput[1] = () => {
					fmc.setDepartureEnrouteTransitionIndex(-1, () => {
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
						fmc.onLeftInput[i + 1] = () => {
							fmc.setDepartureEnrouteTransitionIndex(enrouteDpTransitionIndex, () => {
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
				if (!selectedRunway) {
					appendRow = true;
					displayableDeparturesCount++;
				} else {
					for (let j = 0; j < departure.runwayTransitions.length; j++) {
						if (departure.runwayTransitions[j].name.indexOf(selectedRunway.designation) !== -1) {
							appendRow = true;
							displayableDeparturesCount++;
							break;
						}
					}
				}
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
			let displayedPageIndex = Math.min(currentPage, departurePages.length) - 1;
			for (let i = 0; i < departurePages[displayedPageIndex].length; i++) {
				let departureIndex = departurePages[displayedPageIndex][i].departureIndex;
				rows[2 * i][0] = departurePages[displayedPageIndex][i].text;
				fmc.onLeftInput[i] = () => {
					fmc.flightPlanManager.pauseSync();
					fmc.setDepartureIndex(departureIndex, () => {
						fmc.flightPlanManager.resumeSync();
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

		let erasePrompt = '';
		if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
			fmc.fpHasChanged = true;
			erasePrompt = '<ERASE';
		} else if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 0) {
			erasePrompt = '<INDEX';
			fmc.fpHasChanged = false;
		}

		fmc.setTemplate([
			[originIdent + ' DEPARTURES', currentPage.toFixed(0), pageCount.toFixed(0)],
			['SIDS', 'RUNWAYS', 'RTE 1'],
			...rows,
			['__FMCSEPARATOR'],
			[erasePrompt, '<ROUTE']
		]);

		fmc.onExecPage = () => {
			if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
				if (!fmc.getIsRouteActivated()) {
					fmc.activateRoute();
				}
				fmc.onExecDefault();
			}
		};

		fmc.refreshPageCallback = () => {
			B787_10_FMC_DepArrPage.ShowDeparturePage(fmc);
		};

		fmc.onLeftInput[5] = () => {
			if (erasePrompt == '<ERASE') {
				if (fmc.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
					fmc.eraseTemporaryFlightPlan(() => {
						fmc.fpHasChanged = false;
						B787_10_FMC_DepArrPage.ShowDeparturePage(fmc);
					});
				}
			} else {
				B787_10_FMC_DepArrPage.ShowPage1(fmc);
			}
		};
		fmc.onRightInput[5] = () => {
			B787_10_FMC_RoutePage.ShowPage1(fmc);
		};
		fmc.onPrevPage = () => {
			if (currentPage > 0) {
				B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, currentPage - 1);
			}
		};
		fmc.onNextPage = () => {
			if (currentPage < pageCount) {
				B787_10_FMC_DepArrPage.ShowDeparturePage(fmc, currentPage + 1);
			}
		};

		fmc.updateSideButtonActiveStatus();
	}

	static ShowArrivalPage(fmc, currentPage = 1) {
		fmc.clearDisplay();

		let destination = fmc.flightPlanManager.getDestination();
		let apps = [];
		let arrs = [];


		if (destination) {
			let airportInfo = destination.infos;
			if (airportInfo instanceof AirportInfo) {
				apps = airportInfo.approaches;
				arrs = airportInfo.arrivals;
			}
		}

		apps.forEach((a) => {
			console.log('Approach: ' + a.name);
			console.log('TL: ' + a.transitions.length);
			a.transitions.forEach((t) => {
				console.log('Approach transition: ' + t.name);
			});
		});

		arrs.forEach((a) => {
			//console.log(a.enRouteTransitions.length)
			a.enRouteTransitions.forEach((t) => {
				//console.log(t.name)

				//Object.keys(t).forEach((k) => {
				//	console.log(k)
				//})
			});
			//a.enRouteTransitions.forEach((t) => {
			//	console.log(t.name)
			//Object.keys(t).forEach((k) => {
			//	console.log(k)
			//})
			//});
			//console.log(a.runwayTransitions.length)
			a.runwayTransitions.forEach((t) => {
				//console.log(t.name)

				//Object.keys(t).forEach((k) => {
				//	console.log(k)
				//})
			});

			//console.log("Arrival: " + a.name);
		});


		fmc.onLeftInput[5] = () => {
			B787_10_FMC_DepArrPage.ShowPage1(fmc);
		};
		fmc.onRightInput[5] = () => {
			B787_10_FMC_RoutePage.ShowPage1(fmc);
		};
		fmc.onPrevPage = () => {
			if (currentPage > 0) {
				B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage - 1);
			}
		};
		fmc.onNextPage = () => {
			if (currentPage < pageCount) {
				B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage + 1);
			}
		};
		fmc.updateSideButtonActiveStatus();
	}

	static ShowArrivalPage2(fmc, currentPage = 1) {
		fmc.clearDisplay();
		let destinationIdent = '';
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
		if (destination) {
			let airportInfo = destination.infos;
			if (airportInfo instanceof AirportInfo) {
				selectedApproach = airportInfo.approaches[fmc.flightPlanManager.getApproachIndex()];
				approaches = airportInfo.approaches;
				selectedArrival = airportInfo.arrivals[fmc.flightPlanManager.getArrivalProcIndex()];
				arrivals = airportInfo.arrivals;
			}
		}
		if (selectedApproach) {
			rows[0] = ['', Avionics.Utils.formatRunway(selectedApproach.name), '', '<SEL>'];
			fmc.onRightInput[0] = () => {
				fmc.setApproachIndex(-1, () => {
					fmc.activateRoute();
					B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
				});
			};
			rows[1] = ['', 'TRANS'];
			let selectedTransitionIndex = fmc.flightPlanManager.getApproachTransitionIndex();
			let selectedTransition = selectedApproach.transitions[selectedTransitionIndex];
			if (selectedTransition) {
				rows[2] = ['', selectedTransition.waypoints[0].infos.icao.substr(5), '', '<SEL>'];
				fmc.onRightInput[1] = () => {
					fmc.setApproachTransitionIndex(-1, () => {
						fmc.activateRoute();
						B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage);
					});
				};
			} else {
				for (let i = 0; i < 4; i++) {
					let index = i;
					let transition = selectedApproach.transitions[index];
					if (transition) {
						let name = transition.waypoints[0].infos.icao.substr(5);
						rows[2 * (i + 1)][1] = name;
						fmc.onRightInput[i + 1] = () => {
							fmc.setApproachTransitionIndex(index, () => {
								fmc.activateRoute();
								B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage);
							});
						};
					}
				}
			}
		} else {
			let i = 0;
			let rowIndex = -5 * (currentPage - 1);
			while (i < approaches.length) {
				let approach = approaches[i];
				let appendRow = false;
				if (!selectedArrival) {
					appendRow = true;
					displayableApproachesCount++;
				} else {
					for (let j = 0; j < selectedArrival.runwayTransitions.length; j++) {
						if (selectedArrival.runwayTransitions[j].name.replace('RW', '') === approach.runway) {
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
					if (rowIndex >= 0 && rowIndex < 5) {
						let ii = i;
						rows[2 * rowIndex] = ['', Avionics.Utils.formatRunway(approach.name)];
						fmc.onRightInput[rowIndex] = () => {
							fmc.setApproachIndex(ii, () => {
								fmc.activateRoute();
								B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
							});
						};
					}
					rowIndex++;
				}
				i++;
			}
		}
		if (selectedArrival) {
			rows[0][0] = selectedArrival.name;
			rows[0][2] = '<SEL>';
			fmc.onLeftInput[0] = () => {
				fmc.setArrivalProcIndex(-1, () => {
					fmc.activateRoute();
					B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
				});
			};
		} else {
			let i = 0;
			let rowIndex = -5 * (currentPage - 1);
			while (i < arrivals.length) {
				let arrival = arrivals[i];
				let appendRow = false;
				if (!selectedApproach) {
					appendRow = true;
					displayableArrivalsCount++;
				} else {
					for (let j = 0; j < arrival.runwayTransitions.length; j++) {
						if (arrival.runwayTransitions[j].name.replace('RW', '') === selectedApproach.runway) {
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
					if (rowIndex >= 0 && rowIndex < 5) {
						let ii = i;
						rows[2 * rowIndex][0] = arrival.name;
						fmc.onLeftInput[rowIndex] = () => {
							fmc.setArrivalProcIndex(ii, () => {
								fmc.activateRoute();
								B787_10_FMC_DepArrPage.ShowArrivalPage(fmc);
							});
						};
					}
					rowIndex++;
				}
				i++;
			}
		}
		let rowsCount = Math.max(displayableApproachesCount, displayableArrivalsCount);
		let pageCount = Math.floor(rowsCount / 5) + 1;
		fmc.setTemplate([
			[destinationIdent + ' ARRIVALS', currentPage.toFixed(0), pageCount.toFixed(0)],
			['STAR', 'APPROACH', 'RTE 1'],
			...rows,
			['__FMCSEPARATOR'],
			['\<INDEX', '<ROUTE']
		]);
		fmc.onLeftInput[5] = () => {
			B787_10_FMC_DepArrPage.ShowPage1(fmc);
		};
		fmc.onRightInput[5] = () => {
			B787_10_FMC_RoutePage.ShowPage1(fmc);
		};
		fmc.onPrevPage = () => {
			if (currentPage > 0) {
				B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage - 1);
			}
		};
		fmc.onNextPage = () => {
			if (currentPage < pageCount) {
				B787_10_FMC_DepArrPage.ShowArrivalPage(fmc, currentPage + 1);
			}
		};
		fmc.updateSideButtonActiveStatus();
	}
}

//# sourceMappingURL=B787_10_FMC_DepArrPage.js.map