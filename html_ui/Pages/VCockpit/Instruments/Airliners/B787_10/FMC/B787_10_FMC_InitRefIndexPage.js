class B787_10_FMC_InitRefIndexPage {
    static ShowPage1(fmc) {
        fmc.clearDisplay();
        fmc.setTemplate([
            ['INIT/REF INDEX'],
            [''],
            ['\<IDENT', 'NAV DATA>'],
            [''],
            ['\<POS'],
            [''],
            ['\<PERF'],
            [''],
            ['\<THRUST LIM'],
            [''],
            ['\<TAKEOFF'],
            [''],
            ['\<APPROACH', 'MAINT>']
        ]);
        fmc.onLeftInput[0] = () => {
            B787_10_FMC_IdentPage.ShowPage1(fmc);
        };
        fmc.onLeftInput[1] = () => {
            B787_10_FMC_PosInitPage.ShowPage1(fmc);
        };
        fmc.onLeftInput[2] = () => {
            B787_10_FMC_PerfInitPage.ShowPage1(fmc);
        };
        fmc.onLeftInput[3] = () => {
            B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
        };
        fmc.onLeftInput[4] = () => {
            B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
        };
        fmc.onLeftInput[5] = () => {
            B787_10_FMC_ApproachPage.ShowPage1(fmc);
        };
        fmc.onRightInput[5] = () => {
            B787_10_FMC_MaintPage.ShowPage1(fmc);
        };
        fmc.updateSideButtonActiveStatus();
    }
}
//# sourceMappingURL=B787_10_FMC_InitRefIndexPage.js.map
