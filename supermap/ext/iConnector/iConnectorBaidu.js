/**
 * Created with JetBrains WebStorm.
 * User: liuyayun
 * Date: 13-5-27
 * Time: 10:06am
 * To change this template use File | Settings | File Templates.
 */
//Determine if there is a SuperMap.Web, if there is no then initialization
if(SuperMap.Web == undefined )
{
    SuperMap.Web = new Object();
}
//Determine if there is a SuperMap.Web.iConnector,if there is no then initialization
if(SuperMap.Web.iConnector == undefined )
{
    SuperMap.Web.iConnector = new Object();
}
/**
 * Class:
 * Baidu adapter class
 * @constructor
 */
SuperMap.Web.iConnector.Baidu = function(){

}

/**
 * Method:
 * Loads an external script that is used to send a service request
 * @param xyUrl Request URL
 * @param callback  Callback function
 */
SuperMap.Web.iConnector.Baidu.load_script = function(xyUrl, callback){
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = xyUrl;
    //Refer to cross domain method of jQuery
    script.onload = script.onreadystatechange = function(){
        if((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")){
            callback && callback();
            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;
            if ( head && script.parentNode ) {
                head.removeChild( script );
            }
        }
    };
    // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
    head.insertBefore( script, head.firstChild );
}
/**
 * Property:
 * Record request times to the Baidu server for point coordinate conversion,for server positioning callback function after processing
 * @type {number} Each request a server, will automatically add
 */
SuperMap.Web.iConnector.Baidu.eventsCounts = 0;
/**
* Method:
* send a coordinate conversion request to the Baidu server, a one-time maximum of 20 points to support (Baidu server limit)
* points {Array} @param BMap.Point array
* type {Number} @param Number 0 on behalf of the GPS coordinates to Baidu coordinates; 2 on behalf of the Google coordinates to Baidu coordinates
* @param ID  Uniquely identifies the points corresponding to the array.
* /
SuperMap.Web.iConnector.Baidu.transMore = function(points,type,id){
    var xyUrl = "http://api.map.baidu.com/ag/coord/convert?from=" + type + "&to=4&mode=1";
    var xs = [];
    var ys = [];
    var maxCnt = 20;//send a coordinate conversion request to the Baidu server, a one-time maximum of 20 points to support 
    var send = function(){
        //Automatically add to callback function position
        SuperMap.Web.iConnector.Baidu.eventsCounts++;
        var url = xyUrl + "&x=" + xs.join(",") + "&y=" + ys.join(",") + "&callback=window.SuperMap.Web.iConnector.Baidu.callbackFunction" + SuperMap.Web.iConnector.Baidu.eventsCounts;
        //SuperMap.Web.iConnector.Baidu.eventsCounts  Sure every time in the accumulation, not the same, but the ID may be the same, the point of 20 data points, there may be a point in the array which is more than 20
        //Batch conversion,Belonging to an array of points, so ID will be the same, to facilitate the completion of their full conversion together
        var str = "window.SuperMap.Web.iConnector.Baidu.callbackFunction" +SuperMap.Web.iConnector.Baidu.eventsCounts + "=function(points){SuperMap.Web.iConnector.Baidu.circulatePointSend(points," + type+"," + id+ "); }";
        //Dynamically create callback function
        eval(str);
        //Dynamically create script lable
        SuperMap.Web.iConnector.Baidu.load_script(url);
        xs = [];
        ys = [];
    }
    for(var index in points){
        if(index % maxCnt == 0 && index != 0){
            send();
        }
        xs.push(points[index].lng);
        ys.push(points[index].lat);
        if(index == points.length - 1){
            send();
        }
    }
}

/**
 * APIMethod:
 * Create a Baidu TileLayer,the TileLayer source is iserver
 * @param url  {String}  Map service URL address, such as:“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options Optional parameter
 * transparent - {Boolean} Set the slice is transparent, the default is true
 * cacheEnabled - {Boolean} Set whether to use the cache, the default is false
 * layersID - {String} Set the temporary layer of ID, the general use of thematic maps
 * @returns {BMap.TileLayer} Return BMap.TileLayer object
 */
SuperMap.Web.iConnector.Baidu.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }

    var tileLayer = new BMap.TileLayer();
    var layerUrl = url + "/image.png?redirect=false&width=256&height=256";

    //Whether the slice is transparent
    var transparent = true;
    if(options && options.transparent !=undefined)
    {
        transparent = options.transparent;
    }
    layerUrl += "&transparent=" + transparent;

    //Whether to use cache
    var cacheEnabled = false;
    if(options && options.cacheEnabled !=undefined)
    {
        cacheEnabled = options.cacheEnabled;
    }
    layerUrl += "&cacheEnabled=" + cacheEnabled;

    //If there is layersID,it is using thematic map
    if(options && options.layersID !=undefined)
    {
        layerUrl += "&layersID=" +options.layersID;
    }
    //Calculate resolution array

    var res = Math.pow(2,17);
    var resAry= [];
    for (var i = 0; i < 17; i++)
    {
        resAry[i] = res;
        res *= 0.5;
    }
    //Calculate scale array
    var scaAry = [];
    for(var i = 0;i<17;i++)
    {
        scaAry[i] = 0.0254/(96*resAry[i]);
    }
    //Re write Baidu tileLayer's getTilesUrl mathod
    tileLayer.getTilesUrl = function(tileCoord, zoom) {
        //Calculation section of the bounds range
        var left = tileCoord.x*256*resAry[zoom-1];
        var bottom = tileCoord.y*256*resAry[zoom-1];
        var right = (tileCoord.x + 1)*256*resAry[zoom-1];
        var top = (tileCoord.y + 1)*256*resAry[zoom-1];
        //Combine the bounds into the URL
        var myUrl = layerUrl + "&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";
        myUrl +=  "&scale=" + scaAry[zoom-1];
        //Only to 3857
        myUrl += "&prjCoordSys={\"epsgCode\":3857}";
        return myUrl;
    }
    return tileLayer;

}

