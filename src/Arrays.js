/**
*@namespace dk.marten.utils
*/

/**
* Forskellige funktioner til at bearbejde arrays
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
	        if (console.info) console.info("Array er udvidet med " + em);
	        else if (console.log) console.log("Array er udvidet med " + em);
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

