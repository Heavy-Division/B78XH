import {PreFlightDataHolder} from "./PreFlightDataHolder";

export class FMCDataHolder {
    private readonly _preFlightDataHolder: PreFlightDataHolder;

    get preFlightDataHolder(): PreFlightDataHolder {
        return this._preFlightDataHolder;
    }

    constructor() {
        this._preFlightDataHolder = new PreFlightDataHolder();
    }
}
