export class FMAResolver {
    public update() {

    }
}

export enum AFDSMode {
    FLT_DIR = 'FLT DIR',
    AP = 'A/P',
    LAND3 = 'LAND 3'
}

export enum AFDSRollMode {
    HDG_HOLD = 'HDG HOLD',
    HDG_SEL = 'HDG SEL',
    LNAV = 'LNAV',
    LOC = 'LOC',
    ROLLOUT = 'ROLLOUT',
    TOGA = 'TO/GA',
    TRK_SEL = 'TRK SEL',
    TRK_HOLD = 'TRK HOLD',
    ATT = 'ATT',
    B_CRS = 'B/CRS',
    HUD_TOGA = 'HUD TO/GA'
}

export enum AFDSPitchMode {
    TOGA = 'TO/GA',
    ALT = 'ALT',
    VS = 'V/S',
    VNAV_PTH = 'VNAV PTH',
    VNAV_SPD = 'VNAV SPD',
    VNAV_ALT = 'VNAV ALT',
    VNAV = 'VNAV',
    GS = 'G/S',
    FLARE = 'FLARE',
    FLCH_SPD = 'FLCH SPD',
    FPA = 'FPA',
    GP = 'GP'
}

export enum AFDSAutothrottleMode {
    THR = 'THR',
    THR_REF = 'THR REF',
    HOLD = 'HOLD',
    IDLE = 'IDLE',
    SPD = 'SPD'
}
