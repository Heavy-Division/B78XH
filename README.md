# B78XHL (B787-10 Heavy) Lite version

[![Discord](https://img.shields.io/discord/808476259016769546?color=7289da&logoColor=ffffff&labelColor=99aab5&logo=discord&label=)](https://discord.gg/Hh84CanyHt)

## About

B78XHL is an open source and free modification of default Boeing 787-10 in Microsoft Flight Simulator. B78XHL is a "Lite" version of our B78XH modification.

## Features Overview

* ### FMC
    * #### VNAV
        * CLB Speed Restriction implemented
        * CLB Selected speed implemented
        * CLB Trans altitude is settable
        * CLB Page active speed is highlighted by magenta
    * #### LEGS
        * Cruise speed fixed
    * #### ROUTE
        * Airways support
        * All waypoints between first and last added waypoint are inserted to Legs page
    * #### MISC
        * "HEAVY" button added (misc & configuration of mod)
* ### EICAS
    *  Gears synoptic page
    *  Hydraulics synoptic page
    *  Stat page

* ### MISC
    *  Added HEAVY configuration page
    *  Payload Manager added to HEAVY configuration page

* ### Payload manager
    * CG range 0 - 100%
    * FOB range 0 - 33384 Gallons
    * Payload range 0 - 560000 Pounds
    * FOB can be set only in Gallons
    * Payload can be set only in Pounds
    * Fuel tanks priority groups:
      * LEFT MAIN, RIGHT MAIN
      * CENTER
    * "new" ZFW is set automatically by payload manager
    * manager do not check "GrossWeight" > "Max takeoff weight" (you can overload an aircraft)

# ND

| Default MSFS 787 ND | B787-10 Heavy ND|
|---------------------|-----------------|
|<img src="DOCS/images/map/nd_default.jpg" width="100%">|<img src="DOCS/images/map/nd_heavy.jpg" width="100%">|

| Symbol (default)    | Symbol (Heavy)  | Name |ND Mode | Remarks |
|:---------------------:|:-----------------:|------|--------|---------|
|<img src="DOCS/images/map/default/ICON_MAP_INTERSECTION.png" width="32" height="32">|<img src="DOCS/images/map/heavy/ICON_MAP_INTERSECTION.png" width="32" height="32">|Off route waypoint|||
|<img src="DOCS/images/map/default/ICON_MAP_INTERSECTION_FLIGHTPLAN.png" width="32" height="32">|<img src="DOCS/images/map/heavy/ICON_MAP_INTERSECTION_FLIGHTPLAN.png" width="32" height="32">|Waypoint inactive|||
|<img src="DOCS/images/map/default/ICON_MAP_INTERSECTION_FLIGHTPLAN_ACTIVE.png" width="32" height="32">|<img src="DOCS/images/map/heavy/ICON_MAP_INTERSECTION_FLIGHTPLAN_ACTIVE.png" width="32" height="32">|Waypoint active|||
|<img src="DOCS/images/map/default/ICON_MAP_AIRPORT.png" width="32" height="32">|<img src="DOCS/images/map/heavy/ICON_MAP_AIRPORT.png" width="32" height="32">|Airport|||
|<img src="DOCS/images/map/default/ICON_MAP_VOR.png" width="32" height="32">|<img src="DOCS/images/map/heavy/ICON_MAP_VOR.png" width="32" height="32">|VOR|||
|<img src="DOCS/images/map/default/ICON_MAP_VOR.png" width="32" height="32">|<img src="DOCS/images/map/heavy/ICON_MAP_VOR_DME.png" width="32" height="32">|VOR/DME|||
|<img src="DOCS/images/map/default/ICON_MAP_VOR.png" width="32" height="32">|<img src="DOCS/images/map/heavy/ICON_MAP_VOR_TACAN.png" width="32" height="32">|TACAN|||
|<img src="DOCS/images/map/default/ICON_MAP_VOR.png" width="32" height="32">|<img src="DOCS/images/map/heavy/ICON_MAP_VOR_DME.png" width="32" height="32">|VORTAC|||