class B787_10_FMC_FMCCommPage {
    static ShowPage1(fmc) {
        fmc.clearDisplay();
        fmc.setTemplate([
            ['FMC COMM', '1', '2'],
            [''],
            ['\<RTE 1', 'POS REPORT>'],
            ['UPLINK'],
            ['\<DES FORECAST'],
            [''],
            ['\<RTE DATA'],
            [''],
            [''],
            [''],
            [''],
            ['DATA LINK'],
            ['READY']
        ]);
        fmc.updateSideButtonActiveStatus();
    }
}
