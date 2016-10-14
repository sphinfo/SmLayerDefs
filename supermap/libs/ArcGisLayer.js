/* Copyright (c) 2006-2013 by SuperMap Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the SuperMap distribution or repository for the
 * full text of the license. */

/**
 * @requires SuperMap/Layer/XYZ.js
 */

/**
 * Class: SuperMap.Layer.OSM
 * This layer allows accessing OpenStreetMap tiles. By default the OpenStreetMap
 *    hosted tile.openstreetmap.org Mapnik tileset is used. If you wish to use
 *    a different layer instead, you need to provide a different
 *    URL to the constructor. Here's an example for using OpenCycleMap:
 * 
 * (code)
 *     new SuperMap.Layer.OSM("OpenCycleMap", 
 *       ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
 *        "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
 *        "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]); 
 * (end)
 *
 * Inherits from:
 *  - <SuperMap.Layer.XYZ>
 */
SuperMap.Layer.ArcGisLayer = SuperMap.Class(SuperMap.Layer.XYZ, {

    /**
     * APIProperty: name
     * {String} The layer name. Defaults to "OpenStreetMap" if the first
     * argument to the constructor is null or undefined.
     */
    name: "OpenStreetMap",

    /**
     * APIProperty: url
     * {String} The tileset URL scheme. Defaults to
     * : http://[a|b|c].tile.openstreetmap.org/${z}/${x}/${y}.png
     * (the official OSM tileset) if the second argument to the constructor
     * is null or undefined. To use another tileset you can have something
     * like this:
     * (code)
     *     new SuperMap.Layer.OSM("OpenCycleMap", 
     *       ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
     *        "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
     *        "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]); 
     * (end)
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
    attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",

    /**
     * Property: sphericalMercator
     * {Boolean}
     */
    sphericalMercator: true,

    /**
     * Property: wrapDateLine
     * {Boolean}
     */
    wrapDateLine: true,

    /** APIProperty: tileOptions
     *  {Object} optional configuration options for <SuperMap.Tile> instances
     *  created by this Layer. Default is
     *
     *  (code)
     *  {crossOriginKeyword: 'anonymous'}
     *  (end)
     *
     *  When using OSM tilesets other than the default ones, it may be
     *  necessary to set this to
     *
     *  (code)
     *  {crossOriginKeyword: null}
     *  (end)
     *
     *  if the server does not send Access-Control-Allow-Origin headers.
     */
    tileOptions: null,
    layerDefs : "",
    /**
     * Constructor: SuperMap.Layer.OSM
     *
     * Parameters:
     * name - {String} The layer name.
     * url - {String} The tileset URL scheme.
     * options - {Object} Configuration options for the layer. Any inherited
     *     layer option can be set in this object (e.g.
     *     <SuperMap.Layer.Grid.buffer>).
     */
    initialize: function(name, url,options,layerDefs) {
    	if(layerDefs !== undefined){
    		this.layerDefs = layerDefs;
    	}
    	
        SuperMap.Layer.XYZ.prototype.initialize.apply(this, arguments);
        this.tileOptions = SuperMap.Util.extend({
            crossOriginKeyword: 'anonymous'
        }, this.options && this.options.tileOptions);
    },

    getURL : function(bounds){
    	var url = this.url,
    		format = "&format=png",
    		f = "&f=image",
    		transparent= "&transparent=true",
    		size = "&size=256,256",
    		bboxsr="&BBOXSR=3857",
    		imagesr="&IMAGESR=3857";
    	
    	var bbox = "?bbox=";
    	bbox += bounds.left+",";
    	bbox += bounds.bottom+",";
    	bbox += bounds.right+",";
    	bbox += bounds.top+"";
    	var layerDefs = "";
    	if(this.layerDefs != ""){
    		layerDefs = "&layerDefs="+this.layerDefs;
    	}
    	return this.url+bbox+size+bboxsr+imagesr+layerDefs+format+transparent+f;
    },
    /**
     * Method: clone
     */
    clone: function(obj) {
        if (obj == null) {
            obj = new SuperMap.Layer.ArcGISLayer(
                this.name, this.url, this.getOptions());
        }
        obj = SuperMap.Layer.XYZ.prototype.clone.apply(this, [obj]);
        return obj;
    },

    CLASS_NAME: "SuperMap.Layer.ArcGISLayer"
});
