define([
    "dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "esri/kernel",
    "dijit/_WidgetBase",
    "dijit/a11yclick",
    "dijit/_TemplatedMixin",
    "dojo/on",
    "dojo/Deferred",
    // load template    
    "dojo/text!zesri/dijit/templates/HomeButton.html",
    "dojo/i18n!zesri/nls/jsapi",
    "dojo/dom-class",
    "dojo/dom-style"
],
function (
    Evented,
    declare,
    lang,
    has, esriNS,
    _WidgetBase, a11yclick, _TemplatedMixin,
    on,
    Deferred,
    dijitTemplate, i18n,
    domClass, domStyle
) {
    var Widget = declare([_WidgetBase, _TemplatedMixin, Evented], {
        declaredClass: "esri.dijit.HomeButton",
        templateString: dijitTemplate,
        options: {
            theme: "HomeButton",
            map: null,
            extent: null,
            visible: true
        },
        // lifecycle: 1
        constructor: function(options, srcRefNode) {
            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);
            // widget node
            this.domNode = srcRefNode;
            this._i18n = i18n;
            // properties
            this.set("map", defaults.map);
            this.set("theme", defaults.theme);
            this.set("visible", defaults.visible);
            this.set("extent", defaults.extent);
            // listeners
            this.watch("theme", this._updateThemeWatch);
            this.watch("visible", this._visible);
            // classes
            this._css = {
                container: "homeContainer",
                home: "home",
                loading: "loading"
            };
        },
        // bind listener for button to action
        postCreate: function() {
            this.inherited(arguments);
            this.own(
                on(this._homeNode, a11yclick, lang.hitch(this, this.home))
            );
        },
        // start widget. called by user
        startup: function() {
            // map not defined
            if (!this.map) {
                this.destroy();
                console.log('HomeButton::map required');
            }
            // when map is loaded
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function() {
                    this._init();
                }));
            }
        },
        // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
        destroy: function() {
            this.inherited(arguments);
        },
        /* ---------------- */
        /* Public Events */
        /* ---------------- */
        // home
        // load
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
        home: function() {
            var def = new Deferred();
            var defaultExtent = this.get("extent");
            this._showLoading();
            var homeEvt = {
                extent: defaultExtent
            };
            if(defaultExtent){
                this.map.setExtent(defaultExtent).then(lang.hitch(this, function(){
                    this._hideLoading();
                    this.emit("home", homeEvt);
                    def.resolve(homeEvt);
                }), lang.hitch(this, function(error){
                    if(!error){
                        error = new Error("HomeButton::Failed setting extent on map");
                    }
                    homeEvt.error = error;
                    this.emit("home", homeEvt);
                    def.reject(error);
                }));
            }
            else{
                this._hideLoading();
                var error = new Error("HomeButton::no home extent");
                homeEvt.error = error;
                this.emit("home", homeEvt);
                def.reject(error);
            }
            return def.promise;
        },
        show: function(){
            this.set("visible", true);  
        },
        hide: function(){
            this.set("visible", false);
        },
        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _init: function() {
            this._visible();
            if(!this.get("extent")){
                this.set("extent", this.map.extent);   
            }
            this.set("loaded", true);
            this.emit("load", {});
        },
        _showLoading: function(){
            domClass.add(this._homeNode, this._css.loading);
        },
        _hideLoading: function(){
            domClass.remove(this._homeNode, this._css.loading);
        },
        _updateThemeWatch: function(attr, oldVal, newVal) {
            domClass.remove(this.domNode, oldVal);
            domClass.add(this.domNode, newVal);
        },
        _visible: function(){
            if(this.get("visible")){
                domStyle.set(this.domNode, 'display', 'block');
            }
            else{
                domStyle.set(this.domNode, 'display', 'none');
            }
        }
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.HomeButton", Widget, esriNS);
    }
    return Widget;
});