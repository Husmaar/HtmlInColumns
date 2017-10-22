/**
*@namespace dk.marten.xml
*/

/**
* Objekt til at arbejde med xml og ikke mindst html 
* Benyttes bl.a. i XmlUtil, der igen benyttes i HtmlInColumns
* 
* @author Marten Øgaard
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
    *@todo Burde splittes op som selvstændige attributter og være en array, men er det ikke da der ikke er behov for det i HtmlInColumns
    */
    _r.attributes = "";
    /**
    * 
    * @property {Number} length
    */
    _r.length = 0;



    _r._nodeValue = "";
    /**
    * Værdien af noden / indholdet af tagget
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