export var Level;
(function (Level) {
    Level[Level["none"] = 0] = "none";
    Level[Level["debug"] = 10000] = "debug";
    Level[Level["info"] = 20000] = "info";
    Level[Level["warning"] = 30000] = "warning";
    Level[Level["error"] = 40000] = "error";
    Level[Level["fatal"] = 50000] = "fatal";
})(Level || (Level = {}));
