Include.addScript('/Heavy/Utils/HeavyDataStorage.js');
Include.addScript('/Heavy/SimBrief/SimBriefOceanicWaypointConverter.js');
Include.addScript('/Heavy/SimBrief/SimBriefCredentials.js');
Include.addScript('/Heavy/SimBrief/SimBriefApi.js');

class SimBrief {

	constructor() {
		this.credentials = new SimBriefCredentials();
		this.api = new SimBriefApi(this.credentials);
		this.flightPlan = null;
	}

	setCredentials(credentials){
		if(credentials instanceof SimBriefCredentials){
			this.credentials = credentials;
		}
	}

	getCredentials(){
		return this.credentials;
	}

	getUserName(){
		return this.credentials.userName;
	}

	getUserId(){
		return this.credentials.userId;
	}

	fetchFlightPlan(){
		this.flightPlan = this.api.fetchData()
	}

	getFlightPlan(){
		if(!this.flightPlan){
			this.fetchFlightPlan();
		}

		return this.flightPlan;
	}
}