/**
 * APIMethod:
 *  Converts points of other coordinate systems to points of Baidu map support
 * @param array Point array,support four point type：
 * 1、var points = [
 *                          {x:116.1,y:38.9},
 *                          {x:114.1,y:34.1}
 *                          ];
 * 2、var points = [
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          ];
 * 3、var points = [
 *                          new SuperMap.LonLat(116.1,38.9),
 *                          new SuperMap.LonLat(116.1,38.4)
 *                          ];
 * 4、var points = [
 *                          new BMap.Point(116.38,39.9),
 *                          new BMap.Point(116.38,39.9)
 *                          ];
 * @param projection  {SuperMap.Projection} The projection system for the conversion point (all points in the array must be uniform), the default is 4326
 * @param callback {Function}  Callback function tied with the callback function returns the converted point array in the form of an array
 * @param type {Number} Data in the internal conversion 4326 coordinates.When 0 representing data is standard GPS coordinates to the coordinates of the Baidu, when for two representative data is in accordance with the provisions of the State Bureau of Surveying and mapping the unified offset (China within the scope of the Google data being one of them) . The default value is 0
 */
SuperMap.Web.iConnector.Baidu.transferPoint = function(array,projection,callback,type){

    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        type = type || 0;
        var points = []
        //Several different situations, now only provide two
        for(var i = 0;i<array.length;i++)
        {
            var smPoint;
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.LonLat")
            {
                //Converted to standard coordinates of 4326
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].lon,array[i].lat),projection,new SuperMap.Projection("EPSG:4326"));

            }
            //Support for {x:118, y:38} and SuperMap.Geometry.Point in the form, as both exist in X and Y
            else if(array[i].x != undefined && array[i].y != undefined)
            {
                //Converted to standard coordinates of 4326
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].x,array[i].y),projection,new SuperMap.Projection("EPSG:4326"));

            }
            //Support BMap.Point form
            else if(array[i].lng != undefined && array[i].lat != undefined)
            {
                //Converted to standard coordinates of 4326
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].lng,array[i].lat),projection,new SuperMap.Projection("EPSG:4326"));

            }
            var point = new BMap.Point(smPoint.x,smPoint.y);
            points.push(point);
        }
        SuperMap.Web.iConnector.Baidu.callbackPointEventCounts++;
        SuperMap.Web.iConnector.Baidu.callbackPointEvent[SuperMap.Web.iConnector.Baidu.callbackPointEventCounts]=callback;
        //Initialize point array before conversion
        SuperMap.Web.iConnector.Baidu.startPointArray[SuperMap.Web.iConnector.Baidu.callbackPointEventCounts] = points;
        //Clear point array after conversion
        SuperMap.Web.iConnector.Baidu.endPointArray[SuperMap.Web.iConnector.Baidu.callbackPointEventCounts] = [];
        //Start converting
        SuperMap.Web.iConnector.Baidu.circulatePointSend(null,type,SuperMap.Web.iConnector.Baidu.callbackPointEventCounts);
    }
}

