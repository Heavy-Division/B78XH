//Heavy Division global declaration

/**
 * Returns data storage
 * @returns {any}
 * @constructor
 */
declare function GetDataStorage(): any;

/**
 * Gets data from data store
 * @param {string} _key
 * @returns {any}
 * @constructor
 */
declare function GetStoredData(_key: string): any;

/**
 * Sets data to data store
 * @param {string} _key
 * @param {string | number | boolean} _data
 * @returns {any}
 * @constructor
 */
declare function SetStoredData(_key: string, _data: string | number | boolean): any;

/**
 * Deletes data from data store
 * @param {string} _key
 * @returns {any}
 * @constructor
 */
declare function DeleteStoredData(_key: string): any;

// Working Title global declarations

declare class WTDataStore {
	/**
	 * Retrieves a key from the datastore, possibly returning the default value
	 * @param key The name of the key to retrieve
	 * @param defaultValue The default value to use if the key does not exist
	 * @returns Either the stored value of the key, or the default value
	 */
	static get(key: string, defaultValue: string | number | boolean): any;

	/**
	 * Stores a key in the datastore
	 * @param key The name of the value to store
	 * @param The value to store
	 */
	static set(key: string, value: string | number | boolean): any;
}

declare class CJ4_FMC extends FMCMainDisplay {
	clearDisplay(): void;

	registerPeriodicPageRefresh(action: () => boolean, interval: number, runImmediately: boolean): void;

	unregisterPeriodicPageRefresh(): void;

	_fmcMsgReceiver: any;
	_templateRenderer: WT_FMC_Renderer;
	_navRadioSystem: any;
}

declare class WT_FMC_Renderer {
	setTemplateRaw(template: Array<string[]>, defaultAlternatingLayout?: boolean): void;

	renderSwitch(itemsArr: string[], selectedIndex: number, onClass: string, offClass: string): string
}

declare class LZUTF8 {
	static compress(input: string, options?: {}): any;

	static decompress(input: string, options?: {}): any;
}

declare class CJ4_FMC_NavRadioPage {
	static ShowPage1(fmc: CJ4_FMC): void;
}

// MSFS

declare class WayPoint {
	constructor(_baseInstrument: BaseInstrument);

	icao: string;
	ident: string;
	endsInDiscontinuity?: boolean;
	isVectors?: boolean;
	isRunway?: boolean;
	hasHold?: boolean;
	holdDetails: HoldDetails;
	infos: WayPointInfo;
	type: string;
	bearingInFP: number;
	distanceInFP: number;
	cumulativeDistanceInFP: number;
	instrument: BaseInstrument;
	altDesc: number;
	altitude1: number;
	altitude2: number;
	legAltitudeDescription: number;
	legAltitude1: number;
	legAltitude2: number;
	speedConstraint: number;
	additionalData: { [key: string]: any };
	_svgElements: any;
}

declare class UIElement extends HTMLElement {

}

declare class TemplateElement extends UIElement {

}

interface URLConfig {
	index: number;
}

declare class BaseInstrument extends TemplateElement {
	constructor()

	Init()

	urlConfig: URLConfig;

	connectedCallback();

	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

	facilityLoader: FacilityLoader;
	instrumentIdentifier: string;

	getChildById(_selector: string): HTMLElement | null

	get isPrimary(): boolean

	get instrumentIndex(): number

	requestCall(_func: Function, _timeout?: number);

	onShutDown()

	wasTurnedOff()

	onPowerOn()

	getChildrenById(_selector: string): NodeListOf<Element>
}

declare class NavSystem extends BaseInstrument {
	constructor(arguments: any[])

	Init()

	onUpdate(_deltaTime)
}

declare class FacilityLoader {
	getFacilityRaw(icao: string, timeout?: number): Promise<any>;

	getFacility(icao: string): Promise<any>;
}

declare class WayPointInfo {
	constructor(_instrument: BaseInstrument);

	coordinates: LatLongAlt;
	icao: string;
	ident: string;
	airwayIn: string;
	airwayOut: string;
	airways: Airway[];
	routes: any[];
	instrument: BaseInstrument;
	magneticVariation?: number;
	_svgElements: any;

	UpdateInfos(_CallBack?: any, loadFacilitiesTransitively?: boolean): void;

	CopyBaseInfosFrom(_WP: WayPoint): void;
}

declare class AirportInfo extends WayPointInfo {
	constructor(_instrument: BaseInstrument);

	frequencies: any[];
	namedFrequencies: any[];
	departures: any[];
	approaches: Approach[];
	arrivals: any[];
	runways: any[];
	oneWayRunways: OneWayRunway[];

	UpdateNamedFrequencies(icao?: string): Promise<void>
}

declare class Approach {
	name: string;
	transitions: any[];
	wayPoints: any[];

	isLocalizer(): boolean;
}

declare class Airway {
	name: string;
	type: any;
	icaos: string[];
}

declare class IntersectionInfo extends WayPointInfo {
	constructor(_instrument: BaseInstrument);
}

declare class VORInfo extends WayPointInfo {
	constructor(_instrument: BaseInstrument);
}

declare class NDBInfo extends WayPointInfo {
	constructor(_instrument: BaseInstrument);
}

declare interface OneWayRunway {
	designation: string;
	direction: number;
	beginningCoordinates: LatLongAlt;
	endCoordinates: LatLongAlt;
	elevation: number;
}

declare interface RunwayTransition {
	runwayNumber: number;
	runwayDesignation: number;
}

declare interface EnrouteTransition {
	legs: ProcedureLeg[];
}

declare class Runway {
}

declare class Avionics {
	static Utils: Utils;
	static Curve: any;
	static CurveTool: CurveTool;
	static SVG;
}

declare class Utils {
	computeGreatCircleHeading(coords1: LatLongAlt, coords2: LatLongAlt): number;

	computeGreatCircleDistance(coords1: LatLongAlt, coords2: LatLongAlt): number;

	bearingDistanceToCoordinates(bearing: number, distanceInNM: number, lat: number, long: number): LatLongAlt;

	fmod(value: number, moduloBy: number): number;

	computeDistance(coords1: LatLongAlt, coords2: LatLongAlt): number;

	diffAngle(degrees1: number, degrees2: number): number;

	lerpAngle(from: number, to: number, d: number): number;

	formatRunway(rwy: string): string;

	DEG2RAD: number;
	RAD2DEG: number;

	make_bcd16(arg: number): any

	make_adf_bcd32(arg: number): any

