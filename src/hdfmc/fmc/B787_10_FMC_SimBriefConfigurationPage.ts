import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_HeavyConfigurationPage} from './B787_10_FMC_HeavyConfigurationPage';
import {BaseFMC} from './BaseFMC';
import * as HDSDK from './../../hdsdk/index';

export class B787_10_FMC_SimBriefConfigurationPage {
	private readonly fmc: B787_10_FMC;

	constructor(fmc: B787_10_FMC) {
		this.fmc = fmc;
	}

	showPage() {
		this.fmc.cleanUpPage();

		let simBriefUsernameCell = this.getSimBriefUsernameCell();

		let simBriefUserIdCell = this.getSimBriefUserIdCell();

		let routeOnlyCell = (HDSDK.HeavyDivision.SimBrief.importRouteOnly() ?
			`${this.fmc.resizeContent(this.fmc.colorizeContent('<YES', 'green'), 'large')}←→${this.fmc.resizeContent('NO', 'small')}` :
			`${this.fmc.resizeContent('<YES', 'small')}←→${this.fmc.resizeContent(this.fmc.colorizeContent('NO', 'green'), 'large')}`);

		let withSidCell =  (HDSDK.HeavyDivision.SimBrief.importSid() ?
			`${this.fmc.resizeContent(this.fmc.colorizeContent('<YES', 'green'), 'large')}←→${this.fmc.resizeContent('NO', 'small')}` :
			`${this.fmc.resizeContent('<YES', 'small')}←→${this.fmc.resizeContent(this.fmc.colorizeContent('NO', 'green'), 'large')}`);

		let withStarCell = (HDSDK.HeavyDivision.SimBrief.importStar() ?
			`${this.fmc.resizeContent(this.fmc.colorizeContent('<YES', 'green'), 'large')}←→${this.fmc.resizeContent('NO', 'small')}` :
			`${this.fmc.resizeContent('<YES', 'small')}←→${this.fmc.resizeContent(this.fmc.colorizeContent('NO', 'green'), 'large')}`);

		let importStrategyCell = (HDSDK.HeavyDivision.SimBrief.importStrategy() === 'INGAME' ?
			`${this.fmc.resizeContent(this.fmc.colorizeContent('<INGAME', 'green'), 'large')}←→${this.fmc.resizeContent('SB', 'small')}` :
			`${this.fmc.resizeContent('<INGAME', 'small')}←→${this.fmc.resizeContent(this.fmc.colorizeContent('SB', 'green'), 'large')}`);

		this.fmc._renderer.renderTitle('SIMBRIEF CONFIGURATION');
		this.fmc._renderer.render([
			['Route Only', 'Username'],
			[routeOnlyCell, simBriefUsernameCell],
			['With SID', 'UserID'],
			[withSidCell, simBriefUserIdCell],
			['With STAR'],
			[withStarCell],
			['Import strategy'],
			[importStrategyCell],
			[''],
			[''],
			[''],
			['<BACK']
		]);

		this.setupInputHandlers();

	}

	setupInputHandlers() {
		this.fmc._renderer.lsk(6).event = () => {
			B787_10_FMC_HeavyConfigurationPage.ShowPage1(this.fmc);
		};

		this.fmc._renderer.rsk(1).event = () => {
			let value = this.fmc.inOut;
			if (value === BaseFMC.clrValue) {
				this.fmc.inOut = '';
				HDSDK.HeavyDataStorage.set('SIMBRIEF_USERNAME', '');
			} else if (value.length > 0) {
				this.fmc.clearUserInput();
				HDSDK.HeavyDataStorage.set('SIMBRIEF_USERNAME', value);
			}
			this.showPage();
		};

		this.fmc._renderer.rsk(2).event = () => {
			let value = this.fmc.inOut;
			if (value === BaseFMC.clrValue) {
				this.fmc.inOut = '';
				HDSDK.HeavyDataStorage.set('SIMBRIEF_USERID', '');
			} else if (value.length > 0) {
				this.fmc.clearUserInput();
				HDSDK.HeavyDataStorage.set('SIMBRIEF_USERID', value);
			}

			this.showPage();
		};

		this.fmc._renderer.lsk(1).event = () => {
			if (HDSDK.HeavyDivision.SimBrief.importRouteOnly()) {
				HDSDK.HeavyDataStorage.set('SIMBRIEF_ROUTE_ONLY', '0');
			} else {
				HDSDK.HeavyDataStorage.set('SIMBRIEF_ROUTE_ONLY', '1');
			}
			this.showPage();
		};

		this.fmc._renderer.lsk(2).event = () => {
			if (HDSDK.HeavyDivision.SimBrief.importSid()) {
				HDSDK.HeavyDataStorage.set('SIMBRIEF_WITH_SID', '0');
			} else {
				HDSDK.HeavyDataStorage.set('SIMBRIEF_WITH_SID', '1');
			}
			this.showPage();
		};

		this.fmc._renderer.lsk(3).event = () => {
			if (HDSDK.HeavyDivision.SimBrief.importStar()) {
				HDSDK.HeavyDataStorage.set('SIMBRIEF_WITH_STAR', '0');
			} else {
				HDSDK.HeavyDataStorage.set('SIMBRIEF_WITH_STAR', '1');
			}
			this.showPage();
		};

		this.fmc._renderer.lsk(4).event = () => {
			if (HDSDK.HeavyDivision.SimBrief.importStrategy() === 'INGAME') {
				HDSDK.HeavyDataStorage.set('SIMBRIEF_IMPORT_STRATEGY', 'SB');
			} else {
				HDSDK.HeavyDataStorage.set('SIMBRIEF_IMPORT_STRATEGY', 'INGAME');
			}
			this.showPage();
		};
	}

	getSimBriefUsernameCell() {
		let cell = '-----';
		let username = HDSDK.HeavyDataStorage.get('SIMBRIEF_USERNAME', '');
		if (username) {
			cell = '[color=green]' + username + '[/color]';
		}
		return cell;
	}

	getSimBriefUserIdCell() {
		let cell = '-----';
		let userid = HDSDK.HeavyDataStorage.get('SIMBRIEF_USERID', '');
		if (userid) {
			cell = '[color=green]' + userid + '[/color]';
		}
		return cell;
	}

}
