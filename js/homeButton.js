define([
    "dojo/_base/declare",
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
            // listeners
            this.watch("theme", this._updateThemeWatch);
            this.watch("visible", this._visible);
            // classes
            this._css = {
                container: "container",
                home: "home",
                loading: "loading"
            };
        },
        // start widget. called by user
        startup: function() {
            var _self = this;
            // map not defined
            if (!_self.map) {
                _self.destroy();
                return new Error('map required');
            }
            // map domNode
            _self._mapNode = dom.byId(_self.map.id);
            // when map is loaded
            if (_self.map.loaded) {
                _self._init();
            } else {
                on(_self.map, "load", function() {
                    _self._init();
                });
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
            this.set("startExtent", this.map.extent);
            this.set("loaded", true);
        },
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
        go: function() {
            var _self = this;
            var defaultExtent = _self.get("startExtent");
            _self._showLoading();
            if(defaultExtent){
                return _self.map.setExtent(defaultExtent).then(function(){
                    _self._hideLoading();
                });   
            }
            else{
                _self._hideLoading();
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
            var _self = this;
            _self._visible();
            _self.onLoad();
        },
        _showLoading: function(){
            domClass.add(this._homeNode, this._css.loading);
        },
        _hideLoading: function(){
            domClass.remove(this._homeNode, this._css.loading);
        },
        _updateThemeWatch: function(attr, oldVal, newVal) {
            var _self = this;
            domClass.remove(_self.domNode, oldVal);
            domClass.add(_self.domNode, newVal);
        },
        _visible: function(){
            var _self = this;
            if(_self.get("visible")){
                domStyle.set(_self.domNode, 'display', 'block');
            }
            else{
                domStyle.set(_self.domNode, 'display', 'none');
            }
        }
    });
});