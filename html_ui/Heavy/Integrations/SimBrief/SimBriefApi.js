class SimBriefApi {
	get apiBase() {
		return 'https://www.simbrief.com';
	}

	get apiPath() {
		return 'api/xml.fetcher.php';
	}

	constructor(credentials = undefined) {
		this.credentials = (credentials ? credentials : new SimBriefCredentials());
	}

	constructApiUrl(json = true) {
		let url = new URL(this.apiPath, this.apiBase);
		if (json) {
			url.searchParams.append('json', '1');
		}

		if (this.credentials && this.credentials.userId) {
			url.searchParams.append('userid', this.credentials.userId);
		}

		if (this.credentials && this.credentials.userName) {
			url.searchParams.append('username', this.credentials.userName);
		}

		return url;
	}

	fetchData(json = true) {
		let url = this.constructApiUrl(json);
		return fetch(url.href)
		.then((response) => {
			if (!response.ok) {
				throw (response);
			}

			return response.json();
		});
	}
}