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

