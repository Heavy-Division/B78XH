class B787_10_FMC_ArrivalsPage {
	constructor(fmc) {
		this.fmc = fmc;
		this.destination = undefined;
		this.destinationIdent = '';
		this.arrivals = [];
		this.approaches = [];
		this.selectedArrival = undefined;
		this.selectedApproach = undefined;
		this.pageCount = 1;
	}

	showPage(currentPage = 1) {
		this.fmc.clearDisplay();
		this.loadDestination();
		this.loadDestinationInfos();

		let rows = this.createRows(currentPage);

		if (this.selectedArrival) {
			rows[0][2] = '<SEL>';
			this.fmc.onLeftInput[0] = () => {
				this.fmc.setArrivalIndex(-1, -1, () => {
					this.fmc.activateRoute();
					this.showPage();
				});
			};

			if (this.selectedArrivalTransition) {
				rows[2][2] = '<SEL>';
				this.fmc.onLeftInput[1] = () => {
					this.fmc.ensureCurrentFlightPlanIsTemporary(() => {
						this.fmc.flightPlanManager.setArrivalEnRouteTransitionIndex(-1, () => {
							this.fmc.activateRoute();
							this.showPage();
						});
					});
				};
			} else {
				let offset = (currentPage * 4) - 4;
				for (let i = 1; i <= 4; i++) {
					if(rows[i * 2][0]){
						this.fmc.onLeftInput[i] = () => {
							this.fmc.ensureCurrentFlightPlanIsTemporary(() => {
								this.fmc.flightPlanManager.setArrivalEnRouteTransitionIndex(i + offset - 1, () => {
									this.fmc.activateRoute();
									this.showPage();
								});
							});
						};
					}
				}
			}
		} else {
			for (let i = 0; i < 5; i++) {
				let offset = (currentPage * 5) - 5;
				this.fmc.onLeftInput[i] = () => {
					this.fmc.setArrivalIndex(i + offset, -1, () => {
						this.fmc.activateRoute();
						this.showPage();
					});
				};
			}
		}

		if (this.selectedApproach) {
			rows[0][3] = '<SEL>';
			this.fmc.onRightInput[0] = () => {
				this.fmc.setApproachIndex(-1, () => {
					this.fmc.activateRoute();
					this.showPage();
				});
			};

			if (this.selectedApproachTransition) {
				rows[2][3] = '<SEL>';
				this.fmc.onRightInput[1] = () => {
					this.fmc.setApproachTransitionIndex(-1, () => {
						this.fmc.activateRoute();
						this.showPage();
					});
				};
			} else {
				let offset = (currentPage * 4) - 4;
				for (let i = 1; i <= 4; i++) {
					if(rows[i * 2][1]){
						this.fmc.onRightInput[i] = () => {
							this.fmc.setApproachTransitionIndex(i + offset - 1, () => {
								this.fmc.activateRoute();
								this.showPage();
							});
						};
					}
				}
			}
		} else {
			let offset = (currentPage * 5) - 5;
			for (let i = 0; i < 5; i++) {
				this.fmc.onRightInput[i] = () => {
					this.fmc.setApproachIndex(i + offset, () => {
						this.fmc.activateRoute();
						this.showPage();
					});
				};
			}
		}

		this.fmc.setTemplate([
			[this.destinationIdent + ' ARRIVALS', currentPage.toFixed(0), this.pageCount.toFixed(0)],
			['STAR', 'APPROACH', 'RTE 1'],
			...rows,
			['__FMCSEPARATOR'],
			['\<INDEX', '<ROUTE']
		]);

		this.fmc.onPrevPage = () => {
			if (currentPage > 1) {
				this.showPage(currentPage - 1);
			}
		};
		this.fmc.onNextPage = () => {
			if (currentPage < this.pageCount) {
				this.showPage(currentPage + 1);
			}
		};

		this.fmc.onLeftInput[5] = () => {
			B787_10_FMC_DepArrPage.ShowPage1(this.fmc);
		};
		this.fmc.onRightInput[5] = () => {
			B787_10_FMC_RoutePage.ShowPage1(this.fmc);
		};
		this.fmc.updateSideButtonActiveStatus();
	}

	loadDestination() {
		this.destination = this.fmc.flightPlanManager.getDestination();
		if (this.destination) {
			this.destinationIdent = this.destination.ident;
		}
	}

	loadDestinationInfos() {
		if (this.destination) {
			this.destination.UpdateApproaches();
			let airportInfo = this.destination.infos;
			if (airportInfo instanceof AirportInfo) {
				this.selectedApproach = airportInfo.approaches[this.fmc.flightPlanManager.getApproachIndex()];
				this.approaches = airportInfo.approaches;
				this.selectedArrival = airportInfo.arrivals[this.fmc.flightPlanManager.getArrivalProcIndex()];
				if (this.selectedArrival && this.fmc.flightPlanManager.getArrivalTransitionIndex() !== -1) {
					this.selectedArrivalTransition = this.selectedArrival.enRouteTransitions[this.fmc.flightPlanManager.getArrivalTransitionIndex()];
				} else {
					this.selectedArrivalTransition = undefined;
				}
				if (this.selectedApproach && this.fmc.flightPlanManager.getApproachTransitionIndex() !== -1) {
					this.selectedApproachTransition = this.selectedApproach.transitions[this.fmc.flightPlanManager.getApproachTransitionIndex()];
				} else {
					this.selectedApproachTransition = undefined;
				}
				this.arrivals = airportInfo.arrivals;
			}
		}
	}

	createRows(currentPage = 1) {
		let finalRows = [
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

		let arrivalsCount = 0;
		let arrivalTransitionCount = 0;
		let approachCount = 0;
		let approachTransitionCount = 0;

		let leftSideRows = this.getLeftSideRows();
		let rightSideRows = this.getRightSideRows();
		let offset = (currentPage * 5) - 5;
		if (leftSideRows.selectedArrival) {
			finalRows[0][0] = leftSideRows.selectedArrival;
			if (leftSideRows.availableTransitions.length > 0) {
				finalRows[1][0] = 'TRANS';
			}
			arrivalsCount = 1;

			if (leftSideRows.selectedTransition) {
				finalRows[1][0] = 'TRANS';
				finalRows[2][0] = leftSideRows.selectedTransition;
				arrivalTransitionCount = 1;
			} else {
				let offset = (currentPage * 4) - 4;
				let transitions = leftSideRows.availableTransitions.slice(offset, offset + 4)

				Object.keys(transitions).forEach((k) => {
					if(finalRows[(parseInt(k)  + 1) * 2]){
						finalRows[(parseInt(k)  + 1) * 2][0] = transitions[k];
					}
				});
				arrivalTransitionCount = leftSideRows.availableTransitions.length;
			}
		} else {
			for (let i = offset; i < offset + 5; i++) {
				if (leftSideRows.availableArrivals[i]) {
					finalRows[(i - offset) * 2][0] = leftSideRows.availableArrivals[i];
				}
			}
			arrivalsCount = leftSideRows.availableArrivals.length;
		}

		if (rightSideRows.selectedApproach) {
			finalRows[0][1] = rightSideRows.selectedApproach;
			if (rightSideRows.availableTransitions.length > 0) {
				finalRows[1][1] = 'TRANS';
			}
			approachCount = 1;
			if (rightSideRows.selectedTransition) {
				finalRows[1][1] = 'TRANS';
				finalRows[2][1] = rightSideRows.selectedTransition;
				approachTransitionCount = 1;
			} else {
				let offset = (currentPage * 4) - 4;
				let transitions = rightSideRows.availableTransitions.slice(offset, offset + 4)

				Object.keys(transitions).forEach((k) => {
					if(finalRows[(parseInt(k)  + 1) * 2]){
						finalRows[(parseInt(k)  + 1) * 2][1] = transitions[k];
					}
				});
				approachTransitionCount = rightSideRows.availableTransitions.length;
			}
		} else {
			for (let i = offset; i < offset + 5; i++) {
				if (rightSideRows.availableApproaches[i]) {
					finalRows[(i - offset) * 2][1] = rightSideRows.availableApproaches[i];
				}
			}
			approachCount = rightSideRows.availableApproaches.length;
		}


		let rowsCount = Math.max(arrivalsCount + arrivalTransitionCount, approachCount + approachTransitionCount);
		this.pageCount = Math.floor(rowsCount / 5) + 1;
		return finalRows;
	}

	getLeftSideRows() {
		let availableArrivals = [];
		let availableTransitions = [];
		let selectedArrival = undefined;
		let selectedTransition = undefined;
		if (this.selectedArrival) {
			selectedArrival = this.selectedArrival.name;
			if (this.selectedArrivalTransition) {
				selectedTransition = this.selectedArrivalTransition.name;
			} else {
				if (this.selectedArrival.enRouteTransitions.length > 0) {
					this.selectedArrival.enRouteTransitions.forEach((transition) => {
						availableTransitions.push(transition.name);
					});
				}
			}
		} else {
			this.arrivals.forEach((arrival) => {
				availableArrivals.push(arrival.name);
			});
		}
		return {
			selectedArrival: selectedArrival,
			selectedTransition: selectedTransition,
			availableArrivals: availableArrivals,
			availableTransitions: availableTransitions
		};
	}

	getRightSideRows() {
		let availableApproaches = [];
		let availableTransitions = [];
		let selectedApproach = undefined;
		let selectedTransition = undefined;
		if (this.selectedApproach) {
			selectedApproach = this.selectedApproach.name;
			if (this.selectedApproachTransition) {
				selectedTransition = this.selectedApproachTransition.name;
			} else {
				if (this.selectedApproach.transitions.length > 0) {
					this.selectedApproach.transitions.forEach((transition) => {
						availableTransitions.push(transition.name);
					});
				}
			}
		} else {
			this.approaches.forEach((approach) => {
				availableApproaches.push(approach.name);
			});
		}
		return {
			selectedApproach: selectedApproach,
			selectedTransition: selectedTransition,
			availableApproaches: availableApproaches,
			availableTransitions: availableTransitions
		};
	}
}