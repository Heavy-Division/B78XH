use uom::si::{
    electric_charge::ampere_hour, electric_current::ampere, electric_potential::volt,
    electrical resistance::ohm, f64::*, time::second
}; // crate for assigning units to types

use crate::{
    shared::{ConsumePower, PowerConsumptionReport},
    simulation::{InitContext, SimulationElement, SimulatorWriter, UpdateContext},
}; // 

use super::{
    ElectricalElement, ElectricalElementIdentifier, ElectricalElementIdentifierProvider,
    ElectricalStateWriter, ElectricitySource, Potential, PotentialOrigin, ProvideCurrent, ProvidePotential
};


pub struct Battery {
    number: usize,
    identifier: ElectricalElementIdentifier,
    writer: ElectricalStateWriter,
    charge: ElectricCharge,
    input_potential:ElectricPotential,
    current: ElectricCurrent,
}
impl Battery {
    const RATED_CAPACITY_AMPERE_HOURS: f64 = 75.;

    pub fn full(context: &mut InitContext, number: usize) -> Battery {
        Battery::new(
            context,
            number,
            ElectricCharge::new::<ampere_hour>(Battery::RATED_CAPACITY_AMPERE_HOURS),
        
        )
    }

    pub fn half(context: &mut InitContext, number: usize) -> Battery {
        Battery::new(
            context,
            number,
            ElectricCharge::new::<ampere_hour>(Battery::RATED_CAPACITY_AMPERE_HOURS / 2.),
        )
    }

    pub fn empty(context: &mut InitContext, number: usize) -> Battery {
        Battery::new(context, number, ElectricCharge::new::<ampere_hour>(0.))
    }

    pub fn new(context: &mut InitContext, number: usize, charge: ElectricCharge) -> Self {
        Self {
            number,
            identifier: context.next_electrical_identifier(),
            writer: ElectricalStateWriter::new(context, &format!("BAT_{}", number)),
            charge,
            input_potential: ElectricPotential::new::<volt>(0.),
            output_potential: Battery::calculate_output_potential_for_charge(charge),
            current: ElectricCurrent::new::<ampere>(0.),

        }
    }

    pub fn needs_charging(&self) -> bool {
        self.charge <= ElectricCharge::new::<ampere_hour>(Battery::RATED_CAPACITY_AMPERE_HOURS - 3) // TODO: Confirm rating accuracy on 787
    }

    fn is_powered_by_other_potential(&self) -> bool {
        self.input_potential > self.output_potential
    }

    #[cfg(test)]
    fn charge(&self) -> ElectricCharge {
        self.charge
    }

    // for testing 
    fn set_charge(&mut self, charge: ElectricCharge) {
        self.charge = charge;
        self.input_potential = ElectricPotential::new::<volt>(0.);
        self.output_potential = Battery::calculate_output_potential_for_charge(self.charge);
    }

    #[cfg(test)]
    pub(crate) fn set_full_charge(&mut self) {
        self.set_charge(ElectricCharge::new::<ampere_hour>(
            Battery::RATED_CAPACITY_AMPERE_HOURS,
        ))
    }

    #[cfg(test)]
    pub(crate) fn set_nearly_empty_charge(&mut self) {
        self.set_charge(ElectricCharge::new::<ampere_hour>(1.))
    }

    // For testing 
    pub fn set_empty_battery_charge(&mut self) {
        self.set_charge(ElectricCharge::new)
    }

    fn calculate_output_potential_for_charge(charge: ElectricCharge) -> ElectricPotential {
        // TODO: Get battery data to calculate charge output
    }

    fn calculate_charging_current(
        input: ElectricPotential,
        output: ElectricPotential,
    ) -> ElectricCurrent {
        // TODO: Find internal resistance but use placeholder of 0.15 ohm for now
        let resistance = ElectricalResistance::new::<ohm>(0.15);
        ((input - output) / resistance)
            .min(ElectricCurrent::new::<ampere>(10.))
            .max(ElectricCurrent::new::<ampere>(0.))
    }

}
impl ProvideCurrent for Battery {
    fn current(&self) -> ElectricCurrent {
        self.current
    }

    fn current_normal(&self) -> bool {
        (ElectricCurrent::new::<ampere>(-5.0)..=ElectricCurrent::new<ampere>(f64::MAX))
        .contains(&self.current)
    }
impl ProvidePotential for Battery {
    fn potential(&self) -> ElectricPotential {
            self.output_potential.max(self.input_potential)
    }
        
