class B787_10_SYS extends B787_10_CommonMFD.MFDTemplateElement {
    constructor() {
        super(...arguments);
        this.allPageButtons = new Array();
        this.currentPage = null;
        this.navHighlight = -1;
        this.navHighlightTimer = -1.0;
        this.navHighlightLastIndex = 0;
    }
    get templateID() { return "B787_10_SYS_Template"; }
    get pageIdentifier() { return MFDPageType.SYS; }
    initChild() {
        if (this.allPageButtons == null) {
            this.allPageButtons = new Array();
        }
        var pageButtonSmallTemplate = this.querySelector("#PageButtonSmallTemplate");
        var pageButtonLargeTemplate = this.querySelector("#PageButtonLargeTemplate");
        if (pageButtonSmallTemplate != null) {
            this.allPageButtons.push(new B787_10_SYS_Page_STAT(this, pageButtonSmallTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_ELEC(this, pageButtonSmallTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_HYD(this, pageButtonSmallTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_FUEL(this, pageButtonSmallTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_AIR(this, pageButtonSmallTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_DOOR(this, pageButtonSmallTemplate));
            pageButtonSmallTemplate.remove();
        }
        if (pageButtonLargeTemplate != null) {
            this.allPageButtons.push(new B787_10_SYS_Page_GEAR(this, pageButtonLargeTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_FCTL(this, pageButtonLargeTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_EFIS_DSP(this, pageButtonLargeTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_MAINT(this, pageButtonLargeTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_CB(this, pageButtonLargeTemplate));
            pageButtonLargeTemplate.remove();
        }
        if (this.allPageButtons != null) {
            for (var i = 0; i < this.allPageButtons.length; ++i) {
                if (this.allPageButtons[i] != null) {
                    this.allPageButtons[i].init();
                }
            }
        }
        this.setPageActiveByName("FUEL");
    }
    updateChild(_deltaTime) {
        if (this.currentPage != null) {
            this.currentPage.update(_deltaTime);
        }
        if (this.navHighlightTimer >= 0) {
            this.navHighlightTimer -= _deltaTime / 1000;
            if (this.navHighlightTimer <= 0) {
                this.setNavHighlight(-1);
                this.navHighlightTimer = -1;
            }
        }
    }
    onEvent(_event) {
        if (_event.startsWith("CHANGE_SYS_PAGE_")) {
            this.setPageActiveByName(_event.replace("CHANGE_SYS_PAGE_", ""));
        }
        else {
            switch (_event) {
                case "Cursor_DEC":
                    if (this.navHighlight > 0)
                        this.setNavHighlight(this.navHighlight - 1);
                    else if (this.navHighlight == -1)
                        this.setNavHighlight(this.navHighlightLastIndex);
                    break;
                case "Cursor_INC":
                    if (this.navHighlight >= 0 && this.navHighlight < this.allPageButtons.length - 1)
                        this.setNavHighlight(this.navHighlight + 1);
                    else if (this.navHighlight == -1)
                        this.setNavHighlight(this.navHighlightLastIndex);
                    break;
                case "Cursor_Press":
                    if (this.navHighlight >= 0) {
                        this.allPageButtons[this.navHighlight].trigger();
                    }
                    break;
            }
        }
    }
    setGPS(_gps) {
    }
    setPageActiveByIndex(_index) {
        if ((_index >= 0) && (this.allPageButtons != null) && (_index < this.allPageButtons.length)) {
            for (var i = 0; i < this.allPageButtons.length; ++i) {
                if (this.allPageButtons[i] != null) {
                    if (i == _index) {
                        this.allPageButtons[i].isActive = true;
                        this.currentPage = this.allPageButtons[i];
                        this.navHighlightLastIndex = _index;
                    }
                    else {
                        this.allPageButtons[i].isActive = false;
                    }
                }
            }
        }
    }
    setPageActiveByName(_name) {
        if (this.allPageButtons != null) {
            for (var i = 0; i < this.allPageButtons.length; ++i) {
                if (this.allPageButtons[i] != null) {
                    if (_name == this.allPageButtons[i].getName()) {
                        this.setPageActiveByIndex(i);
                        break;
                    }
                }
            }
        }
    }
    setNavHighlight(_index) {
        if (this.navHighlight != _index) {
            if (this.navHighlight >= 0) {
                this.navHighlight = -1;
                this.navHighlightTimer = -1.0;
            }
            if (_index >= 0) {
                this.navHighlight = _index;
                this.navHighlightTimer = 5.0;
                this.navHighlightLastIndex = _index;
            }
            for (var i = 0; i < this.allPageButtons.length; ++i) {
                if (i == this.navHighlight) {
                    this.allPageButtons[i].isHighlight = true;
                }
                else {
                    this.allPageButtons[i].isHighlight = false;
                }
            }
        }
    }
}
class B787_10_SYS_Page {
    constructor(_sys, _buttonTemplate) {
        this.sys = null;
        this.buttonRoot = null;
        this.pageRoot = null;
        this.active = false;
        this.allTextValueComponents = new Array();
        this.gallonToMegagrams = 0;
        this.gallonToMegapounds = 0;
        this.sys = _sys;
        if (_sys != null) {
            var pageButtonRoot = _sys.querySelector("#" + this.getName() + "_PageButton");
            if ((pageButtonRoot != null) && (_buttonTemplate != null)) {
                this.buttonRoot = _buttonTemplate.cloneNode(true);
                this.buttonRoot.removeAttribute("id");
                pageButtonRoot.appendChild(this.buttonRoot);
                this.buttonRoot.addEventListener("mouseup", this.trigger.bind(this));
                var textElement = this.buttonRoot.querySelector("text");
                if (textElement != null) {
                    diffAndSetText(textElement, this.getName().replace("_", "/"));
                }
            }
            this.pageRoot = _sys.querySelector("#" + this.getName() + "_Page");
        }
        this.gallonToMegagrams = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilogram") * 0.001;
        this.gallonToMegapounds = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "lbs") * 0.001;
    }
    set isActive(_active) {
        this.active = _active;
        if (this.buttonRoot != null) {
            if (this.active) {
                this.buttonRoot.classList.add("page-button-active");
                this.buttonRoot.classList.remove("page-button-inactive");
            }
            else {
                this.buttonRoot.classList.remove("page-button-active");
                this.buttonRoot.classList.add("page-button-inactive");
            }
        }
        if (this.pageRoot != null) {
            diffAndSetStyle(this.pageRoot, StyleProperty.display, this.active ? "block" : "none");
        }
    }
    set isHighlight(_highlight) {
        if (this.buttonRoot != null) {
            if (_highlight) {
                this.buttonRoot.classList.add("page-button-highlight");
            }
            else {
                this.buttonRoot.classList.remove("page-button-highlight");
            }
        }
    }
    init() {
        if (this.pageRoot != null) {
            var inopText = document.createElementNS(Avionics.SVG.NS, "text");
            diffAndSetAttribute(inopText, "x", "50%");
            diffAndSetAttribute(inopText, "y", "5%");
            diffAndSetAttribute(inopText, "fill", "var(--eicasWhite)");
            diffAndSetAttribute(inopText, "fill", "var(--eicasWhite)");
            diffAndSetAttribute(inopText, "font-size", "45px");
            diffAndSetAttribute(inopText, "text-anchor", "middle");
            diffAndSetText(inopText, "INOP");
            this.pageRoot.appendChild(inopText);
        }
    }
    update(_deltaTime) {
        if (this.active) {
            if (this.allTextValueComponents != null) {
                for (var i = 0; i < this.allTextValueComponents.length; ++i) {
                    if (this.allTextValueComponents[i] != null) {
                        this.allTextValueComponents[i].refresh();
                    }
                }
            }
            this.updateChild(_deltaTime);
        }
    }
    trigger() {
        this.sys.onEvent("CHANGE_SYS_PAGE_" + this.getName());
    }
    getTotalFuelInMegagrams() {
        let factor = this.gallonToMegapounds;
        if (BaseAirliners.unitIsMetric(Aircraft.AS01B))
            factor = this.gallonToMegagrams;
        return (SimVar.GetSimVarValue("FUEL TOTAL QUANTITY", "gallons") * factor);
    }
    getMainTankFuelInMegagrams(_index) {
        let factor = this.gallonToMegapounds;
        if (BaseAirliners.unitIsMetric(Aircraft.AS01B))
            factor = this.gallonToMegagrams;
        return (SimVar.GetSimVarValue("FUELSYSTEM TANK QUANTITY:" + _index, "gallons") * factor);
    }
}
class B787_10_SYS_Page_STAT extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "STAT"; }
}
class B787_10_SYS_Page_ELEC extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "ELEC"; }
}
class B787_10_SYS_Page_HYD extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "HYD"; }
}
class B787_10_SYS_Page_FUEL extends B787_10_SYS_Page {
    constructor() {
        super(...arguments);
        this.allFuelComponents = null;
    }
    init() {
        if (this.allFuelComponents == null) {
            this.allFuelComponents = new Array();
        }
        if (this.pageRoot != null) {
            this.unitTextSVG = this.pageRoot.querySelector("#TotalFuelUnits");
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#TotalFuelValue"), this.getTotalFuelInMegagrams.bind(this), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#Tank1Quantity"), this.getMainTankFuelInMegagrams.bind(this, 1), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#Tank2Quantity"), this.getMainTankFuelInMegagrams.bind(this, 2), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#Tank3Quantity"), this.getMainTankFuelInMegagrams.bind(this, 3), 1));
            this.allFuelComponents.push(new Boeing.FuelEngineState(this.pageRoot.querySelector("#Engine1FuelState"), 1));
            this.allFuelComponents.push(new Boeing.FuelEngineState(this.pageRoot.querySelector("#Engine2FuelState"), 2));
            var fuelPumpsGroup = this.pageRoot.querySelector("#FuelPumps");
            if (fuelPumpsGroup != null) {
                var allFuelPumps = fuelPumpsGroup.querySelectorAll("rect");
                if (allFuelPumps != null) {
                    for (var i = 0; i < allFuelPumps.length; ++i) {
                        this.allFuelComponents.push(new Boeing.FuelPump(allFuelPumps[i], parseInt(allFuelPumps[i].id.replace("FuelPump", ""))));
                    }
                }
            }
            var fuelValvesGroup = this.pageRoot.querySelector("#FuelValves");
            if (fuelValvesGroup != null) {
                var fuelValveTemplate = this.pageRoot.querySelector("#FuelValveTemplate");
                if (fuelValveTemplate != null) {
                    var allFuelValves = fuelValvesGroup.querySelectorAll("g");
                    if (allFuelValves != null) {
                        for (var i = 0; i < allFuelValves.length; ++i) {
                            var clonedValve = fuelValveTemplate.cloneNode(true);
                            clonedValve.removeAttribute("id");
                            allFuelValves[i].appendChild(clonedValve);
                            this.allFuelComponents.push(new Boeing.FuelValve(allFuelValves[i], parseInt(allFuelValves[i].id.replace("FuelValve", ""))));
                        }
                    }
                    fuelValveTemplate.remove();
                }
            }
            var fuelLinesGroup = this.pageRoot.querySelector("#FuelLines");
            if (fuelLinesGroup != null) {
                var allFuelLines = fuelLinesGroup.querySelectorAll("line, polyline, g");
                if (allFuelLines != null) {
                    for (var i = 0; i < allFuelLines.length; ++i) {
                        var id = parseInt(allFuelLines[i].id.replace("FuelLine", ""));
                        if ((id != NaN) && (id > 0)) {
                            this.allFuelComponents.push(new Boeing.FuelLine(allFuelLines[i], id));
                        }
                    }
                }
            }
        }
        if (this.allFuelComponents != null) {
            for (var i = 0; i < this.allFuelComponents.length; ++i) {
                if (this.allFuelComponents[i] != null) {
                    this.allFuelComponents[i].init();
                }
            }
        }
    }
    updateChild(_deltaTime) {
        if (this.allFuelComponents != null) {
            for (var i = 0; i < this.allFuelComponents.length; ++i) {
                if (this.allFuelComponents[i] != null) {
                    this.allFuelComponents[i].update(_deltaTime);
                }
            }
        }
        if (this.unitTextSVG) {
            if (BaseAirliners.unitIsMetric(Aircraft.B747_8))
                diffAndSetText(this.unitTextSVG, "KGS X 1000");
            else
                diffAndSetText(this.unitTextSVG, "LBS X 1000");
        }
    }
    getName() { return "FUEL"; }
}
class B787_10_SYS_Page_AIR extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "AIR"; }
}
class B787_10_SYS_Page_DOOR extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "DOOR"; }
}
class B787_10_SYS_Page_GEAR extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "GEAR"; }
}
class B787_10_SYS_Page_FCTL extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "FCTL"; }
}
class B787_10_SYS_Page_EFIS_DSP extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "EFIS_DSP"; }
}
class B787_10_SYS_Page_MAINT extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "MAINT"; }
}
class B787_10_SYS_Page_CB extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "CB"; }
}
customElements.define("b787-10-sys-element", B787_10_SYS);
//# sourceMappingURL=B787_10_SYS.js.map