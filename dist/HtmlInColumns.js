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



/**
*@namespace dk.marten.utils
*/

/**
* A selection of function for working with arrays
* 
* @author Marten Ølgaard
* @created 24/4/2013
* @license MIT
* @copyright Marten Ølgaard
* @class Arrays
* @static
* @see <a href="/Javascript/Eksempler/dk/marten/utils/Arrays.html">Se eksempel</a> 
*/
var Arrays = Arrays || (function () {

	var _r = new Object();
		
	/**
	* Om en array indeholder et givent værdi
	* @method contains
	* @param {Array} arr Array der skal benyttes af metoden 
	* @param {Object} obj
    *@returns {int} index for placering eller -1 hvis elementet ikke findes
	*/
	_r.contains = function(arr, obj){
	    var i = 0, l = arr.length;
	    for (i = 0; i < l; i++) {
	            if (obj === arr[i]) return i;
	    }
	    return -1;
	}

    /**
	* Fjerner et object fra en array
	* @method remove
	* @param {Array} arr Array der skal benyttes af metoden 
	* @param {Object} obj
	* @param {Boolean} checkForDuplicates Om der skal tjekkes for mere end en forekomst. Default er true
    *@returns {Boolean} true hvis der er fjernet et eller flere elementer
	*/
	_r.remove = function (arr, obj, checkForDuplicates) {
	    if (checkForDuplicates == null) checkForDuplicates = true;
	    if (checkForDuplicates) arr = _r.removeDuplicates(arr);

	    var i = _r.contains(arr, obj);
	    if (i != -1) {
	        arr.splice(i, 1);
	        return true;
	    }

	    return false;
	}


	/**
	* Fjerner alle tilfælde af ens elementer. Det første element i array bliver
	* @method removeDuplicates
	* @param {Array} arr Array der skal benyttes af metoden 
	* @return {Array} Array uden dupletter
	*/
	_r.removeDuplicates = function (arr) {
	    var uniq = [],test=false,i=0,j=0,e=null;
	    for (i = 0; i < arr.length; i++) {
	        e = arr[i];
	        test = false;
	        for (j = 0; j < uniq.length; j++) {
	            if (e === uniq[j]) {
	                test = true;
	                break;
	            }
	        }
	        if (!test) uniq.push(e);
	    }
	    return uniq;
	}
    
	/**
	* Shuffler arrayen så alle elementer placeres tilfældigt i forhold til den foregående posittion
    * Benytter Fisher–Yates shuffle metoden
	* @method randomize
	* @param {Array} arr Array der skal benyttes af metoden 
	* @return {Array}
	*/
	_r.randomize = function(arr){
	    var i = arr.length, j, tempi, tempj;
	    if (i === 0) return arr;
	    while (--i) {
	        j = Math.floor(Math.random() * (i + 1));
	        tempi = arr[i];
	        tempj = arr[j];
	        arr[i] = tempj;
	        arr[j] = tempi;
	    }
	    return arr;
	}
	/**
	* Fortsøger at lave et object om til en array. Det er værdierne der lægges ind i arrayen, ikke keysne.
	* @method fromObject
	* @param {Object} obj 
	* @return {Array} Array med alle objektets values
	*/
	_r.fromObject = function (obj) {
	    var key, resultArr = [];
	    for (key in obj) {
	        resultArr.push(obj[key]);
	    }
	    return resultArr;
	}

    /**
   * Funktionalitet der forsøger at clone arrayen. Er egentlig bare en wrapper for .slice(0) 
   * @method clone
   * @param {arr} obj der skal benyttes af metoden 
   *@returns {arr} index for placering eller -1 hvis elementet ikke findes
   */
	_r.clone = function (arr) {
	    return arr.slice(0);
	}
	/**
	* Extender Array objektet med følgende funktioner, hvis de ikke allerede findes:
	* contains, removeDuplicates, randomize, indexOf, clone
	* VÆR OPMÆRKSOM PÅ AT DENNE METODE ÆNDRER ARRAY METODEN
	* Det er altså ikke kun dit script, men alle andre script der benytter Array der ændres. Det betragtes som dårlig stil i javascript, men kan nu være ganske praktisk.
	* @method extendArray
	*/
	_r.extendArray = function () {
	    var em = [];

	    if (typeof Array["randomize"] === "undefined") {
	        Array.prototype.randomize = function () {
	            return Arrays.randomize(this);
	        }
	        em.push("randomize");
	    }

	    if (typeof Array["removeDuplicates"] === "undefined") {
	        Array.prototype.removeDuplicates = function (pattern) {
	            return Arrays.removeDuplicates(this);
	        }
	        em.push("removeDuplicates");
	    }

	    if (typeof Array["contains"] === "undefined") {
	        Array.prototype.contains = function (obj) {
	            return Arrays.contains(this, obj);
	        }
	        em.push("contains");
	    }

	    if (typeof Array["remove"] === "undefined") {
	        Array.prototype.remove = function (obj, checkForDuplicates) {
	            return Arrays.remove(this, obj, checkForDuplicates);
	        }
	        em.push("remove");
	    }

	    if (typeof Array["indexOf"] === "undefined") {
	        Array.prototype.indexOf = indexOf;
	        em.push("indexOf");
	    }

	    if (typeof Array["remove"] === "undefined") {
	        Array.prototype.remove = function (obj, checkForDuplicates) {
	            return Arrays.remove(this, obj, checkForDuplicates);
	        }
	        em.push("remove");
	    }

	    if (typeof Array["clone"] === "undefined") {
	        Array.prototype.clone = function () {
	            return Arrays.clone(this);
	        }
	        em.push("clone");
	    }

	    if (console) {
	        if (console.info) console.info("Array has been extended with: " + em);
            else if (console.log) console.log("Array has been extended with: " + em);
	    }
	}

	var indexOf = function (elt ) {
	    var len = this.length >>> 0;
	    var from = Number(arguments[1]) || 0;
	    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
	    if (from < 0) from += len;
	    for (; from < len; from++) {
	        if (from in this && this[from] === elt) return from;
	    }
	    return -1;
	};
		
	return _r;
})();


/**
*@namespace dk.marten.utils
*/

