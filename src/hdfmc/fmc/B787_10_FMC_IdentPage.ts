import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_InitRefIndexPage} from './B787_10_FMC_InitRefIndexPage';
import {B787_10_FMC_PosInitPage} from './B787_10_FMC_PosInitPage';

export class B787_10_FMC_IdentPage {

	static _updateCounter = 0;

	static ShowPage1(fmc: B787_10_FMC) {
		fmc.cleanUpPage();

		B787_10_FMC_IdentPage._updateCounter = 0;
		fmc.pageUpdate = () => {
			if (B787_10_FMC_IdentPage._updateCounter >= 50) {
				B787_10_FMC_IdentPage.ShowPage1(fmc);
			} else {
				B787_10_FMC_IdentPage._updateCounter++;
			}
		};

		let date = fmc.getNavDataDateRange();

		fmc._renderer.renderTitle('IDENT');

		fmc._renderer.render([
			['MODEL', 'ENGINES'],
			['787-10', 'GEnx-1B76'],
			['NAV DATA', 'ACTIVE'],
			['AIRAC', date.toString()],
			['DRAG/FF'],
			[''],
			['OP PROGRAM', 'CO DATA'],
			[fmc.fmcManVersion, 'VS1001'],
			['OPC'],
			[fmc.fmcBakVersion, ''],
			['__FMCSEPARATOR'],
			['<INDEX', 'POS INIT>']
		]);

		if (fmc.urlConfig.index == 1) {
			fmc._renderer.lsk(6).event = () => {
				B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
			};

			fmc._renderer.rsk(6).event = () => {
				B787_10_FMC_PosInitPage.ShowPage1(fmc);
			};
		}

		/**
		 * Set periodic page refresh if version of HD mode is not loaded from misc file
		 */
		if (fmc.fmcManVersion.includes('XXXX-X-X') || fmc.fmcBakVersion.includes('XXXX-X-X')) {
			fmc.registerPeriodicPageRefresh(() => {
				B787_10_FMC_IdentPage.ShowPage1(fmc);
				return true;
			}, 100, false);
		}
	}
}