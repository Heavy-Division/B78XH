(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.window = global.window || {}));
}(this, function (exports) { 'use strict';

    class SimBriefApi {
        /**
         * Constructor
         * @param {SimBriefCredentials} credentials
         */
        constructor(credentials) {
            /**
             * SimBrief API base url
             * @type {string}
             * @private
             */
            this.apiBase = 'https://www.simbrief.com';
            /**
             * SimBrief API path
             * @type {string}
             * @private
             */
            this.apiPath = 'api/xml.fetcher.php';
            this.credentials = credentials;
        }
        /**
         * Fetches SimBrief flight plan from API
         * @param {boolean} json
         * @returns {Promise<JSON>}
         */
        fetchData(json = true) {
            let url = this.constructApiUrl(json);
            return fetch(url.href)
                .then((response) => {
                if (!response.ok) {
                    throw (response);
                }
                return response.json();
            });
        }
        /**
         * Constructs SimBrief API url
         * @param {boolean} json
         * @returns {URL}
         * @private
         */
        constructApiUrl(json = true) {
            let url = new URL(this.apiPath, this.apiBase);
            if (json) {
                url.searchParams.append('json', '1');
            }
            if (this.credentials && this.credentials.userId) {
                url.searchParams.append('userid', String(this.credentials.userId));
            }
            if (this.credentials && this.credentials.userName) {
                url.searchParams.append('username', String(this.credentials.userName));
            }
            console.log(url);
            return url;
        }
    }

    class HeavyDataStorage {
        /**
         * Loads data from data storage
         * @param {string} _key
         * @param {string | number | boolean | null} _default
         * @returns {string | number | boolean}
         */
        static get(_key, _default = null) {
            return GetStoredData(this.storagePrefix + _key) || _default || false;
        }
        /**
         * Loads data from data storage (get alias)
         * @param {string} _key
         * @param {string | number | boolean | null} _default
         * @returns {string | number | boolean}
         */
        static load(_key, _default = null) {
            return this.get(_key, _default);
        }
        /**
         * Stores data to data storage
         * @param {string} _key
         * @param {string | number | boolean} _data
         */
        static set(_key, _data) {
            SetStoredData(this.storagePrefix + _key, _data);
        }
        /**
         * Stores data to data storage (set alias)
         * @param {string} _key
         * @param {string | number | boolean} _data
         */
        static store(_key, _data) {
            this.set(_key, _data);
        }
        /**
         * Removes data from data storage
         * @param {string} _key
         */
        static delete(_key) {
            DeleteStoredData(this.storagePrefix + _key);
        }
        /**
         * Removes data from data storage (delete alias)
         * @param {string} _key
         */
        static remove(_key) {
            this.delete(_key);
        }
        /**
         * Finds data in data storage
         * @param {string} _key
         * @param {boolean} _printLog
         * @returns {any}
         */
        static search(_key, _printLog = false) {
            try {
                let Storage = GetDataStorage();
                if (Storage) {
                    let values = Storage.searchData(_key);
                    if (_printLog) {
                        for (let i = 0; i < values.length; i++) {
                            console.log(i + ' : ' + values[i].key + ' : ' + values[i].data);
                        }
                    }
                    return values;
                }
            }
            catch (error) {
                return null;
            }
            return null;
        }
        /**
         * Finds data in data storage (search alias)
         * @param {string} _key
         * @param {boolean} _printLog
         * @returns {any}
         */
        static find(_key, _printLog = false) {
            return this.search(_key, _printLog);
        }
    }
    /**
     * Data storage KEY prefix
     * @type {string}
     * @private
     */
    HeavyDataStorage.storagePrefix = 'HEAVY_B78XH_';

    class SimBriefCredentials {
        /**
         * Constructor
         * @param {string} userName
         * @param {number} userId
         */
        constructor(userName = '', userId = NaN) {
            this._userName = userName;
            this._userId = userId;
        }
        /**
         * Returns SimBrief username
         * @returns {string}
         */
        get userName() {
            if (this._userName) {
                return this._userName;
            }
            else {
                const userName = HeavyDataStorage.get('SIMBRIEF_USERNAME', '');
                if (userName) {
                    return String(userName);
                }
                else {
                    return '';
                }
            }
        }
        /**
         * Returns SimBrief userId
         * @returns {number}
         */
        get userId() {
            return this._userId || Number(HeavyDataStorage.get('SIMBRIEF_USERID', ''));
        }
    }

    class SimBrief {
        /**
         * Constructor
         */
        constructor() {
            this.credentials = new SimBriefCredentials();
            this.api = new SimBriefApi(this.credentials);
            this.flightPlan = null;
        }
        /**
         * Returns SimBrief username from credentials
         * @returns {string}
         */
        getUserName() {
            return this.credentials.userName;
        }
        /**
         * Returns SimBrief userId from credentials
         * @returns {number}
         */
        getUserId() {
            return this.credentials.userId;
        }
        /**
         * Returns SimBrief flight plan
         * @returns {Promise<JSON> | null}
         */
        getFlightPlan() {
            if (!this.flightPlan) {
                this.fetchFlightPlan();
            }
            return this.flightPlan;
        }
        /**
         * Fetches SimBrief flight plan from API
         * @private
         */
        fetchFlightPlan() {
            this.flightPlan = this.api.fetchData();
        }
    }

    class SimBriefOceanicWaypointConverter {
        /**
         * Converts SimBrief oceanic waypoints to MSFS oceanic waypoints
         * @param {string} value
         * @returns {string}
         */
        static convert(value) {
            let pattern1 = /([0-9]{2})N([0-9]{1})([0-9]{2})W/;
            if (pattern1.test(value)) {
                return value.replace(pattern1, '$1$3N');
            }
            return value;
        }
    }

    (function (HeavyInput) {
        class Converters {
            static inputToAltitude(input) {
                let inputCheck = input.split('FL');
                if (inputCheck.length === 1) {
                    return isFinite(Number(inputCheck[0])) ? Number(inputCheck[0]) : false;
                }
                else {
                    if (inputCheck[0] === '' && isFinite(Number(inputCheck[1]))) {
                        return Number(inputCheck[1]) * 100;
                    }
                    else {
                        return false;
                    }
                }
            }
            static convertAltitudeDescriptionLettersToIndexes(input) {
                switch (input) {
                    case '':
                        return 1;
                    case 'A':
                        return 2;
                    case 'B':
                        return 3;
                    case 'AB':
                        return 4;
                    default:
                        return 0;
                }
            }
            static waypointConstraints(input, convertToFeet = true, convertAltitudeDescriptionLettersToIndexes = true) {
                let inputCheck = input;
                let inputArray;
                let output = {
                    speed: -1,
                    altitudes: []
                };
                let stringAltitudes = [];
                let speed;
                let altitudes;
                if (inputCheck.indexOf('/') !== -1) {
                    inputArray = inputCheck.split('/');
                    if (inputArray.length !== 2) {
                        return false;
                    }
                    else {
                        speed = inputArray[0];
                        altitudes = inputArray[1];
                    }
                }
                else {
                    altitudes = inputCheck;
                }
                if (speed) {
                    if (Validators.speedRange(speed)) {
                        output.speed = Math.round(parseInt(speed));
                    }
                    else {
                        return false;
                    }
                }
                if (altitudes) {
                    let match = altitudes.match(/^([0-9]{4}|[0-5][0-9]{4}|FL[0-5][0-9]{2}|[0-5][0-9]{2})([AB]?)$/);
                    if (!match) {
                        match = altitudes.match(/^([0-9]{4}|[0-5][0-9]{4}|FL[0-5][0-9]{2}|[0-5][0-9]{2})(A)([0-9]{4}|[0-5][0-9]{4}|FL[0-5][0-9]{2}|[0-5][0-9]{2})(B)$/);
                    }
                    if (match) {
                        match.forEach((value) => {
                            stringAltitudes.push(String(value));
                        });
                    }
                }
                if (stringAltitudes) {
                    if (convertToFeet) {
                        for (let i = 1; i < stringAltitudes.length - 1; i++) {
                            if (stringAltitudes[i].indexOf('FL') !== -1) {
                                stringAltitudes[i] = stringAltitudes[i].replace('FL', '');
                                output.altitudes[i] = parseInt(stringAltitudes[i]) * 100;
                            }
                            else {
                                output.altitudes[i] = parseInt(stringAltitudes[i]);
                            }
                        }
                    }
                    if (convertAltitudeDescriptionLettersToIndexes) {
                        if (stringAltitudes[2] || stringAltitudes[2] === '') {
                            output.altitudes[2] = this.convertAltitudeDescriptionLettersToIndexes(stringAltitudes[2]);
                        }
                        if (stringAltitudes[5]) {
                            output.altitudes[5] = this.convertAltitudeDescriptionLettersToIndexes(stringAltitudes[5]);
                        }
                    }
                }
                return (output.speed !== -1 || output.altitudes ? output : false);
            }
        }
        HeavyInput.Converters = Converters;
        class Validators {
            static speedRange(input, min = 100, max = 399) {
                const inputCheck = Number(input);
                return isFinite(inputCheck) && inputCheck >= min && inputCheck <= max;
            }
            static altitudeRange(input, min = 0, max = Infinity) {
                const inputCheck = Number(input);
                return isFinite(inputCheck) && inputCheck >= min && inputCheck <= max;
            }
            static speedRangeWithAltitude(input) {
                const inputCheck = input.split('/');
                return inputCheck.length === 2 && inputCheck[0] !== undefined && inputCheck[1] !== undefined && this.speedRange(inputCheck[0]) && this.altitudeRange(inputCheck[1]);
            }
            static speedRestriction(input, cruiseAltitude) {
                if (!this.speedRangeWithAltitude(input) || !this.altitudeRange(String(cruiseAltitude))) {
                    return false;
                }
                let inputCheck = input.split('/');
                return inputCheck.length === 2 && inputCheck[0] !== undefined && inputCheck[1] !== undefined && this.speedRange(inputCheck[0]) && this.altitudeRange(inputCheck[1], 0, Number(cruiseAltitude));
            }
        }
        HeavyInput.Validators = Validators;
    })(exports.HeavyInput || (exports.HeavyInput = {}));

    exports.SimBrief = SimBrief;
    exports.SimBriefCredentials = SimBriefCredentials;
    exports.SimBriefApi = SimBriefApi;
    exports.SimBriefOceanicWaypointConverter = SimBriefOceanicWaypointConverter;
    exports.HeavyDataStorage = HeavyDataStorage;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
