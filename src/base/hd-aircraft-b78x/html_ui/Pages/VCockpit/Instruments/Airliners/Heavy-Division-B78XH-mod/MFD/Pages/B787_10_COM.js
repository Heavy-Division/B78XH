class B787_10_COM extends B787_10_CommonMFD.MFDTemplateElement {
    get templateID() { return "B787_10_COM_Template"; }
    get pageIdentifier() { return MFDPageType.COMM; }
    initChild() {
    }
    updateChild(_deltaTime) {
    }
    onEvent(_event) {
    }
    setGPS(_gps) {
    }
}
customElements.define("b787-10-com-element", B787_10_COM);
//# sourceMappingURL=B787_10_COM.js.map