import { B787_10_FMC } from "./B787_10_FMC";
export declare class B787_10_FMC_SimBriefConfigurationPage {
    private readonly fmc;
    constructor(fmc: B787_10_FMC);
    showPage(): void;
    setupInputHandlers(): void;
    getSimBriefUsernameCell(): string;
    getSimBriefUserIdCell(): string;
}
