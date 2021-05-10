class B787_10_EICAS extends B787_10_CommonMFD.MFDTemplateElement {
    constructor() {
        super(...arguments);
        this.allValueComponents = new Array();
        this.gearDisplay = null;
        this.flapsDisplay = null;
        this.stabDisplay = null;
        this.rudderDisplay = null;
        this.primaryGauges = new Array();
        this.secondaryGauges = new Array();
        this.secondaryEngineVisible = true;
        this.gallonToMegagrams = 0;
        this.gallonToMegapounds = 0;
    }
    get templateID() { return "B787_10_EICAS_Template"; }
    get pageIdentifier() { return MFDPageType.EICAS; }
    initChild() {
        this.unitTextSVG = this.querySelector("#UNITS_Value");
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#TAT_Value"), Simplane.getTotalAirTemperature, 0, Airliners.DynamicValueComponent.formatValueToPosNegTemperature));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#THROTTLE1_Value"), Simplane.getEngineThrottleCommandedN1.bind(this, 0), 1, Airliners.DynamicValueComponent.formatValueToThrottleDisplay));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#THROTTLE2_Value"), Simplane.getEngineThrottleCommandedN1.bind(this, 1), 1, Airliners.DynamicValueComponent.formatValueToThrottleDisplay));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#FF_1_Value"), this.getFFValue.bind(this, 1), 1, Airliners.DynamicValueComponent.formatValueToString, this.isEngineStopped.bind(this, 1)));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#FF_2_Value"), this.getFFValue.bind(this, 2), 1, Airliners.DynamicValueComponent.formatValueToString, this.isEngineStopped.bind(this, 2)));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#OIL_Q_1_Value"), this.getOilQValue.bind(this, 1), 0, Airliners.DynamicValueComponent.formatValueToString));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#OIL_Q_2_Value"), this.getOilQValue.bind(this, 2), 0, Airliners.DynamicValueComponent.formatValueToString));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#CABALT_Value"), Simplane.getPressurisationCabinAltitude));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#RATE_Value"), Simplane.getPressurisationCabinAltitudeRate, 0, Airliners.DynamicValueComponent.formatValueToPosNegString));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#DELTAP_Value"), Simplane.getPressurisationDifferential, 1, Airliners.DynamicValueComponent.formatValueToString));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#CENTERFUEL_Value"), this.getMainTankFuelInMegagrams.bind(this, 1), 1, Airliners.DynamicValueComponent.formatValueToString));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#LEFTFUEL_Value"), this.getMainTankFuelInMegagrams.bind(this, 2), 1, Airliners.DynamicValueComponent.formatValueToString));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#RIGHTFUEL_Value"), this.getMainTankFuelInMegagrams.bind(this, 3), 1, Airliners.DynamicValueComponent.formatValueToString));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#GROSSWEIGHT_Value"), this.getGrossWeightInMegagrams.bind(this), 1, Airliners.DynamicValueComponent.formatValueToString));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#TOTALFUEL_Value"), this.getTotalFuelInMegagrams.bind(this), 1, Airliners.DynamicValueComponent.formatValueToString));
        this.allValueComponents.push(new Airliners.DynamicValueComponent(this.querySelector("#SAT_Value"), Simplane.getAmbientTemperature, 0, Airliners.DynamicValueComponent.formatValueToPosNegTemperature));
        this.gearDisplay = new Boeing.GearDisplay(this.querySelector("#GearInfo"));
        this.flapsDisplay = new Boeing.FlapsDisplay(this.querySelector("#FlapsInfo"), this.querySelector("#FlapsLine"), this.querySelector("#FlapsValue"), this.querySelector("#FlapsBar"), this.querySelector("#FlapsGauge"));
        this.stabDisplay = new Boeing.StabDisplay(this.querySelector("#Stab"), 17, 2);
        this.rudderDisplay = new Boeing.RudderDisplay(this.querySelector("#Rudder"));
        var gaugeTemplate = this.querySelector("#GaugeTemplate");
        if (gaugeTemplate != null) {
            if (this.primaryGauges != null) {
                this.primaryGauges.push(new B787_10_EICAS_Gauge_N1(1, this.querySelector("#N1_1_GAUGE"), gaugeTemplate, true));
                this.primaryGauges.push(new B787_10_EICAS_Gauge_N1(2, this.querySelector("#N1_2_GAUGE"), gaugeTemplate, true));
                this.primaryGauges.push(new B787_10_EICAS_Gauge_EGT(1, this.querySelector("#EGT_1_GAUGE"), gaugeTemplate, true));
                this.primaryGauges.push(new B787_10_EICAS_Gauge_EGT(2, this.querySelector("#EGT_2_GAUGE"), gaugeTemplate, true));
            }
            if (this.secondaryGauges != null) {
                this.secondaryGauges.push(new B787_10_EICAS_Gauge_N2(1, this.querySelector("#N2_1_GAUGE"), gaugeTemplate, false));
                this.secondaryGauges.push(new B787_10_EICAS_Gauge_N2(2, this.querySelector("#N2_2_GAUGE"), gaugeTemplate, false));
                this.secondaryGauges.push(new B787_10_EICAS_Gauge_OIL_P(this.querySelector("#OIL_P_INFO_1"), 1, true));
                this.secondaryGauges.push(new B787_10_EICAS_Gauge_OIL_P(this.querySelector("#OIL_P_INFO_2"), 2, true));
                this.secondaryGauges.push(new B787_10_EICAS_Gauge_OIL_T(this.querySelector("#OIL_T_INFO_1"), 1, true));
                this.secondaryGauges.push(new B787_10_EICAS_Gauge_OIL_T(this.querySelector("#OIL_T_INFO_2"), 2, true));
                this.secondaryGauges.push(new B787_10_EICAS_Gauge_VIB(this.querySelector("#VIB_INFO_1"), 1, false));
                this.secondaryGauges.push(new B787_10_EICAS_Gauge_VIB(this.querySelector("#VIB_INFO_2"), 2, false));
            }
            gaugeTemplate.remove();
        }
        this.secondaryEngine = new Array();
        this.secondaryEngine.push(this.querySelector("#SecondaryEngineTop"));
        this.secondaryEngine.push(this.querySelector("#SecondaryEngineBottom"));
        for (let i = 0; i < this.secondaryEngine.length; i++) {
            this.secondaryEngine[i].setAttribute("visibility", (this.secondaryEngineVisible) ? "visible" : "hidden");
        }
        this.infoPanel = new Boeing.InfoPanel(this, "InfoPanel");
        this.infoPanel.init();
        this.infoPanelsManager = new Boeing.InfoPanelsManager();
        this.infoPanelsManager.init(this.infoPanel);
        this.gallonToMegagrams = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilogram") * 0.001;
        this.gallonToMegapounds = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "lbs") * 0.001;
    }
    updateChild(_deltaTime) {
        if (this.allValueComponents != null) {
            for (var i = 0; i < this.allValueComponents.length; ++i) {
                this.allValueComponents[i].refresh();
            }
        }
        if (this.gearDisplay != null) {
            this.gearDisplay.update(_deltaTime);
        }
        if (this.flapsDisplay != null) {
            this.flapsDisplay.update(_deltaTime);
        }
        if (this.stabDisplay != null) {
            this.stabDisplay.update(_deltaTime);
        }
        if (this.rudderDisplay != null) {
            this.rudderDisplay.update(_deltaTime);
        }
        if (this.primaryGauges != null) {
            for (var i = 0; i < this.primaryGauges.length; ++i) {
                if (this.primaryGauges[i] != null) {
                    this.primaryGauges[i].update(_deltaTime);
                }
            }
        }
        if (this.secondaryGauges != null) {
            for (var i = 0; i < this.secondaryGauges.length; ++i) {
                if (this.secondaryGauges[i] != null) {
                    this.secondaryGauges[i].update(_deltaTime);
                }
            }
        }
        if (this.infoPanel) {
            this.infoPanel.update(_deltaTime);
        }
        if (this.unitTextSVG) {
            if (BaseAirliners.unitIsMetric(Aircraft.AS01B))
                this.unitTextSVG.textContent = "KGS X";
            else
                this.unitTextSVG.textContent = "LBS X";
        }
    }
    onEvent(_event) {
        switch (_event) {
            case "ENG":
                this.secondaryEngineVisible = !this.secondaryEngineVisible;
                for (let i = 0; i < this.secondaryEngine.length; i++) {
                    this.secondaryEngine[i].setAttribute("visibility", (this.secondaryEngineVisible) ? "visible" : "hidden");
                }
                break;
        }
    }
    setGPS(_gps) {
    }
    isEngineStopped(_engine) {
        let n1 = SimVar.GetSimVarValue("ENG N1 RPM:" + _engine, "percent");
        return (n1 >= 0.1) ? false : true;
    }
    getN3Value(_engine) {
        return 0;
    }
    getFFValue(_engine) {
        let factor = this.gallonToMegapounds;
        if (BaseAirliners.unitIsMetric(Aircraft.AS01B))
            factor = this.gallonToMegagrams;
        return (SimVar.GetSimVarValue("ENG FUEL FLOW GPH:" + _engine, "gallons per hour") * factor);
    }
    getOilQValue(_engine) {
        return (SimVar.GetSimVarValue("ENG OIL QUANTITY:" + _engine, "percent scaler 16k") * 0.001);
    }
    getVIBValue(_engine) {
        return SimVar.GetSimVarValue("ENG VIBRATION:" + _engine, "Number");
    }
    getMainTankFuelInMegagrams(_index) {
        let factor = this.gallonToMegapounds;
        if (BaseAirliners.unitIsMetric(Aircraft.AS01B))
            factor = this.gallonToMegagrams;
        return (SimVar.GetSimVarValue("FUELSYSTEM TANK QUANTITY:" + _index, "gallons") * factor);
    }
    getTotalFuelInMegagrams() {
        let factor = this.gallonToMegapounds;
        if (BaseAirliners.unitIsMetric(Aircraft.AS01B))
            factor = this.gallonToMegagrams;
        return (SimVar.GetSimVarValue("FUEL TOTAL QUANTITY", "gallons") * factor);
    }
    getGrossWeightInMegagrams() {
        if (BaseAirliners.unitIsMetric(Aircraft.AS01B))
            return SimVar.GetSimVarValue("TOTAL WEIGHT", "kg") * 0.001;
        return SimVar.GetSimVarValue("TOTAL WEIGHT", "lbs") * 0.001;
    }
    getInfoPanelManager() {
        return this.infoPanelsManager;
    }
}
class B787_10_EICAS_Gauge {
}
class B787_10_EICAS_CircleGauge extends B787_10_EICAS_Gauge {
    constructor(_engineIndex, _root, _template, _hideIfN1IsZero) {
        super();
        this.engineIndex = 0;
        this.currentValue = 0;
        this.valueText = null;
        this.fill = null;
        this.fillPathD = "";
        this.fillCenter = new Vec2();
        this.fillRadius = 0;
        this.defaultMarkerTransform = "";
        this.whiteMarker = null;
        this.redMarker = null;
        this.orangeMarker = null;
        this.greenMarker = null;
        this.hideIfN1IsZero = false;
        this.engineIndex = _engineIndex;
        this.root = _root;
        this.hideIfN1IsZero = _hideIfN1IsZero;
        if ((this.root != null) && (_template != null)) {
            this.root.appendChild(_template.cloneNode(true));
            this.valueText = this.root.querySelector(".valueText");
            this.fill = this.root.querySelector(".fill");
            this.whiteMarker = this.root.querySelector(".normalMarker");
            this.redMarker = this.root.querySelector(".dangerMarker");
            this.orangeMarker = this.root.querySelector(".warningMarker");
            this.greenMarker = this.root.querySelector(".greenMarker");
            if (this.fill != null) {
                var fillPathDSplit = this.fill.getAttribute("d").split(" ");
                for (var i = 0; i < fillPathDSplit.length; i++) {
                    if (this.fillRadius > 0) {
                        if (fillPathDSplit[i].charAt(0) == 'L') {
                            this.fillCenter.x = parseInt(fillPathDSplit[i].replace("L", ""));
                            this.fillCenter.y = parseInt(fillPathDSplit[i + 1]);
                        }
                        this.fillPathD += " " + fillPathDSplit[i];
                    }
                    else if (fillPathDSplit[i].charAt(0) == 'A') {
                        this.fillRadius = parseInt(fillPathDSplit[i].replace("A", ""));
                        this.fillPathD = fillPathDSplit[i];
                    }
                }
            }
            if (this.whiteMarker != null) {
                this.defaultMarkerTransform = this.whiteMarker.getAttribute("transform");
            }
            if (this.redMarker != null) {
                this.redMarker.setAttribute("transform", this.defaultMarkerTransform + " rotate(" + B787_10_EICAS_CircleGauge.MAX_ANGLE + ")");
            }
            if (this.orangeMarker != null) {
                this.orangeMarker.style.display = "none";
            }
            if (this.greenMarker != null) {
                this.greenMarker.style.display = "none";
            }
        }
        this.refresh(0, true);
    }
    update(_deltaTime) {
        this.refresh(this.getCurrentValue());
    }
    refresh(_value, _force = false) {
        if ((_value != this.currentValue) || _force) {
            this.currentValue = _value;
            let hide = false;
            if (this.hideIfN1IsZero && SimVar.GetSimVarValue("ENG N1 RPM:" + this.engineIndex, "percent") < 0.1) {
                this.currentValue = -1;
                hide = true;
            }
            if (this.valueText != null) {
                if (hide) {
                    this.valueText.textContent = "";
                }
                else {
                    this.valueText.textContent = this.currentValue.toFixed(1);
                }
            }
            var angle = Math.max((this.valueToPercentage(this.currentValue) * 0.01) * B787_10_EICAS_CircleGauge.MAX_ANGLE, 0.001);
            if (this.whiteMarker != null) {
                this.whiteMarker.setAttribute("transform", this.defaultMarkerTransform + " rotate(" + angle + ")");
            }
            if (this.fill != null) {
                var rad = angle * B787_10_EICAS_CircleGauge.DEG_TO_RAD;
                var x = (Math.cos(rad) * this.fillRadius) + this.fillCenter.x;
                var y = (Math.sin(rad) * this.fillRadius) + this.fillCenter.y;
                this.fill.setAttribute("d", "M" + x + " " + y + " " + this.fillPathD.replace("0 0 0", (angle <= 180) ? "0 0 0" : "0 1 0"));
            }
        }
    }
}
B787_10_EICAS_CircleGauge.MAX_ANGLE = 210;
B787_10_EICAS_CircleGauge.DEG_TO_RAD = (Math.PI / 180);
class B787_10_EICAS_Gauge_TPR extends B787_10_EICAS_CircleGauge {
    getCurrentValue() {
        return Utils.Clamp(SimVar.GetSimVarValue("ENG PRESSURE RATIO:" + this.engineIndex, "ratio") * (100 / 1.7), 0, 100);
    }
    valueToPercentage(_value) {
        return _value;
    }
}
class B787_10_EICAS_Gauge_N1 extends B787_10_EICAS_CircleGauge {
    getCurrentValue() {
        return SimVar.GetSimVarValue("ENG N1 RPM:" + this.engineIndex, "percent");
    }
    valueToPercentage(_value) {
        return Utils.Clamp(_value, 0, 100);
    }
}
class B787_10_EICAS_Gauge_EGT extends B787_10_EICAS_CircleGauge {
    getCurrentValue() {
        return SimVar.GetSimVarValue("ENG EXHAUST GAS TEMPERATURE:" + this.engineIndex, "celsius");
    }
    valueToPercentage(_value) {
        return (Utils.Clamp(_value, 0, 1000) * 0.1);
    }
}
class B787_10_EICAS_Gauge_N2 extends B787_10_EICAS_CircleGauge {
    getCurrentValue() {
        return SimVar.GetSimVarValue("ENG N2 RPM:" + this.engineIndex, "percent");
    }
    valueToPercentage(_value) {
        return Utils.Clamp(_value, 0, 100);
    }
}
class B787_10_EICAS_LineGauge extends B787_10_EICAS_Gauge {
    constructor(_root, _engineIndex, _hideIfN1IsZero) {
        super();
        this.root = null;
        this.engineIndex = 0;
        this.currentValue = 0;
        this.box = null;
        this.valueText = null;
        this.mainBar = null;
        this.barHeight = 0;
        this.cursor = null;
        this.warningBar = null;
        this.dangerMinBar = null;
        this.dangerMaxBar = null;
        this.hideIfN1IsZero = false;
        this.root = _root;
        this.engineIndex = _engineIndex;
        this.hideIfN1IsZero = _hideIfN1IsZero;
        if (this.root != null) {
            this.box = this.root.querySelector("rect");
            this.valueText = this.root.querySelector("text");
            this.mainBar = this.root.querySelector("line");
            if (this.mainBar != null) {
                var mainX = this.mainBar.x1.baseVal.value;
                var mainY1 = this.mainBar.y1.baseVal.value;
                var mainY2 = this.mainBar.y2.baseVal.value;
                this.barHeight = mainY2 - mainY1;
                var leftGauge = (this.engineIndex == 1);
                var warningValue = this.getWarningValue();
                if ((warningValue > 0) || this.needDangerMinDisplay() || this.needDangerMaxDisplay()) {
                    if (warningValue > 0) {
                        var warningY1 = (mainY2 - (this.valueToPercent(warningValue) * this.barHeight));
                        this.warningBar = document.createElementNS(Avionics.SVG.NS, "polyline");
                        var pointsStr = [
                            mainX, this.mainBar.y2.baseVal.value,
                            mainX, warningY1,
                            (leftGauge ? (mainX + B787_10_EICAS_LineGauge.MARKER_WARNING_LENGTH) : (mainX - B787_10_EICAS_LineGauge.MARKER_WARNING_LENGTH)), warningY1
                        ].join(" ");
                        this.warningBar.setAttribute("points", pointsStr);
                        this.warningBar.setAttribute("class", "warningMarker");
                        this.root.appendChild(this.warningBar);
                    }
                    if (this.needDangerMinDisplay()) {
                        this.dangerMinBar = document.createElementNS(Avionics.SVG.NS, "line");
                        this.dangerMinBar.setAttribute("x1", (leftGauge ? (mainX + B787_10_EICAS_LineGauge.MARKER_DANGER_START_OFFSET) : (mainX - B787_10_EICAS_LineGauge.MARKER_DANGER_START_OFFSET)).toString());
                        this.dangerMinBar.setAttribute("x2", (leftGauge ? (mainX + B787_10_EICAS_LineGauge.MARKER_DANGER_END_OFFSET) : (mainX - B787_10_EICAS_LineGauge.MARKER_DANGER_END_OFFSET)).toString());
                        this.dangerMinBar.setAttribute("y1", mainY2.toString());
                        this.dangerMinBar.setAttribute("y2", mainY2.toString());
                        this.dangerMinBar.setAttribute("class", "dangerMarker");
                        this.root.appendChild(this.dangerMinBar);
                    }
                    if (this.needDangerMaxDisplay()) {
                        this.dangerMaxBar = document.createElementNS(Avionics.SVG.NS, "line");
                        this.dangerMaxBar.setAttribute("x1", (leftGauge ? (mainX + B787_10_EICAS_LineGauge.MARKER_DANGER_START_OFFSET) : (mainX - B787_10_EICAS_LineGauge.MARKER_DANGER_START_OFFSET)).toString());
                        this.dangerMaxBar.setAttribute("x2", (leftGauge ? (mainX + B787_10_EICAS_LineGauge.MARKER_DANGER_END_OFFSET) : (mainX - B787_10_EICAS_LineGauge.MARKER_DANGER_END_OFFSET)).toString());
                        this.dangerMaxBar.setAttribute("y1", mainY1.toString());
                        this.dangerMaxBar.setAttribute("y2", mainY1.toString());
                        this.dangerMaxBar.setAttribute("class", "dangerMarker");
                        this.root.appendChild(this.dangerMaxBar);
                    }
                }
                this.cursor = document.createElementNS(Avionics.SVG.NS, "path");
                var dStr = [
                    "M", (leftGauge ? (mainX + B787_10_EICAS_LineGauge.CURSOR_START_OFFSET) : (mainX - B787_10_EICAS_LineGauge.CURSOR_START_OFFSET)), 0,
                    "l", (leftGauge ? B787_10_EICAS_LineGauge.CURSOR_LENGTH : -B787_10_EICAS_LineGauge.CURSOR_LENGTH), -(B787_10_EICAS_LineGauge.CURSOR_HEIGHT * 0.5),
                    "l", 0, B787_10_EICAS_LineGauge.CURSOR_HEIGHT,
                    "Z"
                ].join(" ");
                this.cursor.setAttribute("d", dStr);
                this.cursor.setAttribute("class", "cursor");
                this.root.appendChild(this.cursor);
            }
            this.initChild();
        }
        this.refresh(0, true);
    }
    update(_deltaTime) {
        this.refresh(this.getValue());
    }
    refresh(_value, _force = false) {
        if ((_value != this.currentValue) || _force) {
            this.currentValue = _value;
            let hide = false;
            if (this.hideIfN1IsZero && SimVar.GetSimVarValue("ENG N1 RPM:" + this.engineIndex, "percent") < 0.1) {
                this.currentValue = -1;
                hide = true;
            }
            var isInDangerState = (this.needDangerMinDisplay() && (this.currentValue <= 0)) || (this.needDangerMaxDisplay() && (this.currentValue >= this.getMax()));
            var isInWarningState = !isInDangerState && (this.getWarningValue() > 0) && (this.currentValue <= this.getWarningValue());
            var stateStyle = isInDangerState ? " danger" : (isInWarningState ? " warning" : "");
            if (this.valueText != null) {
                if (hide) {
                    this.valueText.textContent = "";
                }
                else {
                    this.valueText.textContent = this.currentValue.toFixed(this.getValuePrecision());
                }
                this.valueText.setAttribute("class", stateStyle);
            }
            if ((this.cursor != null) && (this.barHeight > 0)) {
                var valueAsPercent = Utils.Clamp(this.valueToPercent(this.currentValue), 0, 1);
                var cursorY = (1 - valueAsPercent) * this.barHeight;
                this.cursor.setAttribute("transform", "translate(0, " + cursorY + ")");
                this.cursor.setAttribute("class", "cursor" + stateStyle);
            }
            this.refreshChild();
        }
    }
    valueToPercent(_value) {
        return (_value / this.getMax());
    }
    initChild() { }
    refreshChild() { }
    getWarningValue() { return 0; }
    needDangerMinDisplay() { return false; }
    needDangerMaxDisplay() { return false; }
    getValuePrecision() { return 0; }
}
B787_10_EICAS_LineGauge.CURSOR_START_OFFSET = 6;
B787_10_EICAS_LineGauge.CURSOR_LENGTH = 30;
B787_10_EICAS_LineGauge.CURSOR_HEIGHT = 20;
B787_10_EICAS_LineGauge.MARKER_WARNING_LENGTH = 10;
B787_10_EICAS_LineGauge.MARKER_DANGER_START_OFFSET = -10;
B787_10_EICAS_LineGauge.MARKER_DANGER_END_OFFSET = 20;
class B787_10_EICAS_Gauge_OIL_P extends B787_10_EICAS_LineGauge {
    getMax() { return 100; }
    getWarningValue() { return 20; }
    needDangerMinDisplay() { return true; }
    getValue() { return SimVar.GetSimVarValue("ENG OIL PRESSURE:" + this.engineIndex, "psi"); }
}
class B787_10_EICAS_Gauge_OIL_T extends B787_10_EICAS_LineGauge {
    getMax() { return 200; }
    getWarningValue() { return 35; }
    needDangerMinDisplay() { return true; }
    needDangerMaxDisplay() { return true; }
    getValue() { return SimVar.GetSimVarValue("ENG OIL TEMPERATURE:" + this.engineIndex, "celsius"); }
}
class B787_10_EICAS_Gauge_VIB extends B787_10_EICAS_LineGauge {
    constructor() {
        super(...arguments);
        this.tooHighBar = null;
    }
    initChild() {
        if ((this.root != null) && (this.mainBar != null)) {
            var x1 = this.mainBar.x1.baseVal.value;
            var x2 = ((this.engineIndex == 1) ? (x1 + B787_10_EICAS_Gauge_VIB.MARKER_TOO_HIGH_LENGTH) : (x1 - B787_10_EICAS_Gauge_VIB.MARKER_TOO_HIGH_LENGTH));
            var y = (this.mainBar.y2.baseVal.value - (this.valueToPercent(B787_10_EICAS_Gauge_VIB.TOO_HIGH_VALUE) * (this.mainBar.y2.baseVal.value - this.mainBar.y1.baseVal.value)));
            this.tooHighBar = document.createElementNS(Avionics.SVG.NS, "line");
            this.tooHighBar.setAttribute("x1", x1.toString());
            this.tooHighBar.setAttribute("x2", x2.toString());
            this.tooHighBar.setAttribute("y1", y.toString());
            this.tooHighBar.setAttribute("y2", y.toString());
            this.root.appendChild(this.tooHighBar);
        }
    }
    refreshChild() {
        var tooHigh = (this.currentValue >= B787_10_EICAS_Gauge_VIB.TOO_HIGH_VALUE);
        if (this.box != null) {
            this.box.setAttribute("class", tooHigh ? "invert" : "");
        }
        if (this.valueText != null) {
            this.valueText.setAttribute("class", tooHigh ? "invert" : "");
        }
    }
    getMax() { return 5; }
    getValue() { return SimVar.GetSimVarValue("ENG VIBRATION:" + this.engineIndex, "Number"); }
    getValuePrecision() { return 1; }
}
B787_10_EICAS_Gauge_VIB.TOO_HIGH_VALUE = 4;
B787_10_EICAS_Gauge_VIB.MARKER_TOO_HIGH_LENGTH = 10;
customElements.define("b787-10-eicas-element", B787_10_EICAS);
//# sourceMappingURL=B787_10_EICAS.js.map