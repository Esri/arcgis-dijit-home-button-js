define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dojo/on",
    // load template
    "dojo/text!./templates/homeButton.html",
    "dojo/i18n!./nls/homeButton",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-style"
],
function (
    declare,
    lang,
    _WidgetBase, _OnDijitClickMixin, _TemplatedMixin,
    on,
    dijitTemplate, i18n,
    dom, domClass, domStyle
) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin], {
        declaredClass: "modules.homeButton",
        templateString: dijitTemplate,
        options: {
            theme: "homeButton",
            map: null,
            extent: null,
            visible: true
        },
        // lifecycle: 1
        constructor: function(options, srcRefNode) {
            // mix in settings and defaults
            declare.safeMixin(this.options, options);
            // widget node
            this.domNode = srcRefNode;
            this._i18n = i18n;
            // properties
            this.set("map", this.options.map);
            this.set("theme", this.options.theme);
            this.set("visible", this.options.visible);
            this.set("extent", this.options.extent);
            // listeners
            this.watch("theme", this._updateThemeWatch);
            this.watch("visible", this._visible);
            // classes
            this._css = {
                container: "homeCon",
                home: "home",
                loading: "loading"
            };
        },
        // start widget. called by user
        startup: function() {
            // map not defined
            if (!this.map) {
                this.destroy();
                return new Error('map required');
            }
            // map domNode
            this._mapNode = dom.byId(this.map.id);
            // when map is loaded
            if (this.map.loaded) {
                this._init();
            } else {
                on(this.map, "load", lang.hitch(this, function() {
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
        onLoad: function() {
            if(!this.get("extent")){
                this.set("extent", this.map.extent);   
            }
            this.set("loaded", true);
        },
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
        go: function() {
            var defaultExtent = this.get("extent");
            this._showLoading();
            if(defaultExtent){
                return this.map.setExtent(defaultExtent).then(lang.hitch(this, function(){
                    this._hideLoading();
                }));   
            }
            else{
                this._hideLoading();
                return new Error('no home extent');
            }
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
            this.onLoad();
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
});