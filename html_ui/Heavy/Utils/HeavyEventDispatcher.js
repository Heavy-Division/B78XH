/**
 * Heavy Division Event Dispatcher
 */

let HeavyEventDispatcher;
(function (HeavyEventDispatcher) {

	/**
	 * Trigger event to target
	 * @param event
	 * @param target
	 */
	HeavyEventDispatcher.trigger = function (event, target, debug = false) {
		if(debug){
			console.log(HeavyEventDispatcher.target[target] + HeavyEventDispatcher.event[event]);
		}
		SimVar.SetSimVarValue(HeavyEventDispatcher.target[target] + HeavyEventDispatcher.event[event], 'Number', 0);
	};

	HeavyEventDispatcher.triggerValue = function (event, target, value = 0, units = 'Number', debug = false) {
		if(debug){
			console.log(HeavyEventDispatcher.target[target] + HeavyEventDispatcher.event[event] + ' Units: ' + units + '; Value: ' + value);
		}
		SimVar.SetSimVarValue(HeavyEventDispatcher.target[target] + HeavyEventDispatcher.event[event], units, value);
	};

	/**
	 * Target definitions
	 */
	let target;
	(function (target) {
		target[target['MFD_1'] = 0] = 'H:AS01B_MFD_1_';
		target[target['MFD_2'] = 1] = 'H:AS01B_MFD_2_';
		target[target['FMC_1'] = 2] = 'H:AS01B_FMC_1_';
		target[target['FMC_2'] = 3] = 'H:AS01B_FMC_2_';
		target[target['PFD'] = 4] = 'H:AS01B_PFD_';
		target[target['GLOBAL'] = 100] = '';
	})(target || (target = {}));

	HeavyEventDispatcher.target = target;

	/**
	 * Event definitions
	 */
	let event;
	(function (event) {
		/**
		 * Internal events
		 * @type {string}
		 */
		event[event['AP_HEADING_HOLD'] = 0] = 'AP_HEADING_HOLD';
		event[event['AP_ALT_HOLD'] = 1] = 'AP_ALT_HOLD';
		event[event['AP_FLCH'] = 2] = 'AP_FLCH';
		event[event['AP_VSPEED'] = 3] = 'AP_VSPEED';
		event[event['AP_LNAV'] = 4] = 'AP_LNAV';
		event[event['AP_VNAV'] = 5] = 'AP_VNAV';
		event[event['AP_SPD'] = 6] = 'AP_SPD';
		event[event['AP_SPEED_INTERVENTION'] = 7] = 'AP_SPEED_INTERVENTION';
		event[event['AP_HEADING_SEL'] = 8] = 'AP_HEADING_SEL';
		event[event['AP_ALT_INTERVENTION'] = 9] = 'AP_ALT_INTERVENTION';
		event[event['THROTTLE_TO_GA'] = 10] = 'THROTTLE_TO_GA';

		/**
		 * ND Events
		 * @type {string}
		 */
		event[event['Range_INC'] = 100] = 'Range_INC';
		event[event['Range_DEC'] = 101] = 'Range_DEC';
		event[event['AUTOPILOT_CTR'] = 103] = 'AUTOPILOT_CTR';
		event[event['Cursor_INC'] = 104] = 'Cursor_INC';
		event[event['Cursor_DEC'] = 105] = 'Cursor_DEC';
		event[event['Cursor_Press'] = 106] = 'Cursor_Press';
		event[event['DSP_SYS'] = 107] = 'SYS';
		event[event['DSP_CDU'] = 108] = 'CDU';
		event[event['DSP_INFO'] = 109] = 'INFO';
		event[event['DSP_CHKL'] = 110] = 'CHKL';
		event[event['DSP_COMM'] = 111] = 'COMM';
		event[event['DSP_ND'] = 112] = 'ND';
		event[event['DSP_EICAS'] = 113] = 'EICAS';
		event[event['DSP_ENG'] = 114] = 'ENG';

		/**
		 * PFD Events
		 * @type {string}
		 */
		event[event['Mins_INC'] = 200] = 'Mins_INC';
		event[event['Mins_DEC'] = 201] = 'Mins_DEC';
		event[event['Mins_RST'] = 202] = 'Mins_Press'; /* B:AIRLINER_Mins_Button_Push global event can be also use */
		event[event['Mins_Selector_Toggle'] = 203] = 'B:AIRLINER_Mins_Selector_Toggle';
		event[event['Mins_Selector_Set'] = 204] = 'B:AIRLINER_Mins_Selector_Set';


		/**
		 * Heavy events
		 * @type {string}
		 */
		event[event['B78XH_TAKEOFF_MODES_UPDATED'] = 1000] = 'B78XH_TAKEOFF_MODES_UPDATED';
	})(event || (event = {}));

	HeavyEventDispatcher.event = event;

})(HeavyEventDispatcher || (HeavyEventDispatcher = {}));

Object.freeze(HeavyEventDispatcher);