export class AircraftPerformanceUtils {
	static climbN1Table = [
		[91, 91.6, 92.9, 94.1, 96.1, 97.6, 99.8, 101.2, 101.5, 100.7],
		[92.8, 93.2, 93.8, 93.1, 94.7, 96.2, 98.3, 99.7, 100.0, 99.2],
		[94.2, 95.0, 95.4, 94.8, 95.0, 94.9, 96.7, 98.2, 98.4, 97.7],
		[92.7, 95.5, 97.0, 96.4, 96.6, 96.5, 95.2, 96.6, 96.8, 96.1],
		[91.2, 93.9, 96.6, 97.9, 98.2, 98.0, 96.9, 95.5, 95.2, 94.5],
		[90.4, 93.1, 95.8, 97.3, 99.0, 98.9, 97.8, 96.5, 95.9, 95.2],
		[89.6, 92.3, 95.0, 96.5, 98.7, 99.7, 98.7, 97.6, 97.0, 96.3],
		[88.8, 91.5, 94.1, 95.6, 97.9, 99.6, 99.7, 98.6, 98.0, 97.3],
		[88.0, 90.7, 93.3, 94.8, 97.0, 98.7, 100.8, 99.6, 99.0, 98.3],
		[87.2, 89.8, 92.4, 93.9, 96.1, 97.8, 101.1, 100.8, 100.0, 99.3],
		[86.4, 89.0, 91.5, 93.0, 95.2, 96.8, 100.2, 101.4, 100.9, 100.3],
		[85.5, 88.1, 90.7, 92.1, 94.3, 95.9, 99.2, 101.0, 100.9, 100.8],
		[84.7, 87.3, 89.8, 91.2, 93.4, 95.0, 98.3, 100.0, 99.9, 99.9],
		[83.9, 86.4, 88.9, 90.3, 92.4, 94.0, 97.3, 99.0, 98.9, 98.9],
		[83.0, 85.5, 88.0, 89.4, 91.5, 93.1, 96.3, 98.0, 97.9, 97.9],
		[82.2, 84.7, 87.1, 88.5, 90.6, 92.1, 95.3, 97.0, 96.9, 96.8],
		[81.3, 83.8, 86.2, 87.5, 89.6, 91.2, 94.3, 96.0, 95.9, 95.8]
	];
	static climbN1TempRow = [60, 50, 40, 30, 20, 15, 10, 5, 0, -5, -10, -15, -20, -25, -30, -35, -40];
	static takeOffN1Table = [
		[89.7, 90.1, 90.6, 90.6, 90.6, 90.5, 90.4, 90.4, 90.3, 90.3, 89.7, 89.2, 88.5],
		[92.5, 93, 93.4, 93.4, 93.4, 93.3, 93.3, 93.2, 93.2, 93.2, 92.6, 92, 91.4],
		[93.9, 94.4, 94.8, 94.8, 94.8, 94.7, 94.6, 94.6, 94.6, 94.5, 94, 93.4, 92.8],
		[95.2, 95.7, 96.2, 96.1, 96.1, 96, 96, 95.9, 95.9, 95.9, 95.3, 94.7, 94.2],
		[96.5, 97, 97.5, 97.4, 97.3, 97.3, 97.3, 97.2, 97.2, 97.2, 96.6, 96, 95.5],
		[97.5, 98.2, 98.9, 98.7, 98.5, 98.4, 98.4, 98.5, 98.4, 98.4, 97.9, 97.3, 96.7],
		[97.8, 98.9, 99.8, 99.7, 99.7, 99.5, 99.3, 99.3, 99.2, 99.3, 8.8, 98.4, 98],
		[97.2, 98.8, 100.4, 100.4, 100.4, 100.4, 100.4, 100.1, 100, 99.9, 99.5, 99.2, 98.8],
		[96.4, 98, 99.6, 100.1, 100.7, 101.1, 101.1, 101.1, 101.7, 101.3, 100.3, 99.9, 99.5],
		[95.6, 97.2, 98.8, 99.3, 99.9, 100.5, 101.1, 101.8, 102.2, 102.4, 102.1, 101.5, 100.3],
		[94.8, 96.3, 97.9, 98.4, 99, 99.6, 1012, 101, 101.7, 102.5, 102.5, 102.2, 1011],
		[93.9, 95.5, 97.1, 97.6, 981, 98.8, 99.4, 100.1, 100.8, 101.6, 101.8, 102, 102.3],
		[93.1, 94.7, 96.2, 96.7, 97.3, 97.9, 98.5, 991, 99.9, 100.7, 100.9, 101.2, 101.4],
		[92.3, 93.8, 95.3, 95.8, 96.4, 97, 97.6, 98.3, 99.1, 99.8, 100, 100.3, 100.6],
		[90.6, 92.1, 93.6, 94.1, 94.6, 95.2, 95.9, 96.6, 97.3, 98, 8.3, 98.5, 98.8],
		[88.8, 90.3, 91.8, 92.3, 92.8, 93.4, 94.1, 94.8, 95.5, 96.3, 96.5, 96.7, 97],
		[87.0, 815, 89.9, 90.4, 91, 91.6, 92.3, 93, 93.7, 94.4, 94.7, 94.9, 95.2],
		[85.2, 86.7, 88.1, 88.6, 89.1, 89.8, 90.5, 91.2, 91.9, 92.6, 92.8, 93.1, 93.4],
		[83.4, 84.8, 861, 86.7, 87.3, 87.9, 88.6, 89.3, 90, 90.7, 91, 91.2, 91.5]
	];
	static _takeOffN1TempRow = [70, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0, -10, -20, -30, -40, -50];

