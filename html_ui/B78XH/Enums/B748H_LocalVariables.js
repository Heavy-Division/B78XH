const B78XH_LocalVariables = {
	VERSION: 'B78XHL',
	IRS: {
		L: {
			STATE: 'L:' + B78XH_LocalVariables.VERSION + '_IRS_L_STATE',
			SWITCH_STATE: 'L:' + B78XH_LocalVariables.VERSION + '_IRS_L_SWITCH_STATE',
			INIT_TIME:  'L:' + B78XH_LocalVariables.VERSION + '_IRS_L_INIT_TIME',
			TIME_FOR_ALIGN: 'L:' + B78XH_LocalVariables.VERSION + '_IRS_L_TIME_FOR_ALIGN'
		},
		C: {
			STATE: 'L:' + B78XH_LocalVariables.VERSION + '_IRS_C_STATE',
			SWITCH_STATE: 'L:' + B78XH_LocalVariables.VERSION + '_IRS_C_SWITCH_STATE',
			INIT_TIME:  'L:' + B78XH_LocalVariables.VERSION + '_IRS_C_INIT_TIME',
			TIME_FOR_ALIGN: 'L:' + B78XH_LocalVariables.VERSION + '_IRS_C_TIME_FOR_ALIGN'
		},
		R: {
			STATE: 'L:' + B78XH_LocalVariables.VERSION + '_IRS_R_STATE',
			SWITCH_STATE: 'L:' + B78XH_LocalVariables.VERSION + '_IRS_R_SWITCH_STATE',
			INIT_TIME:  'L:' + B78XH_LocalVariables.VERSION + '_IRS_R_INIT_TIME',
			TIME_FOR_ALIGN: 'L:' + B78XH_LocalVariables.VERSION + '_IRS_R_TIME_FOR_ALIGN'
		},
		IS_INITED: 'L:' + B78XH_LocalVariables.VERSION + '_IRS_IS_INITED',
		POSITION_SET: 'L:' + B78XH_LocalVariables.VERSION + '_IRS_POSITION_SET'
	},
	APU: {
		EGT: 'L:' + B78XH_LocalVariables.VERSION + '_APU_EGT',
		OIL_PRESS: 'L:' + B78XH_LocalVariables.VERSION + '_APU_OIL_PRESS',
		OIL_TEMP: 'L:' + B78XH_LocalVariables.VERSION + '_APU_OIL_TEMP',
		RPM: 'APU PCT RPM',
		SWITCH_STATE: 'A:APU SWITCH'
	},
	VNAV: {
		CUSTOM_VNAV_CLIMB_ENABLED: 'L:' + B78XH_LocalVariables.VERSION + '_VNAV_CUSTOM_CLIMB_ENABLED'
	},

	SIM_RATE_MANAGER: {
		ACTIVATED: 'L:' + B78XH_LocalVariables.VERSION + '_SIM_RATE_MANAGER_ACTIVATED'
	}
}