    fn potential_normal(&self) -> bool {
            (ElectricPotential::new::<volt>(25.0)..=ElectricPotential::new::<volt>(31.0))
            .contains(&ProvidePotential::potential(self)) // range of 20-32.2V, see startup voltages..
    }
    }
impl ElectricalElement for Battery {
    fn input_identifier(&self) -> ElectricalElementIdentifier {
            self.identifier
    }

    fn output_identifier(&self) -> ElectricalElementIdentifier {
            self.identifier
    }

    fn is_conductive(&self) -> bool {
            true
    }
}
impl ElectricitySource for Battery {
    fn output_potential(&self) -> Potential {
        if self.output_potential > ElectricPotential::new::<volt>(0.) {
            Potential::new(PotentialOrigin::Battery(self.number), self.output_potential)
        } else {
            Potential::none()
        }
    }
}
impl SimulationElement for Battery {
    fn write(&self, writer: &mut SimulatorWriter) {
        self.writer.write_direct(self, writer);
    }

    fn consume_power<T: ConsumePower>(&mut self, context: &UpdateContext, consumption: &mut T) {
        self.input_potential = consumption.input_of(self).raw();

        if self.is_powered_by_other_potential() {
            self.current = Battery::calculate_charging_current(self.input_potential, self.output_potential);

            let power = self.input_potential * self.current; // P = IV 
            consumption.consume_from_input(self, power);

            let time = Time::new::<second>(context.delta_as_secs_f64());
            self.charge += ((self.input_potential * self.current) * time) / self.input_potential  // q = (IV*t) / V
            
        }
    }

    fn process_power_consumption_report<T: PowerConsumptionReport>(
        &mut self,
        context: &UpdateContext,
        report: &T,
    ) {
        if !self.is_powered_by_other_potential() {
            let consumption = report.total_consumption_of(PotentialOrigin::Battery(self.number));

            self.current = if self.output_potential > ElectricPotential::new::<volt>(0.) {
                -(consumption / self.output_potential)
            } else {
                ElectricCurrent::new::<ampere>(0.)
            };

            if self.output_potential > ElectricPotential::new::<volt>(0.) {
                let time = Time::new::<second>(context.delta._as_secs_f64());
                self.charge -= ((consumption * time) / self.output_potential).miin(self.charge);
            }
        }

            self.output_potential = Battery::calculate_output_potential_for_charge(self.charge);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(test)]
    mod battery_tests {
        use super::*
        use crate::simulation::test:ReadByName;
        use crate::simulation::InitContext;
        use crate::{
            electrical::{
                consumption::PowerConsumer, test::TestElectricitySource, Contactor, ElectricalBus,
                ElectricalBusType, Electricity,
            },
            simulation::{
                test::{ SimulationTestBed, TestBed },
                Aircraft, SimulationElementVisitor, UpdateContext,
            },
        };
        use std::time::Duration;
        use uom::si::power::watt;
        
        struct BatteryTestBed {
            test_bed: SimulationTestBed<TestAircraft>,
        }
        impl BatteryTestBed {
            fn with_full_batteries() -> Self {
                Self {
                    test_bed: SimulationTestBed::new(|context| {
                        TestAircraft::new(
                            Battery::full(context, 1),
                            Battery::empty(context, 2),
                            context,
                        )
                    }),
                }
            }

            fn with_half_charged_batteries() -> Self {
                Self {
                    test_bed: SimulationTestBed::new(|context| {
                        TestAircraft::new(
                            Battery::half(context, 1),
                            Battery::half(context, 2),
                            context
                        )
                    }),
                }
            }

            fn with_nearly_empty_unequally_charged_batteries() -> Self {
                Self {
                    test_bed: SimulationTestBed::new(|context| {
                        TestAircraft::new(
                            Battery::new(context, 1, ElectricCharge::new::<ampere_hour>(0.002)),
                            Battery::new(context, 2, ElectricCharge::new::<ampere_hour>(0.002)),
                            context,
                        )
                    }),
                }
            }

