Include.addScript('/Heavy/Utils/HeavyDataStorage.js');

class SimBriefCredentials {
	constructor(userName = '', userId = '') {
		this._userName = userName;
		this._userId = userId;
	}

	get userName() {
		return this._userName || HeavyDataStorage.get('SIMBRIEF_USERNAME', '');
	}

	get userId() {
		return this._userId || HeavyDataStorage.get('SIMBRIEF_USERID', '');
	}

	get userCredentials() {
		return {
			username: this.userName,
			userId: this.userId
		};
	}
}