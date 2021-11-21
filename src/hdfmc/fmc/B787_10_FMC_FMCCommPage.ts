import {B787_10_FMC} from './B787_10_FMC';

export class B787_10_FMC_FMCCommPage {
	static ShowPage1(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
		fmc._renderer.renderTitle('FMC COMM');
		fmc._renderer.renderPages(1, 2);
		fmc._renderer.render([
			[''],
			['<RTE 1', 'POS REPORT>'],
			['UPLINK'],
			['<DES FORECAST'],
			[''],
			['<RTE DATA'],
			[''],
			[''],
			[''],
			[''],
			['DATA LINK'],
			['READY']
		]);
	}
}
