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
