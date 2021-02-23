const HeavyInputChecks = {};

HeavyInputChecks.speedRange = (input, min = 100, max = 399) => {
	let inputCheck = input;
	return isFinite(inputCheck) && inputCheck >= min && inputCheck <= max;
};

HeavyInputChecks.altitudeRange = (input, min = 0, max = Infinity) => {
	let inputCheck = input;
	return isFinite(inputCheck) && inputCheck >= min && inputCheck <= max;
}

HeavyInputChecks.speedRangeWithAltitude = (input) => {
	let inputCheck = input.split('/');
	return inputCheck.length === 2 && inputCheck[0] && inputCheck[1] && HeavyInputChecks.speedRange(inputCheck[0]) && HeavyInputChecks.altitudeRange(inputCheck[1]);
};

HeavyInputChecks.speedRestriction = (input, cruiseAltitude) => {
	if(!HeavyInputChecks.speedRangeWithAltitude(input) || !HeavyInputChecks.altitudeRange(cruiseAltitude)){
		return false;
	}
	let inputCheck = input.split('/');
	return inputCheck.length === 2 && inputCheck[0] && inputCheck[1] && HeavyInputChecks.speedRange(inputCheck[0]) && HeavyInputChecks.altitudeRange(inputCheck[1], 0 , cruiseAltitude)
}

HeavyInputChecks.waypointConstraints = (input, convertToFeet = true, convertAltitudeDescriptionLettersToIndexes = true) => {
	let inputCheck = input;
	let inputArray;
	let output = {speed: -1, altitudes: null};

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
		if (HeavyInputChecks.speedRange(speed)) {
			output.speed = Math.round(parseInt(speed));
		} else {
			return false;
		}
	}

	if (altitudes) {
		output.altitudes = altitudes.match(/^([0-9]{4}|[0-5][0-9]{4}|FL[0-5][0-9]{2}|[0-5][0-9]{2})([AB]?)$/);
		if (!output.altitudes) {
			output.altitudes = altitudes.match(/^([0-9]{4}|[0-5][0-9]{4}|FL[0-5][0-9]{2}|[0-5][0-9]{2})(A)([0-9]{4}|[0-5][0-9]{4}|FL[0-5][0-9]{2}|[0-5][0-9]{2})(B)$/);
		}
	}


	if (output.altitudes) {
		if (convertToFeet) {
			for (let i = 1; i < output.altitudes.length - 1; i++) {
				if (output.altitudes[i].indexOf('FL') !== -1) {
					output.altitudes[i] = output.altitudes[i].replace('FL', '');
					output.altitudes[i] = parseInt(output.altitudes[i]) * 100;
				} else {
					output.altitudes[i] = parseInt(output.altitudes[i]);
				}
			}
		}

		if (convertAltitudeDescriptionLettersToIndexes) {
			if (output.altitudes[2] || output.altitudes[2] === '') {
				output.altitudes[2] = HeavyInputChecks.convertAltitudeDescriptionLettersToIndexes(output.altitudes[2]);
			}
			if (output.altitudes[5]) {
				output.altitudes[5] = HeavyInputChecks.convertAltitudeDescriptionLettersToIndexes(output.altitudes[5]);
			}
		}
	}
	return (output.speed !== -1 || output.altitudes ? output : false);
};

HeavyInputChecks.convertAltitudeDescriptionLettersToIndexes = (input) => {
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
};