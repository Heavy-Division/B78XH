class B787_10_FMC_ProgressPage {
	static ShowPage1(fmc) {
		fmc.clearDisplay();
		B787_10_FMC_ProgressPage._timer = 0;
		fmc.pageUpdate = () => {
			B787_10_FMC_ProgressPage._timer++;
			if (B787_10_FMC_ProgressPage._timer >= 15) {
				B787_10_FMC_ProgressPage.ShowPage1(fmc);
			}
		};

		let speed = Simplane.getGroundSpeed();
		let currentTime = SimVar.GetGlobalVarValue("ZULU TIME", "seconds");
		let currentFuel = SimVar.GetSimVarValue("FUEL TOTAL QUANTITY", "gallons") * SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "pounds") / 1000;
		let currentFuelFlow = SimVar.GetSimVarValue("TURB ENG FUEL FLOW PPH:1", "pound per hour") + SimVar.GetSimVarValue("TURB ENG FUEL FLOW PPH:2", "pound per hour") + SimVar.GetSimVarValue("TURB ENG FUEL FLOW PPH:3", "pound per hour") + SimVar.GetSimVarValue("TURB ENG FUEL FLOW PPH:4", "pound per hour");
		currentFuelFlow = currentFuelFlow / 1000;

		let waypointActiveCell = '';
		let waypointActiveDistanceCell = '';
		let waypointActiveETACell = '';
		let waypointActiveFuelCell = '';
		let waypointActive = fmc.flightPlanManager.getActiveWaypoint();
		let waypointActiveDistance = fmc.flightPlanManager.getDistanceToActiveWaypoint();
		if (waypointActive) {
			console.log(waypointActive.cumulativeDistanceInFP)
			waypointActiveCell = waypointActive.ident;
			if (isFinite(waypointActiveDistance)) {
				waypointActiveDistanceCell = waypointActiveDistance.toFixed(0) + ' ';


				let eta = undefined;
				eta = (B787_10_FMC_ProgressPage.computeEtaToWaypoint(waypointActiveDistance, speed) + currentTime) % 86400
				if (isFinite(eta)) {
					let etaHours = Math.floor(eta / 3600);
					let etaMinutes = Math.floor((eta - etaHours * 3600) / 60);
					waypointActiveETACell = etaHours.toFixed(0).padStart(2, "0") + etaMinutes.toFixed(0).padStart(2, "0") + '[size=small]Z[/size]';
				}

				let fuelLeft = fmc.computeFuelLeft(waypointActiveDistance, speed, currentFuel, currentFuelFlow);
				if (isFinite(fuelLeft)) {
					waypointActiveFuelCell = fuelLeft.toFixed(1);
				}
			}
		}
		let waypointActiveNextCell = '';
		let waypointActiveNext;
		let waypointActiveNextDistanceCell = '';
		let waypointActiveNextETACell = '';
		let waypointActiveNextFuelCell = '';
		let waypointActiveNextDistance = NaN;
		if (fmc.flightPlanManager.getActiveWaypointIndex() != -1) {
			waypointActiveNext = fmc.flightPlanManager.getNextActiveWaypoint();
			if (waypointActiveNext) {
				waypointActiveNextCell = waypointActiveNext.ident;
				if (waypointActive && isFinite(waypointActiveDistance)) {
					let d = Avionics.Utils.computeGreatCircleDistance(waypointActive.infos.coordinates, waypointActiveNext.infos.coordinates);
					if (isFinite(d)) {
						waypointActiveNextDistance = d + waypointActiveDistance;
						waypointActiveNextDistanceCell = waypointActiveNextDistance.toFixed(0) + ' ';

						let eta = undefined;
						eta = (B787_10_FMC_ProgressPage.computeEtaToWaypoint(waypointActiveNextDistance, speed) + currentTime) % 86400
						if (isFinite(eta)) {
							let etaHours = Math.floor(eta / 3600);
							let etaMinutes = Math.floor((eta - etaHours * 3600) / 60);
							waypointActiveNextETACell = etaHours.toFixed(0).padStart(2, "0") + etaMinutes.toFixed(0).padStart(2, "0") + '[size=small]Z[/size]';
						}
						let fuelLeft = fmc.computeFuelLeft(waypointActiveNextDistance, speed, currentFuel, currentFuelFlow);
						if (isFinite(fuelLeft)) {
							waypointActiveNextFuelCell = fuelLeft.toFixed(1);
						}
					}
				}
			}
		}
		let destinationCell = '';
		let destination = fmc.flightPlanManager.getDestination();
		let destinationDistanceCell = '';
		let destinationETACell = '';
		let destinationFuelCell = '';
		let destinationDistance = NaN;
		if (destination) {
			destinationCell = destination.ident;
			destinationDistance = destination.cumulativeDistanceInFP;
			if (waypointActive) {
				const missed = fmc.flightPlanManager.getCurrentFlightPlan().approach;
				const mWayipoints = missed.waypoints;
				if(mWayipoints.length > 0){
					const cumulativeToApproach = mWayipoints[mWayipoints.length - 1].cumulativeDistanceInFP;
					destinationDistance = cumulativeToApproach;
				}
				destinationDistance -= waypointActive.cumulativeDistanceInFP;
				destinationDistance += fmc.flightPlanManager.getDistanceToActiveWaypoint();
				if (isFinite(destinationDistance)) {
					destinationDistanceCell = destinationDistance.toFixed(0) + ' ';

					let eta = undefined;
					eta = (B787_10_FMC_ProgressPage.computeEtaToWaypoint(destinationDistance, speed) + currentTime) % 86400
					if (isFinite(eta)) {
						let etaHours = Math.floor(eta / 3600);
						let etaMinutes = Math.floor((eta - etaHours * 3600) / 60);
						destinationETACell = etaHours.toFixed(0).padStart(2, "0") + etaMinutes.toFixed(0).padStart(2, "0") + '[size=small]Z[/size]';
					}

					let fuelLeft = fmc.computeFuelLeft(destinationDistance, speed, currentFuel, currentFuelFlow);
					if (isFinite(fuelLeft)) {
						destinationFuelCell = fuelLeft.toFixed(1);
					}
				}
			}
		}

		let toTODCell = '';
		let todDistanceCell = '';
		let todETACell = '';
		const showTOD = SimVar.GetSimVarValue("L:AIRLINER_FMS_SHOW_TOP_DSCNT", "number");
		if(showTOD === 1){
			const distanceToTOD = SimVar.GetSimVarValue("L:WT_CJ4_TOD_REMAINING", "number");

			if(distanceToTOD){
				todDistanceCell = distanceToTOD.toFixed(0) + '[size=small]NM[/size]';

				let eta = undefined;
				eta = (B787_10_FMC_ProgressPage.computeEtaToWaypoint(distanceToTOD, speed) + currentTime) % 86400
				if (isFinite(eta)) {
					let etaHours = Math.floor(eta / 3600);
					let etaMinutes = Math.floor((eta - etaHours * 3600) / 60);
					todETACell = etaHours.toFixed(0).padStart(2, "0") + etaMinutes.toFixed(0).padStart(2, "0") + '[size=small]Z[/size]';
				}

				toTODCell = todETACell + '/' + todDistanceCell
			}
		}

		fmc.setTemplate([
			['PROGRESS'],
			['TO', 'FUEL', 'DTG', 'ETA'],
			[waypointActiveCell, waypointActiveFuelCell, waypointActiveDistanceCell, waypointActiveETACell],
			['NEXT', ''],
			[waypointActiveNextCell, waypointActiveNextFuelCell, waypointActiveNextDistanceCell, waypointActiveNextETACell],
			['DEST'],
			[destinationCell, destinationFuelCell, destinationDistanceCell, destinationETACell],
			['', 'TO T/D'],
			['', toTODCell],
			[''],
			[''],
			[''],
			['<POS REPORT', '<POS REF']
		]);

		fmc.updateSideButtonActiveStatus();
	}

	static computeEtaToWaypoint(distance, groundSpeed){
		if (groundSpeed < 50) {
			groundSpeed = 50;
		}
		if (groundSpeed > 0.1) {
			return distance / groundSpeed * 3600;
		}
	}
}

B787_10_FMC_ProgressPage._timer = 0;
//# sourceMappingURL=B787_10_FMC_ProgressPage.js.map