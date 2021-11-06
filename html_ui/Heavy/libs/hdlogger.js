(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.window = global.window || {}));
}(this, function (exports) { 'use strict';

    var Level;
    (function (Level) {
        Level[Level["none"] = 0] = "none";
        Level[Level["debug"] = 10000] = "debug";
        Level[Level["info"] = 20000] = "info";
        Level[Level["warning"] = 30000] = "warning";
        Level[Level["error"] = 40000] = "error";
        Level[Level["fatal"] = 50000] = "fatal";
    })(Level || (Level = {}));

    class HDLogger {
        static log(message, level = Level.none) {
            if (this.handlers.length > 0) {
                for (let handler of this.handlers) {
                    handler.log(message, level);
                }
            }
        }
        static addHandler(handler) {
            this.handlers.push(handler);
        }
    }
    HDLogger.handlers = [];

    class ConsoleHandler {
        log(message, level = Level.none) {
            switch (level) {
                case Level.none:
                    console.log(message);
                    break;
                case Level.debug:
                    console.info(Level[level] + ': ' + message);
                    break;
                case Level.info:
                    console.info(Level[level] + ': ' + message);
                    break;
                case Level.warning:
                    console.warn(Level[level] + ': ' + message);
                    break;
                case Level.error:
                    console.warn(Level[level] + ': ' + message);
                    break;
                case Level.fatal:
                    console.warn(Level[level] + ': ' + message);
                    break;
            }
        }
    }

    exports.HDLogger = HDLogger;
    exports.ConsoleHandler = ConsoleHandler;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
