class B787_10_CDU extends B787_10_CommonMFD.MFDTemplateElement {
    get templateID() { return "B787_10_CDU_Template"; }
    get pageIdentifier() { return MFDPageType.CDU; }
    initChild() {
    }
    updateChild(_deltaTime) {
    }
    onEvent(_event) {
    }
    setGPS(_gps) {
    }
}
customElements.define("b787-10-cdu-element", B787_10_CDU);
//# sourceMappingURL=B787_10_CDU.js.map