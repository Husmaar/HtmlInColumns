/**
*@namespace dk.marten.development
*/

/**
* Hjælpeværktøj til at debugge. Benyttes til at logge beskeder ud. Der benyttes <code>console</code> som udgangspunkt i logningen. 
* Hvis den valgte logmetode ikke findes vælges en anden fallback og hvis browseren slet ikke understøtter console.log sørger modulet også for at javascript afviklingen ikke går i stå (som det ellers sker i gamle msie).
* Man kan også slå screenloggen til så logningen forgår i dom-en.
* Man kan angive hvilket niveau man ønsker at logge, så man f.eks. kun logger fejl eller slår logningen helt fra.
* Hvis man bruger screenlog skal jQuery også være tilstede.
* @class Logger
* @author Marten Ølgaard
* @see <a href="/Javascript/Eksempler/dk/marten/development/Logger.html">Se eksempel</a> 
* @uses jQuery
* @example
*         Logger.useScreenLog = true;
*         Logger.info("start logning");
* 
*         Logger.group("Tidslogning");
*         Logger.startStopwatch();
*         Logger.logStopwatch("Starttid");
*         Logger.groupEnd();
* @static
 */
var Logger = Logger || (function () {
    "use strict"
    var _r = new Object();//Extend function

    /* PRIVATE */
    _r.stopwatchStartTime= null;

    _r.screenLogHtml = "";

    /**    
    * Angiver om browseren har console til rådighed. Benyttes primært internt.
    *@property {Boolean} gotConsole
    */
    _r.gotConsole = true;

    /**    
    * Om der skal benyttes alert som alternativ til console.log hvis der ikke er adgang til denne
    * @property useAlertAsAlternertive
    */
    _r.useAlertAsAlternertive = false;

    /**    
    * Om log informationerne skal skrives på et lag der ligger oven på content
    * @property useScreenLog
    */
    _r.useScreenLog = false;

    /**    
    * Om der skal benyttes trace i stedet for log. Kan være handy hvis man skal finde hvor i koden der logges, feks. for at fjerne disse logs
    * @property traceAllLogs
    */
    _r.traceAllLogs = false;

    /**    
    * Konstant der benyttes til at definere logLevel. Slår alt logning fra.
    * @property LOG_NONE
    */
    Object.defineProperty(_r, "LOG_NONE", {
        value: 0,
        writeable: false
    });

    /**    
    * Konstant der benyttes til at definere logLevel. Logger kun fejl ud.
    * @property LOG_ERROR
    */
    Object.defineProperty(_r, "LOG_ERROR", {
        value: 1,
        writeable: false
    });
    /**    
    * Konstant der benyttes til at definere logLevel
    * @property LOG_ERROR_WARN
    */
    Object.defineProperty(_r, "LOG_ERROR_WARN", {
        value: 2,
        writeable: false
    });
    /**    
    * Konstant der benyttes til at definere logLevel
    * @property LOG_ERROR_WARN_INFO
    */
    Object.defineProperty(_r, "LOG_ERROR_WARN_INFO", {
        value: 3,
        writeable: false
    });
    /**    
    * Konstant der benyttes til at definere logLevel
    * @property LOG_ALL
    */
    Object.defineProperty(_r, "LOG_ALL", {
        value: 4,
        writeable: false
    });
    /**    
    * Hvor mange informationer der skal logges ud
    * @property logLevel
    */
    _r.logLevel = _r.LOG_ALL;


    /**    
    * Css der styrer screenlogen. Benyttes kun hvis useScreenLog er true
    * @property screenLogCss
    */
    _r.screenLogCss =   "#ScreenLogger{\r\n"
                        +"position:fixed;\r\n"
                        +"top:0px;\r\n"
                        +"bottom:0px;\r\n"
                        +"right:0px;\r\n"
                        +"width:250px;\r\n"
                        +"background-color:rgba(0,0,0,.6);\r\n"
                        +"padding:10px;\r\n"
                        +"overflow-y:auto;\r\n"
                        +"overflow-x:hidden;\r\n"
                        +"}\r\n"
                        +"#ScreenLogger div{\r\n"
                        +"color:rgba(255,255,255,0.8);\r\n"
                        +"}\r\n"
                        +"#ScreenLogger div.warn{\r\n"
                        +"color:rgba(255,255,0,0.8);\r\n"
                        +"}\r\n"
                        +"#ScreenLogger div.error{\r\n"
                        +"color:rgba(255,0,0,0.8);\r\n"
                        +"}\r\n"
                        +"#ScreenLogger .logGroup{\r\n"
                        +"padding-left:10px;\r\n"
                        +"border-bottom:1px solid rgba(255,255,255,0.8);\r\n"
                        +"border-top:1px solid rgba(255,255,255,0.8);\r\n"
                        +"}";


    /**
    * Log-er en tekst ud hvis browseren understøtter dette
    *@method log
    *@param {Object} message Besked der skal logges
    */
    _r.log = function (message) {
        if (_r.logLevel < _r.LOG_ALL) return; 
        _r.doLog(message,"debug");
    };


    _r.doLog = function (message, type) {
        if (_r.gotConsole) {
            if (_r.traceAllLogs && typeof console["trace"] !== "undefined") console.trace(message);
            else {
                if (typeof console[type] !== "undefined") {
                    try {
                        console[type](message);
                    } catch (error) {
                        alert(error);
                    }
                } else if (typeof console["log"] !== "undefined") {
                    console.log(message);
                } else if (_r.useAlertAsAlternertive) {
                    alert(message);
                }
            }
        } else if (_r.useAlertAsAlternertive) {
            alert(message);
        }
        _r.screenLog(message, type);
    };

    /**
    * Log-er en tekst ud som advarsel hvis browseren understøtter dette
    *@method trace
    *@param {Object} message Besked der skal logges
    */
    _r.trace = function (message) {
        if (_r.logLevel < _r.LOG_ALL) return;
            _r.doLog(message, "trace");
    }
    /**
    *  Svarer til den tilsvarende console funktionalitet
    *@method debug
    *@param {Object} message Besked der skal logges
    */
    _r.debug = function (message) {
        if (!_r.logLevel == _r.LOG_ALL) return;
        _r.doLog(message, "debug");
    }


    /**
    * Svarer til den tilsvarende console funktionalitet
    *@method info
    *@param {Object} message Besked der skal logges
    */
    _r.info = function (message) {
        if (_r.logLevel < _r.LOG_ERROR_WARN_INFO) return;
        _r.doLog(message, "info");
    };
    /**
    * Log-er en tekst ud som advarsel hvis browseren understøtter dette
    *@method warn
    *@param {Object} message Besked der skal logges
    */
    _r.warn = function (message) {
        if (_r.logLevel < _r.LOG_ERROR_WARN) return;
        _r.doLog(message, "warn");
    };
    /**
    * Log-er en tekst ud som fejl hvis browseren understøtter dette
    *@method error
    *@param {Object} message Besked der skal logges
    */
    _r.error = function (message) {
        if (_r.logLevel < _r.LOG_ERROR) return;
        _r.doLog(message, "error");
    };

    /**
    * Log-er en tekst ud på et lag i browseren
    * Er blandt andet godt når man arbejder med en tablet
    * Bruges mest internt hvis man har sat flaget useScreenLog
    *@method screenLog
    *@param {Object} message Besked der skal logges
    *@param {String} ccsClass 
    */
    _r.screenLog = function (message, ccsClass) {
        if (!(_r.useScreenLog && _r.gotJquery())) return;
        _r.createScreenLogDiv();
        var css = (ccsClass) ? " class=\"" + ccsClass + "\"" : "";
        _r.appendScreenLogHtml("<div" + css + ">" + message + "</div>");
    }


    _r.createScreenLogDiv = function () {
        if (document.getElementById("ScreenLogger") == null) {
            try {
                jQuery("body").append("<div id='ScreenLogger'></div>");
                _r.appendScreenLogHtml("<div><b>LOG</b></div>");
                jQuery("head").append("<style>" + _r.screenLogCss + "</style>");
            } catch (error) {}
        }
    }

    _r.gotJquery = function () {
        return (typeof window["jQuery"] !== "undefined");
    }

    /**
    * Svarer til den tilsvarende console funktionalitet
    *@method group
    *@param {String} Overskrift for gruppen
    */
    _r.group = function (message) {        
        if (_r.gotConsole &&  typeof console["group"] !== "undefined") {
            console.group(message);
        }
        _r.screenGroup(message);
    };

    /**
    * Svarer til den tilsvarende console funktionalitet
    *@method groupCollapsed
    *@param {String} Overskrift for gruppen
    */
    _r.groupCollapsed = function (message) {
        if (_r.gotConsole && typeof console["groupCollapsed"] !== "undefined") {
            console.groupCollapsed(message);
        }
        _r.screenGroup(message);
    };

    _r.screenGroup = function (message) {
        if (_r.useScreenLog && _r.gotJquery()) {
            _r.screenLog("<b>" + message + "</b>");
            _r.appendScreenLogHtml("<div class=\"logGroup\">");
        }
    };

    /**
    * Svarer til den tilsvarende console funktionalitet
    *@method groupEnd
    */
    _r.groupEnd = function () {
        if (_r.gotConsole &&  typeof console["groupEnd"] !== "undefined") {
            console.groupEnd();
        }
        if (_r.useScreenLog && _r.gotJquery()) {
            _r.appendScreenLogHtml("</div>");
        }
    };

    /**
    * Svarer til den tilsvarende console funktionalitet
    *@method assert
    *@param {Boolean} condition
    *@param {Object} message
    */
    _r.assert = function (condition,message) {
        if (_r.gotConsole && typeof console["assert"] !== "undefined") {
            console.assert(condition, message);
            _r.screenLog(message);
        } else if (condition) {
            _r.doLog(message);
            _r.screenLog(message);
        }
    };



    _r.appendScreenLogHtml = function (html) {
        _r.screenLogHtml += html;
        try{
            jQuery("#ScreenLogger").html(_r.screenLogHtml);
        } catch (error) { }
    }

    /**
    * Svarer til den tilsvarende console funktionalitet
    *@method count
    *@param {Object} countID
    *@todo Man kunne lave en fallbackløsning hvis browseren ikke understøtter denne funktion?
    */
    _r.count = function (countID) {
        if (_r.gotConsole && typeof console["count"] !== "undefined") {
            console.count(countID);
        }
    };


    /**
    * Starter Stopwatch
    *@method startStopwatch
    */
    _r.startStopwatch = function () {
        _r.stopwatchStartTime = performance.now();
    };

    /**
    * Nulstiller Stopwatch
    *@method resetStopwatch
    */
    _r.resetStopwatch = function () {
        _r.startStopwatch();
    };

    /**
    * Stopper Stopwatch
    *@method stopStopwatch
    */
    _r.stopStopwatch = function () {
        _r.stopwatchStartTime = null;
    };


    /**
    * Logger tiden siden uret er startet
    * Hvis uret ikke er startet startes dette
    * Kræver at active er true (default værdien)
    *@method logStopwatch
    *@param message{String} Besked der tilføjes til logtiden
    */
    _r.logStopwatch = function (message) {
        if (message == null) message = "Elapsed time";

        if (_r.stopwatchStartTime == null) {
            _r.startStopwatch();
        }
        _r.log(message + " = " + (performance.now() - _r.stopwatchStartTime) + " ms");
    };

    /**
    * Finder tiden siden uret er startet
    *@method getStopwatch
    *@return {Number} Den tid der er gået siden uret blev startet
    */
    _r.getStopwatch = function () {
        if (_r.stopwatchStartTime == null) {
            _r.startStopwatch();
        }

        return performance.now() - _r.stopwatchStartTime;
    };

    /**
    * Logger data ud om tidsforbrug i forbindelse med load af siden
    * Denne metode bør først kaldes efter onload
    *@method logLoadPerformance
    */
    _r.logLoadPerformance = function () {
        if (window.performance && window.performance.timing) {
            _r.group("Load performance");
            var start = window.performance.timing.navigationStart;
            var flow = [{ key : "Start", time : 0 }];
            for (var key in window.performance.timing) {
                if (window.performance.timing[key] != null && window.performance.timing[key] > 0) {
                    flow.push({ key : key, time : (window.performance.timing[key] - start) });
                }
            }
            flow.sort(dynamicSort("time"));
            for (var i = 0; i < flow.length; i++) {
                _r.log(flow[i].key + " = " + flow[i].time);
            }

            _r.groupEnd();
        }

        function dynamicSort(property) {
            var sortOrder = 1;
            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return function (a, b) {
                var result = (a[property] < b[property]) ? -1  : (a[property] > b[property]) ? 1  : 0;
                return result * sortOrder;
            }
        }
    }

    /**
     *
     *@method toString
     *@return {String} Svarer [object Logger]
     */
    _r.toString = function () {
        return "[object Logger]";
    }


    if (window) {
        if (typeof window["console"] === 'undefined') {
            _r.gotConsole = false;
            window.console = {
                log: function () {
                    return;
                }
            };
        }
    } else {
        _r.gotConsole = false;
    }

    
    
    return _r;
})();


