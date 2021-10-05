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
                url.searchParams.append('username', this.credentials.userName);
            }
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
            return this._userName || String(HeavyDataStorage.get('SIMBRIEF_USERNAME', ''));
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

    exports.SimBrief = SimBrief;
    exports.SimBriefCredentials = SimBriefCredentials;
    exports.SimBriefApi = SimBriefApi;
    exports.SimBriefOceanicWaypointConverter = SimBriefOceanicWaypointConverter;
    exports.HeavyDataStorage = HeavyDataStorage;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
