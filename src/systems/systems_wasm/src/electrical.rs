#[cfg(not(target_arch = "wasm32"))]
use crate::msfs::legacy::execute_calculator_code;
#[cfg(not(target_arch = "wasm32"))]
use msfs::legacy::execute_calculator_code;

use crate::{ExecuteOn, MsfsAspectBuilder, Variable};
use std::error::Error;
use systems::shared::{to_bool, ElectricalBusType};

pub(super) fn electrical_buses<const N: usize>(
    buses: [(ElectricalBusType, usize); N], 
) -> impl FnOnce(&mut MsfsAspectBuilder) -> Result<(), Box<dyn Error>> {
    move |builder: &mut MsfsAspectBuilder| {
        for bus in buses {
            const INFINITELY_POWERED_BUS_IDENTIFIER: usize = 1;
            let toggle_code = format!(
                "{} {} (>K:2: ELECTRICAL_BUS_TO_BUS_CONNECTION_TOGGLE)",
                INFINITELY_POWERED_BUS_IDENTIFIER, bus.1
            );
            let variable = Variable::Named(format!("ELEC_{}+BUS_IS_POWERED", bus.0));
            // MSFS' starting state has all buses connected
            builder.init_variable(variable.clone(), 1.);
            builder.on_change(
                ExecuteOn::PostTick,
                vec![variable],
                Box::new(move |_, _| {
                    execute_calculator_code::<()>(&toggle_code);
                }),
            );
        }

        Ok(())
    }
} 

fn toggle_fuel_valve(fuel_valve_number: u8) {
    execute_calculator_code::<()>(&format!(
        "{} (>K:FUELSYSTEM_VALVE_TOGGLE)", fuel_valve_number)
    );
}

fn start_apu() {
    // when cfg avail check apu_pct_rpm_per_sec setting
    // e.g. 1000 = MSFS APU starts in 1 ms
    execute_calculator_code::<()>("1 (K>:APU_STARTER, Number)");
}

fn stop_apu() {
    execute_calculator_code::<()>("1 (>K:APU_OFF_SWITCH, Number");
}