	Vor2Tacan(freq: number): any

	Tacan2Vor(channel, yband): any;

	make_xpndr_bcd16(arg: number): any

	public static loadFile(path: string, callback: (content) => void): void

	public static Clamp(dWeightCoeff: number, min1: number, max1: number)

	isIdent(_value: string): boolean;
}

declare class Curve {
	constructor();

	add(time: number, value: number)

	evaluate(time: string)

	public interpolationFunction: Function;
}

declare class CurveTool {
	NumberInterpolation(n1: number, n2: number, dt: number): number

	static StringColorRGBInterpolation(c1: string, c2: string, dt: number): string
}

declare interface ProcedureLeg {
	type: number;
	fixIcao: string;
	originIcao: string;
	altDesc: number;
	altitude1: number;
	altitude2: number;
	course: number;
	distance: number;
	rho: number;
	theta: number;
	turnDirection: number;
}

declare class LatLongAlt {
	constructor(lat?: number, long?: number, alt?: number);

	lat: number;
	long: number;
	alt: number;

	toDegreeString(): string
}

declare class LatLong {
	constructor(lat: any, long: any);

	lat: any;
	long: any;

	toDegreeString(): string;
}

declare class SimVar {
	static GetSimVarValue(name: string, unit: string, dataSource?: string): any;

	static SetSimVarValue(name: string, unit: string, value: any, dataSource?: string): Promise<void>;

	static GetSimVarArrayValues(simvars: any, callback: (values: any[][]) => void, dataSource: string);

	static SimVarBatch: any;

	static GetGameVarValue(name: string, unit: string, param1?: number, param2?: number): any

	static GetGlobalVarValue(name: string, unit: string): any
}

declare class Simplane {

	static getAutoPilotActive(): boolean;

	static getWeight(): number;

	static getHeadingMagnetic(): number;

	static getGroundSpeed(): number;

	static getNextWaypointName(): string;

	static getIndicatedSpeed(): number;

	static getFlapsHandleIndex(forceSimVarCall?: boolean): number;

	static getAltitude(): number;

	static getCurrentFlightPhase(): number;

	static setCurrentFlightPhase(_index: number);

	static getStallSpeedPredicted(_index: number): number;

	static getAutopilotGPSActive(): boolean;

	static getAutoPilotAPPRCaptured(): boolean;

	static setAutoPilotSelectedNav(_index: number): void;

	static getCurrentLon(): number;

	static getAutoPilotMachModeActive(): boolean

	static getAutoPilotFLCActive(): boolean

	static getTrueSpeed(): number;

	static getAltitudeAboveGround(): number;

	static getCurrentPage(): number;

	static setCurrentPage(val: number);

	static getAutoPilotAirspeedHoldValue(): number;

	static getAutoPilotMachHoldValue(): number;

	static setAPVNAVActive(val: number): void;

	static setAPVNAVArmed(val: number): void;

	static setAPLNAVArmed(val: number): void;

	static setAPLNAVActive(val: number): void;

	static setAPFLCHActive(val: number): void;

	static setAPAltHoldActive(val: number): void;

	static getCrossoverSpeed(): number;

	static getCruiseMach(): number;

	static getStallSpeed(): number;

	static getDesignSpeeds(): DesignSpeeds;

	static getVerticalSpeed(): number;

	static getAutoPilotDisplayedAltitudeLockValue(): number;

	static getMaxSpeed(_aircraft: Aircraft): number;

	static getCrossoverSpeedFactor(_cas: number, _mach: number): number;

	static getAutoPilotAltitudeLockValue(_units?: string): number

	static getAutoPilotSelectedAltitudeLockValue(_units?: string)

	static getIsGrounded(): boolean

	static getAutoPilotGlideslopeActive(): boolean

	static getStallProtectionMinSpeed(): number

	static getAutoPilotThrottleActive(index?: number): boolean

	static getEngineThrottleMode(index: number): number

	static getAutoPilotAltitudeLockActive(): number

	static getAutoPilotThrottleArmed(): boolean
}

declare class DesignSpeeds {
	public VS0: number;
	public VS1: number;
	public VFe: number;
	public VNe: number;
	public VNo: number;
	public VMin: number;
	public VMax: number;
	public Vr: number;
	public Vx: number;
	public Vy: number;
	public Vapp: number;
	public BestGlide: number;
}

declare class EmptyCallback {
	static Void: () => void;
	static Boolean: (arg0: boolean) => void;
}

declare class Coherent {
	static call(handler: string, ...params: any[]): Promise<any>
}

declare function RegisterViewListener(handler: string): void

declare function RegisterViewListener(name, callback?: Function, requiresSingleton?: boolean)

declare function OpenBrowser(url: string): void;

declare class FMCMainDisplay extends BaseInstrument {
	lastPos: string;
	onLeftInput: { (): void }[];
	onRightInput: { (): void }[];
	onPrevPage: { (): void };
	onNextPage: { (): void };
	inOut: string;

	showErrorMessage(message: string);

	defaultInputErrorMessage: string;
	getOrSelectWaypointByIdent;
	flightPlanManager: any;
}

declare class RadioNav {
	getVORBeacon(_index: number)

	setVORStandbyFrequency(_index: number, _value: number): any;

	swapVORFrequencies(_index: number): any;

	setVORActiveFrequency(_index: number, _value: number): any;

	getBestVORBeacon(_useNavSource?: any): NavBeacon;

	static isHz50Compliant(_MHz: number);

	getBestILSBeacon(_useNavSource?): NavBeacon

	getILSActiveFrequency(_index: number): number;

	setILSActiveFrequency(_index: number, _value: number): number

	getBestVORBeacon(_useNavSource?): NavBeacon

	getVORActiveFrequency(_index: number): number;

	setVORActiveFrequency(_index: number, _value: number): number

	getADFActiveFrequency(_index: number): number;

	getVHFActiveFrequency(_userIndex: number, _vhfIndex: number): number;

	setVHFActiveFrequency(_userIndex: number, _vhfIndex: number, _value: number): number;

	setVHFStandbyFrequency(_userIndex: number, _vhfIndex: number, _value: number): number;

	getRADIONAVActive(_index: number): boolean

	setVORActiveIdent(_index: number, _value: string): string

	setILSActiveIdent(_index: number, _value: string): string

	get mode(): NavMode
}

declare class NavBeacon {
	id: number;
	freq: number;
	course: number;
	radial: number;
	name: string;
	ident: string;
	isILS: boolean;

