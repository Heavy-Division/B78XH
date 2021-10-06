export namespace HeavyInput {
	export class Converters {
		static inputToAltitude(input: string): number | false {
			let inputCheck = input.split('FL');
			if (inputCheck.length === 1) {
				return isFinite(Number(inputCheck[0])) ? Number(inputCheck[0]) : false
			} else {
				if (inputCheck[0] === '' && isFinite(Number(inputCheck[1]))) {
					return Number(inputCheck[1]) * 100;
				} else {
					return false;
				}
			}
		}

		public static convertAltitudeDescriptionLettersToIndexes(input: string): number {
			switch (input) {
				case '':
					return 1;
				case 'A':
					return 2;
				case 'B':
					return 3;
				case 'AB':
					return 4;
				default:
					return 0;
			}
		}

		public static waypointConstraints(input: string, convertToFeet: boolean = true, convertAltitudeDescriptionLettersToIndexes: boolean = true) {

			let inputCheck = input;
			let inputArray;
			let output = {
				speed: <number>-1,
				altitudes: <number[]>[]
			};

			let stringAltitudes: string[] = [];

			let speed;
			let altitudes;

			if (inputCheck.indexOf('/') !== -1) {
				inputArray = inputCheck.split('/');
				if (inputArray.length !== 2) {
					return false;
				} else {
					speed = inputArray[0];
					altitudes = inputArray[1];
				}
			} else {
				altitudes = inputCheck;
			}

			if (speed) {
				if (Validators.speedRange(speed)) {
					output.speed = Math.round(parseInt(speed));
				} else {
					return false;
				}
			}

			if (altitudes) {
				let match = altitudes.match(/^([0-9]{4}|[0-5][0-9]{4}|FL[0-5][0-9]{2}|[0-5][0-9]{2})([AB]?)$/);
				if (!match) {
					match = altitudes.match(/^([0-9]{4}|[0-5][0-9]{4}|FL[0-5][0-9]{2}|[0-5][0-9]{2})(A)([0-9]{4}|[0-5][0-9]{4}|FL[0-5][0-9]{2}|[0-5][0-9]{2})(B)$/);
				}

				if (match) {
					match.forEach((value) => {
						stringAltitudes.push(String(value))
					})
				}
			}


			if (stringAltitudes) {
				if (convertToFeet) {
					for (let i = 1; i < stringAltitudes.length - 1; i++) {
						if (stringAltitudes[i].indexOf('FL') !== -1) {
							stringAltitudes[i] = stringAltitudes[i].replace('FL', '');
							output.altitudes[i] = parseInt(stringAltitudes[i]) * 100;
						} else {
							output.altitudes[i] = parseInt(stringAltitudes[i]);
						}
					}
				}

				if (convertAltitudeDescriptionLettersToIndexes) {
					if (stringAltitudes[2] || stringAltitudes[2] === '') {
						output.altitudes[2] = this.convertAltitudeDescriptionLettersToIndexes(stringAltitudes[2]);
					}
					if (stringAltitudes[5]) {
						output.altitudes[5] = this.convertAltitudeDescriptionLettersToIndexes(stringAltitudes[5]);
					}
				}
			}
			return (output.speed !== -1 || output.altitudes ? output : false);
		}
	}

	export class Validators {
		public static speedRange(input: string, min: number = 100, max: number = 399): boolean {
			const inputCheck = Number(input);
			return isFinite(inputCheck) && inputCheck >= min && inputCheck <= max;
		}

		public static altitudeRange(input: string, min: number = 0, max: number = Infinity): boolean {
			const inputCheck = Number(input);
			return isFinite(inputCheck) && inputCheck >= min && inputCheck <= max;
		}

		public static speedRangeWithAltitude(input: string): boolean {
			const inputCheck = input.split('/');
			return inputCheck.length === 2 && inputCheck[0] !== undefined && inputCheck[1] !== undefined && this.speedRange(inputCheck[0]) && this.altitudeRange(inputCheck[1]);
		}

		public static speedRestriction(input: string, cruiseAltitude: string | number): boolean {
			if (!this.speedRangeWithAltitude(input) || !this.altitudeRange(String(cruiseAltitude))) {
				return false;
			}
			let inputCheck = input.split('/');
			return inputCheck.length === 2 && inputCheck[0] !== undefined && inputCheck[1] !== undefined && this.speedRange(inputCheck[0]) && this.altitudeRange(inputCheck[1], 0, Number(cruiseAltitude))
		}
	}
}