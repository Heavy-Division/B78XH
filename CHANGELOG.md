# Changelog

## [Unreleased]

### Added
 - VNAV CLB CRZ altitude is highlighted by magenta when CRZ altitude is commanded by FMC
 - Option to permanently hide Heavy managers from FMC
 - Support for leveling off during climb
 - Whenever the airplane is leveled off because of MCP altitude during climb phase, setting new altitude in the MCP altitude window and pushing the altitude selector continues the climb.

### Changed
 - Altitude intervention overrides CRZ altitude only when MCP altitude window is set above CRZ altitude
 - Aircraft switch to "VNAV ALT" mode and level off at MCP window altitude when the altitude is set to a value below CRZ altitude

### Removed
 - Removed strings from VNAV CRZ page - "pause @ TOD" and so on
 - Removed ASOBO implementation of overriding CRZ Altitude by MCP altitude knob without pushing altitude intervention 

[unreleased]: https://github.com/Heavy-Division/B78XHL/compare/v.0.1.3...main