	reset(): void;
}

declare enum UseNavSource {
	'NO',
	'YES_ONLY',
	'YES_FALLBACK'
}

declare enum NavMode {
	'TWO_SLOTS',
	'FOUR_SLOTS'
}

declare class BaseAirliners extends NavSystem {
	constructor(...arguments: any[])

	Init()
}

declare enum FlightPhase {
	FLIGHT_PHASE_PREFLIGHT,
	FLIGHT_PHASE_TAXI,
	FLIGHT_PHASE_TAKEOFF,
	FLIGHT_PHASE_CLIMB,
	FLIGHT_PHASE_CRUISE,
	FLIGHT_PHASE_DESCENT,
	FLIGHT_PHASE_APPROACH,
	FLIGHT_PHASE_GOAROUND
}

declare function diffAndSetText(_element: HTMLElement, _newValue: any);

declare class FMCDataManager {
	constructor(_fmc: any);

	fmc: any;

	IsValidLatLon(latLong: any): boolean;

	IsAirportValid(icao: string): Promise<any>;

	IsWaypointValid(ident: string): Promise<any>;

	GetAirportByIdent(ident: string): Promise<any>;

	GetWaypointsByIdent(ident: string): Promise<any[]>;

	GetWaypointsByIdentAndType(ident: string, wpType?: string): Promise<any>;

	_PushWaypointToFlightPlan(waypoint: WayPoint): Promise<any>;

	_DeleteFlightPlan(): Promise<boolean>;

	ExecuteFlightPlan(fmc: any): Promise<boolean>;
}

declare class TakeOffSpeedsInfo {
	__Type: string;
	minVal: number;
	minWeight: number;
	maxVal: number;
	maxWeight: number;
}

declare enum ThrottleMode {
	'UNKNOWN',
	'REVERSE',
	'IDLE',
	'AUTO',
	'CLIMB',
	'FLEX_MCT',
	'TOGA',
	'HOLD',
}

declare class FlightPlanManager {
	static DEBUG_INSTANCE: FlightPlanManager;
	public static FlightPlanVersionKey: string;

	addHoldAtWaypointIndex(index: number, details: HoldDetails)

	getSegmentFromWaypoint(fix: any)

	constructor(_instrument: any);

	modifyHoldDetails(index, details)

	_waypoints: any[][];
	_approachWaypoints: any[];
	_departureWaypointSize: number;
	_arrivalWaypointSize: number;
	_activeWaypointIndex: number;
	_onFlightPlanUpdateCallbacks: any[];
	decelPrevIndex: number;
	_activeWaypointHasChanged: boolean;
	_lastDistanceToPreviousActiveWaypoint: number;
	_isGoingTowardPreviousActiveWaypoint: boolean;
	_planeCoordinates: LatLong;
	_isRegistered: boolean;
	_isRegisteredAndLoaded: boolean;
	_currentFlightPlanIndex: number;
	_isLoadedApproachTimeLastSimVarCall: number;
	_isActiveApproachTimeLastSimVarCall: number;
	instrument: any;

	addHardCodedConstraints(wp: any): void;

	get planeCoordinates(): LatLong;

	update(_deltaTime: any): void;

	_gpsActiveWaypointIdent: any;
	_gpsActiveWaypointIndex: any;

	onCurrentGameFlightLoaded(_callback: any): void;

	_onCurrentGameFlightLoaded: any;

	registerListener(): void;

	hasFlightPlan(): boolean;

	_loadWaypoints(data: any, currentWaypoints: any, callback: any): void;

	decelWaypoint: WayPoint;

	updateWaypointIndex(): void;

	_updateFlightPlanCallback(flightPlanData: any, callback: () => void, log: any): void;

	_cruisingAltitude: any;
	_runwayIndex: any;
	_atcTimeClimbLLA: any;
	_atcTimeClimbExist: any;
	_atcTimeApproachLLA: any;
	_atcTimeApproachExist: any;
	_departureRunwayIndex: any;
	_departureProcIndex: any;
	_departureEnRouteTransitionIndex: any;
	_departureDiscontinuity: any;
	_arrivalRunwayIndex: any;
	_arrivalProcIndex: any;
	_arrivalTransitionIndex: any;
	_arrivalDiscontinuity: any;
	_approachIndex: any;
	_approachTransitionIndex: any;
	_lastIndexBeforeApproach: any;
	_isDirectTo: any;
	_directToTarget: WayPoint;
	_directToOrigin: LatLongAlt;

	updateFlightPlanByIndex(callback: () => void, index: any, log: any): void;

	asyncUpdateFlightPlanByIndex(index: any, log?: boolean): Promise<any>;

	updateFlightPlan(callback?: () => void, log?: boolean): void;

	updateCurrentApproach(callback?: () => void, log?: boolean): void;

	_approach: Approach;
	_isLoadedApproach: any;
	_isActiveApproach: any;

	get cruisingAltitude(): any;

	getCurrentFlightPlanIndex(): number;

	getCurrentFlightPlan(): ManagedFlightPlan;

	updateCurrentFlightPlanIndex(callback?: () => void): void;

	asyncUpdateCurrentFlightPlanIndex(): Promise<any>;

	setCurrentFlightPlanIndex(index: any, callback?: (result: any) => void): void;

	asyncSetCurrentFlightPlanIndex(index: any): Promise<any>;

	createNewFlightPlan(callback?: () => void): void;

	createNewFlightPlansUntilIndex(index: any, callback?: () => void): void;

	asyncCreateNewFlightPlansUntilIndex(index: any): Promise<any>;

	copyCurrentFlightPlanInto(index: any, callback?: () => void): void;

	asyncCopyCurrentFlightPlanInto(index: any): Promise<any>;

	copyFlightPlanIntoCurrent(index: any, callback?: () => void): void;

	clearFlightPlan(callback?: () => void): void;

	asyncClearFlightPlan(): Promise<any>;

	clearAllFlightPlans(callback?: () => void): void;

	getOrigin(_addedAsOriginOnly?: boolean): any;

	setOrigin(icao: any, callback?: () => void, useLocalVars?: boolean): void;

	getActiveWaypointIdent(): any;

	getActiveWaypointIndex(useCorrection?: boolean): any;

	computeActiveWaypointIndex(): number;

	setActiveWaypointIndex(index: any, callback?: () => void): void;

	recomputeActiveWaypointIndex(callback?: () => void): void;

	getPreviousActiveWaypoint(): any;

	getActiveWaypoint(useCorrection?: boolean): any;

