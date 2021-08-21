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
	HeavyEventDispatcher.trigger = function (event, target) {
		/**
		 * TODO: implement
		 */
		//console.log(HeavyEventDispatcher.target[target] + HeavyEventDispatcher.event[target]);
	};

	/**
	 * Target definitions
	 */
	let target;
	(function (target) {
		target[target['MFD_1'] = 0] = 'H:AS01B_MFD_1';
		target[target['MFD_2'] = 1] = 'H:AS01B_MFD_2';
		target[target['FMC_1'] = 2] = 'H:AS01B_FMC_1';
		target[target['FMC_2'] = 3] = 'H:AS01B_FMC_2';
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
		event[event['Cursor_INC'] = 0] = 'Cursor_INC';
		event[event['Cursor_DEC'] = 1] = 'Cursor_DEC';
		event[event['Cursor_Press'] = 2] = 'Cursor_Press';
		event[event['AUTOPILOT_CTR'] = 3] = 'AUTOPILOT_CTR';
		event[event['AP_HEADING_HOLD'] = 4] = 'AP_HEADING_HOLD';
		event[event['AP_ALT_HOLD'] = 5] = 'AP_ALT_HOLD';
		event[event['AP_FLCH'] = 6] = 'AP_FLCH';
		event[event['AP_VSPEED'] = 7] = 'AP_VSPEED';
		event[event['AP_LNAV'] = 8] = 'AP_LNAV';
		event[event['AP_VNAV'] = 9] = 'AP_VNAV';
		event[event['AP_SPD'] = 10] = 'AP_SPD';
		event[event['AP_SPEED_INTERVENTION'] = 11] = 'AP_SPEED_INTERVENTION';
		event[event['AP_HEADING_SEL'] = 12] = 'AP_HEADING_SEL';
		event[event['AP_ALT_INTERVENTION'] = 13] = 'AP_ALT_INTERVENTION';
		event[event['THROTTLE_TO_GA'] = 14] = 'THROTTLE_TO_GA';
		/**
		 * Heavy events
		 * @type {string}
		 */
		event[event['B78XH_TAKEOFF_MODES_UPDATED'] = 20] = 'B78XH_TAKEOFF_MODES_UPDATED';
	})(event || (event = {}));

	HeavyEventDispatcher.event = event;

})(HeavyEventDispatcher || (HeavyEventDispatcher = {}));

Object.freeze(HeavyEventDispatcher);