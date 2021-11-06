import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_HeavyPage} from './B787_10_FMC_HeavyPage';
import * as HDSDK from './../../hdsdk/index';

export class B787_10_FMC_HeavyIRSPage {
	private readonly fmc: B787_10_FMC;

	constructor(fmc: B787_10_FMC) {
		this.fmc = fmc;
	}

	showPage() {
		this.fmc.cleanUpPage();
		let irsState = Math.max(SimVar.GetSimVarValue('L:B78XH_IRS_R_STATE', 'Number'), SimVar.GetSimVarValue('L:B78XH_IRS_L_STATE', 'Number'));
		let irsStateString = '';
		switch (irsState) {
			case 0:
				irsStateString = '[color=red]OFF[/color]';
				break;
			case 1:
				irsStateString = '[color=blue]ALIGNING[/color]';
				break;
			case 2:
				irsStateString = '[color=green]ALIGNED[/color]';
				break;
		}

		let irsAlignSpeed;

		switch (HDSDK.HeavyDataStorage.get('IRS_ALIGN_SPEED', 'REAL')) {
			case 'INSTANT':
				irsAlignSpeed = 'INSTANT';
				break;
			case 'FAST':
				irsAlignSpeed = 'FAST';
				break;
			case 'NORMAL':
				irsAlignSpeed = 'NORMAL';
				break;
			case 'REAL':
				irsAlignSpeed = 'REAL';
				break;
		}

		this.fmc.refreshPageCallback = () => {
			this.showPage();
		};

		this.fmc._renderer.renderTitle('IRS');
		this.fmc._renderer.render([
			['IRS STATUS', 'ALIGN TIME'],
			[irsStateString, irsAlignSpeed + '>'],
			['', ''],
			['', ''],
			['', ''],
			['', ''],
			['', ''],
			['', ''],
			['', ''],
			['', 'FORCE ALIGN>'],
			['', ''],
			['<BACK']
		]);

		this.fmc._renderer.rsk(5).event = () => {
			SimVar.SetSimVarValue('L:B78XH_IRS_L_STATE', 'Number', 2);
			SimVar.SetSimVarValue('L:B78XH_IRS_R_STATE', 'Number', 2);
			SimVar.SetSimVarValue('L:B78XH_IRS_L_SWITCH_STATE', 'Number', 1);
			SimVar.SetSimVarValue('L:B78XH_IRS_R_SWITCH_STATE', 'Number', 1);
			SimVar.SetSimVarValue('L:B78XH_IS_IRS_INITED', 'String', '2');
			this.showPage();
		};

		this.fmc._renderer.rsk(1).event = () => {
			this.showAlignSpeedConfigurationPage();
		};

		this.fmc._renderer.lsk(6).event = () => {
			B787_10_FMC_HeavyPage.ShowPage1(this.fmc);
		};


		this.fmc.registerPeriodicPageRefresh(() => {
			this.showPage();
			return true;
		}, 1000, false);
	}

	showAlignSpeedConfigurationPage() {
		this.fmc.cleanUpPage();

		let irsState = Math.max(SimVar.GetSimVarValue('L:B78XH_IRS_R_STATE', 'Number'), SimVar.GetSimVarValue('L:B78XH_IRS_L_STATE', 'Number'));
		let irsStateString = '';
		switch (irsState) {
			case 0:
				irsStateString = '[color=red]OFF[/color]';
				break;
			case 1:
				irsStateString = '[color=blue]ALIGNING[/color]';
				break;
			case 2:
				irsStateString = '[color=green]ALIGNED[/color]';
				break;
		}

		let irsAlignSpeed;

		switch (HDSDK.HeavyDataStorage.get('IRS_ALIGN_SPEED', 'REAL')) {
			case 'INSTANT':
				irsAlignSpeed = 'INSTANT';
				break;
			case 'FAST':
				irsAlignSpeed = 'FAST';
				break;
			case 'NORMAL':
				irsAlignSpeed = 'NORMAL';
				break;
			case 'REAL':
				irsAlignSpeed = 'REAL';
				break;
		}


		this.fmc._renderer.renderTitle('IRS');
		this.fmc._renderer.render([
			['IRS STATUS', 'ALIGN TIME'],
			[irsStateString, irsAlignSpeed],
			['', ''],
			['', '[size=small]<INSTANT[/size]'],
			['', ''],
			['', '[size=small]<FAST[/size]'],
			['', ''],
			['', '[size=small]<NORMAL[/size]'],
			['', ''],
			['', '[size=small]<REAL[/size]'],
			['', ''],
			['<BACK']
		]);


		this.fmc._renderer.rsk(2).event = () => {
			HDSDK.HeavyDataStorage.set('IRS_ALIGN_SPEED', 'INSTANT');
			this.showPage();
		};

		this.fmc._renderer.rsk(3).event = () => {
			HDSDK.HeavyDataStorage.set('IRS_ALIGN_SPEED', 'FAST');
			this.showPage();
		};

		this.fmc._renderer.rsk(4).event = () => {
			HDSDK.HeavyDataStorage.set('IRS_ALIGN_SPEED', 'NORMAL');
			this.showPage();
		};

		this.fmc._renderer.rsk(5).event = () => {
			HDSDK.HeavyDataStorage.set('IRS_ALIGN_SPEED', 'REAL');
			this.showPage();
		};

	}
}