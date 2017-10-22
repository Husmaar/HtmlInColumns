/**
*@namespace dk.marten.events
*/

/**
* Klasse til at lave eventlistenr med
* Kan bl.a. som "superklasse" for andre javascript "klasser"
* @class Event
* @constructor
* @author Marten Ølgaard
* @see <a href="/Javascript/Eksempler/dk/marten/events/Event.html" target="_blank">Eksempel med brug Event klassen</a>
* @todo one implementeringen er alt andet end elegant.
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
    * Tilføjer event der skal lyttes på
    * @method on
    * @param {String} type Type af event der skal lyttes efter
    * @param {Function} listener function der skal kaldes når et event skal affyres
    */
    Event.prototype.on = function (type, listener) {
        if (type == null || listener == null) {
            throw (new Error("type eller listener er null i " + this._name));
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
    * Tilføjer event der skal lyttes på. Dette event fjernes efter det første gang er kaldt
    * @method one
    * @param {String} type Type af event der skal lyttes efter
    * @param {Function} listener function der skal kaldes når et event skal affyres
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
    * Tilføjer event der skal lyttes på
    * @method fire
    * @param {Object|String} event Object med data om hvad der skal affyres
    * Event typen kan enten være i object eller som streng
    * @example this.fire({ type: "foo" });
    * this.fire("foo");//shortcut
    * this.fire({ type: "foo", svaret:"42" });//custom data i event
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
    * Fjerner et event fra listen
    * @method off
    * @param {String} type Type af event der skal lyttes efter
    * @param {Array} listener Funktioner for den pågældende type der ikke længere skal lyttes efter
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