	getNextActiveWaypoint(): any;

	getDistanceToActiveWaypoint(): any;

	getDistanceToDirectToTarget(): any;

	getDistanceToWaypoint(waypoint: any): any;

	getBearingToActiveWaypoint(_magnetic: any): any;

	getBearingToWaypoint(waypoint: any, _magnetic: any): any;

	getETEToActiveWaypoint(): number;

	getETEToWaypoint(waypoint: any): number;

	getDestination(_addedAsDestinationOnly?: boolean): any;

	getDeparture(): any;

	getArrival(): any;

	getAirportApproach(): any;

	getDepartureWaypoints(): WayPoint[];

	getDepartureWaypointsMap(): any[];

	getEnRouteWaypoints(outFPIndex?: any, useLocalVarForExtremity?: boolean): any[];

	getEnRouteWaypointsLastIndex(): number;

	getArrivalWaypoints(): WayPoint[];

	getArrivalWaypointsMap(): any[];

	getWaypointsWithAltitudeConstraints(): any[];

	setDestination(icao: any, callback?: () => void, useLocalVars?: boolean): void;

	addWaypoint(icao: any, index?: number, callback?: () => void, setActive?: boolean): void;

	asyncAddWaypoint(icao: any, index?: number, setActive?: boolean): Promise<any>;

	addCustomWaypoint(ident: any, index: any, latitude: any, longitude: any, setActive?: boolean, callback?: () => void): void;

	asyncAddCustomWaypoint(ident: any, index: any, latitude: any, longitude: any, setActive?: boolean, callback?: () => void): Promise<any>;

	setWaypointLatLon(index: any, latitude: any, longitude: any, setActive: boolean, callback: any): void;

	setWaypointAltitude(altitude: any, index: any, callback?: () => void): void;

	setWaypointAdditionalData(index: any, key: any, value: any, callback?: () => void): void;

	getWaypointAdditionalData(index: any, key: any, callback?: () => void): void;

	invertActiveFlightPlan(callback?: () => void): void;

	getApproachIfIcao(callback?: () => void): void;

	addFlightPlanUpdateCallback(_callback: any): void;

	asyncAddWaypointByIdent(ident: any, index?: number): Promise<any>;

	addWaypointByIdent(ident: any, index?: number, callback?: () => void): void;

	removeWaypoint(index: any, thenSetActive?: boolean, callback?: () => void): void;

	removeWaypointFromTo(indexFrom: any, indexTo: any, thenSetActive?: boolean, callback?: () => void): void;

	indexOfWaypoint(waypoint: any): number;

	getWaypointsCount(flightPlanIndex?: number): number;

	getDepartureWaypointsCount(): number;

	getArrivalWaypointsCount(): number;

	getWaypoint(i: any, flightPlanIndex?: number, considerApproachWaypoints?: boolean): any;

	getWaypoints(flightPlanIndex?: number): any[];

	getDepartureRunwayIndex(): any;

	getDepartureRunway(): any;

	getDetectedCurrentRunway(): any;

	getDepartureProcIndex(): any;

	setDepartureProcIndex(index: any, callback?: () => void): void;

	setDepartureRunwayIndex(index: any, callback?: () => void): void;

	setOriginRunwayIndex(index: any, callback?: () => void): void;

	getAtcTimeClimbLLA(): any;

	getAtcTimeApproachLLA(): any;

	getDepartureEnRouteTransitionIndex(): any;

	setDepartureEnRouteTransitionIndex(index: any, callback?: () => void): void;

	getDepartureDiscontinuity(): any;

	clearDepartureDiscontinuity(callback?: () => void): void;

	removeDeparture(callback?: () => void): void;

	getArrivalProcIndex(): any;

	getArrivalTransitionIndex(): any;

	setArrivalProcIndex(index: any, callback?: () => void): void;

	getArrivalDiscontinuity(): any;

	clearArrivalDiscontinuity(callback?: () => void): void;

	setArrivalEnRouteTransitionIndex(index: any, callback?: () => void): void;

	getArrivalRunwayIndex(): any;

	setArrivalRunwayIndex(index: any, callback?: () => void): void;

	getApproachIndex(): any;

	setApproachIndex(index: any, callback?: () => void, transition?: number): void;

	isLoadedApproach(forceSimVarCall?: boolean): any;

	isActiveApproach(forceSimVarCall?: boolean): any;

	activateApproach(callback?: () => void): void;

	deactivateApproach(): void;

	tryAutoActivateApproach(): void;

	getApproachActiveWaypointIndex(): any;

	getApproach(): Approach;

	getApproachNavFrequency(): any;

	getApproachTransitionIndex(): any;

	getLastIndexBeforeApproach(): any;

	getApproachRunway(): any;

	getApproachWaypoints(): WayPoint[];

	_updateFlightPlanVersion(): void;

	clearDiscontinuity(index: number): void

	setApproachTransitionIndex(index: any, callback?: () => void): void;

	removeArrival(callback?: () => void): void;

	activateDirectTo(icao: any, callback?: () => void): void;

	cancelDirectTo(callback?: () => void): void;

	getIsDirectTo(): any;

	getDirectToTarget(): WayPoint;

	getDirecToOrigin(): LatLongAlt;

	getCoordinatesHeadingAtDistanceAlongFlightPlan(distance: any): {
		lla: LatLong;
		heading: any;
	};

	getCoordinatesAtNMFromDestinationAlongFlightPlan(distance: any, toApproach: boolean): LatLongAlt;

	activateDirectToByIndex(activeIndex: number, callback: Function);

	pauseSync(): void;

	resumeSync(): void;

	getFlightPlan(index: number);

	setDestinationRunwayIndex(index: number, runwayExtension: number, callback: Function)

	getAllWaypoints(): [WayPoint];

	deleteHoldAtWaypointIndex(index: number)

	public addUserWaypoint(pilotWaypointObject: any, selectedWpIndex: any, param3: () => void)
}

declare function fastToFixed(_val: number, _fraction?: number): string

declare enum Aircraft {
	'CJ4',
	'A320_NEO',
	'B747_8',
	'AS01B',
	'AS02A',
	'AS03D'
}


declare class FMCMessagesManager {

	/**
	 * Returns number of FMC messages
	 * @returns {number}
	 */
	get numberOfMessages(): number

	get lastMessage(): FMCMessage

	/**
	 * Add new FMC message
	 * @param {FMCMessage} message
	 */
	addMessage(message: FMCMessage): void

