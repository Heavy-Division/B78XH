import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_HeavyIRSPage} from './B787_10_FMC_HeavyIRSPage';
import {B787_10_FMC_PayloadManagerPage} from './B787_10_FMC_PayloadManagerPage';
import {B787_10_FMC_HeavyConfigurationPage} from './B787_10_FMC_HeavyConfigurationPage';
// import {B787_10_FMC_LNAVDebug} from './B787_10_FMC_LNAVDebug';
import { B787_10_FMC_HeavySimRatePage } from './B787_10_FMC_HeavySimRatePage';
import {B787_10_FMC_MaintPage} from "./B787_10_FMC_MaintPage";

export class B787_10_FMC_HeavyPage {

	static WITHOUT_MANAGERS: boolean = false;

	static ShowPage1(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
		fmc._renderer.render([
			[''],
			['SIMRATE MANAGER', 'IRS MENU>'],
			[''],
			['', 'PAYLOAD MANAGER>'],
			[''],
			['', ''],
			[''],
			[''],
			[''],
			[''],
			[''],
			['', 'CONFIGURATION>']
		]);

		// if (!B787_10_FMC_HeavyPage.WITHOUT_MANAGERS) {
		// 	rows[1] = ['', 'IRS Menu>'];
		// 	rows[3] = ['', 'Payload Manager>'];
		// 	// rows[7] = ['', 'SimRate Manager>'];

			fmc._renderer.rsk(1).event = () => {
				new B787_10_FMC_HeavyIRSPage(fmc).showPage();
			};

			fmc._renderer.rsk(2).event = () => {
				new B787_10_FMC_PayloadManagerPage(fmc).showPage();
			};

		fmc._renderer.rsk(6).event = () => {
			B787_10_FMC_HeavyConfigurationPage.ShowPage1(fmc);
		};

			// fmc._renderer.rsk(3).event = () => {
			// 	new B787_10_FMC_LNAVDebug(fmc).showPage();
			// };
			// TODO: Throws an error for some reason.

			 fmc._renderer.lsk(1).event = () => {
				 B787_10_FMC_HeavySimRatePage.ShowPage1(fmc);
			 };


		}

	// fmc._renderer.rsk(3).event = () => {
	// 	B787_10_FMC_LNAVDebug.showPage(fmc);
	// };	//
	//

	//
	// 	fmc._renderer.renderTitle('HEAVY MENU');
	//
	// }
}
