import { B787_10_FMC } from "./B787_10_FMC";
export declare class B787_10_FMC_PayloadManagerPage {
    private readonly fmc;
    private tankPriorityValues;
    private payloadValues;
    private _internalPayloadValuesCache;
    static get tankCapacity(): {
        CENTER: number;
        LEFT_MAIN: number;
        RIGHT_MAIN: number;
    };
    static get tankPriority(): string[][];
    static get tankVariables(): {
        CENTER: string;
        LEFT_MAIN: string;
        RIGHT_MAIN: string;
    };
    static get payloadIndex(): {
        PILOT: number;
        COPILOT: number;
        BUSINESS_CLASS: number;
        PREMIUM_ECONOMY: number;
        ECONOMY_CLASS: number;
        FORWARD_BAGGAGE: number;
        REAR_BAGGAGE: number;
    };
    static isPayloadManagerExecuted: boolean;
    static centerOfGravity: number;
    static requestedCenterOfGravity: number;
    static requestedFuel: number;
    static requestedPayload: number;
    static remainingPayload: number;
    static get getMaxFuel(): number;
    static get getMinFuel(): number;
    static get getMaxPayload(): number;
    static get getMinPayload(): number;
    static get getMaxCenterOfGravity(): number;
    static get getMinCenterOfGravity(): number;
    constructor(fmc: B787_10_FMC);
    init(): void;
    getPayloadValues(): ({
        PILOT: any;
        COPILOT: any;
        BUSINESS_CLASS?: undefined;
        PREMIUM_ECONOMY?: undefined;
        FORWARD_BAGGAGE?: undefined;
        ECONOMY_CLASS?: undefined;
        REAR_BAGGAGE?: undefined;
    } | {
        BUSINESS_CLASS: any;
        PREMIUM_ECONOMY: any;
        FORWARD_BAGGAGE: any;
        PILOT?: undefined;
        COPILOT?: undefined;
        ECONOMY_CLASS?: undefined;
        REAR_BAGGAGE?: undefined;
    } | {
        ECONOMY_CLASS: any;
        REAR_BAGGAGE: any;
        PILOT?: undefined;
        COPILOT?: undefined;
        BUSINESS_CLASS?: undefined;
        PREMIUM_ECONOMY?: undefined;
        FORWARD_BAGGAGE?: undefined;
    })[];
    getPayloadValue(index: any): any;
    getPayloadValueFromCache(index: any): any;
    setPayloadValue(index: any, value: any): Promise<void>;
    getTankValue(variable: any): any;
    getCenterOfGravity(): any;
    getTotalPayload(useLbs?: boolean): number;
    getTotalFuel(useLbs?: boolean): number;
    flushFuelAndPayload(): Promise<void>;
    flushFuel(): Promise<void>;
    calculateTanks(fuel: any): void;
    calculateMainTanks(fuel: any): number;
    calculateCenterTank(fuel: any): number;
    showPage(): void;
    resetPayload(): Promise<void>;
    calculatePayload(requestedPayload: any): Promise<void>;
    increaseFrontPayload(amount: any, requestedCenterOfGravity: any): Promise<void>;
    increaseRearPayload(amount: any, requestedCenterOfGravity: any): Promise<void>;
}
