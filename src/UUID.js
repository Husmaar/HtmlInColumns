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

    _r.divider = "-";

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
