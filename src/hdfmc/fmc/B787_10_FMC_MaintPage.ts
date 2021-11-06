import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_InitRefIndexPage} from './B787_10_FMC_InitRefIndexPage';

export class B787_10_FMC_MaintPage {
	static ShowPage1(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
		fmc._renderer.renderTitle('MAINT');
		fmc._renderer.render([
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			['<INDEX']
		]);

		fmc._renderer.lsk(6).event = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
	}
}