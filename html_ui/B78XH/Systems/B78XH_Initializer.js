class B78XH_Initializer {
	constructor() {
		this.initialized = false;
		this.configs = [
			// Cold & Dark  and normal config
			/**
			 * B78XHL does not support cold and dark startup
			 * All custom variables and switch states should be set to default values.
			 * EXAMPLE (without C&D):
			 *
			 * IRS_X_STATE should to be set to value "2" (aligned) because IRS L Switch is inoperable in B78XHL
			 * and it is not possible to turn IRS on and align the IRS.
			 *
			 * EXAMPLE (partial C&D):
			 *
			 * IRS_X_STATE can be set to value "1" (aligning) and implement B78XH_IRS to start aligning IRS automatically
			 * when aircraft will spawn on RAMP and BATTERY is ON or/and ELECTRICAL MAIN BUS has voltage
			 *
			 * REASON: B78XHL and B78XH use same PFD and ND implementation.
			 *
			 * TODO: Initializer is not required by B78XHL right now. All systems are implemented to return default states,
			 * TODO: but could be implemented for partial C&D and then B78XHL will require initializer
			 */
			[
				{type: 'L', variable: 'B78XH_IRS_L_STATE', value: 2},
				{type: 'L', variable: 'B78XH_IRS_R_STATE', value: 2},
				{type: 'L', variable: 'B78XH_IRS_L_SWITCH_STATE', value: 1},
				{type: 'L', variable: 'B78XH_IRS_R_SWITCH_STATE', value: 1},
				{type: 'L', variable: 'B78XH_IRS_L_INIT_ALIGN_TIME', value: 10001},
				{type: 'L', variable: 'B78XH_IRS_R_INIT_ALIGN_TIME', value: 10001},
				{type: 'L', variable: 'B78XH_IRS_L_TIME_FOR_ALIGN', value: 0},
				{type: 'L', variable: 'B78XH_IRS_R_TIME_FOR_ALIGN', value: 0},
				{type: 'L', variable: 'B78XH_IS_IRS_POSITION_SET', value: 1},
				{type: 'L', variable: 'B78XH_IS_IRS_INITED', value: 100001},
				{type: 'L', variable: 'B78XH_HYDRAULIC_ELEC_L_SWITCH_STATE', value: 1},
				{type: 'L', variable: 'B78XH_HYDRAULIC_ELEC_C1_SWITCH_STATE', value: 1},
				{type: 'L', variable: 'B78XH_HYDRAULIC_ELEC_C2_SWITCH_STATE', value: 1},
				{type: 'L', variable: 'B78XH_HYDRAULIC_ELEC_R_SWITCH_STATE', value: 1},
				{type: 'K', variable: 'APU_GENERATOR_SWITCH_SET', value: 0}
			]
		];
	}

	init() {
		console.log("Initializer init")
		if (!this.initialized) {
			console.log("Initializer initing")
			let configToLoad = this.configs[0];

			configToLoad.forEach((item) => {
				if (item.hasOwnProperty('check')) {
					let checkValue = SimVar.GetSimVarValue(item.check, item.checkUnit);
					if (item.condition === checkValue) {
						SimVar.SetSimVarValue(item.type + ':' + item.variable, 'Number', item.value);
					}
				} else {
					SimVar.SetSimVarValue(item.type + ':' + item.variable, 'Number', item.value);
				}
			});
			this.initialized = true;
		}
	}
}