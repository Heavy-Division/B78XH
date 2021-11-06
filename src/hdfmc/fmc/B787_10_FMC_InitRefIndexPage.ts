import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_IdentPage} from './B787_10_FMC_IdentPage';
import {B787_10_FMC_ApproachPage} from './B787_10_FMC_ApproachPage';
import {B787_10_FMC_PosInitPage} from './B787_10_FMC_PosInitPage';
import {B787_10_FMC_MaintPage} from './B787_10_FMC_MaintPage';
import {B787_10_FMC_ThrustLimPage} from './B787_10_FMC_ThrustLimPage';
import {B787_10_FMC_TakeOffRefPage} from './B787_10_FMC_TakeOffRefPage';
import {B787_10_FMC_PerfInitPage} from './B787_10_FMC_PerfInitPage';

export class B787_10_FMC_InitRefIndexPage {
	static ShowPage1(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
		fmc._renderer.renderTitle('INIT/REF INDEX');
		fmc._renderer.render([
			[''],
			['<IDENT', 'NAV DATA>'],
			[''],
			['<POS'],
			[''],
			['<PERF'],
			[''],
			['<THRUST LIM'],
			[''],
			['<TAKEOFF'],
			[''],
			['<APPROACH', 'MAINT>']
		]);
		fmc._renderer.lsk(1).event = () => {
			B787_10_FMC_IdentPage.ShowPage1(fmc);
		};
		fmc._renderer.lsk(2).event = () => {
			B787_10_FMC_PosInitPage.ShowPage1(fmc);
		};
		fmc._renderer.lsk(3).event = () => {
			B787_10_FMC_PerfInitPage.ShowPage1(fmc);
		};
		fmc._renderer.lsk(4).event = () => {
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};
		fmc._renderer.lsk(5).event = () => {
			B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
		};
		fmc._renderer.lsk(6).event = () => {
			B787_10_FMC_ApproachPage.ShowPage1(fmc);
		};
		fmc._renderer.rsk(6).event = () => {
			B787_10_FMC_MaintPage.ShowPage1(fmc);
		};
	}
}

//# sourceMappingURL=B787_10_FMC_InitRefIndexPage.js.map