	/**
	 * Creates and returns new FMCMessage
	 * @param {String} title
	 * @param {String} text
	 * @param {Number} priority
	 */
	static createMessage(title, text, priority): FMCMessage

	/**
	 * Creates and shows FMCMessage
	 * @param {String} title
	 * @param {String} text
	 * @param {Number} priority
	 */
	showMessage(title, text, priority?): void

	/**
	 * Removes last message
	 */
	removeLastMessage(): void
}

declare class FMCMessagesHolder {
	/**
	 * Return all messages
	 * @returns {[FMCMessage]}
	 */
	get messages(): FMCMessage

	/**
	 * Return number of stored messages
	 * @returns {number}
	 */
	get numberOfMessages(): number

	/**
	 * Push message into messages array
	 * @param {FMCMessage} message
	 */
	push(message): FMCMessage

	/**
	 * Alias of push(message) function
	 * @param  {FMCMessage} message
	 */
	add(message): FMCMessage

	/**
	 * Alias of push(message) function
	 * @param  {FMCMessage} message
	 */
	store(message): FMCMessage

	/**
	 * Removes the last message and returns that message
	 * @returns {FMCMessage}
	 */
	pop(): FMCMessage

	/**
	 * Purge all messages
	 */
	purge(): void
}

declare class FMCMessage {
	/**
	 * Title of message
	 * @returns {String}
	 */
	get title(): string

	/**
	 * Help window text
	 * @returns {String}
	 */
	get text(): string

	/**
	 * Message priority
	 * @returns {Number}
	 */
	get priority(): number

	/**
	 * Constructor
	 * @param {String} title
	 * @param {String} text
	 * @param {Number} priority
	 */
	constructor(title: string, text: string, priority?: number)
}

declare class FMCDataHolder {
	get preFlightDataHolder(): PreFlightDataHolder
}

declare class B78XHNavModeSelector {
	constructor(flightPlanManager: FlightPlanManager);

	generateInputDataEvents(): void;

	processEvents(): void;

	onNavChangedEvent(event: string)

	currentLateralArmedState: any;
	currentLateralActiveState: any;
}

/**
 * TODO: Should be reworked
 */
declare namespace B78XH_LocalVariables {
	const VERSION: string;
	namespace SIM_RATE_MANAGER {
		const ACTIVATED: string;
	}
	namespace IRS {
		namespace L {
			const STATE: string;
			const SWITCH_STATE: string;
			const INIT_TIME: string;
			const TIME_FOR_ALIGN: string;
		}
		namespace C {
			const STATE_1: string;
			export {STATE_1 as STATE};
			const SWITCH_STATE_1: string;
			export {SWITCH_STATE_1 as SWITCH_STATE};
			const INIT_TIME_1: string;
			export {INIT_TIME_1 as INIT_TIME};
			const TIME_FOR_ALIGN_1: string;
			export {TIME_FOR_ALIGN_1 as TIME_FOR_ALIGN};
		}
		namespace R {
			const STATE_2: string;
			export {STATE_2 as STATE};
			const SWITCH_STATE_2: string;
			export {SWITCH_STATE_2 as SWITCH_STATE};
			const INIT_TIME_2: string;
			export {INIT_TIME_2 as INIT_TIME};
			const TIME_FOR_ALIGN_2: string;
			export {TIME_FOR_ALIGN_2 as TIME_FOR_ALIGN};
		}
		const IS_INITED: string;
		const POSITION_SET: string;
	}
	namespace APU {
		export const EGT: string;
		export const OIL_PRESS: string;
		export const OIL_TEMP: string;
		export const RPM: string;
		const SWITCH_STATE_3: string;
		export {SWITCH_STATE_3 as SWITCH_STATE};
	}
	namespace VNAV {
		namespace SPEED_RESTRICTION {
			const SPEED: string;
			const ALTITUDE: string;
			const FMC_COMMAND_SPEED: string;
		}
		namespace SELECTED_CLIMB_SPEED {
			const SPEED_1: string;
			export {SPEED_1 as SPEED};
			const FMC_COMMAND_SPEED_1: string;
			export {FMC_COMMAND_SPEED_1 as FMC_COMMAND_SPEED};
		}
		const CUSTOM_VNAV_CLIMB_ENABLED: string;
		const FMC_COMMAND_SPEED_TYPE: string;
		const CLIMB_LEVEL_OFF_ACTIVE: string;
		const CLIMB_LEVEL_OFF_AWAIT: string;
		const DESCENT_LEVEL_OFF_ACTIVE: string;
	}
	namespace PRESSURIZATION {
		namespace PACKS {
			export namespace L_1 {
				const SWITCH_STATE_4: string;
				export {SWITCH_STATE_4 as SWITCH_STATE};
			}
			export {L_1 as L};
			export namespace R_1 {
				const SWITCH_STATE_5: string;
				export {SWITCH_STATE_5 as SWITCH_STATE};
			}
			export {R_1 as R};
		}
		namespace TRIM_AIR {
			export namespace L_2 {
				const SWITCH_STATE_6: string;
				export {SWITCH_STATE_6 as SWITCH_STATE};
			}
			export {L_2 as L};
			export namespace R_2 {
				const SWITCH_STATE_7: string;
				export {SWITCH_STATE_7 as SWITCH_STATE};
			}
			export {R_2 as R};
		}
		namespace FANS_LOWER {
			const SWITCH_STATE_8: string;
			export {SWITCH_STATE_8 as SWITCH_STATE};
		}
		namespace RECIRC_UPPER {
			const SWITCH_STATE_9: string;
			export {SWITCH_STATE_9 as SWITCH_STATE};
		}
		namespace COOLING_AFT {
			const SWITCH_STATE_10: string;
			export {SWITCH_STATE_10 as SWITCH_STATE};
		}
		namespace EQUIP_FWD {
			const SWITCH_STATE_11: string;
			export {SWITCH_STATE_11 as SWITCH_STATE};
		}
		namespace TEMP {
			namespace CABIN {
				const SWITCH_STATE_12: string;
				export {SWITCH_STATE_12 as SWITCH_STATE};
			}
			namespace FLIGHT_DECK {
				const SWITCH_STATE_13: string;
				export {SWITCH_STATE_13 as SWITCH_STATE};
			}
			namespace CARGO {
				const SWITCH_STATE_14: string;
				export {SWITCH_STATE_14 as SWITCH_STATE};
			}
		}
	}
}

declare class LateralNavModeState {
}

