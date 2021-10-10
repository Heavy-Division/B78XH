export declare namespace HeavyInput {
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
