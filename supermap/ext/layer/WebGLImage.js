/* COPYRIGHT 2012 SUPERMAP
 * This procedure can only be used under the effective authorization.
 * Without permission, may not be used in any way*/

 /**
 * @requires SuperMap/Tile.js
 */
 
/**
 * Class: SuperMap.Tile.WebGLImage
 * Tile mosaic (webgl).
 * Used to manage the layer image mosaic.
 *
 * Inherits from:
 *  - <SuperMap.Tile>
 */
 
SuperMap.Tile.WebGLImage = SuperMap.Class(SuperMap.Tile, {

    /** 
     * Property: url
     * {String} The URL of the image being requested. No default. Filled in by
     * layer.getURL() function.
     * Picture url.
     */
    url: null,
    
    /** 
     * Property: newImgTag
     * {String} The image label request by tile.
     */
    newImgTag:null,
    
    /** 
     * Property: canvasType
     */    
    canvasType: null,
    
    /**
     * Property: frame
     * {DOMElement} The canvas element is appended to the frame.  Any gutter on
     * the canvas will be hidden behind the frame. 
     */ 
    frame: null,
    
    /**
     * Property: isLoading
     * {Boolean} Indicates if the tile is currently waiting on a loading image. 
     */ 
    isLoading: false,
    
    /** 
     * Property: canvas
     * {DOMElement} The canvas element on which the image is drawn.
     */
    canvas: null,
    
    /** 
     * Property: lastImage
     * {Image} The last requested image object. This property is used to make sure
     *      that only the recent image is drawn.
     */
    lastImage: null,
    
    /** 
     * Property: lastBounds
     * {<SuperMap.Bounds>} The bounds of the last requested image, needed for 
     *      VirtualCanvasImage.displayImage().
     */
    lastBounds: null,
    
    /**
     * Property: isBackBuffer
     * {Boolean} Is this tile a back buffer tile?
     */
    isBackBuffer: false,
        
    /**
     * Property: backBufferTile
     * {<SuperMap.Tile>} A clone of the tile used to create transition
     *     effects when the tile is moved or changes resolution.
     */
    backBufferTile: null,
    
     /**
     * Property: fadingTimer
     * {Number} Record the index ID of fading animation
     *
     */
    fadingTimer:null,

    /**
     * Constructor: SuperMap.Tile.WebGLImage
     * Tile mosaic class.
     * 
     * Parameters:
     * layer - {<SuperMap.Layer>} The layer contain tile.
     * position - {<SuperMap.Pixel>} Point on top left.
     * bounds - {<SuperMap.Bounds>} Tile size.
     * url - {<String>} url address corresponding to tile.
     * size - {<SuperMap.Size>} Tile size.
     * canvasType -
     */   
    initialize: function(layer, position, bounds, url, size, canvasType) {
        var me = this;
        SuperMap.Tile.prototype.initialize.apply(me, arguments);
        me.url = url; //deprecated remove me
        me.canvasType = canvasType;        
        me.events.addEventType("reprojectionProgress");
        me.events.addEventType("filterProgress");
    },

    /** 
     * APIMethod: destroy
     * Destruct the WebGLImage class, and release the resources.
     */
    destroy: function() {
        SuperMap.Tile.prototype.destroy.apply(this, arguments);
        var me = this;
        me.lastImage = null;
        me.canvas = null;
        me.canvasContext = null;
        // clean up the backBufferTile if it exists
        if (me.backBufferTile) {
            me.backBufferTile.destroy();
            me.backBufferTile = null;
            me.layer.events.unregister("loadend", me, me.hideBackBuffer);
        }
    },

    /**
     * Method: clone
     * Create the copy of the current class.
     * Parameters:
     * obj - {<SuperMap.Tile.Image>} The tile to be cloned
     *
     * Returns:
     * {<SuperMap.Tile.Image>} An exact clone of this <SuperMap.Tile.WebGLImage>
     */
    clone: function (obj) {
        var me = this;
        if (obj == null) {
            obj = new SuperMap.Tile.WebGLImage(me.layer,
                                            me.position, 
                                            me.bounds, 
                                            me.url, 
                                            me.size,
                                            me.canvasType);        
        } 
        //pick up properties from superclass
        obj = SuperMap.Tile.prototype.clone.apply(me, [obj]);
        // a new canvas element should be created for the clone
        obj.canvas = null;
        return obj;
    },
    
    /**
     * Method: draw
     * Check that a tile should be drawn, and draw it. Starts a
     * transition if the layer requests one.
     * 
     * Returns:
     * {Boolean} Always returns true.
     */
    draw: function() {
        var me = this;
        if (me.layer != me.layer.map.baseLayer && me.layer.reproject) {
            me.bounds = me.getBoundsFromBaseLayer(me.position);
        }
        var drawTile = SuperMap.Tile.prototype.draw.apply(me, arguments);
        me.startTransition(drawTile);
        if (!drawTile) {
            return;
        }
        if (me.isLoading) {
            // if we're already loading, send 'reload' instead of 'loadstart'.
            me.events.triggerEvent("reload"); 
        } else {
            me.isLoading = true;
            me.events.triggerEvent("loadstart");
        }
        return me.renderTile();  
    },
    
    /**
     * Method: startTransition
     * Creates a backbuffer tile (if it does not exist already)
     * and then displays this tile. 
     * 
     * Parameters:
     * drawTile - {<Boolean>} Should the tile be drawn?
     */
    startTransition: function(drawTile) {
        // <SuperMap.CanvasLayer.> takes care about the transition  
    },
    
    /**
     * Method: renderTile
     * Creates the canvas element and sets the URL.
     * 
     * Returns:
     * {Boolean} Always returns true.
     */
    renderTile: function() {
        var me = this;    
        me.url = me.layer.getURL(me.bounds);
        me.positionImage(); 
        return true;
    },
    
    /**
     * Method: createImage
     * Creates the image and starts loading it.
     */
    createImage: function() {      
    
        if (this.lastImage !== null && !this.lastImage.complete) {
            // When pan many times, it won't request the image. Does not support chrome. https://bugs.webkit.org/show_bug.cgi?id=35377
            this.lastImage.src = '';
        }            
        
        //Check it whether saved in the memory
        var me = this, image = me.layer.getMemoryImg(me.bounds);        
        me.lastBounds = me.bounds.clone();        
        if (image) {
            me.newImgTag = "";
            //Find and dispaly
            me.lastImage = image;
            me.layer.drawCanvasTile(image, me.position);
            if(me.firstInView){
                me.setFirstInView();
            }
        } else {
            //Construct the image object
            var key = me.layer.getXYZ(me.bounds);
            //If you use andriod to load, the url should be set again. Or it will load directly.
            if (!SuperMap.isApp) {
                me.newImgTag = key.x + "_" + key.y + "_" + key.z;
                me.loadTileImage();
            } else{
                var strX = key.x,
                    strY = key.y,
                    strZ;
                if(me.layer instanceof SuperMap.Layer.CloudLayer || me.layer.storageType=="db"){
                    strZ = key.z;
                } else{
                    strZ = me.layer.scales[key.z].toExponential();
                }
                var canvasImageContext = {
                    tile: me,
                    X: strX,
                    Y: strY,
                    Z: strZ,
                    viewRequestID: me.layer.map.viewRequestID
                };
                me.newImgTag = strX + "_" + strY + "_" + strZ;
                // var saveUrlProxy = function() {
                    // this.tile.onLoadsaveUrlFunction(this);
                // }
                me.lastImage = new Image();
        
        var methodName = me.getMethodName();
        var callBack = function(canvasImageContext,methodName){
            return function(r){
            window[methodName] = null;
            canvasImageContext.tile.onLoadsaveUrlFunction(canvasImageContext,r);
            }
        }(canvasImageContext,methodName);
        window[methodName] = callBack;
                /*window.plugins.localstoragemanager.getImg(me.url, me.layer.name, strX, strY, strZ,methodName,
                    function(){},
                    function(e){//errorfunction
                    }
                ); */
                cordova.exec(function(){}, function(e){}, "LocalStoragePlugin","getImg", [me.url, me.layer.name, strX, strY, strZ,methodName]);
            }
        }
    },
    
    getMethodName:function(){
    var dateTime=new Date();
    var yy=dateTime.getFullYear();
    var MM1=dateTime.getMonth()+1;  
    var dd=dateTime.getDate();
        var hh=dateTime.getHours();
        var mm=dateTime.getMinutes();
    var ss=dateTime.getSeconds();
    var ms = dateTime.getMilliseconds();
    
    var name = "getImgFromLocal_"+yy+MM1+dd+hh+mm+ss+ms+(Math.round(Math.random()*10000));
    return name;
    },
    
    //Reset local URL, and load the image
    onLoadsaveUrlFunction:function(canvasImageContext, r) {
        var me = this;
        var nowImgTag = r.x + "_" + r.y + "_" + r.z;
        if(me.newImgTag != nowImgTag){
            return;
        }
        if(r.data){
            if(r.data=="null"){
            return false;
            }
            var src = "data:image/jpeg;base64,"+r.data;
        }
        else{
            var src = me.layer.sdcardPath + "SuperMap/" + me.layer.name + "/" +
                        canvasImageContext.Z + "/" + canvasImageContext.X + "_" + canvasImageContext.Y + ".png";
        }
            me.url = src;
            me.loadTileImage();
    },
    
    /**
     * Method: loadTileImage
     * Load the image through url. Cache the loaded image
     */
    loadTileImage: function(){
        var me = this, 
            image = new Image();
        image.firstInView = true;
        me.lastImage = image;
        var context = { 
            image: image,
            tile: me,
            viewRequestID: me.layer.map.viewRequestID,
            newImgTag: me.newImgTag
            //bounds: me.bounds.clone()// todo: do we still need the bounds? guess no
            //urls: this.layer.url.slice() // todo: for retries?
        };
        
        var onLoadFunctionProxy = function() {
            if(this.tile.newImgTag == this.newImgTag){
                this.tile.onLoadFunction(this);    
            }
        };
        var onErrorFunctionProxy = function() {
            this.tile.onErrorFunction(this);
        };
            
        image.onload = SuperMap.Function.bind(onLoadFunctionProxy, context); 
        image.onerror = SuperMap.Function.bind(onErrorFunctionProxy, context);
        //After the image url is assigned to image, it will get the image from the server
        image.src = me.url;
    },
    
    /**
     * Method: positionImage
     * Sets the position and size of the tile's frame and
     * canvas element.
     */
    positionImage: function() {
        var me = this;
        // if the this layer doesn't exist at the point the image is
        // returned, do not attempt to use it for size computation
        if (!me.layer) {
            return;
        }
        me.createImage();
    },
    
    /**
     * Method: onLoadFunction  
     * Called when an image successfully finished loading. Draws the
     * image on the canvas.  After the image loaded successfully, it will draw on canvas
     * 
     * Parameters:
     * context - {<Object>} The context from the onload event.
     */
    onLoadFunction: function(context) {
        if ((this.layer === null) ||
                (context.viewRequestID !== this.layer.map.viewRequestID) ||
                (context.image !== this.lastImage)) {
            return;
        }
        this.canvasContext = null;
        var image = context.image;
        if(context.tile.shouldDraw){
            //Draw the image

            this.displayImage(image,context.newImgTag);
        }
        //Save the image caches
        this.layer.addMemoryImg(this.lastBounds, image, context);
    },

    /**
     * APIMethod: drawImgData
     *
     * To re draw after the pixel operation of the imgdata
     *
     * Parameters:
     * imgData - {<String>} canvas.toDataURL() The image string
     * evt - {<Object>}  The event object returned by the tileloaded event. layer.events.on({tileloaded: function(evt) {}})
     */
    drawImgData:function(imgData,evt){
        var m,idx=evt.idx;

        m = new Image();
        m.onload = function(me,m,idx){
            return function(){
                if(idx==me.newImgTag){
                    //m.firstInView = true;
                    me.lastImage = m;
                    me.layer.drawCanvasTile(m, me.position);
                }
            }
        }(this,m,idx);
        if(idx==this.newImgTag){
            m.src = imgData;
        }
    },
    

    
    /**
     * Method: displayImage
     * Takes care of resizing the canvas and then draws the 
     * canvas.
     * 
     * Parameters:
     * image - {Image/Canvas} The image to display
     * idx - {String} The marker of tile
     */
    displayImage: function(image,idx) {
        var me = this,
            layer = me.layer;
        if (layer.canvasFilter && !image.filtered) {
            // if a filter is set, apply the filter first and
            // then use the result
            me.filter(image);
            return;
        }

        if(image.firstInView){
            me.setFirstInView();
        }

        //Draw the image
        layer.fixPosition();
//        layer.drawCanvasTile(image, me.position);
        //Update the image status
        me.isLoading = false; 



        me.events.triggerEvent("loadend",{"idx":idx});
    },

    /**
     * Method: onErrorFunction
     * Called when an image finished loading, but not successfully. 
     * 
     * Parameters:
     * context - {<Object>} The context from the onload event.
     */    
    onErrorFunction: function(context) {
        var me = this;
        //The image failed to request. In case of errors of calling the canvasContext.drawImage method.
        if (context.image !== me.lastImage) {
            /* Do not trigger 'loadend' when a new image was request
             * for this tile, because then 'reload' was triggered instead
             * of 'loadstart'.
             * If we would trigger 'loadend' now, Grid would get confused about
             * its 'numLoadingTiles'.
             */
            return;
        }
        //retry? with different url?

        me._attempts = (me._attempts) ? (me._attempts + 1) : 1;
        if (me._attempts <= SuperMap.IMAGE_RELOAD_ATTEMPTS) {
            if (me.layer.url && SuperMap.Util.isArray(me.layer.url) && me.layer.url.length > 1){
                me.layer._attempts = me._attempts;
                me.draw();
                return ;
            }
        }else
        {
            me._attempts = 0;
        }
        
        me.events.triggerEvent("loadend");
    },
    /**
     * Method: setFirstInView
     *
     */
    setFirstInView: function(){
        var me = this;
        if(!me.fadingTimer){
            var context = {
                canvasImage:me,
                image: me.lastImage
            };
            me.fadingTimer = window.setTimeout(SuperMap.Function.bind(me.setNotFirstInView, context),100);
        }
    },
    /**
     * Method: setNotFirstInView
     *
     */
    setNotFirstInView: function(){
        var me = this;
       // me.lastImage.firstInView = false;
        me.image.firstInView = false;
        window.clearTimeout(me.canvasImage.fadingTimer);
        me.canvasImage.fadingTimer = null;
        me.canvasImage.displayImage(me.image);
    },
    /** 
     * Method: show
     * Show the tile. Called in <SuperMap.Tile.showTile()>.
     */
    show: function() {},
    
    /** 
     * Method: hide
     * Hide the tile.  To be implemented by subclasses (but never called).
     */
    hide: function() { },
 
    /** 
     * Method: isTooBigCanvas
     * Used to avoid that the backbuffer canvas gets too big when zooming in very fast.
     * Otherwise drawing the canvas would take too long and lots of memory would be
     * required. 
     */
    isTooBigCanvas: function(size) {
        return size.w > 5000;    
    },
    /**
     * Method: moveTo
     *
     */
    moveTo: function (bounds, position, redraw) {
        if (redraw == null) {
            redraw = true;
        }
        this.bounds = bounds.clone();
        this.position = position.clone();
        //Do not reset the canvas    
        this.layer.redrawCanvas = false;
        if (redraw) {
            this.draw();
        }
    },

    CLASS_NAME: "SuperMap.Tile.WebGLImage"
  });  