declare namespace LateralNavModeState {
	const NONE: string;
	const ROLL: string;
	const LNAV: string;
	const NAV: string;
	const HDGHOLD: string;
	const HDGSEL: string;
	const APPR: string;
	const TO: string;
	const GA: string;
}

declare class LNavModeState {
}

declare namespace LNavModeState {
	const FMS: string;
	const NAV1: string;
	const NAV2: string;
}

declare class NavModeEvent {
}

declare namespace NavModeEvent {
	const ALT_LOCK_CHANGED: string;
	const SIM_ALT_LOCK_CHANGED: string;
	const ALT_CAPTURED: string;
	const NAV_PRESSED: string;
	const NAV_MODE_CHANGED: string;
	const NAV_MODE_CHANGED_TO_FMS: string;
	const HDG_HOLD_PRESSED: string;
	const HDG_HOLD_ACTIVE: string;
	const HDG_SEL_PRESSED: string;
	const HDG_SEL_ACTIVE: string;
	const APPR_PRESSED: string;
	const FLC_PRESSED: string;
	const VS_PRESSED: string;
	const BC_PRESSED: string;
	const VNAV_PRESSED: string;
	const ALT_SLOT_CHANGED: string;
	const SELECTED_ALT1_CHANGED: string;
	const SELECTED_ALT2_CHANGED: string;
	const APPROACH_CHANGED: string;
	const VNAV_REQUEST_SLOT_1: string;
	const VNAV_REQUEST_SLOT_2: string;
	const HDG_LOCK_CHANGED: string;
	const TOGA_CHANGED: string;
	const GROUNDED: string;
	const PATH_NONE: string;
	const PATH_ARM: string;
	const PATH_ACTIVE: string;
	const GP_NONE: string;
	const GP_ARM: string;
	const GP_ACTIVE: string;
	const GS_NONE: string;
	const GS_ARM: string;
	const GS_ACTIVE: string;
	const AP_CHANGED: string;
	const LOC_ACTIVE: string;
	const LNAV_ACTIVE: string;
	const FD_TOGGLE: string;
	const ALT_PRESSED: string;
}

declare class LNavDirector {
	holdsDirector: HoldsDirector;

	constructor(fpm: FlightPlanManager, navModeSelector: B78XHNavModeSelector);

	update();
}

declare function diffAndSetAttribute(_element: HTMLElement, _attribute: string, _newValue: string | number | boolean): void;

declare function registerInstrument(name: string, instrument: any);

declare let HeavyDivision: any;

declare namespace HeavyDataStorage {
	export const storagePrefix: string;

	export function get(_key: any, _default?: any): any;

	export function load(_key: any, _default?: any): any;

	export function set(_key: any, _data: any): void;

	export function store(_key: any, _data: any): void;

	function _delete(_key: any): void;

	export {_delete as delete};

	export function remove(_key: any): void;

	export function search(_key: any, _printLog?: boolean): any;

	export function find(_key: any, _printLog?: boolean): any;
}

declare enum HoldSpeedType {
	'FAA',
	'ICAO'
}

declare enum HoldTurnDirection {
	'Right',
	'Left'
}

declare enum HoldState {
	'None',
	'Entering',
	'Holding',
	'Exiting'
}

declare enum HoldEntry {
	'Direct',
	'Teardrop',
	'Parallel'
}

declare class HoldDetails {
	static createDefault(course, courseTowardsHoldFix): HoldDetails

	static calculateEntryType(holdCourse, inboundCourse, turnDirection): HoldEntry
}

interface AircraftState {
}

declare class HoldsDirector {
	/**
	 * Calculates a hold entry state given the hold course and current
	 * inbound course. See FMS guide page 14-21.
	 * @param {number} holdCourse The course that the hold will be flown with.
	 * @param {number} inboundCourse The course that is being flown towards the hold point.
	 * @returns {string} The hold entry state for a given set of courses.
	 */
	static calculateEntryState(holdCourse: number, inboundCourse: number): string;

	/**
	 * Calculates the hold legs from the provided hold course and airspeed.
	 * @param {LatLongAlt} holdFixCoords The coordinates of the hold fix.
	 * @param {HoldDetails} holdDetails The details of the hold.
	 * @returns {LatLongAlt[]} The four hold corner positions calculated, clockwise starting with the hold fix coordinates, plus 2
	 * parallel leg fixes.
	 */
	static calculateHoldFixes(holdFixCoords: LatLongAlt, holdDetails: any): LatLongAlt[];

	/**
	 * Sets the autopilot course to fly.
	 * @param {number} degreesTrue The track in degrees true for the autopilot to fly.
	 * @param {AircraftState} planeState The current state of the aircraft.
	 */
	static setCourse(degreesTrue: number, planeState: AircraftState): void;

	/**
	 * Creates an instance of a HoldsDirector.
	 * @param {FlightPlanManager} fpm An instance of the flight plan manager.
	 * @param {CJ4NavModeSelector} navModeSelector The nav mode selector to use with this instance.
	 */
	constructor(fpm: FlightPlanManager, navModeSelector: any);

	/** The flight plan manager. */
	fpm: FlightPlanManager;
	/** The nav mode selector. */
	navModeSelector: any;
	/** The hold waypoint index. */
	holdWaypointIndex: number;
	/** The current flight plan version. */
	currentFlightPlanVersion: number;
	/** The current state of the holds director. */
	state: string;
	/**
	 * The coordinates to hold at.
	 * @type {LatLongAlt}
	 */
	fixCoords: LatLongAlt;
	/**
	 * The fix coordinates prior to the hold fix.
	 * @type {LatLongAlt}
	 */
	prevFixCoords: LatLongAlt;
	/** The inbound leg for the hold. */
	inboundLeg: any[];
	/** The outbound leg for the hold. */
	outboundLeg: any[];
	/** The parallel entry leg for the hold. */
	parallelLeg: any[];
	/** The direction of the turn. */
	turnDirection: any;

	/**
	 * Sets up the hold in the HoldsDirector.
	 * @param {number} holdWaypointIndex The index of the waypoint for the hold.
	 */
	initializeHold(holdWaypointIndex: number): void;

	/**
	 * Recalculates the hold with a new plane speed.
	 * @param {AircraftState} planeState The current aircraft state.
	 */
	recalculateHold(planeState: AircraftState): void;

	/**
	 * Updates the hold director.
	 * @param {number} holdWaypointIndex The current waypoint index to hold at.
	 */
	update(holdWaypointIndex: number): void;

