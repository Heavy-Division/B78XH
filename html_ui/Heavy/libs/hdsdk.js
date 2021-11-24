(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.window = global.window || {}));
})(this, (function (exports) { 'use strict';

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
        async getFlightPlan() {
            return await this.api.fetchData(true);
        }
    }

    class SimBriefOceanicWaypointConverter {
        /**
         * Converts SimBrief oceanic waypoints to MSFS oceanic waypoints
         * @param {string} value
         * @returns {string}
         */
        static convert(waypoint) {
            const pattern = /([0-9]{2})(N|S)([0-9]{3})(W|E)/;
            const match = waypoint.match(pattern);
            if (match !== null) {
                const lat = parseInt(match[1], 10);
                const lathem = match[2];
                const long = parseInt(match[3], 10);
                const longhem = match[4];
                const sep = {
                    'NW': 'N',
                    'NE': 'E',
                    'SW': 'W',
                    'SE': 'S',
                }[`${lathem}${longhem}`];
                return long < 100 ?
                    `${lat}${long}${sep}` : `${lat}${sep}${long % 100}`;
            }
            return waypoint;
        }
    }

    var HDFixType;
    (function (HDFixType) {
        HDFixType[HDFixType["WAYPOINT"] = 0] = "WAYPOINT";
        HDFixType[HDFixType["AIRPORT"] = 1] = "AIRPORT";
        HDFixType[HDFixType["VOR"] = 2] = "VOR";
        HDFixType[HDFixType["MISC"] = 3] = "MISC";
    })(HDFixType || (HDFixType = {}));

    var HDFixStage;
    (function (HDFixStage) {
        HDFixStage[HDFixStage["CLB"] = 0] = "CLB";
        HDFixStage[HDFixStage["CRZ"] = 1] = "CRZ";
        HDFixStage[HDFixStage["DES"] = 2] = "DES";
    })(HDFixStage || (HDFixStage = {}));

    class HDFix {
        constructor(data) {
            this.coordinatesRegex = /([0-9]{2})([NS])([0-9])([0-9]{2})([WE])/g;
            this.coordinatesShorthandOverRegex = /([0-9]{2}([NSE])([0-9]{2}))/g;
            this.coordinatesShorthandUnderRegex = /([0-9]{2}([0-9]{2})([NSE]))/g;
            this.rawData = data;
            this.parse();
        }
        get ident() {
            return this._ident;
        }
        get originalIdent() {
            return this._originalIdent;
        }
        get flightPhase() {
            return this.stage;
        }
        get isCoordinatesWaypoint() {
            this.coordinatesRegex.lastIndex = 0;
            this.coordinatesShorthandOverRegex.lastIndex = 0;
            this.coordinatesShorthandUnderRegex.lastIndex = 0;
            if (this.type === HDFixType.MISC || this.type === HDFixType.WAYPOINT) {
                if (this.coordinatesRegex.test(this.originalIdent) || this.coordinatesShorthandOverRegex.test(this.originalIdent) || this.coordinatesShorthandUnderRegex.test(this.originalIdent)) {
                    return true;
                }
            }
            return false;
        }
        parse() {
            this._originalIdent = this.rawData.ident;
            this._ident = this.convertIdent(this.rawData.ident);
            this.name = this.rawData.name;
            this.type = this.parseType(this.rawData.type);
            this.stage = this.parseStage(this.rawData.stage);
            this.airway = this.rawData.via_airway;
            this.lat = this.rawData.pos_lat;
            this.lon = this.rawData.pos_long;
            this.mora = this.rawData.mora;
            this.airwayIn = undefined;
            this.airwayOut = undefined;
        }
        convertIdent(ident) {
            /**
             * 50.30N060W -> H5060
             *
             *
             * 50N160W -> 50N60
             * 50S160E -> 50S60
             * 50S160W -> 50W60
             * 50N160E -> 50E60
             *
             *
             * 50N060W -> 5060N
             * 50N060E  -> 5060E
             * 50S060E -> 5060S
             * 50S060W -> 5060W
             */
            /**
             * /([0-9]{2})([NS])([0-9])([0-9]{2})([WE])/g
             */
            if (this.coordinatesRegex.test(ident)) {
                return ident.replace(this.coordinatesRegex, (matches, lat, mid, lonStart, lonEnd, end) => {
                    if (lonStart == '0') {
                        if (mid === 'N' && end == 'W') {
                            return lat + lonEnd + 'N';
                        }
                        else if (mid === 'N' && end == 'E') {
                            return lat + lonEnd + 'E';
                        }
                        else if (mid === 'S' && end == 'W') {
                            return lat + lonEnd + 'W';
                        }
                        else if (mid === 'S' && end == 'E') {
                            return lat + lonEnd + 'S';
                        }
                    }
                    else {
                        if (mid === 'N' && end == 'W') {
                            return lat + 'N' + lonEnd;
                        }
                        else if (mid === 'N' && end == 'E') {
                            return lat + 'E' + lonEnd;
                        }
                        else if (mid === 'S' && end == 'W') {
                            return lat + 'W' + lonEnd;
                        }
                        else if (mid === 'S' && end == 'E') {
                            return lat + 'S' + lonEnd;
                        }
                    }
                });
            }
            return ident;
        }
        parseType(value) {
            switch (value) {
                case 'wpt':
                    return HDFixType.WAYPOINT;
                case 'apt':
                    return HDFixType.AIRPORT;
                case 'vor':
                    return HDFixType.VOR;
                default:
                    return HDFixType.MISC;
            }
        }
        parseStage(value) {
            switch (value) {
                case 'CLB':
                    return HDFixStage.CLB;
                case 'CRZ':
                    return HDFixStage.CRZ;
                case 'DSC':
                    return HDFixStage.DES;
                default:
                    return undefined;
            }
        }
    }

    class HDAirport {
        constructor(data) {
            const airport = data;
            this.icao = airport.icao_code;
            this.iata = airport.iata_code;
            this.name = airport.name;
            this.lat = Number(airport.pos_lat);
            this.lon = Number(airport.pos_lon);
            this.elevation = Number(airport.elevation);
            this.plannedRunway = airport.plan_rwy;
        }
    }

    class HDOrigin extends HDAirport {
        constructor(data) {
            super(data.origin);
        }
    }

    class HDDestination extends HDAirport {
        constructor(data) {
            super(data.destination);
        }
    }

    class HDNavlogInfo {
        constructor(data) {
            const general = data.general;
            this.flightNumber = general.flight_number;
            this.costIndex = parseInt(general.costindex);
            this.initialAltitude = parseInt(general.initial_altitude);
            this.cruiseMach = parseFloat(general.cruise_mach);
            this.cruiseTrueAirspeed = parseInt(general.cruise_tas);
            this.route = general.route;
            this.units = data.params.units;
            const fixes = data.navlog.fix;
            const destination = data.destination.icao_code;
            const lastWaypointIndex = (fixes[fixes.length - 1].ident === destination ? fixes.length - 2 : fixes.length - 1);
            this.sid = fixes[0].via_airway !== 'DCT' ? fixes[0].via_airway : 'DCT';
            this.star = fixes[lastWaypointIndex].via_airway !== 'DCT' ? fixes[lastWaypointIndex].via_airway : 'DCT';
            if (this.sid !== 'DCT') {
                const transIndex = data.navlog.fix.map((waypoint) => {
                    return waypoint.via_airway === this.sid;
                }).lastIndexOf(true);
                this.enRouteTrans = data.navlog.fix[transIndex].ident;
            }
        }
    }

    class HDWeights {
        constructor(data) {
            const weights = data.weights;
            this._operatingEmpty = Number(weights.oew);
            this._maxTakeoff = Number(weights.max_tow);
            this._maxTakeoffStruct = Number(weights.max_tow_struct);
            this._maxZeroFuel = Number(weights.max_zfw);
            this._maxLanding = Number(weights.max_ldw);
            this._estimatedTakeoff = Number(weights.est_tow);
            this._estimatedZeroFuel = Number(weights.est_zfw);
            this._estimatedLanding = Number(weights.est_ldw);
            this._estimatedRamp = Number(weights.est_ramp);
            this._cargo = Number(weights.cargo);
            this._paxCount = Number(weights.pax_count);
            this._paxWeight = Number(weights.pax_weight);
            this._payload = Number(weights.payload);
        }
        get payload() {
            return this._payload;
        }
        get paxWeight() {
            return this._paxWeight;
        }
        get paxCount() {
            return this._paxCount;
        }
        get cargo() {
            return this._cargo;
        }
        get estimatedRamp() {
            return this._estimatedRamp;
        }
        get estimatedLanding() {
            return this._estimatedLanding;
        }
        get estimatedZeroFuel() {
            return this._estimatedZeroFuel;
        }
        get estimatedTakeoff() {
            return this._estimatedTakeoff;
        }
        get maxLanding() {
            return this._maxLanding;
        }
        get maxZeroFuel() {
            return this._maxZeroFuel;
        }
        get maxTakeoffStruct() {
            return this._maxTakeoffStruct;
        }
        get maxTakeoff() {
            return this._maxTakeoff;
        }
        get operatingEmpty() {
            return this._operatingEmpty;
        }
    }

    class HDFuel {
        constructor(data) {
            const fuel = data.fuel;
            this._taxi = fuel.taxi;
            this._enrouteBurn = fuel.enroute_burn;
            this._contingency = fuel.contingency;
            this._alternateBurn = fuel.alternate_burn;
            this._reserve = fuel.reserve;
            this._etops = fuel.etops;
            this._extra = fuel.extra;
            this._minTakeoff = fuel.min_takeoff;
            this._plannedTakeoff = fuel.plan_takeoff;
            this._plannedRamp = fuel.plan_ramp;
            this._plannedLanding = fuel.plan_landing;
            this._averageFlow = fuel.avg_fuel_flow;
            this._maxTanks = fuel.max_tanks;
        }
        get taxi() {
            return this._taxi;
        }
        set taxi(value) {
            this._taxi = value;
        }
        get enrouteBurn() {
            return this._enrouteBurn;
        }
        set enrouteBurn(value) {
            this._enrouteBurn = value;
        }
        get alternateBurn() {
            return this._alternateBurn;
        }
        set alternateBurn(value) {
            this._alternateBurn = value;
        }
        get contingency() {
            return this._contingency;
        }
        set contingency(value) {
            this._contingency = value;
        }
        get reserve() {
            return this._reserve;
        }
        set reserve(value) {
            this._reserve = value;
        }
        get extra() {
            return this._extra;
        }
        set extra(value) {
            this._extra = value;
        }
        get minTakeoff() {
            return this._minTakeoff;
        }
        set minTakeoff(value) {
            this._minTakeoff = value;
        }
        get plannedTakeoff() {
            return this._plannedTakeoff;
        }
        set plannedTakeoff(value) {
            this._plannedTakeoff = value;
        }
        get plannedRamp() {
            return this._plannedRamp;
        }
        set plannedRamp(value) {
            this._plannedRamp = value;
        }
        get plannedLanding() {
            return this._plannedLanding;
        }
        set plannedLanding(value) {
            this._plannedLanding = value;
        }
        get maxTanks() {
            return this._maxTanks;
        }
        set maxTanks(value) {
            this._maxTanks = value;
        }
        get averageFlow() {
            return this._averageFlow;
        }
        set averageFlow(value) {
            this._averageFlow = value;
        }
        get etops() {
            return this._etops;
        }
        set etops(value) {
            this._etops = value;
        }
    }

    class SimBriefNavlogParser {
        constructor(simbrief) {
            this._rawNavlog = undefined;
            this.transformedNavlog = undefined;
            this.navlog = undefined;
            this.middlewares = [];
            this._fixes = [];
            this.simbrief = simbrief;
        }
        get info() {
            return this._info;
        }
        get origin() {
            return this._origin;
        }
        get destination() {
            return this._destination;
        }
        get fixes() {
            return this._fixes;
        }
        get weights() {
            return this._weights;
        }
        get fuel() {
            return this._fuel;
        }
        async parse() {
            this._rawNavlog = await this.simbrief.getFlightPlan();
            await this.parseOrigin();
            await this.parseDestination();
            await this.parseNavlogInfo();
            await this.parseWeights();
            await this.parseFuel();
            await this.transformNavlog();
            await this.parseWaypoints();
        }
        async transformNavlog() {
            const data = await this._rawNavlog;
            this.transformedNavlog = this.applyMiddlewares(data);
        }
        async parseWaypoints() {
            const fixes = this.transformedNavlog.navlog.fix;
            for (const fix of fixes) {
                this._fixes.push(new HDFix(fix));
            }
        }
        use(middleware) {
            this.middlewares.push(middleware);
        }
        applyMiddleware(data, middleware) {
            return middleware.apply(data);
        }
        applyMiddlewares(data) {
            let output = data;
            this.middlewares.forEach((middleware) => {
                output = this.applyMiddleware(output, middleware);
            });
            return output;
        }
        async parseOrigin() {
            this._origin = new HDOrigin(this._rawNavlog);
        }
        async parseDestination() {
            this._destination = new HDDestination(this._rawNavlog);
        }
        async parseNavlogInfo() {
            this._info = new HDNavlogInfo(this._rawNavlog);
        }
        async parseWeights() {
            this._weights = new HDWeights(this._rawNavlog);
        }
        async parseFuel() {
            this._fuel = new HDFuel(this._rawNavlog);
        }
    }

    class SimBriefImporter {
        constructor(parser) {
            this.parser = parser;
        }
        getInfo() {
            return this.parser.info;
        }
        getFixes() {
            return this.parser.fixes;
        }
        getOrigin() {
            return this.parser.origin;
        }
        getDestination() {
            return this.parser.destination;
        }
        getFuel() {
            return this.parser.fuel;
        }
        getWeights() {
            return this.parser.weights;
        }
        async execute() {
            return new Promise(async (resolve) => {
                await this.parser.parse();
                resolve();
            });
        }
    }

    exports.HeavyInput = void 0;
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

    exports.FMCLineType = void 0;
    (function (FMCLineType) {
        FMCLineType[FMCLineType["LINE"] = 0] = "LINE";
        FMCLineType[FMCLineType["TITLE"] = 1] = "TITLE";
    })(exports.FMCLineType || (exports.FMCLineType = {}));

    class SelectKey {
        constructor(id, container) {
            this.id = undefined;
            this.side = undefined;
            this._event = undefined;
            this.hoverElement = undefined;
            this.buttonElement = undefined;
            this.borderElement = undefined;
            this.dashElement = undefined;
            this.side = id.substring(0, 3);
            this.id = parseInt(id.substring(3, 4));
            this.init(container);
        }
        init(container) {
            const id = this.side + this.id;
            this.buttonElement = container.querySelector('#' + id + '-BUTTON');
            this.hoverElement = container.querySelector('#' + id + '-HOVER');
            this.dashElement = container.querySelector('#' + id + '-DASH');
            this.borderElement = container.querySelector('#' + id + '-BORDER');
            this.hookupHoverEvents();
            this.deactivateHover();
        }
        set event(event) {
            this._event = event;
            this.update();
        }
        get event() {
            return this._event;
        }
        update() {
            this.activate();
        }
        hookupHoverEvents() {
            /**
             * TODO: ForeignObject is rendered above SVG elements because of bug in ingame browser and the bug does not
             * allow to trigger events bind to SVG elements (HOVER PATH)
             *
             * POSSIBLE WORKAROUNDS:
             *
             * 1) Do not use SVG Path for highlighting (not ideal workaround)
             * 2) Bind events to SVG path and also to RSK/LSK foreign objects (not ideal [it needs to be bind to all lines and all positions LL/CL/CLL/CRL/RL])
             * 3) Create fake invisible foreign objects above lines and bind events to SVG path and the fake foreign objects [not ideal -> fake objects]
             * 4) Render SVG paths outside the SVG (not sure if possible) -> This is possible but z-index of hovers SVG has to be bigger then z-index of real FMC SVG
             * 5) Render SVG path to PNG and use foreign object to pack the PNG. (not ideal. Complications with HDRemoteFMC because the remote fmc can be rendered on many
             * devices phones/touchscreens/tables and in many resolutions)
             * 6) Render SVG dynamically and append the hover SVGs into DOM (This is what ASOBO uses...) -> do not like this approach because it needs logic for rendering static elements
             *
             * Current implementation: Number 4;
             */
            this.hoverElement.addEventListener('mouseenter', () => {
                if (this._event) {
                    this.hoverElement.style.opacity = '1';
                }
            });
            this.hoverElement.addEventListener('mouseleave', () => {
                this.hoverElement.style.opacity = '0';
            });
            this.hoverElement.addEventListener('mouseup', () => {
                if (this._event) {
                    this.event();
                }
            });
        }
        deactivate() {
            this.deactivateButton();
            this.deactivateDash();
            this.deactivateBorder();
        }
        deactivateButton() {
            this.buttonElement.style.display = 'none';
        }
        deactivateHover() {
            this.hoverElement.style.opacity = '0';
        }
        deactivateDash() {
            this.dashElement.style.fill = '#4fceee';
        }
        deactivateBorder() {
            this.borderElement.style.fillOpacity = '0';
            this.borderElement.style.stroke = '#4fceee';
        }
        deactivateEvent() {
            this.event = undefined;
        }
        activate() {
            if (this._event) {
                this.activateButton();
                this.activateDash();
                this.activateBorder();
            }
            else {
                this.deactivate();
            }
        }
        activateButton() {
            this.buttonElement.style.display = 'block';
        }
        activateHover() {
            throw new Error('NOT IMPLEMENTED');
        }
        activateDash() {
            this.dashElement.style.fill = '#ffffff';
        }
        activateBorder() {
            this.borderElement.style.stroke = '#000000';
            this.borderElement.style.fill = '#726d72';
            this.borderElement.style.fillOpacity = '.56471';
        }
        trigger() {
            if (this.event) {
                this.event();
            }
        }
        render() {
            if (this.event) {
                this.activate();
            }
            else {
                this.deactivate();
            }
        }
    }

    class MainKey {
        constructor(id, container) {
            this._event = undefined;
            this.id = undefined;
            this.borderElement = undefined;
            this.id = parseInt(id.substring(2));
            this.init(container);
        }
        /**
         * TODO: Revise border element html ID
         * @param {HTMLElement} container
         * @private
         */
        init(container) {
            this.borderElement = container.querySelector('#MK' + this.id + '-BUTTON');
            this.hookupKeyEvent();
        }
        set event(event) {
            this._event = event;
        }
        get event() {
            return this._event;
        }
        hookupKeyEvent() {
            this.borderElement.addEventListener('mouseup', () => {
                if (this.event) {
                    this.event();
                }
            });
        }
        trigger() {
            if (this.event) {
                this.event();
            }
        }
        render() {
        }
    }

    class FMCRenderer {
        /**
         * FMC Renderer
         * @param {HTMLElement} container
         * @param {IRendererTemplater} templater
         */
        constructor(container, templater) {
            this.middlewares = [];
            /**
             * TODO: Consider switch to ForeignObject DIV/SPAN because of line wrap and partial coloring/settable
             * @type {SVGTSpanElement[][]}
             * @private
             */
            this.lines = [];
            this.titles = [];
            this.selectKeys = [];
            this.mainKeys = [];
            this.container = container;
            this.templater = templater;
            this.loadElements(container);
        }
        /**
         * Renders page title
         * @param {string} title
         */
        renderTitle(title) {
            if (this.title) {
                this.title.innerHTML = title;
                this.title = this.applyMiddlewares(this.title);
            }
        }
        /**
         * Renders pages
         * @param {number} current
         * @param {number} total
         */
        renderPages(current, total) {
            if (this.pages) {
                this.pages.innerHTML = String(current) + '/' + String(total);
            }
        }
        /**
         * Clears display
         */
        clearDisplay() {
            if (this.pages) {
                this.pages.textContent = '';
                this.pages.innerHTML = '';
            }
            if (this.title) {
                this.title.textContent = '';
                this.title.innerHTML = '';
            }
            for (let i = 0; i <= this.titles.length - 1; i++) {
                this.titles[i].forEach((title) => {
                    title.textContent = '';
                    title.innerHTML = '';
                });
            }
            for (let i = 0; i <= this.lines.length - 1; i++) {
                this.lines[i].forEach((line) => {
                    line.textContent = '';
                    line.innerHTML = '';
                });
            }
        }
        /**
         * Returns main key
         * @param {number} id
         * @returns {MainKey | undefined}
         */
        mk(id) {
            const mkID = id - 1;
            if (mkID < 0 || mkID > 16) {
                return undefined;
            }
            return this.mainKeys[mkID];
        }
        /**
         * Sets all events to UNDEFINED
         */
        cleanUpSelectKeyEvents() {
            this.selectKeys.forEach((key) => {
                key.event = undefined;
            });
        }
        /**
         * Returns Left Select Key (LSK) Object
         * @param {number} id
         * @returns {SelectKey | undefined}
         */
        lsk(id) {
            const lskID = id - 1;
            if (lskID < 0 || lskID > 5) {
                return undefined;
            }
            return this.selectKeys[lskID];
        }
        /**
         * Sets event for LSK
         * @param {number} id
         * @param {() => void} event
         */
        setLskEvent(id, event) {
            const lskID = id - 1;
            if (lskID < 0 || lskID > 5) {
                return;
            }
            this.selectKeys[lskID].event = event;
        }
        /**
         * Returns Right Select Key (RSK) Object
         * @param {number} id
         * @returns {SelectKey | undefined}
         */
        rsk(id) {
            const rskID = id + 5;
            if (rskID < 6 || rskID > 12) {
                return undefined;
            }
            return this.selectKeys[rskID];
        }
        /**
         * Sets event for RSK
         * @param {number} id
         * @param {() => void} event
         */
        setRskEvent(id, event) {
            const rskID = id + 5;
            if (rskID < 6 || rskID > 12) {
                return;
            }
            this.selectKeys[rskID].event = event;
        }
        /**
         * Renders data to FMC
         * @param {string[][]} data
         */
        render(data) {
            for (let i = 0; i <= this.titles.length - 1; i++) {
                this.setDataToLine(i, data[i * 2], exports.FMCLineType.TITLE);
                this.titles[i] = this.titles[i].map((value) => {
                    return this.applyMiddlewares(value);
                });
            }
            for (let i = 0; i <= this.lines.length - 1; i++) {
                this.setDataToLine(i, data[(i * 2) + 1], exports.FMCLineType.LINE);
                this.lines[i] = this.lines[i].map((value) => {
                    return this.applyMiddlewares(value);
                });
            }
        }
        /**
         * Renders exec state
         * @param {boolean} state
         */
        renderExec(state) {
            if (this.execs) {
                if (state === true) {
                    for (const exec of this.execs) {
                        exec.style.fill = '#65ff3a';
                    }
                }
                else {
                    for (const exec of this.execs) {
                        exec.style.fill = '#354b4f';
                    }
                }
            }
        }
        /**
         * Sets data to lines
         * @param {number} index
         * @param {string[]} data
         * @param {FMCLineType} type
         * @private
         */
        setDataToLine(index, data, type) {
            let target = [];
            if (type === exports.FMCLineType.LINE) {
                target = this.lines[index];
            }
            else if (type === exports.FMCLineType.TITLE) {
                target = this.titles[index];
            }
            if (data && target) {
                this.templater.arrange(data, target);
            }
        }
        /**
         * Adds middleware
         * @param {IRendererMiddleware} middleware
         */
        use(middleware) {
            this.middlewares.push(middleware);
        }
        /**
         * Apply middleware to value
         * @param value
         * @param {IRendererMiddleware} middleware
         * @returns {any}
         * @private
         */
        applyMiddleware(value, middleware) {
            return middleware.apply(value);
        }
        /**
         * Applies all middlewares
         * @param value
         * @returns {any}
         * @private
         */
        applyMiddlewares(value) {
            let output = value;
            this.middlewares.forEach((middleware) => {
                output = this.applyMiddleware(output, middleware);
            });
            return output;
        }
        /**
         * Loads all elements and store references
         * @param {HTMLElement} container
         * @private
         */
        loadElements(container) {
            this.loadTitles(container);
            this.loadLines(container);
            /**
             * Exec require document or body to be able to highlight both buttons. This is not a good practice
             * but it does not have performance impact because the elements are cached in memory
             */
            this.loadExec(document.body);
            this.loadPageTitle(container);
            this.loadPages(container);
            this.loadSelectKeys(container);
            this.loadMainKeys(container);
        }
        /**
         * Loads all lines and store references
         * @param {HTMLElement} container
         * @private
         */
        loadLines(container) {
            for (let i = 0; i <= FMCRenderer.numberOfLines - 1; i++) {
                this.lines[i] = [];
                for (let j = 0; j <= FMCRenderer.linesPrefixes.length - 1; j++) {
                    const element = this.loadLine(String('#' + FMCRenderer.linesPrefixes[j] + (i + 1) + '-FOREIGN'), container);
                    if (element) {
                        this.lines[i][j] = element;
                    }
                }
            }
        }
        /**
         * Loads all titles and store references
         * @param {HTMLElement} container
         * @private
         */
        loadTitles(container) {
            for (let i = 0; i <= FMCRenderer.numberOfTitles - 1; i++) {
                this.titles[i] = [];
                for (let j = 0; j <= FMCRenderer.titlesPrefixes.length - 1; j++) {
                    const element = this.loadTitle(String('#' + FMCRenderer.titlesPrefixes[j] + (i + 1) + '-FOREIGN'), container);
                    if (element) {
                        this.titles[i][j] = element;
                    }
                }
            }
        }
        /**
         * Loads title page element
         * @param {HTMLElement} container
         * @private
         */
        loadPageTitle(container) {
            const textElement = container.querySelector('#TITLE-FOREIGN');
            if (textElement) {
                this.title = textElement;
            }
        }
        /**
         * Loads pages text element
         * @param {HTMLElement} container
         * @private
         */
        loadPages(container) {
            const textElement = container.querySelector('#PAGES-FOREIGN');
            if (textElement) {
                this.pages = textElement;
            }
        }
        /**
         * Loads exec light
         * @param {HTMLElement} container
         * @private
         */
        loadExec(container) {
            const execRects = container.getElementsByClassName('exec-emit-class');
            if (execRects) {
                this.execs = execRects;
            }
        }
        /**
         * Loads line from container and returns HTMLElement of line
         * @param {string} id
         * @param {HTMLElement} container
         * @returns {HTMLElement}
         * @private
         */
        loadLine(id, container) {
            const textElement = container.querySelector(id);
            if (textElement) {
                return textElement;
            }
            return undefined;
        }
        /**
         * Loads title from container and returns HTMLElement of title
         * @param {string} id
         * @param {HTMLElement} container
         * @returns {HTMLElement}
         * @private
         */
        loadTitle(id, container) {
            const textElement = container.querySelector(id);
            if (textElement) {
                return textElement;
                //return textElement.getElementsByTagName('tspan')[0];
            }
            return undefined;
        }
        loadSelectKeys(container) {
            const leftKeys = container.querySelectorAll('.lsk-btn');
            const rightKeys = container.querySelectorAll('.rsk-btn');
            leftKeys.forEach((element) => {
                this.selectKeys.push(new SelectKey(element.id, container));
            });
            rightKeys.forEach((element) => {
                this.selectKeys.push(new SelectKey(element.id, container));
            });
        }
        loadMainKeys(container) {
            const mainKeys = container.querySelectorAll('.mk-btn');
            mainKeys.forEach((element) => {
                this.mainKeys.push(new MainKey(element.id, container));
            });
        }
    }
    FMCRenderer.linesPrefixes = ['LL', 'CLL', 'CL', 'CRL', 'RL'];
    FMCRenderer.titlesPrefixes = ['LT', 'CLT', 'CT', 'CRT', 'RT'];
    FMCRenderer.numberOfLines = 6;
    FMCRenderer.numberOfTitles = 6;
    exports = {
        FMCRenderer
    };

    class ColorRendererMiddleware {
        constructor() {
            this.regex = /\[color=([a-z-]+)\](.*?)\[\/color\]/g;
        }
        apply(value) {
            return this.applyRegex(value);
        }
        applyRegex(value) {
            if (value instanceof String) {
                return value.replace(this.regex, '$2');
            }
            else if (value instanceof SVGTSpanElement) {
                if (value.textContent) {
                    value.textContent = value.textContent.replace(this.regex, '$2');
                    return value;
                }
                else {
                    return value;
                }
            }
            else if (value instanceof HTMLElement) {
                if (this.regex.test(value.innerHTML)) {
                    value.innerHTML = value.innerHTML.replace(this.regex, '<tspan class="$1">$2</tspan>');
                }
                return value;
            }
            return value;
        }
    }

    class SizeRendererMiddleware {
        constructor() {
            this.regex = /\[size=([a-z-]+)\](.*?)\[\/size\]/g;
        }
        apply(value) {
            return this.applyRegex(value);
        }
        applyRegex(value) {
            if (value instanceof String) {
                return value.replace(this.regex, '$2');
            }
            else if (value instanceof SVGTSpanElement) {
                if (value.textContent) {
                    value.textContent = value.textContent.replace(this.regex, '$2');
                    return value;
                }
                else {
                    return value;
                }
            }
            else if (value instanceof HTMLElement) {
                if (this.regex.test(value.innerHTML)) {
                    value.innerHTML = value.innerHTML.replace(this.regex, '<tspan class="$1">$2</tspan>');
                }
                return value;
            }
            return value;
        }
    }

    class SeparatorRendererMiddleware {
        constructor() {
            this.separator = '__FMCSEPARATOR';
            this.replace = '---------------------------------------';
        }
        apply(value) {
            return this.applyReplace(value);
        }
        applyReplace(value) {
            if (value instanceof String) {
                if (value === this.separator) {
                    value = this.replace;
                }
            }
            else if (value instanceof SVGTSpanElement) {
                if (value.textContent === this.separator) {
                    value.textContent = this.replace;
                }
            }
            else if (value instanceof HTMLElement) {
                if (value.innerText === this.separator) {
                    value.innerHTML = this.replace;
                }
            }
            return value;
        }
    }

    class SettableRendererMiddleware {
        constructor() {
            this.regexUndefined = /\[settable=undefined](.*)\[\/settable]/g;
            this.regexFixedWidth = /\[settable=([0-9]+)](.*)\[\/settable]/g;
        }
        apply(value) {
            return this.applyRegex(value);
        }
        applyRegex(value) {
            this.regexUndefined.lastIndex = 0;
            this.regexFixedWidth.lastIndex = 0;
            if (value instanceof String) {
                value = value.replace(this.regexUndefined, '<div class="settable"><span>$1</span></div>');
                value = value.replace(this.regexFixedWidth, '<div class=\'settable\' style=\'width: $1px\'><span>$2</span></div>');
                return value;
            }
            else if (value instanceof SVGTSpanElement) {
                if (value.textContent) {
                    if (this.regexUndefined.test(value.textContent) || this.regexFixedWidth.test(value.textContent)) {
                        value.classList.add('settableTarget');
                    }
                    else {
                        value.classList.remove('settableTarget');
                    }
                    value.textContent = value.textContent.replace(this.regexUndefined, '<div class="settable"><span>$1</span></div>');
                    value.textContent = value.textContent.replace(this.regexFixedWidth, '<div class=\'settable\' style=\'width: $1px\'><span>$2</span></div>');
                    return value;
                }
                else {
                    value.classList.remove('settableTarget');
                    return value;
                }
            }
            else if (value instanceof HTMLElement) {
                value.innerHTML = value.innerHTML.replace(this.regexUndefined, '<div class="settable"><span>$1</span></div>');
                value.innerHTML = value.innerHTML.replace(this.regexFixedWidth, '<div class=\'settable\' style=\'width: $1px\'><span>$2</span></div>');
                return value;
            }
            return value;
        }
    }

    /**
     * Encode HTML special characters into HTML entities
     *
     * NOTE: This middleware should not be used alone and without reason. FMCRenderer encodes all values automatically.
     * So there is not reason to use the middleware alone. If you need to manipulate with HTML with another middleware
     * you should use HtmlDecodeRendererMiddleware first then use your special middleware and then encode values
     * by this middleware.
     *
     * Typical usage
     *
     * const renderer = new FMCRenderer(this, new NaturalRendererTemplater());
     * renderer.use(new SeparatorRendererMiddleware()); // This middleware do not manipulate with HTML
     * renderer.use(new HtmlDecodeRendererMiddleware()); // Decode HTML entities in values
     * renderer.use(new HtmlManipulatingRendererMiddleware()); // Your renderer what manipulate with HTML
     * renderer.use(new HtmlEncodeRendererMiddleware()); // Encode HTML special chars back to entities
     */
    class HtmlEncodeRendererMiddleware {
        apply(value) {
            if (value instanceof HTMLElement) {
                value.textContent = value.innerText = value.innerHTML;
                return value;
            }
        }
    }

    class HtmlDecodeRendererMiddleware {
        constructor() {
            this.decoder = document.createElement('textarea');
        }
        apply(value) {
            this.decoder.innerHTML = value.innerHTML;
            value.innerHTML = this.decoder.value;
            return value;
        }
    }

    class SettableHighlighterRendererMiddleware {
        constructor() {
            this.settableIdPrefix = 'S';
        }
        /**
         * TODO: Known issue: highlighter highlights whole TSPAN
         * Need to figure out a way to highlight only part of content
         * Example: Assumed temperature
         * @param value
         * @returns {any}
         */
        apply(value) {
            if (value instanceof SVGTSpanElement) {
                const settableBoxId = value.id.replace('TS', this.settableIdPrefix);
                const settableBoxElement = document.getElementById(settableBoxId);
                if (settableBoxElement !== null) {
                    if (value.classList.contains('settableTarget')) {
                        const mode = settableBoxElement.dataset.mode;
                        const length = value.getComputedTextLength();
                        if (mode === 'normal') {
                            settableBoxElement.style.display = 'block';
                            settableBoxElement.setAttribute('width', length + 9 + 'px');
                        }
                        else {
                            settableBoxElement.style.display = 'block';
                            const right = value.getClientRects()[0].right;
                            settableBoxElement.setAttribute('x', right - length - 4 + 'px');
                            settableBoxElement.setAttribute('width', length + 12 + 'px');
                        }
                    }
                    else {
                        settableBoxElement.style.display = 'none';
                    }
                }
            }
            return value;
        }
    }

    /**
     * NaturalRendererTemplater
     *
     * Templater renders data in default (ASOBO) way
     *
     * ['left']
     * ['left', 'right']
     * ['left', 'right', 'center']
     * ['left','right', 'center left', 'center right']
     */
    class DefaultRendererTemplater {
        arrange(data, target) {
            if (target instanceof SVGTSpanElement) {
                this.arrangeSVG(data, target);
            }
            else if (target instanceof HTMLElement) {
                this.arrangeHtml(data, target);
            }
        }
        arrangeSVG(data, target) {
            switch (data.length) {
                case 1:
                    target[0].textContent = data[0];
                    target[1].textContent = '';
                    target[2].textContent = '';
                    target[3].textContent = '';
                    target[4].textContent = '';
                    break;
                case 2:
                    target[0].textContent = data[0];
                    target[1].textContent = '';
                    target[2].textContent = '';
                    target[3].textContent = '';
                    target[4].textContent = data[1];
                    break;
                case 3:
                    target[0].textContent = data[0];
                    target[1].textContent = '';
                    target[2].textContent = data[2];
                    target[3].textContent = '';
                    target[4].textContent = data[1];
                    break;
                case 4:
                    target[0].textContent = data[0];
                    target[1].textContent = data[2];
                    target[2].textContent = '';
                    target[3].textContent = data[3];
                    target[4].textContent = data[1];
                    break;
            }
        }
        arrangeHtml(data, target) {
            switch (data.length) {
                case 1:
                    target[0].innerHTML = data[0];
                    target[1].innerHTML = '';
                    target[2].innerHTML = '';
                    target[3].innerHTML = '';
                    target[4].innerHTML = '';
                    break;
                case 2:
                    target[0].innerHTML = data[0];
                    target[1].innerHTML = '';
                    target[2].innerHTML = '';
                    target[3].innerHTML = '';
                    target[4].innerHTML = data[1];
                    break;
                case 3:
                    target[0].innerHTML = data[0];
                    target[1].innerHTML = '';
                    target[2].innerHTML = data[2];
                    target[3].innerHTML = '';
                    target[4].innerHTML = data[1];
                    break;
                case 4:
                    target[0].innerHTML = data[0];
                    target[1].innerHTML = data[2];
                    target[2].innerHTML = '';
                    target[3].innerHTML = data[3];
                    target[4].innerHTML = data[1];
                    break;
            }
        }
    }

    class NaturalRendererTemplater {
        arrange(data, target) {
            this.execute(data, target);
        }
        /**
         * Executes arrange
         * @param {string[]} data
         * @param {HTMLElement[] | SVGTSpanElement[]} target
         * @private
         */
        execute(data, target) {
            /**
             * TODO: This is only basic check. It should unpack target array and handle every target independently
             * Templater will fail if the targets are not same. (It should not be a problem because does not make sense to have different targets in one line)
             */
            if (target[0] instanceof SVGTSpanElement) {
                this.arrangeSVG(data, target);
            }
            else if (target[0] instanceof HTMLElement) {
                this.arrangeHtml(data, target);
            }
        }
        arrangeSVG(data, target) {
            switch (data.length) {
                case 1:
                    target[0].textContent = data[0];
                    target[1].textContent = '';
                    target[2].textContent = '';
                    target[3].textContent = '';
                    target[4].textContent = '';
                    break;
                case 2:
                    target[0].textContent = data[0];
                    target[1].textContent = '';
                    target[2].textContent = '';
                    target[3].textContent = '';
                    target[4].textContent = data[1];
                    break;
                case 3:
                    target[0].textContent = data[0];
                    target[1].textContent = '';
                    target[2].textContent = data[1];
                    target[3].textContent = '';
                    target[4].textContent = data[2];
                    break;
                case 4:
                    target[0].textContent = data[0];
                    target[1].textContent = data[1];
                    target[2].textContent = '';
                    target[3].textContent = data[2];
                    target[4].textContent = data[3];
                    break;
            }
        }
        arrangeHtml(data, target) {
            switch (data.length) {
                case 1:
                    target[0].textContent = target[0].innerText = data[0];
                    target[1].textContent = target[1].innerText = '';
                    target[2].textContent = target[2].innerText = '';
                    target[3].textContent = target[3].innerText = '';
                    target[4].textContent = target[4].innerText = '';
                    break;
                case 2:
                    target[0].textContent = target[0].innerText = data[0];
                    target[1].textContent = target[1].innerText = '';
                    target[2].textContent = target[2].innerText = '';
                    target[3].textContent = target[3].innerText = '';
                    target[4].textContent = target[4].innerText = data[1];
                    break;
                case 3:
                    target[0].textContent = target[0].innerText = data[0];
                    target[1].textContent = target[1].innerText = '';
                    target[2].textContent = target[2].innerText = data[1];
                    target[3].textContent = target[3].innerText = '';
                    target[4].textContent = target[4].innerText = data[2];
                    break;
                case 4:
                    target[0].textContent = target[0].innerText = data[0];
                    target[1].textContent = target[1].innerText = data[1];
                    target[2].textContent = target[2].innerText = '';
                    target[3].textContent = target[3].innerText = data[2];
                    target[4].textContent = target[4].innerText = data[3];
                    break;
            }
        }
    }

    exports.HDSpeedPhase = void 0;
    (function (HDSpeedPhase) {
        HDSpeedPhase[HDSpeedPhase["SPEED_PHASE_CLIMB"] = 0] = "SPEED_PHASE_CLIMB";
        HDSpeedPhase[HDSpeedPhase["SPEED_PHASE_CRUISE"] = 1] = "SPEED_PHASE_CRUISE";
        HDSpeedPhase[HDSpeedPhase["SPEED_PHASE_DESCENT"] = 2] = "SPEED_PHASE_DESCENT";
        HDSpeedPhase[HDSpeedPhase["SPEED_PHASE_APPROACH"] = 3] = "SPEED_PHASE_APPROACH";
    })(exports.HDSpeedPhase || (exports.HDSpeedPhase = {}));

    exports.HDSpeedType = void 0;
    (function (HDSpeedType) {
        HDSpeedType[HDSpeedType["SPEED_TYPE_ECON"] = 0] = "SPEED_TYPE_ECON";
        HDSpeedType[HDSpeedType["SPEED_TYPE_SELECTED"] = 1] = "SPEED_TYPE_SELECTED";
        HDSpeedType[HDSpeedType["SPEED_TYPE_RESTRICTION"] = 2] = "SPEED_TYPE_RESTRICTION";
        HDSpeedType[HDSpeedType["SPEED_TYPE_TRANSITION"] = 3] = "SPEED_TYPE_TRANSITION";
        HDSpeedType[HDSpeedType["SPEED_TYPE_ACCELERATION"] = 4] = "SPEED_TYPE_ACCELERATION";
        HDSpeedType[HDSpeedType["SPEED_TYPE_PROTECTED"] = 5] = "SPEED_TYPE_PROTECTED";
        HDSpeedType[HDSpeedType["SPEED_TYPE_WAYPOINT"] = 6] = "SPEED_TYPE_WAYPOINT";
    })(exports.HDSpeedType || (exports.HDSpeedType = {}));

    class HDSpeed {
        constructor(speed) {
            this._speed = Number(speed);
        }
        /**
         * Speed getter
         * @returns {number}
         */
        get speed() {
            return this._speed;
        }
        /**
         * Speed setter
         * @param speed
         */
        set speed(speed) {
            this._speed = Number(speed);
        }
        isValid() {
            return this._speed && isFinite(this._speed);
        }
    }

    class HDDescentSpeed extends HDSpeed {
        constructor(speed, speedMach) {
            super(speed);
            this._speedMach = Number(speedMach);
        }
        get speedMach() {
            return this._speedMach;
        }
        set speedMach(speedMach) {
            this._speedMach = Number(speedMach);
        }
    }

    class HDSpeedRestriction extends HDSpeed {
        constructor(speed, altitude) {
            super(speed);
            this._altitude = Number(altitude);
        }
        get altitude() {
            return this._altitude;
        }
        set altitude(altitude) {
            this._altitude = Number(altitude);
        }
    }

    class HDAccelerationSpeedRestriction extends HDSpeedRestriction {
        constructor(speed, altitude, height) {
            super(speed, altitude);
            this._accelerationHeight = Number(height);
        }
        /**
         * Acceleration height setter
         * @param height
         */
        set accelerationHeight(height) {
            this._accelerationHeight = Number(height);
        }
        /**
         * Returns acceleration height
         * @returns {number}
         */
        get accelerationHeight() {
            return this._accelerationHeight;
        }
        /**
         * TODO: logic for v2+10 - v2+25 has to be implemented
         * @returns {boolean}
         */
        isValid() {
            const planeAltitude = Simplane.getAltitude();
            const v2speed = SimVar.GetSimVarValue('L:AIRLINER_V2_SPEED', 'Knots');
            this.speed = Number(v2speed + 25);
            if (this._speed && isFinite(this._speed) && this._altitude && isFinite(this._altitude)) {
                if (this._altitude > planeAltitude) {
                    return true;
                }
            }
            return false;
        }
    }

    class HDOverspeedProtection extends HDSpeed {
        /**
         * Speed getter
         * @returns {number}
         */
        get speed() {
            return Number(this.getFlapProtectionMaxSpeed(Simplane.getFlapsHandleIndex()));
        }
        /**
         * Overspeed protection should be always valid
         * @returns {boolean}
         */
        isValid() {
            return true;
        }
        /**
         * Flap protection speeds table
         * @param handleIndex
         * @returns {number}
         */
        getFlapProtectionMaxSpeed(handleIndex) {
            switch (handleIndex) {
                case 0:
                    return 360;
                case 1:
                    return 255;
                case 2:
                    return 235;
                case 3:
                    return 225;
                case 4:
                    return 215;
                case 5:
                    return 210;
                case 6:
                    return 210;
                case 7:
                    return 205;
                case 8:
                    return 185;
                case 9:
                    return 175;
            }
            return 360;
        }
    }

    class HDClimbSpeedRestriction extends HDSpeedRestriction {
        isValid() {
            const planeAltitude = Simplane.getAltitude();
            if (this._speed && isFinite(this._speed) && this._altitude && isFinite(this._altitude)) {
                if (this._altitude > planeAltitude) {
                    return true;
                }
            }
            return false;
        }
    }

    class HDSpeedTransition extends HDSpeedRestriction {
        constructor(speed = 250, altitude = 10000, isDeleted = false) {
            super(speed, altitude);
            this._isDeleted = Boolean(isDeleted);
        }
        get isDeleted() {
            return this._isDeleted;
        }
        set isDeleted(isDeleted) {
            this._isDeleted = Boolean(isDeleted);
        }
        /**
         * TODO implement above/bellow altitude check
         * @param planeAltitude
         * @returns {boolean}
         */
        isValid() {
            const planeAltitude = Simplane.getAltitude();
            if (this._speed && isFinite(this._speed) && !this._isDeleted) {
                if (10000 > planeAltitude) {
                    return true;
                }
            }
            return false;
        }
    }

    class HDClimbSpeedTransition extends HDSpeedTransition {
        constructor(speed = 250, altitude = 10000, isDeleted = false) {
            super(speed, altitude, isDeleted);
        }
    }

    class HDClimbSpeed extends HDSpeed {
        constructor(speed) {
            super(speed);
        }
    }

    class HDCruiseSpeed extends HDSpeed {
        constructor(speed, speedMach) {
            super(speed);
            this._speedMach = Number(speedMach);
        }
        get speedMach() {
            return this._speedMach;
        }
        set speedMach(speedMach) {
            this._speedMach = Number(speedMach);
        }
    }

    class HDDescentSpeedRestriction extends HDSpeedRestriction {
        /**
         * TODO: Not implemented
         * @returns {boolean}
         */
        isValid() {
            return false;
        }
    }

    class HDDescentSpeedTransition extends HDSpeedTransition {
        constructor(speed = 240, altitude = 10000, isDeleted = false) {
            super(speed, altitude, isDeleted);
        }
    }

    class SpeedDirector {
        constructor(speedManager) {
            this._speedManager = speedManager;
            /**
             * TODO: FMC should be removed. All speed related values should be stored directly in SpeedDirector
             * @private
             */
            this._commandedSpeedType = undefined;
            this._lastCommandedSpeedType = undefined;
            this._speedPhase = undefined;
            this._lastSpeedPhase = undefined;
            this._machMode = undefined;
            this._lastMachMode = undefined;
            this._lastSpeed = undefined;
            this._speedCheck = undefined;
            this.Init();
        }
        get descentSpeedEcon() {
            return this._descentSpeedEcon;
        }
        set descentSpeedEcon(value) {
            this._descentSpeedEcon = value;
        }
        get descentSpeedSelected() {
            return this._descentSpeedSelected;
        }
        set descentSpeedSelected(value) {
            this._descentSpeedSelected = value;
        }
        get descentSpeedTransition() {
            return this._descentSpeedTransition;
        }
        set descentSpeedTransition(value) {
            this._descentSpeedTransition = value;
        }
        get descentSpeedRestriction() {
            return this._descentSpeedRestriction;
        }
        set descentSpeedRestriction(value) {
            this._descentSpeedRestriction = value;
        }
        get cruiseSpeedEcon() {
            return this._cruiseSpeedEcon;
        }
        set cruiseSpeedEcon(value) {
            this._cruiseSpeedEcon = value;
        }
        get cruiseSpeedSelected() {
            return this._cruiseSpeedSelected;
        }
        set cruiseSpeedSelected(value) {
            this._cruiseSpeedSelected = value;
        }
        get climbSpeedEcon() {
            return this._climbSpeedEcon;
        }
        set climbSpeedEcon(value) {
            this._climbSpeedEcon = value;
        }
        get climbSpeedSelected() {
            return this._climbSpeedSelected;
        }
        set climbSpeedSelected(value) {
            this._climbSpeedSelected = value;
        }
        get climbSpeedTransition() {
            return this._climbSpeedTransition;
        }
        set climbSpeedTransition(value) {
            this._climbSpeedTransition = value;
        }
        get climbSpeedRestriction() {
            return this._climbSpeedRestriction;
        }
        set climbSpeedRestriction(value) {
            this._climbSpeedRestriction = value;
        }
        get accelerationSpeedRestriction() {
            return this._accelerationSpeedRestriction;
        }
        set accelerationSpeedRestriction(value) {
            this._accelerationSpeedRestriction = value;
        }
        Init() {
            this._updateAltitude();
            this._updateLastSpeed();
            this._updateMachMode();
            this._updateManagedSpeed();
            this._initSpeeds();
        }
        _initSpeeds() {
            this._accelerationSpeedRestriction = new HDAccelerationSpeedRestriction(this._speedManager.repository.v2Speed + 10, 1500, 1500);
            this._overspeedProtection = new HDOverspeedProtection(undefined);
            this._climbSpeedRestriction = new HDClimbSpeedRestriction(undefined, undefined);
            this._climbSpeedTransition = new HDClimbSpeedTransition();
            this._climbSpeedSelected = new HDClimbSpeed(undefined);
            this._climbSpeedEcon = new HDClimbSpeed(this._speedManager.getEconClbManagedSpeed(0));
            this._cruiseSpeedSelected = new HDCruiseSpeed(undefined, undefined);
            this._cruiseSpeedEcon = new HDCruiseSpeed(this._speedManager.getEconCrzManagedSpeed(0), 0.85);
            this._descentSpeedRestriction = new HDDescentSpeedRestriction(undefined, undefined);
            this._descentSpeedTransition = new HDDescentSpeedTransition();
            this._descentSpeedSelected = new HDDescentSpeed(undefined, undefined);
            this._descentSpeedEcon = new HDDescentSpeed(282, undefined);
            //		this._waypointSpeedConstraint = new WaypointSpeed(null, null);
        }
        get machModeActive() {
            return this._machMode;
        }
        _updateMachMode() {
            this._machMode = Simplane.getAutoPilotMachModeActive();
            this._updateFmcIfNeeded();
        }
        _updateLastMachMode() {
            this._lastMachMode = this._machMode;
        }
        _updateAltitude() {
            this._planeAltitude = Simplane.getAltitude();
        }
        _updateManagedSpeed() {
        }
        _resolveMachKias(speed) {
            if (this.machModeActive) {
                const maxMachSpeed = 0.850;
                const requestedSpeed = SimVar.GetGameVarValue('FROM KIAS TO MACH', 'number', speed.speed);
                return Math.min(maxMachSpeed, requestedSpeed);
            }
            else {
                return speed.speed;
            }
        }
        get speed() {
            switch (this.speedPhase) {
                case exports.HDSpeedPhase.SPEED_PHASE_CLIMB:
                    switch (this.commandedSpeedType) {
                        case exports.HDSpeedType.SPEED_TYPE_RESTRICTION:
                            return this._resolveMachKias(this._climbSpeedRestriction);
                        case exports.HDSpeedType.SPEED_TYPE_TRANSITION:
                            return this._resolveMachKias(this._climbSpeedTransition);
                        case exports.HDSpeedType.SPEED_TYPE_SELECTED:
                            return this._resolveMachKias(this._climbSpeedSelected);
                        case exports.HDSpeedType.SPEED_TYPE_ACCELERATION:
                            return this._resolveMachKias(this._accelerationSpeedRestriction);
                        case exports.HDSpeedType.SPEED_TYPE_PROTECTED:
                            return this._resolveMachKias(this._overspeedProtection);
                        //					case SpeedType.SPEED_TYPE_WAYPOINT:
                        //						return (this.machModeActive ? (this._waypointSpeedConstraint.speedMach ? this._waypointSpeedConstraint.speedMach : this._resolveMachKias(this._waypointSpeedConstraint)) : this._waypointSpeedConstraint.speed);
                        case exports.HDSpeedType.SPEED_TYPE_ECON:
                            return this._resolveMachKias(this._climbSpeedEcon);
                        default:
                            return 133;
                    }
                case exports.HDSpeedPhase.SPEED_PHASE_CRUISE:
                    switch (this.commandedSpeedType) {
                        case exports.HDSpeedType.SPEED_TYPE_RESTRICTION:
                        case exports.HDSpeedType.SPEED_TYPE_TRANSITION:
                        case exports.HDSpeedType.SPEED_TYPE_ECON:
                            return (this.machModeActive ? this._cruiseSpeedEcon.speedMach : this._cruiseSpeedEcon.speed);
                        case exports.HDSpeedType.SPEED_TYPE_SELECTED:
                            return (this.machModeActive ? (this._cruiseSpeedSelected.speedMach ? this._cruiseSpeedSelected.speedMach : this._resolveMachKias(this._cruiseSpeedSelected)) : this._cruiseSpeedSelected.speed);
                        case exports.HDSpeedType.SPEED_TYPE_PROTECTED:
                            return this._resolveMachKias(this._overspeedProtection);
                        //					case SpeedType.SPEED_TYPE_WAYPOINT:
                        //						return (this.machModeActive ? (this._waypointSpeedConstraint.speedMach ? this._waypointSpeedConstraint.speedMach : this._resolveMachKias(this._waypointSpeedConstraint)) : this._waypointSpeedConstraint.speed);
                    }
                    break;
                case exports.HDSpeedPhase.SPEED_PHASE_DESCENT:
                    switch (this.commandedSpeedType) {
                        case exports.HDSpeedType.SPEED_TYPE_RESTRICTION:
                            return this._resolveMachKias(this._descentSpeedRestriction);
                        case exports.HDSpeedType.SPEED_TYPE_TRANSITION:
                            return this._resolveMachKias(this._descentSpeedTransition);
                        case exports.HDSpeedType.SPEED_TYPE_SELECTED:
                            return (this.machModeActive ? (this._descentSpeedSelected.speedMach ? this._descentSpeedSelected.speedMach : this._resolveMachKias(this._descentSpeedSelected)) : this._descentSpeedSelected.speed);
                        case exports.HDSpeedType.SPEED_TYPE_ECON:
                            return this._resolveMachKias(this._descentSpeedEcon);
                        case exports.HDSpeedType.SPEED_TYPE_PROTECTED:
                            return this._resolveMachKias(this._overspeedProtection);
                        //					case SpeedType.SPEED_TYPE_WAYPOINT:
                        //						return (this.machModeActive ? (this._waypointSpeedConstraint.speedMach ? this._waypointSpeedConstraint.speedMach : this._resolveMachKias(this._waypointSpeedConstraint)) : this._waypointSpeedConstraint.speed);
                    }
                    break;
                case exports.HDSpeedPhase.SPEED_PHASE_APPROACH:
                    switch (this.commandedSpeedType) {
                        case exports.HDSpeedType.SPEED_TYPE_RESTRICTION:
                            return this._resolveMachKias(this._descentSpeedRestriction);
                        case exports.HDSpeedType.SPEED_TYPE_TRANSITION:
                            return this._resolveMachKias(this._descentSpeedTransition);
                        case exports.HDSpeedType.SPEED_TYPE_SELECTED:
                            return (this.machModeActive ? (this._descentSpeedSelected.speedMach ? this._descentSpeedSelected.speedMach : this._resolveMachKias(this._descentSpeedSelected)) : this._descentSpeedSelected.speed);
                        case exports.HDSpeedType.SPEED_TYPE_ECON:
                            return this._resolveMachKias(this._descentSpeedEcon);
                        case exports.HDSpeedType.SPEED_TYPE_PROTECTED:
                            return this._resolveMachKias(this._overspeedProtection);
                        //					case SpeedType.SPEED_TYPE_WAYPOINT:
                        //						return (this.machModeActive ? (this._waypointSpeedConstraint.speedMach ? this._waypointSpeedConstraint.speedMach : this._resolveMachKias(this._waypointSpeedConstraint)) : this._waypointSpeedConstraint.speed);
                    }
                    break;
            }
        }
        get speedPhase() {
            return this._speedPhase;
        }
        get commandedSpeedType() {
            return this._commandedSpeedType;
        }
        _updateLastSpeed() {
            this._lastSpeed = (this.speed ? this.speed : undefined);
        }
        _updateCheckSpeed() {
            this._speedCheck = this.speed;
        }
        update(flightPhase, costIndexCoefficient) {
            this._costIndexCoefficient = costIndexCoefficient;
            this._updateAltitude();
            this._updateLastSpeed();
            switch (flightPhase) {
                case FlightPhase.FLIGHT_PHASE_PREFLIGHT:
                case FlightPhase.FLIGHT_PHASE_TAXI:
                case FlightPhase.FLIGHT_PHASE_TAKEOFF:
                case FlightPhase.FLIGHT_PHASE_CLIMB:
                case FlightPhase.FLIGHT_PHASE_GOAROUND:
                    this._updateClimbSpeed();
                    break;
                case FlightPhase.FLIGHT_PHASE_CRUISE:
                    this._updateCruiseSpeed();
                    break;
                case FlightPhase.FLIGHT_PHASE_DESCENT:
                    this._updateDescentSpeed();
                    break;
                case FlightPhase.FLIGHT_PHASE_APPROACH:
                    this._updateApproachSpeed();
                    break;
            }
            this._updateCheckSpeed();
        }
        _updateClimbSpeed() {
            let speed = {
                [exports.HDSpeedType.SPEED_TYPE_RESTRICTION]: (this._climbSpeedRestriction && this._climbSpeedRestriction.isValid() ? this._climbSpeedRestriction.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_TRANSITION]: (this._climbSpeedTransition && this._climbSpeedTransition.isValid() ? this._climbSpeedTransition.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_ACCELERATION]: (this._accelerationSpeedRestriction && this._accelerationSpeedRestriction.isValid() ? this._accelerationSpeedRestriction.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_SELECTED]: (this._climbSpeedSelected && this._climbSpeedSelected.isValid() ? this._climbSpeedSelected.speed : false),
                //[SpeedType.SPEED_TYPE_WAYPOINT]: (this._waypointSpeedConstraint && this._waypointSpeedConstraint.isValid() ? this._waypointSpeedConstraint.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_ECON]: (this._climbSpeedEcon && this._climbSpeedEcon.isValid() ? this._climbSpeedEcon.speed : false)
            };
            this._updateLastCommandedSpeed();
            this._updateLastMachMode();
            let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
                return speed[value] < speed[accumulator] ? value : accumulator;
            }, exports.HDSpeedType.SPEED_TYPE_ECON);
            commandedSpeedKey = this.shouldCommandSelectedSpeed(commandedSpeedKey, this._climbSpeedSelected);
            this._updateCommandedSpeed(commandedSpeedKey, exports.HDSpeedPhase.SPEED_PHASE_CLIMB);
            this._updateMachMode();
        }
        shouldCommandSelectedSpeed(commandedSpeedKey, selectedSpeed) {
            if (Number(commandedSpeedKey) === exports.HDSpeedType.SPEED_TYPE_ECON) {
                return selectedSpeed.isValid() ? exports.HDSpeedType.SPEED_TYPE_SELECTED : exports.HDSpeedType.SPEED_TYPE_ECON;
            }
            else {
                return Number(commandedSpeedKey);
            }
        }
        _updateCruiseSpeed() {
            let speed = {
                [exports.HDSpeedType.SPEED_TYPE_SELECTED]: (this._cruiseSpeedSelected && this._cruiseSpeedSelected.isValid() ? this._cruiseSpeedSelected.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
                //[SpeedType.SPEED_TYPE_WAYPOINT]: (this._waypointSpeedConstraint && this._waypointSpeedConstraint.isValid() ? this._waypointSpeedConstraint.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_ECON]: (this._cruiseSpeedEcon && this._cruiseSpeedEcon.isValid() ? this._cruiseSpeedEcon.speed : null)
            };
            this._updateLastCommandedSpeed();
            this._updateLastMachMode();
            let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
                return speed[value] < speed[accumulator] ? value : accumulator;
            }, exports.HDSpeedType.SPEED_TYPE_ECON);
            commandedSpeedKey = this.shouldCommandSelectedSpeed(commandedSpeedKey, this._cruiseSpeedSelected);
            this._updateCommandedSpeed(commandedSpeedKey, exports.HDSpeedPhase.SPEED_PHASE_CRUISE);
            this._updateMachMode();
        }
        _updateDescentSpeed() {
            let speed = {
                [exports.HDSpeedType.SPEED_TYPE_RESTRICTION]: (this._descentSpeedRestriction && this._descentSpeedRestriction.isValid() ? this._descentSpeedRestriction.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_TRANSITION]: (this._descentSpeedTransition && this._descentSpeedTransition.isValid() ? this._descentSpeedTransition.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_SELECTED]: (this._descentSpeedSelected && this._descentSpeedSelected.isValid() ? this._descentSpeedSelected.speed : false),
                //[SpeedType.SPEED_TYPE_WAYPOINT]: (this._waypointSpeedConstraint && this._waypointSpeedConstraint.isValid() ? this._waypointSpeedConstraint.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_ECON]: (this._descentSpeedEcon && this._descentSpeedEcon.isValid() ? this._descentSpeedEcon.speed : false)
            };
            this._updateLastCommandedSpeed();
            this._updateLastMachMode();
            let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
                return speed[value] < speed[accumulator] ? value : accumulator;
            }, exports.HDSpeedType.SPEED_TYPE_ECON);
            commandedSpeedKey = this.shouldCommandSelectedSpeed(commandedSpeedKey, this._descentSpeedSelected);
            this._updateCommandedSpeed(commandedSpeedKey, exports.HDSpeedPhase.SPEED_PHASE_DESCENT);
            this._updateMachMode();
        }
        _updateApproachSpeed() {
            let speed = {
                [exports.HDSpeedType.SPEED_TYPE_RESTRICTION]: (this._descentSpeedRestriction && this._descentSpeedRestriction.isValid() ? this._descentSpeedRestriction.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_TRANSITION]: (this._descentSpeedTransition && this._descentSpeedTransition.isValid() ? this._descentSpeedTransition.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_SELECTED]: (this._descentSpeedSelected && this._descentSpeedSelected.isValid() ? this._descentSpeedSelected.speed : false),
                [exports.HDSpeedType.SPEED_TYPE_ECON]: (this._descentSpeedEcon && this._descentSpeedEcon.isValid() ? this._descentSpeedEcon.speed : false)
            };
            this._updateLastCommandedSpeed();
            this._updateLastMachMode();
            let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
                return speed[value] < speed[accumulator] ? value : accumulator;
            }, exports.HDSpeedType.SPEED_TYPE_ECON);
            commandedSpeedKey = this.shouldCommandSelectedSpeed(commandedSpeedKey, this._descentSpeedSelected);
            this._updateCommandedSpeed(commandedSpeedKey, exports.HDSpeedPhase.SPEED_PHASE_APPROACH);
            this._updateMachMode();
        }
        _updateLastCommandedSpeed() {
            this._lastCommandedSpeedType = this._commandedSpeedType;
            this._lastSpeedPhase = this._speedPhase;
        }
        _updateCommandedSpeed(speedType, speedPhase) {
            /**
             * commandedSpeedType has to be retyped to NUMBER because array filter returns KEY as STRING
             * @type {number}
             */
            this._commandedSpeedType = Number(speedType);
            this._speedPhase = Number(speedPhase);
            this._updateFmcIfNeeded();
        }
        _updateFmcIfNeeded() {
            if (this._lastCommandedSpeedType !== this._commandedSpeedType || this._lastSpeedPhase !== this._speedPhase || this._lastMachMode !== this._machMode || this._lastSpeed !== this._speedCheck) {
                SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'Number', 1);
            }
        }
    }

    exports.HeavyDivision = void 0;
    (function (HeavyDivision) {
        class Configuration {
            static activeFlightPlanSynchronizationStrategy() {
                return parseInt(HeavyDataStorage.get('FP_SYNCHRONIZATION_STRATEGY', '0'));
            }
            static isFlightPlanSynchronizationActive() {
                return !(Configuration.activeFlightPlanSynchronizationStrategy() == 0);
            }
            static isOneWaySynchronizationActive() {
                return (Configuration.activeFlightPlanSynchronizationStrategy() == 1);
            }
            static isNonProcedureSynchronizationActive() {
                return (Configuration.activeFlightPlanSynchronizationStrategy() == 2);
            }
            static isNormalFlightPlanSynchronizationActive() {
                return (Configuration.activeFlightPlanSynchronizationStrategy() == 3);
            }
            static useImperial() {
                return (!!parseInt(HeavyDataStorage.get('USE_IMPERIAL', 1)));
            }
            static useMetric() {
                return !Configuration.useImperial();
            }
        }
        HeavyDivision.Configuration = Configuration;
        class SimBrief {
            static importRouteOnly() {
                return (!!parseInt(HeavyDataStorage.get('SIMBRIEF_ROUTE_ONLY', 0)));
            }
            static importSid() {
                return (!!parseInt(HeavyDataStorage.get('SIMBRIEF_WITH_SID', 0)));
            }
            static importStar() {
                return (!!parseInt(HeavyDataStorage.get('SIMBRIEF_WITH_STAR', 0)));
            }
            static importStrategy() {
                return HeavyDataStorage.get('SIMBRIEF_IMPORT_STRATEGY', 'INGAME');
            }
        }
        HeavyDivision.SimBrief = SimBrief;
    })(exports.HeavyDivision || (exports.HeavyDivision = {}));

    exports.ColorRendererMiddleware = ColorRendererMiddleware;
    exports.DefaultRendererTemplater = DefaultRendererTemplater;
    exports.FMCRenderer = FMCRenderer;
    exports.HeavyDataStorage = HeavyDataStorage;
    exports.HtmlDecodeRendererMiddleware = HtmlDecodeRendererMiddleware;
    exports.HtmlEncodeRendererMiddleware = HtmlEncodeRendererMiddleware;
    exports.NaturalRendererTemplater = NaturalRendererTemplater;
    exports.SeparatorRendererMiddleware = SeparatorRendererMiddleware;
    exports.SettableHighlighterRendererMiddleware = SettableHighlighterRendererMiddleware;
    exports.SettableRendererMiddleware = SettableRendererMiddleware;
    exports.SimBrief = SimBrief;
    exports.SimBriefApi = SimBriefApi;
    exports.SimBriefCredentials = SimBriefCredentials;
    exports.SimBriefImporter = SimBriefImporter;
    exports.SimBriefNavlogParser = SimBriefNavlogParser;
    exports.SimBriefOceanicWaypointConverter = SimBriefOceanicWaypointConverter;
    exports.SizeRendererMiddleware = SizeRendererMiddleware;
    exports.SpeedDirector = SpeedDirector;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
