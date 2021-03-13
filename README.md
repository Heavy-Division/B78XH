# B78XH (B787-10 Heavy)

[![Discord](https://img.shields.io/discord/808476259016769546?color=7289da&logoColor=ffffff&labelColor=99aab5&logo=discord&label=)](https://discord.gg/Hh84CanyHt)

## About

B78XH is an open source and free modification of default Boeing 787-10 in Microsoft Flight Simulator.

## Normal vs WO release

WO release is same as normal release but the release does not contain managers. (Payload and SimRate manager) 

## Features Overview

* ### FMC
    * #### VNAV
        * CLB Speed restriction
        * CLB Selected speed
        * CLB Selected speed can be deleted by ECON prompt
        * CLB settable transition altitude
        * CLB FMC commanded speed is highlighted by magenta
        * CLB page title depends on commanded speed (ACT/MOD ECON CLB, ACT/MOD xxxKT CLB, ...)
        * CRZ settable selected speed
        * CRZ FMC commanded speed is highlighted by magenta
        * CRZ Selected speed can be deleted by ECON prompt
        * CRZ page title depends on commanded speed (ACT/MOD ECON CRZ, ACT/MOD xxxKT CRZ, ...)
        * Cruise Climb
        * Cruise Descent
        * Early descent (descent path calculation not supported now)
        * DES NOW (descent path calculation not supported now)
        * Climb leveling off
    * #### LEGS
        * Cruise speed fixed
        * DIRECT TO (basic)
    * #### ROUTE
        * Airways support
        * All waypoints between first and last added waypoint are inserted to Legs page
    * #### MISC
        * "HEAVY" button added (misc & configuration of mod)
    
* ### ND/MFD
  * MFD is touchable on both sides
  * ND symbols changed to default Boeing symbols
  * Altitude Range Arc (ARA) [Green banana]
  * TOD
  * TOC
    
* ### EICAS / SYS
    *  Gears synoptic page
    *  Hydraulics synoptic page
    *  Stat page
    *  FCTL synoptic page
    *  AIR synoptic page (static)

* ### MISC
    *  Added HEAVY configuration page
    *  Payload Manager added to HEAVY configuration page
    *  SimRate Manager added to HEAVY configuration page

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

* ### SimRate manager
    * Modes:
        * slow down - change sim rate to 1x few miles before TOD or DECEL waypoint
        * pause - pause game few miles before TOD or DECEL waypoint
    * Rate Modes:
        * Off - do nothing (do not change sim rate)
        * Linear - Change sim rate to 4x and hold.
        * Normal - Change sim rate to 4x and hold. 5nm before waypoint change sim rate to 2x and hold. 3nm after waypoint change sim rate to 4x and hold.
        * Aggressive - change sim rate to 8x and hold (!!!Do not use this mode now!!!)
    * Unpause button - unpause game when the game is paused by sim rate manager (this is the only way how to unpause game)
    * Emergency shutdown - Terminates all sim rate manager interventions immediately. During an emergency shutdown is not possible to use FMC for 6 seconds. You will be able to deactivate an emergency shutdown or leave the page without deactivation after 6 seconds.

# ND

| Default MSFS 787 ND | B787-10 Heavy ND|
|---------------------|-----------------|
|<img src="DOCS/images/map/nd_default.png" width="100%">|<img src="DOCS/images/map/nd_heavy.png" width="100%">|

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

# ND - Altitude prediction (BANANA)
<img src="DOCS/images/map/nd_banana.png" width="100%">

# SimRate Manager
<img src="DOCS/images/simrate-manager/simrate-manager.png" width="50%">