/**
 *  APIMethod:
 * Converts the line array of other coordinate systems to a line array of Baidu map support
 * @param array Line array,there are two types
 * 1、var lines = [new SuperMap.Geometry.LineString(
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          )];
 * 2、var lines = [new BMap.Polyline(
 *                          new BMap.Point(116.38,39.9),
 *                          new BMap.Point(116.38,39.9)
 *                          )];
 * @param projection  {SuperMap.Projection}  The coordinates of line that needs to be converted.
 * @param callback {Function} Callback function tied with  he callback function returns the converted line array in the form of an array
 * @param type {Number} Data in the internal conversion 4326 coordinates.When 0 representing data is standard GPS coordinates to the coordinates of the Baidu, when for two representative data is in accordance with the provisions of the State Bureau of Surveying and mapping the unified offset (China within the scope of the Google data being one of them) . The default value is 0
 */
SuperMap.Web.iConnector.Baidu.transferLine = function(array,projection,callback,type){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        type = type || 0;
        var lines = [];
        for(var i = 0;i<array.length;i++)
        {
            var pointsStart = [];
            var pointsEnd = [];
            //LineString supermap support 
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.Geometry.LineString")
            {
                pointsStart = array[i].components;
                for(var j = 0;j<pointsStart.length;j++)
                {
                    pointsEnd.push(SuperMap.Projection.transform(pointsStart[j],projection,new SuperMap.Projection("EPSG:4326")));
                }

            }
            //Support Baidu Polyline
            else if(array[i].constructor == BMap.Polyline)
            {
                pointsStart = array[i].getPath();
                for(var j = 0;j<pointsStart.length;j++)
                {
                    pointsEnd.push(SuperMap.Projection.transform(new SuperMap.Geometry.Point(pointsStart[j].lng,pointsStart[j].lat),projection,new SuperMap.Projection("EPSG:4326")));
                }
            }
            lines.push(pointsEnd);
        }
        SuperMap.Web.iConnector.Baidu.callbackLineEventCounts++;
        SuperMap.Web.iConnector.Baidu.callbackLineEvent[SuperMap.Web.iConnector.Baidu.callbackLineEventCounts]=callback;
        //Initialize line array before conversion
        SuperMap.Web.iConnector.Baidu.startLineArray[SuperMap.Web.iConnector.Baidu.callbackLineEventCounts] = lines;
        //Clear line array after conversion
        SuperMap.Web.iConnector.Baidu.endLineArray[SuperMap.Web.iConnector.Baidu.callbackLineEventCounts] = [];
        SuperMap.Web.iConnector.Baidu.circulateLineSend(null,type,SuperMap.Web.iConnector.Baidu.callbackLineEventCounts);
    }
}

/**
 *  APIMethod:
 * Converts the polygonal array of other coordinate systems to a polygonal array of Baidu map support
 * @param array Polygon array, support two forms:
 * 1、var polygons = [new SuperMap.Geometry.Polygon(
 *                          [new SuperMap.Geometry.LinearRing(
 *                                  new SuperMap.Geometry.Point(116.3786889372559,39.90762965106183),
 *                                  new SuperMap.Geometry.Point(116.38632786853032,39.90795884517671),
 *                                  new SuperMap.Geometry.Point(116.38534009082035,39.897432133833574),
 *                                  new SuperMap.Geometry.Point(116.37624058825688,39.89789300648029)
 *                                  )
 *                           ]
 *                        )];
 * 2、var polygons = [new BMap.Polygon(
 *                                  new BMap.Point(116.3786889372559,39.90762965106183),
 *                                  new BMap.Point(116.38632786853032,39.90795884517671),
 *                                  new BMap.Point(116.38534009082035,39.897432133833574),
 *                                  new BMap.Point(116.37624058825688,39.89789300648029)
 *                          )];
 * @param projection {SuperMap.Projection} The coordinates of a polygon that needs to be converted.
 * @param callback {Function} Callback function tied with  he callback function returns the converted polygon array in the form of an array
 * @param type {Number} Data in the internal conversion 4326 coordinates.When 0 representing data is standard GPS coordinates to the coordinates of the Baidu, when for two representative data is in accordance with the provisions of the State Bureau of Surveying and mapping the unified offset (China within the scope of the Google data being one of them) . The default value is 0
 */
