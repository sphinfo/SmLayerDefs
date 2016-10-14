
/**
 * Class: SuperMap.Layer.WebGLLayer
 * The layer that use the webgl method to render
 * Use this layer to depend on part matrix calculation, so it needs to reference to examples/js/glMatrix-0.9.5.min.js library
 * Inherits from:
 *  - <SuperMap.Layer.Grid>
 */

SuperMap.Layer.WebGLLayer = SuperMap.Class(SuperMap.Layer.Grid, {

    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Set the default value of parameter of tile url request.
     *  transparent (whether the layer is transparent.Default is false
     *  cacheEnabled(whether to use the server caches. Default is true)
     */
    DEFAULT_PARAMS: {
        //maxVisibleVertex: 360000,
        transparent: false,
        cacheEnabled: true
    },

    /**
     * Property: prjStr
     * {String}
     * Projection key string. Finish assigning value when layer initialization. For example: prjCoordSys={"epsgCode":3857}
     * not public
     */
    prjStr1: null,

    /**
     * Property: getmapstatusservice
     * {String}
     */
    getMapStatusService: null,

    /**
     * Property: viewBounds
     * {Object} The range of map window display area.
     */
    viewBounds: null,

    /**
     * Property: viewer
     * {Object} User display view.
     */
    viewer: null,

    /**
     * Property: scale
     * {Number} Display scale of map.
     */
    scale: null,


    /**
     * Property: overlapDisplayed
     * {Boolean} When the map objects are in the same range, whether to overlay display. Default is true.
     */
    overlapDisplayed: true,

    /**
     * Property: redirect
     * {Boolean} Whether to redirect. A concept in HTTP transmission. If it is true, redirect the request to the real address;
     * If it is false, it will be the image byte stream in the response body. Default is false, not redirect.
     */
    redirect: false,

    /**
     * Property: overlapDisplayedOptions
     * {<SuperMap.REST.OverlapDisplayedOptions>} Avoid the filter option of map object overlay.
     * It is false when overlapDisplayed is false. It is used to strengthen the processing for map object overlay.
     */
    overlapDisplayedOptions: null,


    /**
     * Property: useCanvas
     * {Boolean} Set whether to display a layer by the Canvas element. Default is true. Only can be true
     * 
     */
    useCanvas: true,
    
    /**
     * Property: canvas
     * When useCanvas is true, this Canvas is the real container of all tiles.
     */
    canvas: null, 
    
    /**
     * Property: canvasContext
     * {Canvas} The context of WEBGL.
     */    
    canvasContext: null,

    /**
     * Property: lastResolution
     * The resolution that canvas drawn last time.
     */
    lastResolution: null,
    
    /**
     * Property: lastCanvasPosition
     * When canvas drawn last time, the location to top-left.
     */
    lastCanvasPosition: null,
    
    /**
     * Property: redrawCanvas
     * Indicates if the canvas element should be reset before
     * the next tile is drawn.
     * Indicates that whether the canvas element needs resetting before drawing. Default is false.
     */
    redrawCanvas: false,

    /**
     * Property: format
     * {String} The image format of map service.
     *     Default value is png. Currently, it supports png, jpg, bmp and gif.
     */
    format: "png",
    
    /**
     * Property: dpi
     * {Float} The pixel number of per inch in screen.
     * Combined with the layer scale, this parameter can calculate the layer resolution in this layer.
     */
    dpi: null,
    
    /**
     * Property: isBaseLayer
     * {Boolean} Whether the layer is the base map. Default is true.
     */
    isBaseLayer: true, 
    
    /**
     * Property: tileOriginCorner
     * {String} The original location of grid. (When <tileOrigin> is not to be set, this attribute is valid).
     *   Optional values: "tl" (up left), "tr" (up right), "bl" (left lower), and "br"(right lower). Default is "tl".
     */ 
    tileOriginCorner: "tl",
    
    /**
     * Property: datumAxis
     * {Number} The spheroid semi-major axis of geographic coordinate system. When users customize the map Options, If * not specify this parameter, the DPI is calculated by spheroid semi-major axis 6378137 of WGS84 reference system.
     */
    datumAxis: null,

    /**
     * Property: timeoutID
     * {Number} Record the index of setTimeout.
     */    
    timeoutID :null,
    
    /**
     * Property: memoryImg
     * {Object} Store the loaded image as the caches.
     * It needs to be redrawn when layer status changes. First, it will determine whether this picture is in caches.
     * If it exists, draw directly; if not, send request to the server.
     * This can improve the efficiency and can also see pictures of cache in the offline state.
     */
    memoryImg: null,
    
    /**
     * Property: memoryKeys
     * {Array} Save the key values of cached images.
     * Every picture corresponds to a key, such as x0y1z2, 
     * which represents the picture that the scale is 2 in the first row and second column.(calculate from the top-left).
     */
    memoryKeys:[],

    /**
     * APIProperty: bufferImgCount
     * {Number} Used to record the cache image number in the memory. Default is 1000.
     * In order to reduce network traffic, when using the Canvas mode, layer will save the accessed pictures to the memory.
     * If the number is grater than this attribute, the new pictures will replace the cached picture.
     */
    bufferImgCount:1000,

    /**
     * Property: isFirstLoad
     * {Bool} Record whether it is the first time to load. Default is true.
     */    
    isFirstLoad: true,
    
    /**
     * Property: zoomDuration
     * {Number} Set the interval of two wheel events trigger. If the interval is less than 500ms,
     * give up the last wheel event. (An error will be thrown, if this attribute and interval of <SuperMap.Handler.MouseWheel> are both set)
     */  
    zoomDuration:500,
    
    /**
     * Property: isZoomming
     * {bool} Record whether to scale.
     */  
    isZoomming: null,
          
    /**
     * Property: useHighSpeed
     * {bool} Record whether to adopt the strategy of high reading.
     */ 
    useHighSpeed:true,
    
    /**
     * Property: changeDx
     * {Interger} Record the position shift.
     */ 
    changeDx: null,
    /**
     * Property: changeDy
     * {Interger} Record the position shift.
     */ 
    changeDy: null,

    /**
     * Property: lenColumn
     * {Interger} Record the col length of the current grid.
     */
    lenColumn: null,

    /**
     * Property: lenRow
     * {Interger} Record the row length of the current grid.
     */
    lenRow: null,
    
    /**
     * Porperty: sdcardPath
     * {String} Record the mobile SDCard location.
     */
    sdcardPath:null,
    
    /**
     * Porperty: storageType
     * {String} Offline storage type is the file format.
     */
    storageType:"File",

    /**
     * Porperty: transitionObj
     * {Object} Scale animation object.
     */
    transitionObj: null,

    /**
     * Property: inZoom
     * {Boolean} Whether the current map operation is in the scale.
     */
    inZoom: false,
    
    /**
     * Constructor: SuperMap.Layer.WebGLLayer
     * The layer rendered by the webgl method
     *
     * Parameters:
     * name - {String}  Layer name.
     * url - {String} Service address of layer.
     * params - {Object} Set the optional parameter in url.
     * options - {Object} The option attached to the layer attribute. The attribute open by the parent class and this class.
     */
    initialize: function (name, url, params, options) {
        //Get part of information through the browser
        var me = this, broz = SuperMap.Browser;
        //me.tileSize = new SuperMap.Size(256, 256);
        //Determine whether it is the mobile, if it is, 
        if(!!SuperMap.isApp)me.bufferImgCount = 500;
        SuperMap.Layer.Grid.prototype.initialize.apply(me, arguments);
        //reports the progress of a tile filter
        if(me.useCanvas) {
            //Determine whether to support the Canvas drawing through the browser
            me.useCanvas = SuperMap.Util.supportCanvas();
        }
        
        if(broz.device === 'android') {
            me.useCanvas = false;
        }
        
        if (SuperMap.isApp) {
            //me.sdcardPath = "file://" + window.plugins.localstoragemanager.getsdcard().sdcard + "/";
            cordova.exec(function(obj){
				me.sdcardPath = "file://" + obj.sdcard + "/";
			}, function(e){}, "LocalStoragePlugin","getsdcard", []);
            me.useCanvas = true;
        }
        
        if(me.useCanvas) {
            me.canvas = document.createElement("canvas");
            me.canvas.id = "Canvas_" + me.id;
            me.canvas.style.position = "absolute";       
            me.div.appendChild(me.canvas);                     
            me.canvasContext = me.canvas.getContext('experimental-webgl');
            me.transitionObj = new SuperMap.Animal(me);
            me.memoryImg = {};    
        }
        
        //If it is the Canvas strategy, it uses the high speed reading.
        me.useHighSpeed = me.useCanvas ? true : false;            
        me.isFirstLoad = true;

        //Codes of subclass
        SuperMap.Util.applyDefaults(me.params, me.DEFAULT_PARAMS);
        me.events.addEventType("layerInitialized");
        me.events.addEventType("loadError");
        if (me.params.transparent) {
            if (me.format === "jpg") {
                me.format = SuperMap.Util.alphaHack() ? "gif" : "png";
            }
            if (me.format === "bmp") {
                me.format = SuperMap.Util.alphaHack() ? "bmp" : "png";
            }
        }
        if (typeof me.params.clipRegion !== "undefined") {
            if (me.params.clipRegion instanceof SuperMap.Geometry) {
                me.params.clipRegionEnabled = true;
                var sg = SuperMap.REST.ServerGeometry.fromGeometry(me.params.clipRegion);
                me.params.clipRegion = SuperMap.Util.toJSON(sg);
            } else {
                delete me.params.clipRegion;
            }
        }
        if (typeof me.params.layersID !== "undefined") {
            if (!me.params.layersID){
                delete me.params.layersID;
            }
        }
        if (me.params.redirect) {
            me.redirect = true;
        }

        //Users pass on the map unit of Layer
        if(me.units){
            me.units = me.units.toLowerCase();
        }

        if(me.dpi && me.maxExtent &&(me.resolutions || me.scales)) {
            //If you set dpi, maxExtent, resolutions or scales, it doesn't need to send a request to server to get the layer information
        }else if(!me.dpi && (!me.viewBounds || !me.viewer || !me.scale)) {
            //If viewBounds, viewer, scale, units and datumAxis are set in options, calculate the dpi
            if (!!SuperMap.isApp) {
                var layerContext = {
                    tile:me
                };

                cordova.exec(function(layerContext){
                    return function(r){
                        layerContext.tile.getAppStatusSucceed(layerContext,r);
                    }
                }(layerContext), function(e){},
                    "LocalStoragePlugin","getconfig",
                    [this.name,this.storageType]
                );
            } else{
                var strServiceUrl = me.url;
                if (SuperMap.Util.isArray(url)) {
                    strServiceUrl = url[0];
                }
                var getMapStatusService = new SuperMap.REST.MapService(strServiceUrl,
                    {eventListeners: {processCompleted: me.getStatusSucceed, scope: me,
                        processFailed: me.getStatusFailed}, projection: me.projection});
                getMapStatusService.processAsync();
            }
        }
        if (me.projection) {
            if(typeof me.projection == "string") {
                me.projection = new SuperMap.Projection(me.projection);
            }

            var arr = me.projection.getCode().split(":");
            if (arr instanceof Array && arr.length == 2) {
                me.prjStr1 = "{\"epsgCode\":" + arr[1] + "}";
            }
        }
    },

    getAppStatusSucceed:function(layerContext,r) {
        var mapStatus = r.json;
        var me = this;
        if (mapStatus != "false")
        {
            mapStatus = eval('(' + mapStatus + ')');
            var bounds = mapStatus.bounds;
            bounds = new SuperMap.Bounds(bounds.left,bounds.bottom,bounds.right,bounds.top);
            me.maxExtent = bounds;
            if(mapStatus.dpi){
                me.dpi = mapStatus.dpi;
                me.options.scales = mapStatus.scales;
                me.units = mapStatus.unit;
                me.datumAxis = 6378137;
            }
            else{
                var viewBounds = mapStatus.viewBounds,
                    coordUnit = mapStatus.coordUnit,
                    viewer = mapStatus.viewer,
                    scale = mapStatus.scale,
                    datumAxis = mapStatus.datumAxis;
                //Transfer the jsonObject into SuperMap.Bounds to calculate the dpi.
                viewBounds = new SuperMap.Bounds(viewBounds.left,viewBounds.bottom,viewBounds.right,viewBounds.top);
                me.viewBounds = viewBounds;

                viewer = new SuperMap.Size(viewer.rightBottom.x, viewer.rightBottom.y);
                me.viewer = viewer;
                me.scale = scale;

                coordUnit = coordUnit.toLowerCase();
                me.units = me.units || coordUnit;
                me.datumAxis = datumAxis;

                me.dpi = SuperMap.Util.calculateDpi(viewBounds, viewer, scale, me.units, datumAxis);
            }
            me.events.triggerEvent('layerInitialized',me);
        }else{
            var strServiceUrl = me.url;
            if (SuperMap.Util.isArray(me.url)) {
                strServiceUrl = me.url[0];
            }
            var getMapStatusService = new SuperMap.REST.MapService(strServiceUrl,
                {eventListeners:{processCompleted: me.getStatusSucceed, scope: me,
                    processFailed: me.getStatusFailed}, projection: me.projection});
            getMapStatusService.processAsync();
        }
    },

    /**
     * Method: setMapStatus
     * CLculate the Dpi and set maxExtent.
     */
    getStatusSucceed: function(mapStatus) {
        var me = this;

        if (mapStatus.result){
            // If users did not set scales, visibleScales, and visibleScalesEnable is true, make layer.scales=visibleScales.
            var visScales = null;
            var orResult = mapStatus.originResult;
            if(orResult){
                visScales = orResult.visibleScales;
                if(!me.scales && orResult.visibleScalesEnabled && (visScales &&visScales.length&&visScales.length>0))
                {
                    this.options.scales=visScales;
                }
            }

            var mapStatus = mapStatus.result;
            var bounds = mapStatus.bounds, viewBounds = mapStatus.viewBounds,
                coordUnit = mapStatus.coordUnit,
                viewer = mapStatus.viewer,
                scale = mapStatus.scale,
                datumAxis = mapStatus.datumAxis;
            //Convert the jsonObject into SuperMap.Bounds, used to calculate dpi.
            viewBounds = new SuperMap.Bounds(viewBounds.left,viewBounds.bottom,viewBounds.right,viewBounds.top);
            me.viewBounds = viewBounds;

            viewer = new SuperMap.Size(viewer.rightBottom.x, viewer.rightBottom.y);
            me.viewer = viewer;
            me.scale = scale;

            bounds = new SuperMap.Bounds(bounds.left,bounds.bottom,bounds.right,bounds.top);
            me.maxExtent = bounds;

            coordUnit = coordUnit.toLowerCase();
            me.units = me.units || coordUnit;
            me.datumAxis = datumAxis;

            me.dpi = SuperMap.Util.calculateDpi(viewBounds, viewer, scale, me.units, datumAxis);

            if (!!SuperMap.isApp){
                //window.plugins.localstoragemanager.savaconfig(this.name,mapStatus);
                cordova.exec(function(){}, function(e){}, "LocalStoragePlugin","savaconfig", [this.name,mapStatus]);
            }

            me.events.triggerEvent('layerInitialized',me);
        }
    },

    /**
     * Method: getStatusFailed
     * Failed to get the layer statu
     */
    getStatusFailed: function(failedMessage) {
        var me = this;
        me.events.triggerEvent('loadError',failedMessage);
    },

    /**
     * Method: getTileUrl
     * Get the URL of tiles.
     *
     * Parameters:
     * xyz - {Object} A pair of key value, represent the indexes in X, Y and Z directions.
     *
     * Returns
     * {String} The URL of tiles.
     */
    getTileUrl: function (xyz) {
        var me = this,
            newParams,
            tileSize = me.tileSize,
            scale = me.scales[xyz.z];
     
        //scale = SuperMap.Util.normalizeScale(scale);
        if(!scale)scale = this.getScaleForZoom(xyz.z);
        newParams = {
            "width" : tileSize.w,
            "height" : tileSize.h,
            "x" : xyz.x,
            "y" : xyz.y,
            "scale" : scale,
            "redirect" : me.redirect
        };
        if (SuperMap.Credential.CREDENTIAL) {
            newParams[SuperMap.Credential.CREDENTIAL.name] = SuperMap.Credential.CREDENTIAL.getValue();
        }
        if (!me.params.cacheEnabled) {
            newParams.t = new Date().getTime();
        }
        if (typeof me.params.layersID !== "undefined" && typeof newParams.layersID == "undefined") {
            if (me.params.layersID && me.params.layersID.length > 0){
                newParams.layersID = me.params.layersID;
            }
        }

        if (me.prjStr1) {
            newParams.prjCoordSys = me.prjStr1;
        }

        return me.getFullRequestString(newParams);
    },

    /**
     * Method: getFullRequestString
     * Merge this parameter with URL, and get the complete request address. (rewrite bass class method)
     *
     * Parameters:
     * newParams - {Object}
     * altUrl - {String}
     *
     * Returns:
     * {String}
     */
    getFullRequestString:function(newParams, altUrl) {
        var me = this,
            url = altUrl || this.url,
            allParams, paramsString, urlParams;
        allParams = SuperMap.Util.extend({}, me.params),
            allParams = SuperMap.Util.extend(allParams, newParams);

        if(allParams.overlapDisplayed === false) {
            me.overlapDisplayedOptions = allParams.overlapDisplayedOptions;
            me.overlapDisplayed = allParams.overlapDisplayed;
            delete allParams.overlapDisplayed;
            delete allParams.overlapDisplayedOptions;
        }
        paramsString = SuperMap.Util.getParameterString(allParams);

        if (SuperMap.Util.isArray(url)) {
            var s = "" + newParams.x + newParams.y;
            url = me.selectUrl(s, url);
        }
        url = url + "/tileImage." + me.format;
        urlParams = SuperMap.Util.upperCaseObject(SuperMap.Util.getParameters(url));
        for (var key in allParams) {
            if(key.toUpperCase() in urlParams) {
                delete allParams[key];
            }
        }
        paramsString = SuperMap.Util.getParameterString(allParams);
        if( me.tileOrigin ){
            paramsString = paramsString + "&origin={\"x\":" + me.tileOrigin.lon + "," + "\"y\":" + me.tileOrigin.lat + "}";
        }
        if(me.overlapDisplayed === false) {
            me.overlapDisplayedOptions = me.overlapDisplayedOptions ? me.overlapDisplayedOptions : new SuperMap.REST.OverlapDisplayedOptions();
            paramsString += "&overlapDisplayed=false&overlapDisplayedOptions="+ me.overlapDisplayedOptions.toString();
        }

        return SuperMap.Util.urlAppend(url, paramsString);
    },

    /**
     * Method: mergeNewParams
     * Modify the URL parameter dynamically. 
     *
     * Parameters:
     * newParams - {Object}
     *
     * Returns
     * {Boolean} Whether the changes is successful.
     */
    mergeNewParams: function (newParams) {
        if (typeof (newParams.clipRegion) != "undefined") {
            if (newParams.clipRegion instanceof SuperMap.Geometry) {
                newParams.clipRegionEnabled = true;
                var sg = SuperMap.REST.ServerGeometry.fromGeometry(newParams.clipRegion);
                newParams.clipRegion = SuperMap.Util.toJSON(sg);
            } else {
                delete newParams.clipRegion;
            }
        }
        return SuperMap.Layer.HTTPRequest.prototype.mergeNewParams.apply(this, [newParams]);
    },
    
    /**
     * Method: removeMap
     * rewrite Grid.removeMap method to clear '_timeoutId'
     * Called when the layer is removed from the map.
     *
     * Parameters:
     * map - {<SuperMap.Map>} The map.
     */
    removeMap: function(map) {
        SuperMap.Layer.Grid.prototype.removeMap.apply(this, [map])
        this._timeoutId && window.clearTimeout(this._timeoutId); 
        this._timeoutId = null;
    },
    
    /**
     * APIMethod: destroy
     * Destruct the Layer class. Release the resources.  
     */
    destroy: function () {
        var me = this;

        if(me.getMapStatusService) {
            me.getMapStatusService.events.listeners = null;
            me.getMapStatusService.destroy();
        }
        me.viewBounds = null;
        me.viewer = null;
        me.scale = null;

        SuperMap.Layer.Grid.prototype.destroy.apply(me, arguments);
        me.format = null;
        me.dpi = null;
        me.datumAxis = null;
        me.isBaseLayer = null;
        me.tileOriginCorner = null;
        me.tileSize = null;
        me.bufferContext = null;
        if(me.transitionObj){
            me.transitionObj.destroy();
            me.trnasitionObj = null;
        }
        if (me.useCanvas) {
            me.canvas = null;
            me.memoryImg = null;
        }

        me.DEFAULT_PARAMS = null;
    },
    
    /**
     * APIMethod: clone
     * Create the copy of current layer.
     *
     * Parameters:
     * obj - {Object} 
     *
     * Returns:
     * {<SuperMap.SuperMap.Layer>} New layer
     */
    clone: function (obj) {
        var me = this;
        if (obj == null) {
            obj = new SuperMap.Layer.WebGLLayer(
                me.name, me.url, me.params, me.getOptions());
        }
       
        obj = SuperMap.Layer.Grid.prototype.clone.apply(me, [obj]);
        obj._timeoutId = null;
        return obj;
    },
    
    /**
     * Method: moveTo
     * When the map moves, trigger this event. all tile operations are finished by map.
     * moveTo's task is to receive a bounds. And determine whether the loaded pictures
     * in bounds are preloaded.
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}
     * zoomChanged - {Boolean}
     * dragging - {Boolean}
     */
    moveTo: function(bounds, zoomChanged, dragging) {
        var me = this,
            ratio = this.lastResolution / this.map.getResolution(),
            style = this.map.layerContainerDiv.style,
            left = parseInt(style.left),
            top = parseInt(style.top);
        
        this.inZoom = zoomChanged ? true: false;
        this.changeDx = -left; 
        this.changeDy = -top;
        
        if(!zoomChanged && !me.isZoomming && me.useCanvas){
            this.fixPosition();
        }
        SuperMap.Layer.HTTPRequest.prototype.moveTo.apply(me, arguments);
        bounds = bounds || me.map.getExtent();

        // When the operation is pan, it does not redraw the whole canvas
        me.redrawCanvas = zoomChanged;
        me.dragging = dragging;
        
        // the new map resolution
        var resolution = this.map.getResolution();

        // It can conduct scale animation only after all scale attributes are added.
        if (me.useCanvas && ratio!=1) {
            if (!zoomChanged || dragging || (this.lastResolution === null) || (this.lastCanvasPosition === null)) {
            } else {
                var lefttop = this.getLayerPxFromLonLat(this.lastCanvasPosition);
                if(!this.map.isIEMultipTouch){
//                    this.transitionObj.begin(this.canvas, lefttop);
                }
            }
        }

        if (bounds != null) {            
            // When the grid is null, or scales, it needs to redraw the whole canvas
            var forceReTile = !me.grid.length || zoomChanged;
            // Get bounds of all tiles
            var tilesBounds = me.getTilesBounds();            
            if (this.singleTile) {
                if ( forceReTile || 
                     (!dragging && !tilesBounds.containsBounds(bounds))) {
                     if(zoomChanged && this.transitionEffect !== 'resize') {
                         this.removeBackBuffer();
                     }

                     if(!zoomChanged || this.transitionEffect === 'resize') {
                         this.applyBackBuffer(resolution);
                     }
                     
                    this.initSingleTile(bounds);
                }
            } else {
                if (forceReTile || !tilesBounds.containsBounds(bounds, true)) {
                    if(this.useCanvas){
                        //Determine whether it is the first time to load
                        if(this.isFirstLoad){
                            this.redrawCanvas = true;
                            this.inZoom = true;
                            this.isFirstLoad = false;
                        }
                    }
                    if(this.zoomDuration && me.useCanvas) {
                        this.resetCanvas();
                        this.isZoomming = true;
                        window.clearTimeout(this._timeoutId);
                        this._timeoutId = window.setTimeout(
                            SuperMap.Function.bind(function(){
                                this.initGriddedTiles(bounds);
                            }, this),
                            this.zoomDuration
                        );
                    } else {
                        if(zoomChanged && this.transitionEffect === 'resize') {
                            this.applyBackBuffer(resolution);
                        }
                        this.initGriddedTiles(bounds);
                    }
                } else {
                    this.scheduleMoveGriddedTiles();
                }
            }
        }
        
        //According to the changes, calculate the geographic location of canvas top left.
        if (me.useCanvas){
            //Get the location of the changes.
            var canvasPosition = new SuperMap.Pixel(this.changeDx, this.changeDy); 
            //Calculate the canvas geographic position through the changes.
            this.lastCanvasPosition = this.map.getLonLatFromLayerPx(canvasPosition);
        }
    },
    
    /**
     * Method: scheduleMoveGriddedTiles
     * Add the move tile to the plan.
     */
    scheduleMoveGriddedTiles: function() {
        if(this.useHighSpeed){
            this.moveGriddedTiles();
        }else{
            this.timerId && window.clearTimeout(this.timerId);
            this.timerId = window.setTimeout(
                this._moveGriddedTiles,
                this.tileLoadingDelay
            );
        }
    },
    
    /**
     * Method: moveGriddedTiles
     */
    moveGriddedTiles: function() {
        var shifted = true;
        var buffer = this.buffer || 1;
        var tlLayer = this.grid[0][0].position;
        var offsetX = -this.changeDx;
        var offsetY = -this.changeDy;
        var tlViewPort = tlLayer.add(offsetX, offsetY);
        if (tlViewPort.x > -this.tileSize.w * (buffer - 1)) {
            this.shiftColumn(true);
        } else if (tlViewPort.x < -this.tileSize.w * buffer) {
            this.shiftColumn(false);
        } else if (tlViewPort.y > -this.tileSize.h * (buffer - 1)) {
            this.shiftRow(true);
        } else if (tlViewPort.y < -this.tileSize.h * buffer) {
            this.shiftRow(false);
        } else {
            shifted = false;
        }
        if (shifted) {
            if(this.useHighSpeed){
                this.moveGriddedTiles();
            }else{
                this.timerId = window.setTimeout(this._moveGriddedTiles, 0);
            }
        } else {
            //tiles have shifted already, so we can do something.
            //e.g. We can draw images in those tiles on a canvas, if no image is contained in tile,
            //we draw nothing.
        }
    },
    
    /**
     * Method: moveByPx
     * Override the method of parent class.
     */
    moveByPx: function(dx, dy) {
        this._timeoutId && window.clearTimeout(this._timeoutId);
        //Record the changes of every time.
        this.changeDx +=dx;
        this.changeDy +=dy;
        if(this.useHighSpeed){
            this.fixPosition();
            this.scheduleMoveGriddedTiles();
        }
    },
    
    /**
     * Method: fixPosition
     * Translation logic.
     */
    fixPosition: function(){
        var tile, tileImg, i, j,
            me = this;
        //Clear webgl
        me.canvasContext.viewport(0, 0, me.canvasContext.viewportWidth, me.canvasContext.viewportHeight);
//        me.canvasContext.clear(me.canvasContext.COLOR_BUFFER_BIT | me.canvasContext.DEPTH_BUFFER_BIT);
        for(i=0; i<this.lenRow; i++){
            for(j=0; j<this.lenColumn; j++){
                tile = me.grid[i][j];
                tileImg = tile.lastImage;
                //firefox. Even if failed to load image, complete attribute is true. So use width and height to judge
                //IE. When failed to load image, width is 28 and the height is 30. So use complete to judge.
                if((tileImg != null) && (tile.shouldDraw === true) && 
                        (tileImg.width > 0 && tileImg.height > 0) && 
                        tileImg.complete){
                    var positionX = tile.position.x - me.changeDx;
                    var positionY = tile.position.y - me.changeDy;
                    if(tile.lastImage.firstInView){
                        if(me.getExtent().containsLonLat(tile.bounds.getCenterLonLat())){
                            tile.lastImage.firstInView = false;
                        }
                        else if(me.getExtent().intersectsBounds(tile.bounds)){
                            tile.setFirstInView();
                        }
                    }
                    me.drawCanvasTile2(tile.lastImage, positionX, positionY, false);
                }
            }
        }
    },
    
    /**
     * Method: addTile
     * Gives subclasses of Grid the opportunity to create an 
     * OpenLayer.Tile of their choosing. The implementer should initialize 
     * the new tile and take whatever steps necessary to display it.
     *
     * Parameters
     * bounds - {<SuperMap.Bounds>}
     * position - {<SuperMap.Pixel>}
     *
     * Returns:
     * {<SuperMap.Tile>} The added SuperMap.Tile
     */
    addTile: function(bounds,position) {
        // Modify the Tile class todo
        if(this.useCanvas){
            return new SuperMap.Tile.WebGLImage(this, position, bounds, null, this.tileSize, this.useCanvas)
        }else{
            var tile = new this.tileClass(
                this, position, bounds, null, this.tileSize, this.tileOptions
            );
            this.events.triggerEvent("addtile", {tile: tile});
            return tile;
        }
    },
    
    /**
     * Method: drawCanvasTile
     * After loading Image, display the image to canvas.
     * 
     * Parameters:
     * image - {<Image>} The tile to draw
     * position - {<SuperMap.Pixel>} The position of the tile.
     */
    drawCanvasTile: function(image,  position) {
        if (this.dragging) {
            return;
        }
        if(this.inZoom){
            image.firstInView = false;
        }
        this.resetCanvas();
        var mapStyle = this.map.layerContainerDiv.style;
        var left = parseInt(mapStyle.left),
            top = parseInt(mapStyle.top); 
        //Solve the problem that error appears with canvas drawing in ie||mobile device.
        if(SuperMap.Browser.name === 'msie'){
            var context = {
                layer: this,
                position: position,
                image: image,
                mapStyle: mapStyle
            };    
            var _drawCanvasIE = SuperMap.Function.bind(this.drawCanvasIE, context);
            window.setTimeout(_drawCanvasIE,100);
        }else{
            //Draw the image through position to solve the white line
            this.drawCanvasTile2(image, position.x + left, position.y + top);
        }
    },

    /**
     * Method: drawImgData
     * Draw imgdata string in canvas
     * 
     * Parameters:
     * imgData - {<String>} The imgdata string
     * p - {<SuperMap.Pixel>} The location of tile.
     */
    drawImgData:function(imgData,p){
        var mapStyle = this.map.layerContainerDiv.style;
        var left = parseInt(mapStyle.left),
            top = parseInt(mapStyle.top);
//        this.canvasContext.putImageData(imgData, p.x+left, p.y+top);
    },
    

    drawCanvasIE:function(){
        this.layer.drawCanvasTile2(this.image, this.position.x + parseInt(this.mapStyle.left), this.position.y + parseInt(this.mapStyle.top));
    },
    shaderProgram:null,
    /**
     * Method: drawCanvasTile2
     * Display the image to canvas.
     * 
     * Parameters:
     * image - {<Image>} The tile object to be drawn
     * positionX - {Number} The x coordinate of tile in canvas
     * positionY - {Number} The y coordinate of tile in canvas
     * clear - {boolean} Whether to clear again.
     */
    drawCanvasTile2: function(image, positionX, positionY, clear){
        clear = clear || true;
        if(image){
            var gl =  this.canvasContext;
            var shaderProgram;
            if(true)
            {
                //Initialize the renderer
                var fragmentShader = this.getShader(gl, "fragment");
                var vertexShader = this.getShader(gl, "vertex");

                shaderProgram = gl.createProgram();
                gl.attachShader(shaderProgram, vertexShader);
                gl.attachShader(shaderProgram, fragmentShader);
                gl.linkProgram(shaderProgram);

                if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                    alert("Could not initialise shaders");
                }

                gl.useProgram(shaderProgram);

                shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
                gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

                shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
                gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

                shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
                shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
                shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
            }

            //Calculate the tile location
            var cubeVertexPositionBuffer00 = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer00);
            var w = gl.viewportWidth;
            var h = gl.viewportHeight;
            var nScale;
            if(w >= h)
            {
                nScale = this.tileSize.h/h;
            }
            else
            {
                nScale = this.tileSize.h/w;
            }
            //Define the matrix that the 256*256 rectangle is in
            var vertices = [
                -1*nScale, -1*nScale,  0,
                1*nScale, -1*nScale,  0,
                1*nScale,  1*nScale,  0,
                -1*nScale,  1*nScale,  0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            cubeVertexPositionBuffer00.itemSize = 3;
            cubeVertexPositionBuffer00.numItems = 4;

            var cubeVertexTextureCoordBuffer00 = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer00);
            var textureCoords = [
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
            cubeVertexTextureCoordBuffer00.itemSize = 2;
            cubeVertexTextureCoordBuffer00.numItems = 4;

            var cubeVertexIndexBuffer00 = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer00);
            var cubeVertexIndices = [
                0, 1, 2,      0, 2, 3
            ];
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
            cubeVertexIndexBuffer00.itemSize = 1;
            cubeVertexIndexBuffer00.numItems = 6;

            //Add the image
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

            var pMatrix = mat4.create();
            var mvMatrix = mat4.create();
            mat4.perspective(90, gl.viewportWidth / gl.viewportHeight, 1, 100.0, pMatrix);

            mat4.identity(mvMatrix);
            //Pan
            var x = (positionX - w/2 )*2*nScale/this.tileSize.h + nScale;
            var y = (h/2 - positionY)*2*nScale/this.tileSize.h - nScale;
            mat4.translate(mvMatrix, [x, y, -1.0]);

            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer00);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer00.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer00);
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer00.itemSize, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(shaderProgram.samplerUniform, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer00);
            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
            gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer00.numItems, gl.UNSIGNED_SHORT, 0);
        }
    },
    /**
     * Method: getShader
     * Initialize the shader
     *
     * Parameters:
     * gl - {<WebGLRenderingContext>} The context of webgl
     * name - {String} can be “fragment” or “vertex”
     */
    getShader:function(gl,name){
        var shader;
        var str = "";
        if(name == "fragment" )
        {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            str = "precision mediump float;    varying vec2 vTextureCoord;    uniform sampler2D uSampler;void main(void){gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));}";
        }
        else if(name == "vertex" )
        {
            shader = gl.createShader(gl.VERTEX_SHADER);
            str = "attribute vec3 aVertexPosition;    attribute vec2 aTextureCoord;    uniform mat4 uMVMatrix;    uniform mat4 uPMatrix;    varying vec2 vTextureCoord;    void main(void) {    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);    vTextureCoord = aTextureCoord;    }";
        }
        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    },

    /**
     * Method: resetCanvas
     * Move the canvas to original point. Clear all things in the canvas 
     */
    resetCanvas: function() {            
        // because the layerContainerDiv has shifted position (for non canvas layers), reposition the canvas.
        if (this.redrawCanvas) {
            this.redrawCanvas = false;
            // clear canvas by reseting the size
            // broken in Chrome 6.0.458.1:
            // http://code.google.com/p/chromium/issues/detail?id=49151
            this.canvas.width = this.map.viewPortDiv.clientWidth;
            this.canvas.height = this.map.viewPortDiv.clientHeight;
            this.canvasContext.viewportWidth = this.canvas.width;
            this.canvasContext.viewportHeight = this.canvas.height;

            //Clear webgl
            this.canvasContext.clearColor(0.0, 0.0, 0.0, 0);
            this.canvasContext.enable(this.canvasContext.DEPTH_TEST);
            this.canvasContext.viewport(0, 0, this.canvasContext.viewportWidth, this.canvasContext.viewportHeight);
            this.canvasContext.clear(this.canvasContext.COLOR_BUFFER_BIT | this.canvasContext.DEPTH_BUFFER_BIT);
            if (this.useCanvas) {
                // store the current resolution and canvas position for transition
                this.lastResolution = this.map.getResolution(); 
            }
            return true;
        }
        return false;
    },
    
    //Override the initGriddedTiles in grid
    initGriddedTiles:function(bounds) {
        this.isZoomming = false;
        SuperMap.Layer.Grid.prototype.initGriddedTiles.apply(this,arguments);
        this.lenRow = this.grid.length;
        this.lenColumn = this.grid[0].length;
    },
    
    /**
     * Method: getLayerPxFromLonLat
     * A wrapper for the <SuperMap.Map.getLayerPxFromLonLat()> method,
     * which takes into account that the canvas element has a fixed size and 
     * it always moved back to the original position.
     * 
     * Parameters:
     * lonlat - {<SuperMap.LonLat>}longitude and latitude
     *
     * Returns:
     * {<SuperMap.Pixel>} The pixel point
     */
    getLayerPxFromLonLat: function(lonlat) {
        return this.usesCanvas ? this.map.getPixelFromLonLat(lonlat) : 
            this.map.getLayerPxFromLonLat(lonlat);
    },
    
    /**
     * Method: getLayerPxFromLonLat
     * A wrapper for the <SuperMap.Map.getViewPortPxFromLayerPx()> method.
     * 
     * Parameters:
     * layerPx - {<SuperMap.Pixel>}
     * 
     * Returns:
     * {<SuperMap.Pixel>}
     */ 
    getViewPortPxFromLayerPx: function(layerPx) {
        return this.useCanvas ? layerPx : this.map.getViewPortPxFromLayerPx(layerPx);
    },
    
    /**
     * Method: getURL
     * Get the URL of tiles.
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}  The bounds of tiles.
     *
     * Returns:
     * {String} The URL of tiles.
     */
    getURL: function (bounds) {
        var me = this,
            xyz;
        bounds = me.adjustBounds(bounds);
        xyz = me.getXYZ(bounds);
        return me.getTileUrl(xyz);
    },
    
    /**
     * Method: getXYZ
     * According to the bounds of tile, get the xyz values.
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}  The bounds of tiles.
     *
     * Returns:
     * {Object} A set of key value pairs, represent the indexes in tile X, Y and Z directions.
     */
    getXYZ: function (bounds) {
        var me = this,
            x, y, z,
            map = me.map,
            res = map.getResolution(),
            tOrigin = me.getTileOrigin(),
            tileSize = me.tileSize;
        x = Math.round((bounds.left - tOrigin.lon) / (res * tileSize.w));
        y = Math.round((tOrigin.lat - bounds.top) / (res * tileSize.h));
        z = map.getZoom();
        return {"x": x, "y": y, "z": z};
    },
    
    /**
     * Method: getMemoryImg
     * Get the image of this record according to the tile bounds.
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}  The bounds of tiles.
     *
     * Returns:
     * {Object} image object. If not exist, return null
     */
    getMemoryImg: function(bounds){
        var me = this, key = me.getXYZ(bounds);
        key = "x" + key.x + "y" + key.y + "z" + key.z;
        return me.memoryImg[key];
    },
    
    /**
     * Method: addMemoryImg
     * Record the tile bounds and the corresponding image information.
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}  The bounds of tile.
     * image - {<Image>} The image information corresponding to the tiles
     *
     */
    addMemoryImg:function(bounds, image, context){

        var me = this;// key = me.getXYZ(bounds);

        if(me.bufferImgCount == 0)
            return;

        var newImgTag = context.newImgTag;
        if(newImgTag&&newImgTag!=""){
            //Delete the cache images
            if(me.memoryKeys.length >= me.bufferImgCount){
                var keyDel = me.memoryKeys.shift();
                me.memoryImg[keyDel] = null;
                delete me.memoryImg[keyDel];
            }
            var keys = newImgTag.split("_");
            var key = "x" + keys[0] + "y" + keys[1] + "z" + keys[2];
            //Cache tiles and save the index.
            me.memoryImg[key] = image;
            me.memoryKeys.push(key);
        }
    },
    
    /** 
     * Method: initResolutions
     * Initialize the Resolutions array.
     */
    initResolutions: function () {
                
        var me = this, 
            i, len, p, startZoomLevel,
            props = {}, 
            alwaysInRange = true;
        
        //If resolutions and scales are defined in layer, use the resolutions and scales of layer directly, and //calculate maxResolution, minResolution, numZoomLevels, maxScale and minScale
        if (me.resolutions && me.scales) {
            var len = me.resolutions.length;
            me.resolutions.sort(function(a, b) {
                return (b - a);
            });
            if (!me.maxResolution) {
                me.maxResolution = me.resolutions[0];
            }

            if (!me.minResolution) {
                me.minResolution = me.resolutions[len-1];
            }
            me.scales.sort(function(a, b) {
                return (a - b);
            });
            if (!me.maxScale) {
                me.maxScale = me.scales[len-1];
            }

            if (!me.minScale) {
                me.minScale = me.scales[0];
            }
            me.numZoomLevels = len;
            return;
        }

        // Get the data to calculate the resolutions from layer configuration.
        for (i = 0, len = me.RESOLUTION_PROPERTIES.length; i < len; i++) {
            p = me.RESOLUTION_PROPERTIES[i];
            props[p] = me.options[p];
            if (alwaysInRange && me.options[p]) {
                alwaysInRange = false;
            }
        }
        
        if (me.alwaysInRange == null) {
            me.alwaysInRange = alwaysInRange;
        }
        
        // If there is not resolutions, use scales to calculate resolutions.
        if (props.resolutions == null) {
            props.resolutions = me.resolutionsFromScales(props.scales);
        }

        // If there is no resolutions, use layer configuration to set
        //maxResolution,minResolution, numZoomLevels, maxZoomLevel Calculate the resolutions
        if (props.resolutions == null) {
            props.resolutions = me.calculateResolutions(props);
        }
        
        //If you can get resolutions from layer configuration, and resolutions and scales are set in map, use them directly.
        //Calculate maxResolution, minResolution, numZoomLevels, maxScale and minScale
        if (me.map.resolutions && me.map.scales) {
            me.resolutions = me.map.resolutions;
            me.scales = me.map.scales;
            var len = me.resolutions.length;
            me.resolutions.sort(function(a, b) {
                return (b - a);
            });
            if (!me.maxResolution) {
                me.maxResolution = me.resolutions[0];
            }

            if (!me.minResolution) {
                me.minResolution = me.resolutions[len-1];
            }
            me.scales.sort(function(a, b) {
                return (a - b);
            });
            if (!me.maxScale) {
                me.maxScale = me.scales[len-1];
            }

            if (!me.minScale) {
                me.minScale = me.scales[0];
            }
            me.numZoomLevels = len;
            return;
        }
        
        //If this is still not calculated resolutions, then the first access from the baselayer, followed by map (method above), and finally calculated.
        if (props.resolutions == null) {
            for (i = 0, len = me.RESOLUTION_PROPERTIES.length; i<len; i++) {
                p = me.RESOLUTION_PROPERTIES[i];
                props[p] = me.options[p] != null ?
                    me.options[p] : me.map[p];
            }
            if (props.resolutions == null) {
                props.resolutions = me.resolutionsFromScales(props.scales);
            }
            if (props.resolutions == null) {
                if(me.map.baseLayer!=null){
                    props.resolutions = me.map.baseLayer.resolutions;
                }
            }            
            if (props.resolutions == null) {
                props.resolutions = me.calculateResolutions(props);
            }
        }

        var maxRes;
        if (me.options.maxResolution && me.options.maxResolution !== "auto") {
            maxRes = me.options.maxResolution;
        }
        if (me.options.minScale) {
            maxRes = SuperMap.Util.getResolutionFromScaleDpi(me.options.minScale, me.dpi, me.units, me.datumAxis);
        }

        var minRes;
        if (me.options.minResolution && me.options.minResolution !== "auto") {
            minRes = me.options.minResolution;
        }
        if (me.options.maxScale) {
            minRes = SuperMap.Util.getResolutionFromScaleDpi(me.options.maxScale, me.dpi, me.units, me.datumAxis);
        }

        if (props.resolutions) {

            props.resolutions.sort(function(a, b) {
                return (b - a);
            });
            
            if (!maxRes) {
                maxRes = props.resolutions[0];
            }

            if (!minRes) {
                var lastIdx = props.resolutions.length - 1;
                minRes = props.resolutions[lastIdx];
            }
        }

        me.resolutions = props.resolutions;
        if (me.resolutions) {
            len = me.resolutions.length;
            me.scales = [len];
            if(me.map.baseLayer){
                startZoomLevel = this.calculateResolutionsLevel(me.resolutions);
            }
            else{
                startZoomLevel = 0;
            }
            for (i = startZoomLevel; i < len + startZoomLevel; i++) {
                me.scales[i] = SuperMap.Util.getScaleFromResolutionDpi(me.resolutions[i- startZoomLevel], me.dpi, me.units, me.datumAxis);
            }
            me.numZoomLevels = len;
        }
        me.minResolution = minRes;
        if (minRes) {
            me.maxScale = SuperMap.Util.getScaleFromResolutionDpi(minRes, me.dpi, me.units, me.datumAxis);
        }
        me.maxResolution = maxRes;
        if (maxRes) {
            me.minScale = SuperMap.Util.getScaleFromResolutionDpi(maxRes, me.dpi, me.units, me.datumAxis);
        }
    },
    
    /** 
     * Method: calculateResolutionsLevel
     * Calculate the scale array according to the resolutions array.
     *
     * Parameters:
     * resolutions - {Array({Number})}resolutions array.
     */
    calculateResolutionsLevel: function(resolutions){
        var me = this, j, len, resolution,
                 baseLayerResolutions;
        baseLayerResolutions = me.map.baseLayer.resolutions;
        len = baseLayerResolutions.length;
        resolution = resolutions[0];
        for(j=0; j<len; j++){
            if(resolution == baseLayerResolutions[j]){
                return j;
            }
        }
        return 0;
    },

    /** 
     * Method: resolutionsFromScales
     * Calculate the resolutions array according to the scales array.
     *
     * Parameters:
     * scales - {Array({Number})}scales array.
     */
    resolutionsFromScales: function (scales) {
        if (scales == null) {
            return;
        }
        var me = this,
            resolutions, len;
        len = scales.length;
        resolutions = [len];
        for (var i = 0; i < len; i++) {
            resolutions[i] = SuperMap.Util.getResolutionFromScaleDpi(
            scales[i], me.dpi, me.units, me.datumAxis);
        }
        return resolutions;
    },
    
    /**
     * Method: calculateResolutions
     * Calculate the resolutions array according to the provided attributes.
     *
     * Parameters:
     * props - {Object} 
     *
     * Return:
     * {Array({Number})} resolutions array.
     */
    calculateResolutions: function (props) {
        var me = this,
            maxResolution = props.maxResolution;
        if (props.minScale != null) {
            maxResolution = SuperMap.Util.getResolutionFromScaleDpi(props.minScale, me.dpi, me.units, me.datumAxis);
        } else if (maxResolution == "auto" && me.maxExtent != null) {
            var viewSize, wRes, hRes;
            viewSize = me.map.getSize();
            wRes = me.maxExtent.getWidth() / viewSize.w;
            hRes = me.maxExtent.getHeight() / viewSize.h;
            maxResolution = Math.max(wRes, hRes);
        }

        var minResolution = props.minResolution;
        if (props.maxScale != null) {
            minResolution = SuperMap.Util.getResolutionFromScaleDpi(props.maxScale, me.dpi, me.units, me.datumAxis);
        } else if (props.minResolution == "auto" && me.minExtent != null) {
            var viewSize, wRes, hRes;
            viewSize = me.map.getSize();
            wRes = me.minExtent.getWidth() / viewSize.w;
            hRes = me.minExtent.getHeight()/ viewSize.h;
            minResolution = Math.max(wRes, hRes);
        }

        if(typeof maxResolution !== "number" &&
            typeof minResolution !== "number" &&
            this.maxExtent != null) {
            // maxResolution for default grid sets assumes that at zoom
            // level zero, the whole world fits on one tile.
            var tileSize = this.map.getTileSize();
            maxResolution = Math.max(
                this.maxExtent.getWidth() / tileSize.w,
                this.maxExtent.getHeight() / tileSize.h
            );
        }

        var maxZoomLevel = props.maxZoomLevel;
        var numZoomLevels = props.numZoomLevels;
        if (typeof minResolution === "number" &&
            typeof maxResolution === "number" && numZoomLevels === undefined) {
            var ratio = maxResolution / minResolution;
            numZoomLevels = Math.floor(Math.log(ratio) / Math.log(2)) + 1;
        } else if (numZoomLevels === undefined && maxZoomLevel != null) {
            numZoomLevels = maxZoomLevel + 1;
        }

        if (typeof numZoomLevels !== "number" || numZoomLevels <= 0 ||
            (typeof maxResolution !== "number" &&
               typeof minResolution !== "number")) {
            return;
        }

        var resolutions = [numZoomLevels];
        var base = 2;
        if (typeof minResolution == "number" && typeof maxResolution == "number") {
            base = Math.pow(
                    (maxResolution / minResolution),
                (1 / (numZoomLevels - 1))
            );
        }

        if (typeof maxResolution === "number") {
            for (var i = 0; i < numZoomLevels; i++) {
                resolutions[i] = maxResolution / Math.pow(base, i);
            }
        } else {
            for (i = 0; i < numZoomLevels; i++) {
                resolutions[numZoomLevels - 1 - i] =
                    minResolution * Math.pow(base, i);
            }
        }

        return resolutions;
    },
    
    CLASS_NAME: "SuperMap.Layer.WebGLLayer"

});