	static getClimbThrustN1(temperature, altitude) {
		let lineIndex = 0;
		for (let i = 0; i < this.climbN1TempRow.length; i++) {
			lineIndex = i;
			if (temperature > this.climbN1TempRow[i]) {
				break;
			}
		}
		let rowIndex = Math.floor(altitude / 5000);
		rowIndex = Math.max(0, rowIndex);
		rowIndex = Math.min(rowIndex, this.climbN1Table[0].length - 1);
		return this.climbN1Table[lineIndex][rowIndex];
	}

	static getTakeOffThrustN1(temperature, airportAltitude) {
		let lineIndex = 0;
		for (let i = 0; i < this._takeOffN1TempRow.length; i++) {
			lineIndex = i;
			if (temperature > this._takeOffN1TempRow[i]) {
				break;
			}
		}
		let rowIndex = Math.floor(airportAltitude / 1000) + 2;
		rowIndex = Math.max(0, rowIndex);
		rowIndex = Math.min(rowIndex, this.takeOffN1Table[0].length - 1);
		return this.takeOffN1Table[lineIndex][rowIndex];
	}

	static getThrustClimbLimit() {
		let altitude = Simplane.getAltitude();
		let temperature = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
		return this.getClimbThrustN1(temperature, altitude) - this.getThrustCLBMode() * 8.6;
	}

	static getThrustCLBMode() {
		return SimVar.GetSimVarValue('L:B78XH_THRUST_CLIMB_MODE', 'Number');
	}

	static getThrustTakeOffLimit(airport: any = undefined) {
		if (airport) {
			let altitude = airport.infos.coordinates.alt;
			const assumedTemp = this.getThrustTakeOffTemp();
			let temp;
			if (assumedTemp) {
				temp = assumedTemp;
			} else {
				temp = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
			}
			return this.getTakeOffThrustN1(temp, altitude) - this.getThrustTakeOffMode() * 10;
		}
		return 100;
	}

	static getThrustTakeOffMode() {
		return SimVar.GetSimVarValue('L:B78XH_THRUST_TAKEOFF_MODE', 'Number');
	}

	/**
	 * TODO: Rename to ASSUMED TEMPERATURE
	 * @returns {any}
	 */
	static getThrustTakeOffTemp() {
		return SimVar.GetSimVarValue('L:B78XH_THRUST_ASSUMED_TEMPERATURE', 'Number');
	}
}