/**
* Forskellige funktioner til at bearbejde Objects
* 
* @author Marten Ølgaard
* @created 24/4/2013
* @license MIT
* @copyright Marten Ølgaard
* @class Objects
* @static
* @see <a href="/Javascript/Eksempler/dk/marten/utils/Objects.html">Se unit test af difference</a> 
*/
var Objects = Objects || (function () {

    var _r = new Object();

    /**
	* Funktionalitet der forsøger at clone et object. Cloner kun de simplere typer og ikke referencer til andre objekter, functions e.lign.
    * Desuden er det kun objectets værdier der klones og ikke evtuelle værdier der ligger i prototype hierakiet. Dvs. at hvis objektet er skabt med Object.create kan der optså problemmer!
	* @method clone
	* @param {Object} obj der skal clones
    * @returns {Object} det clonede objekt
	*/
    _r.clone = function (obj) {
        var copy;
        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;
        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (Array.isArray(obj)) {
            return obj.slice(0);
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = _r.clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to clone obj! Its type isn't supported.");
    }

    /**
    * Merger et antal objekter ind i et nyt objekt der returneres. De objekter der merges påvirkes ikke.
    * Hvis flere af objekterne deler properties med samme navn vil det være det sidste objekt i af arrayen hvis værdi der kommer til at gælde.
    * @method combine
    * @param {Array} allObjects Array med objekter der skal samles til et objekt
    * @param {Boolean} doClone Om data skal clones inden de kommes i det nye object
    * @returns {Object} det mergede objekt
    */
    _r.combine = function (allObjects, doClone) {
        var mergedObj = {};
        for (var i = 0; i < allObjects.length; i++) {
            if (allObjects[i] && typeof allObjects[i] === "object" && !Array.isArray(allObjects[i])) {
                for (var attr in allObjects[i]) {
                    if (allObjects[i].hasOwnProperty(attr)) {
                        mergedObj[attr] = (doClone==true) ? _r.clone(allObjects[i][attr]) : allObjects[i][attr];
                    }
                }
            } else {
                if (console) {
                    var m = allObjects[i] + " kan ikke combines";
                    if (console.warn) console.warn(m);
                    else if (console.log) console.log(m);
                }
            }
        }
        return mergedObj;
    }

    /**
    * Finder forskellen mellem to objekter.
    * Kan kun benyttes på relativt simple objekter
    * Er lavet til logbogen (render)
    * @method difference
    * @example var old = [{ id: 1 }, { id: 7 }, { id: 8 }];
	* var ny = [{ id: 2 }, { id: 7 }, { id: 9 }, { id: 19 }, { id: 29 }, { id: 39 }];
	* var dif = Objects.difference(old, ny, "id");
    * @param {Array} oldObjects Array med objekter 
    * @param {Array} newObjects Array med objekter 
    * @param {String} keyName Den key der skal sammenlignes på 
    *@returns {Object} Objekt med en added array og en deleted array
    */
    _r.difference = function (oldObjects, newObjects, keyName) {
        var nyID = 0, oldID = 0;
        var added = [];
        var deleted = [];
        while (oldID < oldObjects.length && nyID < newObjects.length) {
            if (oldObjects[oldID][keyName] == newObjects[nyID][keyName]) {
                previousElement = newObjects[nyID];
                nyID++;
                oldID++;
            } else {
                var pos = findColPos(newObjects, oldObjects[oldID], keyName, nyID);
                if (pos == -1) {
                    deleted.push({
                        element: oldObjects[oldID]
                    });
                    oldID++;
                } else {
                    while (nyID < pos) {
                        added.push({
                            element: newObjects[nyID],
                            previousElement: (nyID > 0) ? newObjects[nyID - 1] : null,
                            nextElement: ((nyID + 1) < newObjects.length) ? newObjects[nyID + 1] : null
                        });
                        nyID++;
                    }
                }
            }
        }

        while (nyID < newObjects.length) {
            added.push({
                element: newObjects[nyID],
                previousElement: (nyID > 0) ? newObjects[nyID - 1] : null,
                nextElement: ((nyID + 1) < newObjects.length) ? newObjects[nyID + 1] : null
            });
            nyID++;
        }

        while (oldID < oldObjects.length) {
            deleted.push({
                element: oldObjects[oldID]
            });
            oldID++;
        }

        return { added: added, deleted: deleted };
    }

    var findColPos = function (col, item, idName, startIndex) {
        for (var i = startIndex; i < col.length; i++) {
            if (col[i][idName] == item[idName]) {
                return i;
            }
        }
        return -1;
    }


    /**
    * Tilføjer Object.Create for browsere der ikke understøtter dette. 
    * This polyfill covers the main use case which is creating a new object for which the prototype has been chosen but doesn't take the second argument into account.
    * @method addNonSupportedObjectCreate
    * @param {Object} obj der skal benyttes af metoden 
    *@returns {int} index for placering eller -1 hvis elementet ikke findes
    * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
    */
    _r.addNonSupportedObjectCreate = function () {
        if (typeof Object.create != 'function') {
            Object.create = (function () {
                var Temp = function () { };
                return function (prototype) {
                    if (arguments.length > 1) {
                        throw Error('Second argument not supported');
                    }
                    if (prototype !== Object(prototype) && prototype !== null) {
                        throw TypeError('Argument must be an object or null');
                    }
                    if (prototype === null) {
                        throw Error('null [[Prototype]] not supported');
                    }
                    Temp.prototype = prototype;
                    var result = new Temp();
                    Temp.prototype = null;
                    return result;
                };

            })();
        }
    }

    /**
    * Tjekker om en række objekter er ens, dvs. har de samme værdier uanset rækkefølgende.
    * Metoden er tyvstjålet
    * 
    * @method isEqual
    * @return {Boolean} true hvis de to objekter indeholder samme værdier - ellers false.
    * @example var old = [{ id: 1 }, { id: 7 }, { id: 8 }];
    * var ny = [{ id: 2 }, { id: 7 }, { id: 9 }, { id: 19 }, { id: 29 }, { id: 39 }];
    * alert( Objects.hasSameValues(old, ny, anotherNew));
    * @see http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
    */
    _r.isEqual = function () {

        var i, l, leftChain, rightChain;

        function compare2Objects(x, y) {
            var p;

            // remember that NaN === NaN returns false
            // and isNaN(undefined) returns true
            if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
                return true;
            }

            // Compare primitives and functions.     
            // Check if both arguments link to the same object.
            // Especially useful on the step where we compare prototypes
            if (x === y) {
                return true;
            }

            // Works in case when functions are created in constructor.
            // Comparing dates is a common scenario. Another built-ins?
            // We can even handle functions passed across iframes
            if ((typeof x === 'function' && typeof y === 'function') ||
               (x instanceof Date && y instanceof Date) ||
               (x instanceof RegExp && y instanceof RegExp) ||
               (x instanceof String && y instanceof String) ||
               (x instanceof Number && y instanceof Number)) {
                return x.toString() === y.toString();
            }

            // At last checking prototypes as good as we can
            if (!(x instanceof Object && y instanceof Object)) {
                return false;
            }

            if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
                return false;
            }

            if (x.constructor !== y.constructor) {
                return false;
            }

            if (x.prototype !== y.prototype) {
                return false;
            }

            // Check for infinitive linking loops
            if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
                return false;
            }

            // Quick checking of one object being a subset of another.
            // todo: cache the structure of arguments[0] for performance
            for (p in y) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                }
                else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }
            }

            for (p in x) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                }
                else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }

                switch (typeof (x[p])) {
                    case 'object':
                    case 'function':

                        leftChain.push(x);
                        rightChain.push(y);

                        if (!compare2Objects(x[p], y[p])) {
                            return false;
                        }

                        leftChain.pop();
                        rightChain.pop();
                        break;

                    default:
                        if (x[p] !== y[p]) {
                            return false;
                        }
                        break;
                }
            }

            return true;
        }

        if (arguments.length < 1) {
            return true; //Die silently? Don't know how to handle such case, please help...
            // throw "Need two or more arguments to compare";
        }

        for (i = 1, l = arguments.length; i < l; i++) {

            leftChain = []; //Todo: this can be cached
            rightChain = [];

            if (!compare2Objects(arguments[0], arguments[i])) {
                return false;
            }
        }

        return true;
    }




    return _r;
})();

