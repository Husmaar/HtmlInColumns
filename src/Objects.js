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
