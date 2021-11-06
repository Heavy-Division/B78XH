import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_HeavyIRSPage} from './B787_10_FMC_HeavyIRSPage';
import {B787_10_FMC_PayloadManagerPage} from './B787_10_FMC_PayloadManagerPage';
import {B787_10_FMC_HeavyConfigurationPage} from './B787_10_FMC_HeavyConfigurationPage';

export class B787_10_FMC_HeavyPage {

	static WITHOUT_MANAGERS: boolean = false;

	static ShowPage1(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
		let rows = [
			[''],
			['', ''],
			[''],
			['', ''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			['', 'CONFIGURATION>']
		];

		if (!B787_10_FMC_HeavyPage.WITHOUT_MANAGERS) {
			rows[1] = ['', 'IRS Menu>'];
			rows[3] = ['', 'Payload Manager>'];
			//rows[5] = ['', 'SimRate Manager>'];

			fmc._renderer.rsk(1).event = () => {
				new B787_10_FMC_HeavyIRSPage(fmc).showPage();
			};

			fmc._renderer.rsk(2).event = () => {
				new B787_10_FMC_PayloadManagerPage(fmc).showPage();
			};
			/*
			 fmc._renderer.rsk(3).event = () => {
			 new B787_10_FMC_SimRateManagerPage(fmc).showPage();
			 };
			 */
		}

		fmc._renderer.rsk(6).event = () => {
			B787_10_FMC_HeavyConfigurationPage.ShowPage1(fmc);
		};

		fmc._renderer.renderTitle('HEAVY MENU');
		fmc._renderer.render(rows);

	}
}