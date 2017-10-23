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
    * Indeholder alt htmlen. Sættes ved init.
    * @property {String} altHtml
    * @private
    */
    _r.altHtml;

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



    /**
    * Initialise the class
    * @method init
    * @param {Object} options Settings that will be merged into the default settings
    */
    _r.init = function (options) {
        this.uuid = UUID.get("_") + "_";
        this.options = Objects.combine([this.defaults, options]);
        Arrays.extendArray();
        this.altHtml = $(this.options.containerID).html();//Hent html fra siden
        $(this.options.containerID).html("");//Nulstil containeren med det hentede html
        $(this.options.containerID).show();//Vis containeren

        $(window).resize(this.onResize.bind(this));
    }

    /**
    *
    * @method onResize
    */
    _r.onResize = function () {
        if (Math.abs(this.lastRenderHeight - window.innerHeight) > 3) {
            this.render();
        }
    }

    /**
    * Overordnet metode der renderer spalterne
    * @method render
    */
    _r.render = function () {
        if (this.altHtml == null) throw new Error("No html. Have you called init?");

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

        //Logger.log(this.altHtml);

        this.urenderedeHtmlNoder = XmlUtil.splitXml(this.altHtml);

        //Logger.log(this.urenderedeHtmlNoder);

        this.renderNextColumn();

        $(this.options.containerID + " ." + _r.defaults.columnClass).height(this.columnMaxHeight);

    }
    /**
    * Starter forfra med renderingen
    * @method reRender
    * @private
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
            setTimeout(this.renderNextColumn.bind(this), 0);
        }
        else {
            //Logger.logStopwatch("end");
            this.preLoadImages();
            this.isRunning = false;
            this.abortRenderAndReRender = false;
            this.fire({ type: this.RENDERED, width: $(this.options.containerID).width() });
        }
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
    * Finder ud af hvor meget tekst fra en node der er plads til i den rresterende del af spalten
    * Derudover tjekkes der også for horeunger og franske horeunger
    * @method findTextContent
    * @private
    * @param {XmlNode} node Array der skal benyttes af metoden 
    * @param {String} existingHtml Html der allerede er testet og som der er plads til
    * @param {String} nodeStart Html inden test teksten 
    * @param {String} nodeSlut Html efter test teksten 
    *@returns {Object} {added, remaining} object
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

        this.columnMaxHeight = Math.max($("#" + this.columnID).height(), this.columnMaxHeight);

        this.columnCount++;
        $(this.options.containerID).css({ width: ((this.columnWidth + this.columnMargin) * this.columnCount) });
    }
    _r.allImages = [];

    /**
    * Sætter onload tag ind i img
    * @method updateImgTag
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

