
/**
 * @requires SuperMap/Layer/CanvasLayer.js
 * @requires SuperMap/Layer/Grid.js
 * @requires SuperMap/Tile/Image.js
 */

/**
 * Class: SuperMap.Layer.ArcGIS93Rest
 *  ArcGIS service layer class is used to display maps of ArcGIS Server 9.3.
 *  Constructors of <SuperMap.Layer.ArcGIS93Rest> can be used to create the ArcGIS93Rest layer.
 *  For more information, see: http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html;
 *
 *
 * 
 * Inherits from:
 *  - <SuperMap.Layer.CanvasLayer>
 */
SuperMap.Layer.ArcGIS93Rest = SuperMap.Class(SuperMap.CanvasLayer, {

    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Hashtable of default parameter key/value pairs 
     */
    DEFAULT_PARAMS: {
        format: "png"
    },
        
    /**
     * APIProperty: isBaseLayer
     * {Boolean} Basemap (Default is true)
     */
    isBaseLayer: true,
    /**
     * Property: attribution
     * {String} The layer attribution.
     */
    attribution: "Data By <a style='white-space: nowrap' target='_blank' href='http://www.arcgisonline.cn/'>ESRI</a>",

    /**
     * Constructor: SuperMap.Layer.ArcGIS93Rest
     * Create an ArcGIS93Rest layer
     *
     * Example:
     * (code)
     *
     * var arcims = new SuperMap.Layer.ArcGIS93Rest("MyName",
     *                                    "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer/export",
     *                                    {
     *                                      layers: "show:0,1,2"
     *                                    });
     * (end)
     *
     * Parameters:
     * name - {String} Layer name
     * url - {String}  The REST service url of ArcGIS, and the url directory is http://sampleserver1.arcgisonline.com/ArcGIS/rest/services
     * or http://www.arcgisonline.cn/ArcGIS/rest/services,etc.
	 * You can find the corresponding service under the directory.
     * params - {Object} Optional parameters.
     * options - {Object} Open properties of this class and its parent class.
     *
     * Allowed params properties:
     * layers - {String} Set layers to be displayed on the output map. For methods can be used to specify which layers needs to be displayed:
     * show (Only the layer specified in this list can be used for plotting);
     * hide(All the layers except layers in this list will be used for plotting);
     * include(Additional layers apart from the default layers);
     * exclude(Eliminated layers within the default layers);
     *
     * Allowed options properties:
     * useCanvas - {Boolean} Whether to use Canvas for drawing?
     */
    initialize: function(name, url, params, options) {
        var me=this,newArguments = [];
        //Convert the params parameter into capitals
        params = SuperMap.Util.upperCaseObject(params);
        newArguments.push(name, url, params, options);
        SuperMap.CanvasLayer.prototype.initialize.apply(me, newArguments);
        SuperMap.Util.applyDefaults(me.params, SuperMap.Util.upperCaseObject(me.DEFAULT_PARAMS));
                       
        //layer is transparent
        //The following codes will not be temporarily considered. 
        if (this.params.TRANSPARENT && 
            this.params.TRANSPARENT.toString().toLowerCase() == "true") {
            
            // unless explicitly set in options, make layer an overlay
            if ( (options == null) || (!options.isBaseLayer) ) {
                this.isBaseLayer = false;
            } 
            
            // jpegs can never be transparent, so intelligently switch the 
            //  format, depending on the browser's capabilities
            if (this.params.FORMAT == "jpg") {
                this.params.FORMAT = SuperMap.Util.alphaHack() ? "gif"
                                                                 : "png";
            }
        }
    },    

    
    /**
     * APIMethod: destroy
     * Deconstruct a ArcGIS93Rest class, and release resources.
     */
    destroy: function() {
        // for now, nothing special to do here. 
        SuperMap.CanvasLayer.prototype.destroy.apply(this, arguments);
    },   
    
    /**
         * APIMethod: clone
         * Create a copy of the current layer
         * Parameters:
         * obj - {Object}
         * Returns:
         * {<SuperMap.Layer.ArcGIS93Rest>}
         */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new SuperMap.Layer.ArcGIS93Rest(this.name,
                                           this.url,
                                           this.params,
                                           this.getOptions());
        }

        //get all additions from superclasses
        obj = SuperMap.CanvasLayer.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        return obj;
    },
    
    
    /**
     * Method: getURL
     * Get the url of the tile.
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>} bounds of tiles.
     *
     * Returns:
     * {String} The URL of the tile.
     */
    getURL: function (bounds) {
        bounds = this.adjustBounds(bounds);

        // ArcGIS Server only wants the numeric portion of the projection ID.
        var projWords = this.projection.getCode().split(":");
        var srid = projWords[projWords.length - 1];

        var imageSize = this.getImageSize();
        //With demand-based considerations, many parameters are the default, which are not public. 
        //Modify these parameters here when you need
		//You can also add several properties in the class for initialization.
        var newParams = {
            'BBOX': bounds.toBBOX(),
            'SIZE': imageSize.w + "," + imageSize.h,
            // We always want image, the other options were json, image with a whole lotta html around it, etc.
            'F': "image",
            'BBOXSR': srid,
            'IMAGESR': srid
        };

        // Now add the filter parameters.
        // Set a layer filtering parameter.
        if (this.layerDefs) {
            var layerDefStrList = [];
            var layerID;
            for(layerID in this.layerDefs) {
                if (this.layerDefs.hasOwnProperty(layerID)) {
                    if (this.layerDefs[layerID]) {
                        layerDefStrList.push(layerID);
                        layerDefStrList.push(":");
                        layerDefStrList.push(this.layerDefs[layerID]);
                        layerDefStrList.push(";");
                    }
                }
            }
            if (layerDefStrList.length > 0) {
                newParams['LAYERDEFS'] = layerDefStrList.join("");
            }
        }
        var requestString = this.getFullRequestString(newParams);
        return requestString;
    },
    
    /**
     * Method: setLayerFilter
     * Modify the layerDefs parameter during creating tiles.
     * Parameters:
     * id - {String} The corresponding layer id.
     * queryDef - {String} Descriptions used for replacing previous parameters.
     * layerDefs is mainly used to filter the information of a layer in order to determine which information will be displayed for plotting,
	 
     * For more information, please see:
     * http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/export.html
     */
    setLayerFilter: function ( id, queryDef ) {
        if (!this.layerDefs) {
            this.layerDefs = {};
        }
        if (queryDef) {
            this.layerDefs[id] = queryDef;
        } else {
            delete this.layerDefs[id];
        }
    },
    
    /**
     * Method: clearLayerFilter
     * Clear the layerDefs parameter
     *
     * Parameters:
     * id - {String} The layer id that needs to be cleared.
     */
    clearLayerFilter: function ( id ) {
        if (id) {
            delete this.layerDefs[id];
        } else {
            delete this.layerDefs;
        }
    },
    
    /**
     * Method: mergeNewParams
     * Conversion method used in dynamically creating a params parameter for a basic class
     * 
     *
     *     Converting these parameters into capitals when params is changed.
     * 
     * Parameters:
     * newParams - {Object} New varied params parameter.
     */
    mergeNewParams:function(newParams) {
        var upperParams = SuperMap.Util.upperCaseObject(newParams);
        var newArguments = [upperParams];
        return SuperMap.CanvasLayer.prototype.mergeNewParams.apply(this,
                                                             newArguments);
    },

    CLASS_NAME: "SuperMap.Layer.ArcGIS93Rest"
});