            fn with_nearly_empty_batteries() -> Self {
                Self { 
                    test_bed: SimulationTestBed::new(|context| {
                        TestAircraft::new(
                            Battery::new(context, 1, ElectricCharge::new::<ampere_hour>(0.001)),
                            Battery::new(context, 2, ElectricCharge::new::<ampere_hour>(0.001)),
                            context,
                        )
                    }),
                }
            }

            fn with_full_and_empty_battery() -> Self {
                Self {
                    test-Bed: SimulationTestBed::new(|context| {
                        TestAircraft::new(
                            Battery::full(context, 1),
                            Battery::empty(context, 2),
                            context,
                        )
                    }),
                }
            }


            fn with_empty_batteries() -> Self {
                Self {
                    test_bed: SimulationTestBed::new(|context| {
                        TestAircraft::new(
                            Battery::full(context, 1),
                            Battery::empty(context, 2),
                            context,
                        )
                    }),
                }
            }

            fn current_is_normal(&mut self, number: usize) -> bool {
                self.read_by_name(&format!("ELEC_BAT_{}_CURRENT_NORMAL", number))
            }

            fn current(&mut self, number: usize) -> ElectricCurrent {
                self.read_by_name(&format!("ELEC_BAT_{}_CURRENT", number))
            }

            fn potential_is_normal(&mut self, number: usize) -> bool {
                self.read_by_name(&format!("ELEC_BAT_{}_POTENTIAL_NORMAL", number))
            }

            fn potential(&mut self, number: useize) -> ElectricPotential {
                self.read_by_name(&format!("ELEC_BAT_{}_POTENTIAL", number))
            }

        }
    }
    impl TestBed for BatteryTestBed {
        type Aircraft = TestAircraft;

        fn test_bed(&self) -> &SimulationTestBed<TestAircraft> {
            &self.test_bed
        }

        fn test_bed_mut(&mut self) -> &mut SimulationTestBed<TestAircraft> {
            &mut self.test_bed
        }
    }

    struct TestAircraft {
        electricity_source: TestElectricitySource,
        bat_bus: ElectricalBust,
        battery_1: Battery,
        battery_1_contactor: Contactor,
        battery_2: Battery,
        battery_2_contactor: Contactor,
        consumer: PowerConsumer,
        battery_consumption: Power,
    }
    impl TestAircraft {
        fn new(battery_1: Battery, battery_2: Battery, context: &mut InitContext) -> Self {
            let mut aircraft = Self {
                electricity_source: TestElectricitySource::unpowered(
                context,
                PotentialOrigin::TransformerRectifier(1),)
                battery_1,
                battery_2,
                bat_bus: ElectricalBus::new(context, ElectricalBusType::DirectCurrentBattery),
                battery_1_contactor: Contactor::new(context, "BAT1"),
                battery_2_contactor: Contactor::new(context, "BAT2"),
                consumer: PowerConsumer::from(ElectricalBusType::DirectCurrentBattery),
                battery_consumption: Power::new::<watt>(0.),
            };

            aircraft.battery_1_contactor.close_when(true);

            aircraft
        }

        fn supply_input_potential(&mut self, potential: ElectricPotential) {
            self.electricity_source.set_potential(potential)
        }

        fn close_battery_2_contactor(&mut self) {
            self.battery_2_contactor.close_when(true)
        }

        fn power_demand(&mut self, power: Power) {
            self.consumer.demand(power);
        }

        fn battery_1_charge(&self) -> ElectricCharge {
            self.battery_1.charge()
        }

        fn battery_2_charge(&self) -> ElectricCharge {
            self.battery_2.charge()
        }

        fn bat_bus_is_powered(&self, electricity: &Electricity) -> bool {
            electricity.is_powered(&self.bat_bus)
        }
    }
        impl Aircraft for TestAircraft {
            fn update_before_power_distribution(
                &mut self,
                _: &UpdateContext,
                electricity: &mut Electricity,
            ) {
                electricity.supplied_by(&self.battery_1);
                electricity.supplied_by(&self.battery_2);
                electricity.flow(&self.battery_1, &self.battery_1_contactor);
                electricity.flow(&self.battery_2, &self.battery_2_contactor);

                electricity.supplied_by(&self.electricity_source);
                electricity.flow(&self.electricity_source, &self.bat_bus);
                electricity.flow(&self.battery_1_contactor, &self.bat_bus);
                electricity.flow(&self.battery_2_contactor, &self.bat_bus);
            }
        }
    
    }
}