SuperMap.Web.iConnector.Baidu.transferPolygon = function(array,projection,callback,type){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        type = type || 0;
        var polygons = [];
        for(var i = 0;i<array.length;i++)
        {
            var pointsStart = [];
            var pointsEnd = [];
            //Linestring supported by SuperMap
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.Geometry.Polygon")
            {
                pointsStart = array[i].getVertices(false);
                for(var j = 0;j<pointsStart.length;j++)
                {
                    pointsEnd.push(SuperMap.Projection.transform(pointsStart[j],projection,new SuperMap.Projection("EPSG:4326")));
                }

            }
            //Polygon supported by SuperMap
            else if(array[i].constructor == BMap.Polygon)
            {
                pointsStart = array[i].getPath();
                for(var j = 0;j<pointsStart.length;j++)
                {
                    pointsEnd.push(SuperMap.Projection.transform(new SuperMap.Geometry.Point(pointsStart[j].lng,pointsStart[j].lat),projection,new SuperMap.Projection("EPSG:4326")));
                }
            }
            polygons.push(pointsEnd);
        }
        SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts++;
        SuperMap.Web.iConnector.Baidu.callbackPolygonEvent[SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts]=callback;
        //Initialize polygon array before conversion
        SuperMap.Web.iConnector.Baidu.startPolygonArray[SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts] = polygons;
        //Clear polygon array after conversion
        SuperMap.Web.iConnector.Baidu.endPolygonArray[SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts] = [];
        SuperMap.Web.iConnector.Baidu.circulatePolygonSend(null,type,SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts);
    }
}

/**
 * Property:
 * Record point array before conversion
 * @type {Array}  BMap.Point array
 * Each data represent a Pidian array, each array composed with points.
 */
SuperMap.Web.iConnector.Baidu.startPointArray = [];
/**
 * Property:
 * Record point array after conversion
 * @type {Array}   BMap.Point array
 * Each data represent a Pidian array, each array composed with points.
 */
SuperMap.Web.iConnector.Baidu.endPointArray = [];
/**
 * Property:
 * Record point callback function array user registered
 * @type {Array} Callback function array
 */
SuperMap.Web.iConnector.Baidu.callbackPointEvent = [];
/**
 * Property:
 * For the record of the current array pads need to be converted
 * @type {number} The default is -1, there is a need to convert each array pads since 1
 */
SuperMap.Web.iConnector.Baidu.callbackPointEventCounts = -1;
/**
 * Method:
 * Callback function after each point convertion by server, which determines whether all points will be converted, if not then continue to convert
 * @param xyResults  Coordinates of a set of coordinates returned by the server
 * @param id On behalf of the conversion point is the point of the ID group, to avoid the callback function error
 * @param type {Number} Data in the internal conversion 4326 coordinates.When 0 representing data is standard GPS coordinates to the coordinates of the Baidu, when for two representative data is in accordance with the provisions of the State Bureau of Surveying and mapping the unified offset (China within the range of the Google data being one of them) . The default value is 0
 */
SuperMap.Web.iConnector.Baidu.circulatePointSend = function(xyResults,type,id){

    if(xyResults !=null)
    {
        for(var index in xyResults){
            xyResult = xyResults[index];
            if(xyResult.error != 0){continue;}//Error is returned directly;
            var resultPoint = new BMap.Point(xyResult.x, xyResult.y);
            SuperMap.Web.iConnector.Baidu.endPointArray[id].push(resultPoint);
        }
    }

    //If the point has been converted, then all points will be passed directly to the external user, or continue to convert.
    if(SuperMap.Web.iConnector.Baidu.startPointArray[id].length == 0)
    {
        SuperMap.Web.iConnector.Baidu.callbackPointEvent[id](SuperMap.Web.iConnector.Baidu.endPointArray[id],type,id);
    }
    else
    {
        var pots = [];
        if(SuperMap.Web.iConnector.Baidu.startPointArray[id].length>20)
        {
            pots = SuperMap.Web.iConnector.Baidu.startPointArray[id].splice(0,20);
        }
        else
        {
            pots = SuperMap.Web.iConnector.Baidu.startPointArray[id].splice(0,SuperMap.Web.iConnector.Baidu.startPointArray[id].length);
        }
        SuperMap.Web.iConnector.Baidu.transMore(pots,type,id);
    }

}

