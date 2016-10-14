/* Copyright (c) 2006-2013 by SuperMap Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the SuperMap distribution or repository for the
 * full text of the license. */

/**
 * @requires SuperMap/Layer/Grid.js
 */

/**
 * Class: SuperMap.Layer.ArcGIS93Rest
 * Instances of SuperMap.Layer.ArcGIS93Rest are used to display data from
 *     ESRI ArcGIS Server 9.3 (and up?) Mapping Services using the REST API.
 *     Create a new ArcGIS93Rest layer with the <SuperMap.Layer.ArcGIS93Rest>
 *     constructor.  More detail on the REST API is available at
 *     http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html ;
 *     specifically, the URL provided to this layer should be an export service
 *     URL: http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/export.html 
 * 
 * Inherits from:
 *  - <SuperMap.Layer.Grid>
 */
SuperMap.Layer.ArcGIS93Rest = SuperMap.Class(SuperMap.Layer.Grid, {

    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Hashtable of default parameter key/value pairs 
     */
    DEFAULT_PARAMS: { 
      format: "png"
    },
        
    /**
     * APIProperty: isBaseLayer
     * {Boolean} Default is true for ArcGIS93Rest layer
     */
    isBaseLayer: true,
 
 
    /**
     * Constructor: SuperMap.Layer.ArcGIS93Rest
     * Create a new ArcGIS93Rest layer object.
     *
     * Example:
     * (code)
     * var arcims = new SuperMap.Layer.ArcGIS93Rest("MyName",
     *                                    "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StateCityHighway_USA/MapServer/export", 
     *                                    {
     *                                      layers: "0,1,2"
     *                                    });
     * (end)
     *
     * Parameters:
     * name - {String} A name for the layer
     * url - {String} Base url for the ArcGIS server REST service
     * options - {Object} An object with key/value pairs representing the
     *                    options and option values.
     *
     * Valid Options:
     *        format - {String} MIME type of desired image type.
     *        layers - {String} Comma-separated list of layers to display.
     *        srs - {String} Projection ID.
     */
    initialize: function(name, url, params, options) {
        var newArguments = [];
        //uppercase params
        params = SuperMap.Util.upperCaseObject(params);
        newArguments.push(name, url, params, options);
        SuperMap.Layer.Grid.prototype.initialize.apply(this, newArguments);
        SuperMap.Util.applyDefaults(
                       this.params, 
                       SuperMap.Util.upperCaseObject(this.DEFAULT_PARAMS)
                       );
                       
        //layer is transparent        
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
         * Method: clone
         * Create a clone of this layer
         *
         * Returns:
         * {<SuperMap.Layer.ArcGIS93Rest>} An exact clone of this layer
         */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new SuperMap.Layer.ArcGIS93Rest(this.name,
                                           this.url,
                                           this.params,
                                           this.getOptions());
        }

        //get all additions from superclasses
        obj = SuperMap.Layer.Grid.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        return obj;
    },
    
    
    /**
     * Method: getURL
     * Return an image url this layer.
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>} A bounds representing the bbox for the
     *                                request.
     *
     * Returns:
     * {String} A string with the map image's url.
     */
    getURL: function (bounds) {
        bounds = this.adjustBounds(bounds);

        // ArcGIS Server only wants the numeric portion of the projection ID.
        var projWords = this.projection.getCode().split(":");
        var srid = projWords[projWords.length - 1];

        var imageSize = this.getImageSize(); 
        var newParams = {
            'BBOX': bounds.toBBOX(),
            'SIZE': imageSize.w + "," + imageSize.h,
            // We always want image, the other options were json, image with a whole lotta html around it, etc.
            'F': "image",
            'BBOXSR': srid,
            'IMAGESR': srid
        };

        // Now add the filter parameters.
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
     * addTile creates a tile, initializes it, and adds it to the layer div. 
     *
     * Parameters:
     * id - {String} The id of the layer to which the filter applies.
     * queryDef - {String} A sql-ish query filter, for more detail see the ESRI
     *                     documentation at http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/export.html
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
     * Clears layer filters, either from a specific layer,
     * or all of them.
     *
     * Parameters:
     * id - {String} The id of the layer from which to remove any
     *               filter.  If unspecified/blank, all filters
     *               will be removed.
     */
    clearLayerFilter: function ( id ) {
        if (id) {
            delete this.layerDefs[id];
        } else {
            delete this.layerDefs;
        }
    },
    
    /**
     * APIMethod: mergeNewParams
     * Catch changeParams and uppercase the new params to be merged in
     *     before calling changeParams on the super class.
     * 
     *     Once params have been changed, the tiles will be reloaded with
     *     the new parameters.
     * 
     * Parameters:
     * newParams - {Object} Hashtable of new params to use
     */
    mergeNewParams:function(newParams) {
        var upperParams = SuperMap.Util.upperCaseObject(newParams);
        var newArguments = [upperParams];
        return SuperMap.Layer.Grid.prototype.mergeNewParams.apply(this, 
                                                             newArguments);
    },

    CLASS_NAME: "SuperMap.Layer.ArcGIS93Rest"
});
