import { B787_10_FMC } from './B787_10_FMC';
import { B787_10_FMC_HeavyPage } from './B787_10_FMC_HeavyPage';
import { B787_10_FMC_InitRefIndexPage } from './B787_10_FMC_InitRefIndexPage';
import { HDLogger } from '../../hdlogger';
import * as HDSDK from './../../hdsdk/index';

export class B787_10_FMC_HeavySimRatePage {

    static ShowPage1(fmc: B787_10_FMC) {
        fmc.cleanUpPage();

        let title = (fmc) => {
            fmc._renderer.renderTitle('SIMRATE MANAGER: OFF');
        };

        let actualSimRate = SimVar.GetGlobalVarValue('SIMULATION RATE', 'Number');
        let isSimRateManagerActive = SimVar.GetSimVarValue(B78XH_LocalVariables.SIM_RATE_MANAGER.ACTIVATED, 'BOOLEAN');

        // const simRateRefresh = () => {
        //    while (isSimRateManagerActive === 0) {
        //        const renderSimRate = fmc._renderer.render(actualSimRate);
        //    }
        //    simRateRefresh();
        // };



        // const simRate = simRateRefresh();

        title(fmc);
        fmc._renderer.render([
            [''],
            ['', ''],
            [''],
            ['', ''],
            [''],
            ['', ''],
            [''],
            ['', ''],
            [''],
            [isSimRateManagerActive]
            [''],
            ['<BACK', '']
        ]);


        fmc._renderer.lsk(6).event = () => {
            B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
        };

        fmc._renderer.lsk(6).event = () => {
            B787_10_FMC_HeavyPage.ShowPage1(fmc);
        };

    }

    showPage() {

    }
}