/**
*@namespace dk.marten.utils
*/

/**
* Metoder til at trimme, tjekke længder, fjerne whitespace etc. fra strenge
* @class Strings
* @author Marten Ølgaard
* @static
* @see <a href="/Javascript/Eksempler/dk/marten/utils/Strings.html">Se eksempel</a> 
*/
var Strings = Strings || (function () {
    var _r = new Object();

    /**
    *
    *	@method hasText
    *	@param {String} str string to check
    *	@return {Boolean} true/false
    */
    _r.hasText= function (str) {
        var tmp = Strings.removeExtraWhitespace(str,true);
        return !!tmp.length;
    }

    /**
    *
    *	@method removeExtraWhitespace
    *	@param {String} str string to remove whitespace and extra charactes like tabs, linebreaks and carriage returns from
    *	@param removeAllWhitespace:Boolean, optional - defines if ALL whitespace should be removed from the string, default is false
    *	@return String
    */
    _r.removeExtraWhitespace = function (str, removeAllWhitespace) {
        removeAllWhitespace = (removeAllWhitespace != null) ? removeAllWhitespace : false;

        if (str == null) { return ''; }
        var tmp = Strings.trim(str);
        return tmp.replace(/\s+/g, removeAllWhitespace ? '' : ' ');
    }

    /**
    * Trimmer whitespace eller angiven karakter væk fra start og slut i en streng
    *	@method trim
    *	@param {String} str string to trim
    *	@param {String} pattern Karakter der skal trimmes væk fra start og slut. Hvis den er tom eller null fjernes whitespace
    *	@return {String}
    */
    _r.trim = function (str, pattern) {
        if (str == null) return '';
        if (pattern == null) pattern = "\\s";
        return Strings.trimStart(Strings.trimEnd(str, pattern), pattern);
    }

    /**
    * Trimmer whitespace eller angiven karakter væk fra start af en streng.
    *	@method trimStart
    *	@param {String} str string to trim
    *	@param {String} pattern Karakter der skal trimmes væk. Hvis den er tom eller null fjernes whitespace
    *	@return {String}
    */
    _r.trimStart = function (str, pattern) {
        if (str == null) return '';
        if (pattern == null) pattern = "\\s";
        var reg = new RegExp("^" + pattern+"+", "g");
        return str.replace(reg, '');
    }

    /**
    * Trimmer whitespace eller angiven karakter væk fra slutningen af en streng
    *	@method trimEnd
    *	@param {String} str string to trim
    *	@param {String} pattern Karakter der skal trimmes væk. Hvis den er tom eller null fjernes whitespace
    *	@return {String}
    */
    _r.trimEnd = function (str, pattern) {
        if (str == null) return '';
        if (pattern == null) pattern = "\\s";
        var reg = new RegExp( pattern + "+$", "g");
        return str.replace(reg, '');
    }

    /**
    *
    *	@method contains 
    *	@param {String} str string to search
    *	@param {String} strContain string to find
    *	@return {Boolean} true/false
    */
    _r.contains = function (str, strContain) {
        if (str == null) { return false; }
        return str.indexOf(strContain) != -1;
    }

    /**
    * Laver strengens første bogstav med stort
    * Bruges til tekster
	*	@method capitaliseFirstSentenceLetter
	*	@param {string} string 
	*	@return String
	*/
    _r.capitaliseFirstSentenceLetter = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
    * Laver teskten om så alle ord starter med stort, som f.eks. ved de fleste navne
    * Bruges til tekster
     *	@method capitaliseFirstWordLetter
     *	@param {string} string 
     *	@return String
     */
    _r.capitaliseFirstWordLetter = function (str) {
        var words = str.split(' ');
        for (var i = 0, l = words.length; i < l; i++) {
            words[i] = Strings.capitaliseFirstSentenceLetter(word[i]);
        }
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
    * Extender string med følgende funktioner trim, trimStart, trimEnd hvis disse ikke allerede findes
    * VÆR OPMÆRKSOM PÅ AT DENNE METODE ÆNDRER STRING METODEN
    * Det er altså ikke kun dit script, men alle andre script der benytter String der ændres. Det betragtes som dårlig stil i javascript, men kan nu være ganske praktisk.
    * @method extendString
    */
    _r.extendString = function () {
        var em = [];
        //Overrider trim metoden uanset om den allerede findes med klassens udvidede trim metode, da denne metode udvider eksisterende trim
        String.prototype.trim = function (pattern) {
            return Strings.trim(this, pattern);
        }
        em.push("trim");
        if (typeof String["trimEnd"] === "undefined") {
            String.prototype.trimEnd = function (pattern) {
                return Strings.trimEnd(this, pattern);
            }
            em.push("trimEnd");
        }
        if (typeof String["trimStart"] === "undefined") {
            String.prototype.trimStart = function (pattern) {
                return Strings.trimStart(this, pattern);
            }
            em.push("trimStart");
        }

        if (console) {
            if (console.info) console.info("String er udvidet med " + em);
            else if (console.log) console.log("String er udvidet med " + em);
        }
    }

    return _r;
})();

/**
*@namespace dk.marten.xml
*/

/**
* Objekt til at arbejde med xml og ikke mindst html 
* Benyttes bl.a. i XmlUtil, der igen benyttes i HtmlInColumns
* 
* @author Marten �gaard
* @created 23/7/2013
* @license MIT
* @copyright marten.dk
* @class XmlNode
* @using Strings
* @static
*/
var XmlNode = XmlNode || (function () {

    var _r = {};


    /**
    * Nodes navn, f.eks. h1 i et h1 tag
    * @property {String} name
    */
    _r.name = "";

    /**
    * Alle tag-ets attributes samlet i en tekststreng
    * @property {String} attributes
    *@todo Burde splittes op som selvst�ndige attributter og v�re en array, men er det ikke da der ikke er behov for det i HtmlInColumns
    */
    _r.attributes = "";
    /**
    * 
    * @property {Number} length
    */
    _r.length = 0;



    _r._nodeValue = "";
    /**
    * V�rdien af noden / indholdet af tagget
    * @property {String} nodeValue
    */
    Object.defineProperty(_r, "nodeValue", {
        get: function () {
            return this._nodeValue;
        },
        set: function (value) {
            while (value.indexOf("  ") != -1) {
                value = value.replace(/\s\s+/g, " ");
            }
            this._nodeValue = Strings.trim(value);
            this.length = this._nodeValue.length;
        }
    });


    /**
    * Returnerer noden som html
    * @method getAsHtml
    * @param {String} defaultNodeName Det tag der benyttes hvis noden ikke har et defineret tag. Er bare en tom streng hvis parameteren ikke er defineret
    * @return {String} 
    */
    _r.getAsHtml = function (defaultNodeName, preventEmptyTags) {            
        if (defaultNodeName == null) defaultNodeName = "";
        if (preventEmptyTags == null) preventEmptyTags = false;
        var html = "";
        if (preventEmptyTags && this.attributes == "" && this.nodeValue.replace(/\s/g, "") == "" && !(this.name == "br" || this.name == "img")) return html;
        if (defaultNodeName == "" && this.name == "") html = this.nodeValue;
        else if (this.name == "br" || this.name == "img") {
            html = "<" + this.name + " " + this.attributes + "/>";            
        }
        else {
            html = "<" + ((this.name == "") ? defaultNodeName : this.name) + " " + this.attributes + ">" + this.nodeValue + "</" + ((this.name == "") ? defaultNodeName : this.name) + ">";
        }
        return html;
    };


    /**
    * Cloner node
    * @property {XmlNode} clone
    */
    _r.clone = function () {
        var xn = Object.create(XmlNode);
        xn.attributes = this.attributes;
        xn.name = this.name;
        xn.nodeValue = this.nodeValue;

        return xn;
    };

    return _r;
})();
/// <reference path="../development/Logger.js" />
/**
*@namespace dk.marten.xml
*/


/**
* Klasse der splitter xml/html op i dele
* 
* @author Marten Ølgaard
* @created 9/9/2013
* @license MIT
* @copyright 
* @todo 
* @class XmlUtil
* @see <a href="/Javascript/Eksempler/dk/marten/xml/XmlUtil_UnitTest.html" target="_blank">Unit test af klassen</a>
* @static
*/
var XmlUtil = XmlUtil || (function () {

    var _r = new Object();//Extend function

    /**
    * Lægger indholdet af en nodearray ind i nodens nodeValue
    * @method concatXmlNodeArray
    * @param node {XmlNode}  Der indeholder XmlNode-er
    * @param nodeArray {Array}  Der indeholder XmlNode-er
     * @return {String} 
    */
    _r.concatXmlNodeArray = function (node,nodeArray) {
        node.nodeValue = _r.concatXmlNodeArrayHtml(nodeArray);
        return node;
    }


    /**
    * Lægger alt html i nodeArray-en sammen til en html streng
    * @method concatXmlNodeArrayHtml
    * @param nodeArray {Array}  Der indeholder XmlNode-er
     * @return {String} 
    */
    _r.concatXmlNodeArrayHtml = function (nodeArray, defaultNodeName, maxIndex) {
        maxIndex = (maxIndex!= undefined) ? maxIndex : nodeArray.length-1;
        var html = "";
        for (var i = 0; i <= maxIndex; i++) {
            //if (i == 1) {
            //    Logger.log(nodeArray[i]);
            //    Logger.log(nodeArray[i].getAsHtml(defaultNodeName, true));
            //}
            html += nodeArray[i].getAsHtml(defaultNodeName,true);
        }
        return html;
    }


    /**
    * Splitter html op i tag-klumper i samme niveau
    * Måske skal den flyttes over i egen klasse
    * @method splitXml
    * @param altHtml {String} Den html der skal splittes op    
    * @return {Array} Array Der indeholder XmlNode-er
    */
    _r.splitXml = function (altHtml) {
        var nn, na, i;

        var htmlParts = _r.formatHtml(altHtml).split("<");
        //Logger.log(htmlParts);
        var htmlDoc = new Array();

        var curLevel = 0;

        var name = null;
        var currentNode = Object.create(XmlNode);

        for (i = 0, l = htmlParts.length; i < l; i++) {
            if (htmlParts[i].replace(/ /g, "") == "") {
                //Tom - intet skal gøres
            }
            else if (htmlParts[i].indexOf("/") == 0) {
                //Det er aflsutningen af et tag
                curLevel--;
                //top level
                if (curLevel == 0) {
                    currentNode.nodeValue = currentNode.nodeValue.replace(/^\s/g, '').replace(/\s+$/g, '');
                    htmlDoc.push(currentNode);
                    currentNode = Object.create(XmlNode);
                    currentNode.nodeValue += htmlParts[i].substring(htmlParts[i].indexOf(">") + 1);
                } else {
                    currentNode.nodeValue += " <" + htmlParts[i];
                }
            }
            else if (htmlParts[i].indexOf("/>") != -1) {
                //Standalonetag, fx <br/> - skal bare tilføjes det aktuelle indhold
                
                if (curLevel == 0) {
                    nn = htmlParts[i].substring(0, htmlParts[i].indexOf("/>"));
                    if (nn.indexOf(" ") != -1) {
                        currentNode.attributes = nn.substr(nn.indexOf(" "));
                        nn = nn.substr(0, nn.indexOf(" "));
                    }
                    currentNode.name = nn.toLowerCase();

                    htmlDoc.push(currentNode);
                    currentNode = Object.create(XmlNode);
                    htmlParts[i] = htmlParts[i].substring(htmlParts[i].indexOf("/>") + 2);
                    i--;
                } else {
                    currentNode.nodeValue += " <" + htmlParts[i];
                }
            }
            else if (htmlParts[i].indexOf(">") == -1) {
                //Ren tekst
                currentNode.nodeValue += htmlParts[i];
                currentNode.nodeValue = currentNode.nodeValue.replace(/^\s/g, '').replace(/\s+$/g, '');
                htmlDoc.push(currentNode);
                currentNode = Object.create(XmlNode);
            } else {
                if (curLevel == 0) {
                    //Start på en node
                    nn = htmlParts[i].substr(0, htmlParts[i].indexOf(">"));
                    na = "";
                    if (nn.indexOf(" ") != -1) {
                        currentNode.attributes = nn.substr(nn.indexOf(" "));
                        nn = nn.substr(0, nn.indexOf(" "));
                    }
                    currentNode.name = nn.toLowerCase();
                    currentNode.nodeValue += htmlParts[i].substring(htmlParts[i].indexOf(">") + 1);

                } else {
                    currentNode.nodeValue += " <" + htmlParts[i];
                }
                curLevel++;
            }
        }

        if (currentNode.nodeValue.replace(/ /g, "") != "") {
            currentNode.nodeValue = currentNode.nodeValue.replace(/^\s/g, '').replace(/\s+$/g, '');
            htmlDoc.push(currentNode);
        }


        return htmlDoc;
    }

    /**
     * Renser html så html-en bliver xhtml, samt fjerner tabs og newlines og dobbelt whitespaces
     * @method formatHtml
     * @param altHtml {String} Den html der skal renses
     * @return {String}
     */
    _r.formatHtml = function (altHtml) {
        var nonXhtmlTags = ["img([^>]*[^/])", "br[^>/]*", "hr[^>/]*"];

        for (var i = 0; i < nonXhtmlTags.length; i++) {
            var regExp = new RegExp("<" + nonXhtmlTags[i] + ">", "gi");
            var result = altHtml.match(regExp);
            if (result != null) {
                for (var j = 0; j < result.length; j++) {
                    altHtml = altHtml.replace(result[j], result[j].replace(">", "/>"));
                }
            }
        }

        altHtml = altHtml.replace(/\n/g, " ").replace(/\t/g, " ");
        //while (altHtml.indexOf(/\s\s/) != -1)
            altHtml = altHtml.replace(/\s\s+/g, " ");
        //Logger.log(altHtml);
        return altHtml;
    }



    return _r;
})();


/**
*@namespace dk.marten.ui
*/

/**
* Genereates a UUID
* 
* @author Marten Ølgaard
* @created 12/6/2013
* @license MIT
* @copyright Marten Ølgaard 2013
* @class UUID
* @static
*/
var UUID = UUID || (function () {

    var _r = new Object();

    var used = {};

    /**
    * The dividet in the uuid
    * @property {string} divider
    */
    _r.divider = "-";

    /**
    * Creates and return an UUID
    * @method get
    * @param {Object} divider Set an divider. Optional.
    */
    _r.get = function (divider) {
        if (divider!= null) _r.divider = divider;
        var id;
        for (; used[id = randomHex(8) + _r.divider + randomHex(4) + _r.divider + randomHex(4) + _r.divider + randomHex(12)];) { }
        used[id] = 1;
        return id;
    };

    function randomHex(len) {
        return (new Array(len).join(0)
                + parseInt(Math.pow(2, len * 4) * Math.random()
                          ).toString(16)).slice(-len);
    }

    return _r;
}());

/**
*@namespace dk.marten.events
*/

/**
* Class to add event functionality to other calsses
* Are usually used as a "super" class
* @class Event
* @constructor
* @author Marten Ølgaard
* @see <a href="/Javascript/Eksempler/dk/marten/events/Event.html" target="_blank">Eksempel med brug Event klassen</a>
*/
(function () {

    var Event = function () {
        /**
        * Objekt med de metoder der har registreret sig
        * @property {Object} _listeners
        * @private
        */
        this._listeners = {};

        /**
        * Objekt med de metoder der har registreret sig
        * @property {Object} _oneListeners
        * @private
        */
        this._oneListeners = {};
        /**
        * Navn der bruges når der smides en fejl
        * @property {Object} _name
        * @private
        */
        this._name = "Event";
    }

    /**
    * Adds an event
    * @method on
    * @param {String} type Name of the event
    * @param {Function} listener function that will be called when the event fires
    */
    Event.prototype.on = function (type, listener) {
        if (type == null || listener == null) {
            throw (new Error("type eller listener is null in " + this._name));
        }
        if (typeof this._listeners[type] === "undefined") {
            this._listeners[type] = [];
        }

        var exists = false;
        for (var i = 0, len = this._listeners[type].length; i < len; i++) {
            if (this._listeners[type][i] === listener) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            this._listeners[type].push(listener);
        }
    }

    /**
    * Adds an event that will be fired only once
    * @method one
    * @param {String} type Name of the event
    * @param {Function} listener function that will be called when the event fires
    */
    Event.prototype.one = function (type, listener) {
        if (type == null || listener == null) {
            throw (new Error("type eller listener er null i " + this._name));
        }
        if (typeof this._listeners[type] === "undefined") {
            this._listeners[type] = [];
        }
        if (typeof this._oneListeners[type] === "undefined") {
            this._oneListeners[type] = [];
        }

        var exists = false;
        for (var i = 0, len = this._listeners[type].length; i < len; i++) {
            if (this._listeners[type][i] === listener) {
                exists = true;
                break;
            }
        }
        console.log(this._oneListeners[type]);
        if (!exists) {
            this._listeners[type].push(listener);
            this._oneListeners[type].push(listener);
        }
    }

    /**
    * Fires an event
    * @method fire
    * @param {Object|String} event Object with data about the event that are going to be fired
    * The event type can be as an string or in an object
    * @example this.fire({ type: "foo" });
    * this.fire("foo");//shortcut
    * this.fire({ type: "foo", answer:"42" });//custom data i event
    */
    Event.prototype.fire = function (event) {
        if (typeof event == "string") {
            event = { type: event, target: this };
        }
        if (!event.target) {
            event.target = this;
        }
        if (!event.type) {
            throw new Error("Event object missing 'type' property.");
        }

        if (this._listeners[event.type] instanceof Array) {
            var listeners = this._listeners[event.type];
            for (var i = 0, len = listeners.length; i < len; i++) {
                var listener =listeners[i]
                listener.call(this, event);

                if (typeof this._oneListeners[event.type] !== "undefined") {
                    var exists = false;
                    for (var j = 0, m = this._oneListeners[event.type].length; j < m; j++) {
                        if (this._oneListeners[event.type][j] === listener) {
                            exists = true;
                            break;
                        }
                    }
                    if (exists) this.off(event.type, listener);
                }
            }
        }
    }

    /**
    * Removes an event from the list
    * @method off
    * @param {String} type Name of the event
    * @param {Function} listener The function that is associated with the name. If no function is added all events with the choosen name are removed
    */
    Event.prototype.off = function (type, listener) {
        if (this._listeners[type] instanceof Array) {
            if (!listener) this._listeners[type] = [];
            var listeners = this._listeners[type];
            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        } 
    }

    window.Event = Event;
}());
/**
*@namespace dk.marten.ui
*/
/**
* Takes the text in the container div and put it into columns
* 
* @author Marten Ølgaard
* @created 12/6/2013
* @license MIT
* @class HtmlInColumns
* @extends dk.marten.events.Event
* @using jQuery
* @using dk.marten.util.Arrays
* @using dk.marten.util.Objects
* @using dk.marten.ui.UUID
* @using dk.marten.xml.XmlNode
* @using dk.marten.xml.XmlUtil
* @see <a href="/Javascript/Eksempler/dk/marten/ui/HtmlInColumns.html" target="_blank">Eksempel</a>	 
* @example var content = Object.create(HtmlInColumns);
* content.init();
* content.render();
* @static
*/
var HtmlInColumns = HtmlInColumns || (function () {

    "use strict"
    var usingObj = ['jQuery', 'UUID', 'XmlNode', 'XmlUtil', 'Arrays', 'Objects', 'Event', 'Strings'];
    for (var i = 0; i < usingObj.length; i++) {
        if (typeof window[usingObj[i]] === "undefined") throw (new Error("HtmlInColumns relies on '" + usingObj[i] + "' which cant be found. Please add it to the html (before HtmlInColumns)."));
    }

    var _r = new Event();//Extend function

    _r.options = {};

    _r.defaults = {
        /**
        * The dom-id of the container div. Default is #Container
        * @property {string} options.containerID
        */
        containerID: "#Container",
        /**
        * CSS class for the column divs. Default is column
        * @property {string} options.columnClass
        */
        columnClass: "column",
        /**
        * Should the script protect against orphans
        * Hvis denne er sat til true, vil tekst kunne blive højere end maxheight, dvs højere end containerens højde. 
        * Default er true
        * @property {Boolean} options.protectAgainstOrphans
        */
        protectAgainstOrphans: true
    }

    /**
    * Tags that cant be in the end of a column
    * @property {Array} nonLastTag
    */
    _r.nonLastTag = ["h1", "h2", "h3", "h4", "h5", "h6"];

    /**
    * Tags that cant be divided over two columns
    * @property {Array} nonSplitTag
    */
    _r.nonSplitTag = ["li", "tr", "div"];

    /**
    * The number of char that defines a orphan
    * @property {int} orphansLength
    */
    _r.orphansLength = 60;

    /**
   * Name of the event that fires when all the columns is rendered
   * @property {Number} RENDERED
   */
    Object.defineProperty(_r, "RENDERED", {
        value: "onRendered",
        writeable: false
    });

    /**
    * Bredden af spalterne
    * Hvis den ikke er defineret findes den automatisk - gad vide hvorfor man kan definere den!
    * @property {Number} columnWidth
    * @private
    */
    _r.columnWidth = NaN;
    /**
    * Margin imellem spalterne
    * Hvis den ikke er defineret findes den automatisk - gad vide hvorfor man kan definere den!
    * @property {Number} columnMargin
    * @private
    */
    _r.columnMargin = NaN;

    /**
    * Bruges på ARK sitet, men jeg har glemt præcist hvorfor - det bliver brugt til at sætte en bund margin
    * @property {Number} extraHeightMargin
    * @private
    */
    _r.extraHeightMargin = 0;

    /**
    * UUID der bruges til at lave spalte id. Sættes før alle spalternes dom id, f.eks. 42b5e564_1df2_12ac_130fe29d9645_.
    * @property {String} uuid
    */
    _r.uuid;

    /**
    * ID-et for det aktuelle spalte
    * @property {String} columnID
    * @private
    */
    _r.columnID;

    /**
    * Counter for antallet af spalter. Bruges til at lave spalte id
    * @property {Number} columnCount
    * @private
    */
    _r.columnCount = 1;

    /**
    * 
    * @property {Number} columnMaxHeight
    * @private
    */
    _r.columnMaxHeight = 0;

    /**
    * 
    * @property {Number} maxHeight
    * @private
    */
    _r.maxHeight = 0;

    /**
    * Contains the raw html
    * @property {String} allHtml
    */
    _r.allHtml;

    /**
    * Antallet af anslag som der typisk skal benyttes i en spalte.
    * Benyttes for at give bedre performance
    * @property {Number} averageLetterCount
    * @private
    */
    _r.averageLetterCount;

    /**
    *Antallet af anslag som der er brugt til alle spalter.
    * Benyttes for at give bedre performance
    * @property {Number} columnLetterCount
    * @private
    */
    _r.columnLetterCount;

    /**
    * Angiver om spalterne er ved at blive renderet
    * @property {Boolean} isRunning
    * @private
    */
    _r.isRunning = false;

    /**
    * 
    * @property {Number} abortRenderAndReRender
    * @private
    */
    _r.abortRenderAndReRender = false;

    /**
   * 
   * @property {Number} urenderedeHtmlNoder
   * @private
   */
    _r.urenderedeHtmlNoder;

    /**
    * Bruges til at angive ved hvilken værdi en ol skal starte hvis den kører over to spalter
    * @property {int} olLiCount
    * @private
    */
    _r.olLiCount = 0;

    /**
    * Højde af vinduet ved sidste rendering
    * @property {int} lastRenderHeight
    * @private
    */
    _r.lastRenderHeight = 0


    _r.loadCount;

    _r.allImages = [];


    /**
    * Initialise the class
    * @method init
    * @param {Object} options Settings that will be merged into the default settings
    */
    _r.init = function (options) {
        this.uuid = UUID.get("_") + "_";
        this.options = Objects.combine([this.defaults, options]);
        this.allHtml = $(this.options.containerID).html();//Hent html fra siden
        $(this.options.containerID).html("");//Nulstil containeren med det hentede html
        $(this.options.containerID).show();//Vis containeren

        $(window).resize(this.onResize.bind(this));
    }

    /**
    * Is called on resize. Will try to re render.
    * @method onResize
    */
    _r.onResize = function () {
        if (Math.abs(this.lastRenderHeight - window.innerHeight) > 3) {
            this.render();
        }
    }

    /**
    * Renders the content into columns
    * @method render
    */
    _r.render = function () {
        if (this.allHtml == null) throw new Error("No html. Have you called init?");

        if (this.isRunning) {
            this.abortRenderAndReRender = true;
            return;
        }

        this.isRunning = true;
        this.lastRenderHeight = window.innerHeight;

        //Logger.startStopwatch();

        //Nulstil variabler
        this.columnMaxHeight = 0;
        this.averageLetterCount = 0;
        this.columnLetterCount = 0;

        //Nulstil indhold
        $(this.options.containerID).html("");
        this.maxHeight = $(this.options.containerID).height() - this.extraHeightMargin;

        this.columnCount = 0;

        //Logger.log(this.allHtml);

        this.urenderedeHtmlNoder = XmlUtil.splitXml(this.allHtml);

        //Logger.log(this.urenderedeHtmlNoder);

        this.renderNextColumn();

        $(this.options.containerID + " ." + _r.defaults.columnClass).height(this.columnMaxHeight);

    }
    /**
    * Restarts the rendering
    * @method reRender
    */
    _r.reRender = function () {
        this.abortRenderAndReRender = false;
        this.isRunning = false;
        this.render();
    }
    /**
    * Renderer en column, gør kollonen synlig, holder en kort pause, kalder renderNextColumn igen og når der ikke er mere indhold affyres et RENDERED event
    * @method renderNextColumns
    * @private
    */
    _r.renderNextColumn = function () {
        if (this.abortRenderAndReRender) {
            setTimeout(this.reRender.bind(this), 50);
            return;
        }

        var resultNoder, i;

        this.columnID = this.createNewColumn(this.columnCount);

        //Laver et gæt på hvor mange tags man skal starte med at test højde for - burde give bedre perfomance
        var averageLetterCount = (this.columnCount == 0) ? 0 : this.columnLetterCount / (this.columnCount);
        var nextNumbersOfTags = 0;
        var tagLetterCount = 0;
        while (tagLetterCount < averageLetterCount && this.urenderedeHtmlNoder.length > nextNumbersOfTags) {
            tagLetterCount += this.urenderedeHtmlNoder[nextNumbersOfTags].length;
            nextNumbersOfTags++;
        }

        //lav indhold til den næste spalte
        resultNoder = this.handleOLTags(this.handleNonLastTags(this.findColumnContent(this.urenderedeHtmlNoder, nextNumbersOfTags, "p")));

        //Der er ikke tilføjet nogle noder - vil resultere i uendeligt loop
        if (resultNoder.added.length == 0 && resultNoder.remaining.length > 0) {
            resultNoder.added.push(resultNoder.remaining.shift());
        }

        this.urenderedeHtmlNoder = resultNoder.remaining;
        
        //Indsætter html i aktuel spalte
        this.finishColumn(XmlUtil.concatXmlNodeArrayHtml(resultNoder.added));
        

        for (var i = 0; i < resultNoder.added.length; i++) {
            this.columnLetterCount += resultNoder.added[i].length;
        }

        if (this.urenderedeHtmlNoder.length > 0) {
            setTimeout(this.renderNextColumn.bind(this), 0);//put job back in the queue to show the newly added column
        }
        else {
            this.renderDone();
        }
    }
    
    /**
    * 
    * @method renderDone
    * @private
    */
    _r.renderDone = function () {
        //Logger.logStopwatch("end");
        this.preLoadImages();
        this.isRunning = false;
        this.abortRenderAndReRender = false;
        this.fire({ type: this.RENDERED, width: $(this.options.containerID).width() });
    }


    /**
    * Håndterer hvis et ol tag spænder over to kollonner
    * @method handleOLTags
    * @param {Object} resultNoder 
    * @return {Object}  
    * @todo Hvad hvis ol-en spænder over mere end 2 kollonner?
    * @private
    */
    _r.handleOLTags = function (resultNoder) {
        var l = resultNoder.added.length;
        if (l > 0 && resultNoder.added[l - 1].name == "ol") {
            var liNoder = XmlUtil.splitXml(resultNoder.added[l - 1].nodeValue);
            var i = liNoder.length - 1;
            var count = 1;

            while (liNoder[i].name == "li" && i > 0) {
                i--;
                count++;
            }

            this.olLiCount = count + 1;
        }

        if (this.olLiCount != 0 && resultNoder.remaining.length > 0 && resultNoder.remaining[0].name == "ol") {
            resultNoder.remaining[0].attributes += " start=\"" + this.olLiCount + "\" ";
            this.olLiCount = 0;
        }

        return resultNoder;
    }

    /**
    * Tjekker om det sidste element er pålisten over elementer der ikke må stå til sidst, f.kes. h1, h2 osv.
    * @method handleNonLastTags
    * @param {Object} resultNoder 
    * @return {Object}  
    * @private
    */
    _r.handleNonLastTags = function (resultNoder) {
        while (resultNoder.added.length > 0 && this.nonLastTag.indexOf(resultNoder.added[resultNoder.added.length - 1].name) != -1) {
            resultNoder.remaining.unshift(resultNoder.added.pop());
        }
        return resultNoder;
    }



    /**
    * Flytter horeunger fra den ene spalte til den anden
    * @method handleOrphans
    * @param {Object} resultNoder 
    * @return {Object}  
    * @private
    */
    _r.handleOrphans = function (resultNoder) {
        if (this.options.protectAgainstOrphans) {
            //Horeunge
            if (resultNoder.remaining.length < this.orphansLength) {
                resultNoder.added += " " + resultNoder.remaining;
                resultNoder.remaining = "";
            }
            //Fransk horeunge
            if (resultNoder.added.length < this.orphansLength) {
                resultNoder.remaining = resultNoder.added + " " + resultNoder.remaining;
                resultNoder.added = "";
            }
        }

        return resultNoder;
    }

    /**
    * Finder det indhold der er plads til i hver enkelt spalte
    * @method findColumnContent
    * @param {Array} bruttoNodeList De noder der er tilbage og endnu ikke sat ind i en kollonne
    * @param {int} testForIndex Det index i remainingNodes array som man skal starte med at teste for. Forbedrer performance
    * @param {String} defaultNodeName Navn for noder der ikke er i et tag
    * @param {string} existingHtml Html der allerede er sat ind i spalten og som der er plads til  - benyttes ved nestede tags, f.eks. ol-li
    * @param {string} nodeStart Start htmltags som det nye indhold skal være inden i - benyttes ved nestede tags, f.eks. ol-li
    * @param {string} nodeSlut Slut htmltags som det nye indhold skal være inden i - benyttes ved nestede tags, f.eks. ol-li
    * @return {Object} Objekt med to værdier 'added' som er de noder der er tilføjet til den næste kolonne og 'remaining' der er de noder der ikke var plads til.
    * @private
    */
    _r.findColumnContent = function (bruttoNodeList, testForIndex, defaultNodeName, existingHtml, nodeStart, nodeSlut) {
        if (defaultNodeName == null) defaultNodeName = "";
        if (nodeStart == null) nodeStart = "";
        if (nodeSlut == null) nodeSlut = "";
        if (existingHtml == null) existingHtml = "";
        if (!testForIndex || testForIndex < 0) testForIndex = 0;
        if (testForIndex > (bruttoNodeList.length - 1)) testForIndex = (bruttoNodeList.length - 1);
        var direction, previousDirection, testHtml, resultNoder;

        previousDirection = direction = 0;

        //Først splittes der på hele noder
        while (bruttoNodeList.length > testForIndex && testForIndex >= 0 && (direction == previousDirection || previousDirection == 0)) {
            previousDirection = direction;
            testHtml = XmlUtil.concatXmlNodeArrayHtml(bruttoNodeList, defaultNodeName, testForIndex);
            direction = this.testHeight(existingHtml + nodeStart + testHtml + nodeSlut);
            testForIndex += direction;
        }

        //Hvis testForIndex bliver mindre end -1 skal det lige nulstilles
        if (testForIndex < -1) testForIndex = -1;

        //Hvis spalten fra start af har været for stor skal sidste tag også fjernes
        if (direction == 1 && bruttoNodeList.length != testForIndex) testForIndex--;

        var result = {
            added: bruttoNodeList.slice(0, testForIndex + 1),
            remaining: bruttoNodeList.slice(testForIndex + 1)
        };

        //Forsøg at splitte den næste node op, enten via undernoder eller via ren tekst
        if (result.remaining.length > 0) {
            //Test om der er subnoder i næste node, som evt. kan plittes op
            var node = result.remaining[0];
            var addNode = node.clone();
            var subNodes = XmlUtil.splitXml(node.nodeValue);

            if (this.nonSplitTag.indexOf(node.name) == -1) {
                var okHtml = XmlUtil.concatXmlNodeArrayHtml(result.added);

                if (subNodes.length == 1 && subNodes[0].name == "") {
                    //Der er kun ren tekst tilbage
                    addNode = node.clone();
                    var splitTekst = this.findTextContent(
                        subNodes[0],
                        existingHtml + okHtml,
                        nodeStart + "<" + node.name + " " + node.attributes + ">",
                        "</" + node.name + ">" + nodeSlut);

                    if (Strings.hasText(splitTekst.added)) {
                        addNode.nodeValue = splitTekst.added;
                        result.added.push(addNode);
                        result.remaining[0].nodeValue = splitTekst.remaining;
                    }
                } else {
                    //Det sidste tag kan splittes op i undernoder
                    resultNoder = this.findColumnContent(
                        subNodes,
                        0,
                        "",
                        existingHtml + okHtml,
                        nodeStart + "<" + node.name + " " + node.attributes + ">",
                        "</" + node.name + ">" + nodeSlut
                        );

                    if (resultNoder.added.length > 0) {
                        addNode.nodeValue = XmlUtil.concatXmlNodeArrayHtml(resultNoder.added);
                        result.added.push(addNode);
                        result.remaining[0].nodeValue = XmlUtil.concatXmlNodeArrayHtml(resultNoder.remaining);
                    }
                }
            }
        }

      

        return result;
    }

    /**
    * Finder ud af hvor meget tekst fra en node der er plads til i den resterende del af spalten
    * Derudover tjekkes der også for horeunger og franske horeunger
    * @method findTextContent
    * @private
    * @param {XmlNode} node Array der skal benyttes af metoden 
    * @param {String} existingHtml Html der allerede er testet og som der er plads til
    * @param {String} nodeStart Html inden test teksten 
    * @param {String} nodeSlut Html efter test teksten 
    * @returns {Object} {added, remaining} object
    * @private
    */
    _r.findTextContent = function (node, existingHtml, nodeStart, nodeSlut) {
        var direction, previousDirection, testHtml, testForIndex, nodeWords;
        testForIndex = previousDirection = direction = 0;
        testHtml = "";

        nodeWords = node.nodeValue.split(" ");

        //Finder ca. start indexet for forbedret performance
        $("#" + this.columnID).html(existingHtml);
        var exHeight = $("#" + this.columnID).height();

        $("#" + this.columnID).html(nodeStart + node.nodeValue + nodeSlut);
        var nodeHeight = $("#" + this.columnID).height();

        var fraction = (this.maxHeight - exHeight) / nodeHeight;
        if (fraction < 1) {
            testForIndex = Math.floor(nodeWords.length * fraction);
        }

        //Finder ud af hvor meget tekst der er plads til i spalten
        while (nodeWords.length > testForIndex && testForIndex >= 0 && (direction == previousDirection || previousDirection == 0)) {
            previousDirection = direction;
            testHtml = (nodeWords.slice(0, testForIndex)).join(" ");
            direction = this.testHeight(existingHtml + nodeStart + testHtml + nodeSlut);
            testForIndex += direction;
        }
        if (testForIndex < 0) testForIndex = 0;

        //Hvis spalten fra start af har været for stor skal sidste tag også fjernes
        if (direction == 1 && nodeWords.length != testForIndex) testForIndex--;

        var result = {
            added: (nodeWords.slice(0, testForIndex)).join(" "),
            remaining: (nodeWords.slice(testForIndex)).join(" ")
        }

        return this.handleOrphans(result);
    }

    /**
    * Tester om indholdet overskrider højden af spalten
    * @method testHeight
    * @private
    * @param {String} html 
    * @returns {Number} [-1|1] -1 hvis indholdet overskrider spaltens højde og 1 hvis spalten endnu ikke er udfyldt
    * @private
    */
    _r.testHeight = function (html) {
        $("#" + this.columnID).html(html);
        //Logger.log("testHeight: " + $("#" + this.columnID).height() + " - " + this.maxHeight);
        if ($("#" + this.columnID).height() > this.maxHeight) return -1;
        else return 1;
    }

    /**
    * Indsætter html i aktuel kollonne
    * @method finishColumn
    * @param {String} columnHtml 
    * @private
    */
    _r.finishColumn = function (columnHtml) {
        //Fjern start og slut breaks og indsæt html i spalten


        if (isNaN(this.columnWidth)) {
            this.columnWidth = $("#" + this.columnID).width();
        }
        $("#" + this.columnID).html(this.updateImgTag(columnHtml.replace(/^ *<br\/>/g, "").replace(/$<br\/> */g, ""), this.columnWidth, this.columnID));

        //Indsætterevt. div css 
        if (isNaN(this.columnMargin)) {
            this.columnMargin = parseInt($("#" + this.columnID).css("margin-left").replace("px", ""))
                + parseInt($("#" + this.columnID).css("margin-right").replace("px", ""))
                + parseInt($("#" + this.columnID).css("padding-right").replace("px", ""))
                + parseInt($("#" + this.columnID).css("padding-left").replace("px", ""))
                + parseInt($("#" + this.columnID).css("border-right-width").replace("px", ""))
                + parseInt($("#" + this.columnID).css("border-left-width").replace("px", ""));
        }
        
        if (this.columnMaxHeight < $("#" + this.columnID).height()) {
            this.columnMaxHeight = $("#" + this.columnID).height();
            jQuery(this.options.containerID + " div").height(this.columnMaxHeight);
        } else {
            $("#" + this.columnID).height(this.columnMaxHeight);
        }

        this.columnCount++;
        $(this.options.containerID).css({ width: ((this.columnWidth + this.columnMargin) * this.columnCount) });     
    }

    /**
    * Sætter onload tag ind i img
    * @method updateImgTag
    * @private
    */
    _r.updateImgTag = function (html, columnWidth, columnID) {
        var imgRE = new RegExp("<img", "gi");
        var srcRE = new RegExp("\s*src\s*=\s*\"[0-9a-åA-å\./:\?=]*\"", "gi");
        var srcRE2 = new RegExp("\s*src\s*=\s*\"", "gi");

        var parts = html.split(imgRE);

        for(var i = 1;i<parts.length;i++){
            var srcStrs = parts[i].match(srcRE);
            if (srcStrs!=null && srcStrs.length == 1) {
                var srcStr = srcStrs[0];
                var src = srcStr.replace(srcRE2, "").replace("\"", "").replace(/\s+/g, "");
                this.allImages.push({ src: src, columnID: columnID });
            }
            parts[i] = " width=\"" + columnWidth + "\" id=\"pic-" + columnID + "-" + i + "\"" + parts[i];
        }
        return parts.join("<img");
    }


    /**
    * Preloader alle billederne i html-en
    * @method preLoadImages
    * @private
    */
    _r.preLoadImages = function () {
        this.loadCount = this.allImages.length;
        for (var i = 0; i < this.allImages.length; i++) {
            this.allImages[i].img = new Image();
            this.allImages[i].img.onload = this.picLoaded.bind(this);
            this.allImages[i].img.src = this.allImages[i].src;
        }
    }

    /**
    * Kaldes når et billede er loaded og gen renderer hvis en spalte er blevet for høj
    * @method picLoaded
    * @private
    */
    _r.picLoaded = function () {
        var heightThreshold = 50;
        this.loadCount--;
        if (this.loadCount == 0) {
            for (var i = 0; i < this.allImages.length; i++) {
                var h = $("#" + this.allImages[i].columnID).height() - heightThreshold;

                //Logger.log("Column height (" + this.columnMaxHeight + ":" + this.maxHeight + "): " + h);
                if (h > this.columnMaxHeight || h > this.maxHeight) {
                    var html = $("#" + this.allImages[i].columnID).html();
                    //Tjek at der ikke kun er et enkelt img i kolonnen
                    if (html.indexOf("<img") != 0 || html.split(">").length > 2) {
                        this.reRender();
                        break;
                    }
                }
            }
        }
    }

    /**
    * Opreter en ny spalte i dokumentet html og returnerer id for spalten
    * @method createNewColumn
    * @param {String} columnID Overordnet id-komponent for spalterne
    * @return {String} Dom-idet for spalten
    * @private
    */
    _r.createNewColumn = function (columnID) {
        var id = this.uuid + columnID;
        var html = "<div id=\"" + id + "\" class=\"" + this.options.columnClass + "\"></div>";
        $(this.options.containerID).append(html);
        return id;
    }


    
    
    return _r;
})();

