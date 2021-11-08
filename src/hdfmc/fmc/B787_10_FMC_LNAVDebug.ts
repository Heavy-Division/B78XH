import {B787_10_FMC} from './B787_10_FMC';
import {LNAV} from '../../hdsdk/Navigation/LNAV';

/**
 * TODO: WIND_LEVELER is probably bugged in 787 I was talked about it with WT...
 */

export class B787_10_FMC_LNAVDebug {

	static lnav: LNAV = new LNAV();
	static updater: number = 0;

	static async showPage(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
		console.log('AP MANAGED MODE: ' + SimVar.GetSimVarValue('AUTOPILOT AVIONICS MANAGED', 'number'));
		console.log('WING LEVELER: ' + SimVar.GetSimVarValue('AUTOPILOT WING LEVELER', 'number'));
		console.log('BANK REF: ' + SimVar.GetSimVarValue('AUTOPILOT BANK HOLD REF', 'degrees'));
		console.log('BANK HOLD: ' + SimVar.GetSimVarValue('AUTOPILOT BANK HOLD', 'Bool'));
		console.log('PITCH REF: ' + SimVar.GetSimVarValue('AUTOPILOT PITCH HOLD REF', 'degrees'));
		console.log('PITCH HOLD: ' + SimVar.GetSimVarValue('AUTOPILOT PITCH HOLD', 'Bool'));
		console.log('APPROACH HOLD: ' + SimVar.GetSimVarValue('AUTOPILOT APPROACH HOLD', 'boolean'));

		fmc.pageUpdate = () => {
			this.updater += 1;
			if (this.updater > 10) {
				this.updater = 0;
				B787_10_FMC_LNAVDebug.showPage(fmc);
			}
		};

		//SimVar.SetSimVarValue('K:AP_WING_LEVELER_OFF', 'number', 0);
		//SimVar.SetSimVarValue('K:HEADING_SLOT_INDEX_SET', 'number', 2);
		//SimVar.SetSimVarValue('L:AP_HEADING_HOLD_ACTIVE', 'Number', 0);
		//Simplane.setAPLNAVArmed(1);
		//Simplane.setAPLNAVActive(1);
		//SimVar.SetSimVarValue('K:AP_NAV1_HOLD_ON', 'number', 0);

		//SimVar.SetSimVarValue('AUTOPILOT WING LEVELER', 'Bool', false);
		//SimVar.SetSimVarValue('K:AUTOPILOT_BANK_HOLD', 'number', 0);


		fmc._renderer.renderTitle('MANAGED LNAV DEBUG');
		fmc._renderer.render([
			['', ''],
			['<ENABLE', 'MANAGED', 'DISABLE>'],
			['', ''],
			['<ENABLE', 'BANK HOLD', 'DISABLE>'],
			['', ''],
			['<BANK LEFT', '5°', 'BANK RIGHT>'],
			['', ''],
			['<BANK LEFT', '10°', 'BANK RIGHT>'],
			['', ''],
			['<BANK LEFT', '15°', 'BANK RIGHT>'],
			['', ''],
			['<', 'COHERENT', 'BANK MODE>'],
			['', '']
		]);

		fmc._renderer.lsk(1).event = () => {
			this.lnav.enableManagedMode();
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};

		fmc._renderer.rsk(1).event = () => {
			this.lnav.disableManagedMode();
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};

		fmc._renderer.lsk(2).event = () => {
			this.lnav.enableBankHold();
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};

		fmc._renderer.rsk(2).event = () => {
			this.lnav.disableBankHold();
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};


		fmc._renderer.lsk(3).event = () => {
			this.lnav.setBank(-5);
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};

		fmc._renderer.lsk(4).event = () => {
			this.lnav.setBank(-10);
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};

		fmc._renderer.lsk(5).event = () => {
			this.lnav.setBank(-15);
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};

		fmc._renderer.lsk(6).event = () => {
			this.lnav.setBank(-20);
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};

		fmc._renderer.rsk(3).event = () => {
			this.lnav.setBank(5);
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};

		fmc._renderer.rsk(4).event = () => {
			this.lnav.setBank(10);
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};

		fmc._renderer.rsk(5).event = () => {
			this.lnav.setBank(15);
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};

		fmc._renderer.rsk(6).event = async () => {
			B787_10_FMC_LNAVDebug.showPage(fmc);
		};
	}
}