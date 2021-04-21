Include.addScript('/Heavy/Utils/HeavyDataStorage.js');

class B787_10_FMC_HeavyPage {

	/**
	 * @param fmc
	 */
	static async testDeparture(fmc) {
		console.log("D1")
		/** @type {FlightPlanManager} */
		let man = fmc.flightPlanManager;
/*
		await fmc.updateRouteOrigin('EGLL',() => {
			console.log("D2")
		});

		await fmc.updateRouteDestination('EGKK', () => {
			console.log("D3")
		});
*/
		await fmc.setOriginRunwayIndex(3, () => {
			console.log("D4")
		});

		console.log("D5")
		man.pauseSync();
		await fmc.setDepartureIndex(2, () => {
			console.log("D6")
			man.resumeSync();
		});

		console.log("D7")
	}

	static ShowPage1(fmc) {
		fmc.clearDisplay();
		/*
		            details.holdCourse = course;
            details.holdSpeedType = exports.HoldSpeedType.FAA;
            details.legTime = 60;
            details.speed = Math.max(Simplane.getGroundSpeed(), 140);
            details.windDirection = SimVar.GetSimVarValue("AMBIENT WIND DIRECTION", "degrees");
            details.windSpeed = SimVar.GetSimVarValue("AMBIENT WIND VELOCITY", "knots");
            details.legDistance = details.legTime * (details.speed / 3600);
            details.turnDirection = exports.HoldTurnDirection.Right;
            details.state = exports.HoldState.None;
            details.entryType = HoldDetails.calculateEntryType(course, courseTowardsHoldFix, details.turnDirection);
		 */
		/*
		let holdWaypoint = fmc.flightPlanManager.getWaypoint(1)
		const details = HoldDetails.createDefault(holdWaypoint.bearingInFP, holdWaypoint.bearingInFP);
		details.holdCourse = 117;
		details.legDistance = 15;
		details.turnDirection = HoldTurnDirection.Right
		fmc.flightPlanManager.addHoldAtWaypointIndex(1, details);

		let holdWaypoint2 = fmc.flightPlanManager.getWaypoint(2)
		const details2 = HoldDetails.createDefault(holdWaypoint2.bearingInFP, holdWaypoint2.bearingInFP);
		details2.holdCourse = 17;
		details2.legDistance = 20;
		details2.turnDirection = HoldTurnDirection.Left
		fmc.flightPlanManager.addHoldAtWaypointIndex(3, details2);
		 */
		let rows = [
			['HEAVY MENU'],
			[''],
			['', ''],
			[''],
			['', ''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			['', '<CONFIGURATION']
		];

		if (!B787_10_FMC_HeavyPage.WITHOUT_MANAGERS) {
			rows[2] = ['', '<Payload Manager'];
			rows[4] = ['', '<SimRate Manager'];

			fmc.onRightInput[0] = () => {
				new B787_10_FMC_PayloadManagerPage(fmc).showPage();
			};
			fmc.onRightInput[1] = () => {
				new B787_10_FMC_SimRateManagerPage(fmc).showPage();
			};
		}

		fmc.onRightInput[5] = () => {
			B787_10_FMC_HeavyConfigurationPage.ShowPage1(fmc);
		};

		fmc.setTemplate(
			rows
		);

		fmc.updateSideButtonActiveStatus();
	}
}

B787_10_FMC_HeavyPage.WITHOUT_MANAGERS = false;