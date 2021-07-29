class B787_10_INFO extends B787_10_CommonMFD.MFDTemplateElement {
    get templateID() { return "B787_10_INFO_Template"; }
    get pageIdentifier() { return MFDPageType.INFO; }
    initChild() {
    }
    updateChild(_deltaTime) {
    }
    onEvent(_event) {
    }
    setGPS(_gps) {
    }
}
customElements.define("b787-10-info-element", B787_10_INFO);
//# sourceMappingURL=B787_10_INFO.js.map