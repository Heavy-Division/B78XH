export class B787_10_FMC_SelectWptPage {
	static ShowPage(fmc, waypoints, callback, page = 0) {
		fmc.cleanUpPage();
		let rows = [
			[''],
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
		for (let i = 0; i < 5; i++) {
			let w = waypoints[i + 5 * page];
			if (w) {
				let t = '';
				if (w.icao[0] === 'V') {
					t = ' VOR';
				} else if (w.icao[0] === 'N') {
					t = ' NDB';
				} else if (w.icao[0] === 'A') {
					t = ' AIRPORT';
				}
				rows[2 * i] = [w.ident + t];
				rows[2 * i + 1] = [w.infos.coordinates.toDegreeString()];
				fmc._renderer.lsk(i + 1).event = () => {
					callback(w);
				};
				fmc._renderer.rsk(i + 1).event = () => {
					callback(w);
				};
			}
		}

		fmc._renderer.renderTitle('SELECT DESIRED WPT');
		fmc._renderer.renderPages(page + 1, Math.ceil(waypoints.length / 5));
		fmc._renderer.render([
			...rows,
			['']
		]);

		fmc.onPrevPage = () => {
			if (page > 0) {
				B787_10_FMC_SelectWptPage.ShowPage(fmc, waypoints, callback, page - 1);
			}
		};
		fmc.onNextPage = () => {
			if (page < Math.floor(waypoints.length / 5)) {
				B787_10_FMC_SelectWptPage.ShowPage(fmc, waypoints, callback, page + 1);
			}
		};
	}
}