
/**
 * @requires SuperMap/Util.js
 * @requires SuperMap/Layer/CanvasLayer.js
 */

/**
 * Class: SuperMap.Layer.OSM
 *    This layer can access the OpenStreetMapservice.
 *
 * Inherits from:
 *  - <SuperMap.Layer.CanvasLayer>
 */
SuperMap.Layer.OSM = SuperMap.Class(SuperMap.CanvasLayer, {

    /**
     * APIProperty: name
     * {String}Layer name, the default is "OpenStreetMap", to prevent the initialization of the layer name is not set
     *
     */
    name: "OpenStreetMap",

    /**
     * Property: url
     * {String}The default three OpenStreetMap server address, do not need to user settings
     */
    url: [
        'http://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'http://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
    ],

    /**
     * Property: attribution
     * {String} The layer attribution.
     */
    attribution: "Data CC-By-SA by <a style='white-space: nowrap' target='_blank' href='http://openstreetmap.org/'>OpenStreetMap</a>",

    /**
     * Constructor: SuperMap.Layer.OSM
     * Creat OSM layer,can browse OpenStreetMap map
     * Example:
     * (code)
     *
     * var osm = new SuperMap.Layer.OSM("MyName");
     *                                    
     * (end)
     *
     *  The default for the Mercator projection, so you need coordinate conversion  when add elements and map location on the map. 
     * Example:
     * (code)
     *
     * var markers = new SuperMap.Layer.Markers( "Markers" );
     * map.addLayer(markers);
     * var size = new SuperMap.Size(21,25);
     * var offset = new SuperMap.Pixel(-(size.w/2), -size.h);
     * var icon = new SuperMap.Icon('image url', size, offset);
     * markers.addMarker(new SuperMap.Marker(new SuperMap.LonLat(118,40 ).transform(
     * new SuperMap.Projection("EPSG:4326"),
     * map.getProjectionObject()),icon));
     *
     * (end)
     * Parameters:
     * name - {String} Layer name
     */
    initialize: function(name, options) {
        options = SuperMap.Util.extend({
            projection: "EPSG:900913",
            numZoomLevels: 16
        }, options);
        SuperMap.CanvasLayer.prototype.initialize.apply(this,[name,this.url,{},options] );
    },

    /**
     * Method: clone
     */
    clone: function(obj) {
        if (obj == null) {
            obj = new SuperMap.Layer.OSM(
                this.name, this.url, this.getOptions());
        }
        obj = SuperMap.CanvasLayer.prototype.clone.apply(this, [obj]);
        return obj;
    },

    /**
     * APIMethod: destroy
     * Deconstruct the OSM class, the release of resources.
     */
    destroy: function () {
        var me = this;
        SuperMap.CanvasLayer.prototype.destroy.apply(me, arguments);
    },
    /**
     * Method: getTileUrl
     * Get tile URL.
     *
     * Parameters:
     * xyz - {Object} 一Key group,the index of x,y,z direction
     *
     * Returns
     * {String} Tile URL.
     */
    getTileUrl: function (xyz) {
        var me = this,  url;

        if (SuperMap.Util.isArray(this.url)) {

            url = me.selectUrl(xyz, this.url);
        }
        url= SuperMap.String.format(url, {
            x: xyz.x,
            y: xyz.y,
            z: xyz.z
        });
        return  url;
    },
    /**
     * Method: selectUrl
     * In a certain way to choose a reasonable URL in a group of URL array
     * Parameters:
     * xyz - {Object} 一Key group,the index of x,y,z direction
     * urls - {Array(String)} url array
     *
     * Returns:
     * {String} A reasonable URL, mainly for the map to access multiple servers, improve efficiency
     */
    selectUrl: function(xyz, urls) {
        var id=Math.abs(xyz.x+xyz.y)%urls.length;
        var url=urls[id];
        return url;
    },
    CLASS_NAME: "SuperMap.Layer.OSM"
});