	/**
	 * Handles the direct entry state.
	 * @param {AircraftState} planeState The current aircraft state.
	 */
	handleDirectEntry(planeState: AircraftState): void;

	/**
	 * Handles the teardrop entry state.
	 * @param {AircraftState} planeState The current aircraft state.
	 */
	handleTeardropEntry(planeState: AircraftState): void;

	/**
	 * Handles the teardrop entry state.
	 * @param {AircraftState} planeState The current aircraft state.
	 */
	handleParallelEntry(planeState: AircraftState): void;

	/**
	 * Handles the in-hold state.
	 * @param {AircraftState} planeState The current aircraft state.
	 */
	handleInHold(planeState: AircraftState): void;

	/**
	 * Activates the waypoint alert if close enough to the provided fix.
	 * @param {AircraftState} planeState The current aircraft state.
	 * @param {LatLongAlt} fix The fix to alert for.
	 */
	alertIfClose(planeState: AircraftState, fix: LatLongAlt): void;

	/**
	 * Cancels the waypoint alert.
	 */
	cancelAlert(): void;

	/**
	 * Handles the exiting state.
	 * @param {AircraftState} planeState The current aircraft state.
	 */
	handleExitingHold(planeState: AircraftState): void;

	/**
	 * Tracks the specified leg.
	 * @param {LatLongAlt} legStart The coordinates of the start of the leg.
	 * @param {LatLongAlt} legEnd The coordinates of the end of the leg.
	 * @param {AircraftState} planeState The current aircraft state.
	 * @param {boolean} execute Whether or not to execute the calculated course.
	 */
	trackLeg(legStart: LatLongAlt, legEnd: LatLongAlt, planeState: AircraftState, execute?: boolean): void;

	/**
	 * Tracks an arc leg.
	 * @param {LatLongAlt} legStart The start of the leg.
	 * @param {LatLongAlt} legEnd The end of the leg.
	 * @param {AircraftState} planeState The state of the aircraft.
	 */
	trackArc(legStart: LatLongAlt, legEnd: LatLongAlt, planeState: AircraftState): void;

	/**
	 * Calculates whether or not the aircraft is abeam the provided leg end.
	 * @param {number} dtk The desired track along the leg.
	 * @param {LatLongAlt} planePosition The current position of the aircraft.
	 * @param {LatLongAlt} fixCoords The coordinates of the leg end fix.
	 */
	isAbeam(dtk: number, planePosition: LatLongAlt, fixCoords: LatLongAlt): boolean;

	/**
	 * Attempts to activate LNAV automatically if LNAV or APPR LNV1 is armed.
	 * @param {LatLongAlt} legStart The coordinates of the start of the leg.
	 * @param {LatLongAlt} legEnd The coordinates of the end of the leg.
	 * @param {AircraftState} planeState The current aircraft state.
	 * @param {number} navSensitivity The sensitivity to use for tracking.
	 */
	tryActivateIfArmed(legStart: LatLongAlt, legEnd: LatLongAlt, planeState: AircraftState): void;

	/**
	 * Exits the active hold.
	 */
	exitActiveHold(): void;

	/**
	 * Cancels exiting the hold at the hold fix.
	 */
	cancelHoldExit(): void;

	/**
	 * Calculates the distance remaining to the hold fix.
	 * @param {AircraftState} planeState The current aircraft state.
	 * @returns {number} The distance remaining to the hold fix, in NM.
	 */
	calculateDistanceRemaining(planeState: AircraftState): number;

	/**
	 * Checks whether the holds director is ready to accept a new hold fix
	 * or is curently entering the fix at the provided waypoint index.
	 * @param {number} index The waypoint index to check against.
	 * @returns {boolean} True if active, false otherwise.
	 */
	isReadyOrEntering(index: number): boolean;

	/**
	 * Whether or not the current waypoint index is in active hold.
	 * @param {number} index The waypoint index to check against.
	 * @returns {boolean} True if active, false otherwise.
	 */
	isHoldActive(index: number): boolean;

	/**
	 * Whether or not the current hold is exiting.
	 * @param {number} index The waypoint index to check against.
	 * @returns {boolean} True if exiting, false otherwise.
	 */
	isHoldExiting(index: number): boolean;

	/**
	 * Whether or not the current hold has exited.
	 * @param {number} index The waypoint index to check against.
	 * @returns {boolean} True if exiting, false otherwise.
	 */
	isHoldExited(index: number): boolean;
}

declare class HoldsDirectorState {
}

declare namespace HoldsDirectorState {
	const NONE: string;
	const ENTRY_DIRECT_INBOUND: string;
	const ENTRY_TEARDROP_INBOUND: string;
	const ENTRY_TEARDROP_OUTBOUND: string;
	const ENTRY_TEARDROP_TURNING: string;
	const ENTRY_PARALLEL_INBOUND: string;
	const ENTRY_PARALLEL_OUTBOUND: string;
	const ENTRY_PARALLEL_TURNING: string;
	const TURNING_OUTBOUND: string;
	const OUTBOUND: string;
	const TURNING_INBOUND: string;
	const INBOUND: string;
	const EXITING: string;
	const EXITED: string;
}

declare enum SegmentType {
	'Origin',
	'Departure',
	'Enroute',
	'Arrival',
	'Approach',
	'Missed',
	'Destination'
}

declare class CJ4_FMC_PilotWaypointParser {

	public static buildPilotWaypointFromExisting(id, number: number, number2: number, _fmc: any)

	public static parseInput(value: string | any, scratchPadWaypointIndex: any, _fmc: any)

	public static parseInputLatLong(inputValue: any, _fmc: any)

	public static parseInputPlaceBearingDistance(inputValue: any, _fmc: any): any;
}

declare class FlightPlanSegment {
	private type: any;
	private offset: any;
	private waypoints: any;
	public static Empty: FlightPlanSegment;

	constructor(type, offset, waypoints)
}

declare let SpeedType: any;
declare let SpeedPhase: any;

declare class SimBrief {
	/**
	 * SimBrief credentials
	 * @type {SimBriefCredentials}
	 * @private
	 */
	private readonly credentials;
	/**
	 * SimBrief Api
	 * @type {SimBriefApi}
	 * @private
	 */
	private readonly api;
	/**
	 * SimBrief flight plan
	 * @type {Promise<JSON> | null}
	 * @private
	 */
	private flightPlan;

	/**
	 * Constructor
	 */
	constructor();

	/**
	 * Returns SimBrief username from credentials
	 * @returns {string}
	 */
	getUserName(): string;

