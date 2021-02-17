const HeavyInputUtils = {};

HeavyInputUtils.inputToAltitude = (input) => {
	let inputCheck = input.split('FL');
	if (isFinite(inputCheck[0]) && inputCheck.length === 1) {
		return inputCheck[0];
	} else if (inputCheck[0] === '' && isFinite(inputCheck[1])) {
		return inputCheck[1] * 100;
	} else {
		return false;
	}
};