SuperMap.Web.iConnector.Baidu.startLineArray = [];
/**
 * Property:
 * Record line array after conversion
 * @type {Array}   BMap.Polyline array
 * Each data represent some BMap.Polyline array, each array composed with several BMap.Polyline.
 */
SuperMap.Web.iConnector.Baidu.endLineArray = [];
/**
 * Property:
 * Record line callback function array user registered
 * @type {Array} Callback function array
 */
SuperMap.Web.iConnector.Baidu.callbackLineEvent = [];
/**
 * Property:
 * For the record of the current line array pads need to be converted
 * @type {number} The default is -1, there is a need to convert each array pads since 1
 */
SuperMap.Web.iConnector.Baidu.callbackLineEventCounts = -1;
/**
 * Method:
 * Callback function after each line convertion by server, which determines whether all lineS will be converted, if not then continue to convert
 * @param xyResults  Coordinates of a set of coordinates returned by the server
 * @param id On behalf of the conversion line is the line of the ID group, to avoid the callback function error
 * @param type {Number} Data in the internal conversion 4326 coordinates.When 0 representing data is standard GPS coordinates to the coordinates of the Baidu, when for two representative data is in accordance with the provisions of the State Bureau of Surveying and mapping the unified offset (China within the range of the Google data being one of them) . The default value is 0
 */
SuperMap.Web.iConnector.Baidu.circulateLineSend = function(points,type,id){
    if(points !=null)
    {
        var line =new BMap.Polyline(points, {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});
        SuperMap.Web.iConnector.Baidu.endLineArray[id].push(line);
    }
    if(SuperMap.Web.iConnector.Baidu.startLineArray[id].length == 0)
    {
        SuperMap.Web.iConnector.Baidu.callbackLineEvent[id](SuperMap.Web.iConnector.Baidu.endLineArray[id]);
    }
    else
    {
        var pots = SuperMap.Web.iConnector.Baidu.startLineArray[id].splice(0,1);
        SuperMap.Web.iConnector.Baidu.transferPoint(pots[0],new SuperMap.Projection("EPSG:4326"),SuperMap.Web.iConnector.Baidu.circulateLineSend,type);
    }
}
/**
 * Property:
 * Record polygon array after conversion
 * @type {Array}   BMap.Polygon array
 * Each data represent some BMap.Polygon array, each array composed with several BMap.Polygon.
 */
SuperMap.Web.iConnector.Baidu.startPolygonArray = [];
/**
 * Property:
 * Record polygon array after conversion
 * @type {Array}   BMap.Polygon array
 * Each data represent some BMap.Polygon array, each array composed with several BMap.Polygon.
 */
SuperMap.Web.iConnector.Baidu.endPolygonArray = [];
/**
 * Property:
 * Record polygon callback function array user registered
 * @type {Array} Callback function array
 */
SuperMap.Web.iConnector.Baidu.callbackPolygonEvent = [];
/**
 * Property:
 * For the record of the current polygon array pads need to be converted
 * @type {number} The default is -1, there is a need to convert each array pads since 1
 */
SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts = -1;
/**
 * Method:
 * Callback function after each polygon convertion by server, which determines whether all polygon will be converted, if not then continue to convert
 * @param xyResults  Coordinates of a set of coordinates returned by the server
 * @param id On behalf of the conversion polygon is the polygon of the ID group, to avoid the callback function error
 * @param type {Number} Data in the internal conversion 4326 coordinates.When 0 representing data is standard GPS coordinates to the coordinates of the Baidu, when for two representative data is in accordance with the provisions of the State Bureau of Surveying and mapping the unified offset (China within the range of the Google data being one of them) . The default value is 0
 */
SuperMap.Web.iConnector.Baidu.circulatePolygonSend = function(points,type,id){
    if(points !=null)
    {
        var polygon =new BMap.Polygon(points, {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});
        SuperMap.Web.iConnector.Baidu.endPolygonArray[id].push(polygon);
    }
    if(SuperMap.Web.iConnector.Baidu.startPolygonArray[id].length == 0)
    {
        SuperMap.Web.iConnector.Baidu.callbackPolygonEvent[id](SuperMap.Web.iConnector.Baidu.endPolygonArray[id]);
    }
    else
    {
        var pots = SuperMap.Web.iConnector.Baidu.startPolygonArray[id].splice(0,1);
        SuperMap.Web.iConnector.Baidu.transferPoint(pots[0],new SuperMap.Projection("EPSG:4326"),SuperMap.Web.iConnector.Baidu.circulatePolygonSend,type);
    }
}