	/**
	 * Returns SimBrief userId from credentials
	 * @returns {number}
	 */
	getUserId(): number;

	/**
	 * Returns SimBrief flight plan
	 * @returns {Promise<JSON> | null}
	 */
	getFlightPlan(): Promise<JSON> | null;

	/**
	 * Fetches SimBrief flight plan from API
	 * @private
	 */
	private fetchFlightPlan;
}


declare class SimBriefOceanicWaypointConverter {
	/**
	 * Converts SimBrief oceanic waypoints to MSFS oceanic waypoints
	 * @param {string} value
	 * @returns {string}
	 */
	static convert(value: string): string;
}

declare namespace HeavyInput {
	class Converters {
		static inputToAltitude(input: string): number | false;

		static convertAltitudeDescriptionLettersToIndexes(input: string): number;

		static waypointConstraints(input: string, convertToFeet?: boolean, convertAltitudeDescriptionLettersToIndexes?: boolean): false | {
			speed: number;
			altitudes: number[];
		};
	}

	class Validators {
		static speedRange(input: string, min?: number, max?: number): boolean;

		static altitudeRange(input: string, min?: number, max?: number): boolean;

		static speedRangeWithAltitude(input: string): boolean;

		static speedRestriction(input: string, cruiseAltitude: string | number): boolean;
	}
}

declare class PreFlightDataHolder {
	/**
	 * ThrustLim page pre flight check/holder
	 * @returns {ThrustLimPagePreFlightCheck}
	 */
	get thrustLim(): ThrustLimPagePreFlightCheck;

	/**
	 * TakeOff page pre flight check/holder
	 * @returns {TakeOffPagePreFlightCheck}
	 */
	get takeOff(): TakeOffPagePreFlightCheck;

	/**
	 * PerfInit page pre flight check/holder
	 * @returns {PerfInitPagePreFlightCheck}
	 */
	get perfInit(): PerfInitPagePreFlightCheck;

	/**
	 * Route page pre flight check/holder
	 * @returns {RoutePagePreFlightCheck}
	 */
	get route(): RoutePagePreFlightCheck;

	/**
	 * @param {boolean} value
	 */
	set completed(arg: boolean);
	/**
	 * Is preflight completed?
	 * @returns {boolean}
	 */
	get completed(): boolean;

	_completed: boolean;

	/**
	 * @param {boolean} value
	 */
	set finished(arg: boolean);
	/**
	 * Is preflight finished?
	 * @returns {boolean}
	 */
	get finished(): boolean;

	_finished: boolean;
	_thrustLim: ThrustLimPagePreFlightCheck;
	_takeOff: TakeOffPagePreFlightCheck;
	_perfInit: PerfInitPagePreFlightCheck;
	_route: RoutePagePreFlightCheck;
}

declare class ThrustLimPagePreFlightCheck {
	/**
	 * @param {boolean} value
	 */
	set completed(arg: boolean);
	/**
	 * Is thrust page preflight completed?
	 * @returns {boolean}
	 */
	get completed(): boolean;

	_completed: boolean;

	/**
	 * @param {boolean} value
	 */
	set assumedTemperature(arg: boolean);
	/**
	 * Is assumed temperature filled?
	 * TODO: Assumed temperature is not required for preflight (should be removed)
	 * @returns {boolean}
	 */
	get assumedTemperature(): boolean;

	_assumedTemperature: boolean;
}

declare class TakeOffPagePreFlightCheck {
	/**
	 * @param {boolean} value
	 */
	set completed(arg: boolean);
	/**
	 * Is takeoff page preflight completed?
	 * @returns {boolean}
	 */
	get completed(): boolean;

	_completed: boolean;

	/**
	 * @param {boolean} value
	 */
	set flaps(arg: boolean);
	/**
	 * Are flaps filled?
	 * @returns {boolean}
	 */
	get flaps(): boolean;

	_flaps: boolean;

	/**
	 * @param {boolean} value
	 */
	set v1(arg: boolean);
	/**
	 * Is v filled?
	 * @returns {boolean}
	 */
	get v1(): boolean;

	_v1: boolean;

	/**
	 * @param {boolean} value
	 */
	set vR(arg: boolean);
	/**
	 * Is vR filled?
	 * @returns {boolean}
	 */
	get vR(): boolean;

	_vR: boolean;

	/**
	 * @param {boolean} value
	 */
	set v2(arg: boolean);
	/**
	 * Is v2 filled?
	 * @returns {boolean}
	 */
	get v2(): boolean;

	_v2: boolean;
}

declare class PerfInitPagePreFlightCheck {
	/**
	 * @param {boolean} value
	 */
	set completed(arg: boolean);
	/**
	 * Is PerfInit page preflight completed?
	 * @returns {boolean}
	 */
	get completed(): boolean;

	_completed: boolean;

	/**
	 * @param {boolean} value
	 */
	set cruiseAltitude(arg: boolean);
	/**
	 * Is cruise altitude filled?
	 * @returns {boolean}
	 */
	get cruiseAltitude(): boolean;

	_cruiseAltitude: boolean;

	/**
	 * @param {boolean} value
	 */
	set costIndex(arg: boolean);
	/**
	 * Is cost index filled?
	 * @returns {boolean}
	 */
	get costIndex(): boolean;

	_costIndex: boolean;

	/**
	 * @param {boolean} value
	 */
	set reserves(arg: boolean);
	/**
	 * Are reserves filled?
	 * @returns {boolean}
	 */
	get reserves(): boolean;

	_reserves: boolean;
}

declare class RoutePagePreFlightCheck {
	/**
	 * @param {boolean} value
	 */
	set completed(arg: boolean);
	/**
	 * Is PerfInit page preflight completed?
	 * @returns {boolean}
	 */
	get completed(): boolean;

	_completed: boolean;

	/**
	 * @param {boolean} value
	 */
	set origin(arg: boolean);
	/**
	 * Is origin filled?
	 * @returns {boolean}
	 */
	get origin(): boolean;

	_origin: boolean;

	/**
	 * @param {boolean} value
	 */
	set destination(arg: boolean);
	/**
	 * Is destination filled?
	 * @returns {boolean}
	 */
	get destination(): boolean;

	_destination: boolean;

	/**
	 * @param {boolean} value
	 */
	set activated(arg: boolean);
	/**
	 * Is route activated?
	 * @returns {boolean}
	 */
	get activated(): boolean;

	_activated: boolean;
}