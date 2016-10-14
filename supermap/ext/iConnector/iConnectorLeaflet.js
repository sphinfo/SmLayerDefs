/**
 * Created with JetBrains WebStorm.
 * User: liuyayun
 * Date: 13-5-27
 * Time: 3:06pm
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
 * Leaflet adapter class
 * @constructor
 */
SuperMap.Web.iConnector.Leaflet = function(){

}
/**
 *  APIMethod:
 *  Creat Leaflet layer L.tileLayer.canvas,the TileLayer source is iserver(only for 3857 map and 4326 map)
 *  (start code)
 *  //新建map
 *   map = L.map('map',{
 *            center: [0, 0],
 *             zoom:2,
 *           crs:L.CRS.EPSG4326   //Definition coordinate system
 *    });
 * //Add layer to map by following method
 * var  tileLayer=   SuperMap.Web.iConnector.Leaflet.getLayer(url,{projection:"4326"});
 * tileLayer.addTo(map);
 * (end)
 * @param url  {String}  Map service URL address, such as:“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options Optional parameter
 * transparent - {Boolean} Set the slice is transparent, the default is true
 * cacheEnabled - {Boolean} Set whether to use the cache, the default is false
 * layersID - {String} Set the temporary layer of ID, the general use of thematic maps
 * projection-{String}Set layer projection as "3857" or "4326",default is "3857"
 * @returns {Object} Return Leaflet object
 */
SuperMap.Web.iConnector.Leaflet.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }
    var layer = L.tileLayer.canvas();
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
    //If there has projection，it only can be 4326 or 3857 map。
    var projection="3857";
    if(options&&options.projection){
        if(options.projection==="4326"){
            projection="4326";
        }
    }
    layerUrl+="&projection="+projection;
    //Calculate resolution and scale
    var resLen = 17;
    var resStart = 0;
    var resolutions=[];
    var dpi = 95.99999999999984;
    var scales=[];

    if(projection==="3857"){
        for(var i=resStart;i<=resLen;i++){
            var res3857 = 156543.0339/Math.pow(2,i);
            resolutions.push(res3857);
            var scale3857 = 0.0254/dpi/res3857;
            scales.push(scale3857);
        }
        layer.scales=scales;
    }
    else{
        for(var i=resStart;i<=resLen;i++){
            var res4326 = 1.40625/Math.pow(2,i);
            resolutions.push(res4326);
            var scale4326 = 0.0254*360/dpi/res4326/Math.PI/2/6378137;
            scales.push(scale4326);
        }
        layer.scales=scales;
    }

    layer.url = layerUrl;

    layer.drawTile = function(canvas, tilePoint, zoom){

        var ctx = canvas.getContext('2d');
        var x = tilePoint.x;
        var y = tilePoint.y;
        var po = Math.pow(2,zoom);

         x-=po/2;
         y=po/2-y-1;
        //Output map bybounds(or use center)
         var left = x*256*resolutions[ zoom];
         var bottom = y*256*resolutions[zoom];
         var right = (x + 1)*256*resolutions[zoom];
         var top = (y + 1)*256*resolutions[zoom];
        //Combine the bounds into the URL
         tileUrl =this.url + "&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";

         tileUrl +="&scale=" +scales[zoom];
         var epsg=projection==="3857"?3857:4326;
         tileUrl += "&prjCoordSys={\"epsgCode\":"+epsg+"}";
         this.preImage(tileUrl,function(){
         ctx.drawImage(this,0,0,256,256);
         });
    }
    layer.preImage = function(url,callback){
        var img = new Image(); //Create a Image object, to achieve the image of the pre Download
        img.src = url;

        if (img.complete) { // If the image already exists in the browser cache, call the callback function directly.
            callback.call(img);
            return; // Return directly, do not handle the onload event
        }

        img.onload = function () { //mage download completed asynchronous call callback function.
            callback.call(img);//Replace the this of the callback function to the Image object
        };
    }
    return layer;
}
/**
 * APIMethod:
 *  Converts points of other coordinate systems to points of Leaflet support
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
 *                          new L.LatLng(39.9,116.38),
 *                          new L.LatLng(39.9,116.35)
 *                          ];
 * @param projection  {SuperMap.Projection} The projection system for the conversion point (all points in the array must be uniform), the default is 4326
 * @returns {Array} Return L.LatLng object array
 */
SuperMap.Web.iConnector.Leaflet.transferPoint = function(array,projection){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        var pro = projection || new SuperMap.Projection("EPSG:4326");
        var points = []
        //Several different situations, now only provide two
        for(var i = 0;i<array.length;i++)
        {
            var smPoint;
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.LonLat")
            {
                //Converted to standard coordinates of 4326
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].lon,array[i].lat),pro,new SuperMap.Projection("EPSG:4326"));

            }
            //Support for {x:118, y:38} and SuperMap.Geometry.Point in the form, as both exist in X and Y
            else if(array[i].x != undefined && array[i].y != undefined)
            {
                //Converted to standard coordinates of 4326
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].x,array[i].y),pro,new SuperMap.Projection("EPSG:4326"));

            }
            //Support form of leaflet L.LatLng
            else if(array[i].lat != undefined && array[i].lng != undefined)
            {
                //Converted to standard coordinates of 4326
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].lng,array[i].lat),projection,new SuperMap.Projection("EPSG:4326"));

            }
            var traPoint = SuperMap.Web.iConnector.Leaflet.transfer(smPoint.x,smPoint.y);
            var point = new L.LatLng(traPoint.lat,traPoint.lng);
            points.push(point);
        }
        return points;
    }
}
/**
 * APIMethod:
 * Converts the line array of other coordinate systems to a line array of leaflet support
 * @param array Line array,there are two types
 * 1. var lines = [new SuperMap.Geometry.LineString(
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          )];
 * 2. var lines = [new L.Polyline(
 *                              [
 *                                  new L.LatLng(39.9,116.38),
 *                                  new L.LatLng(39.4,116.38)
 *                              ]
 *                          )];
 * @param projection  {SuperMap.Projection}  The coordinates of line that needs to be converted.
 * @returns {Array} Return L.Polyline object array
 */
SuperMap.Web.iConnector.Leaflet.transferLine = function(array,projection){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        var pro = projection || new SuperMap.Projection("EPSG:4326");
        var lines = [];
        //Several different situations, now only provide two
        for(var i = 0;i<array.length;i++)
        {
            var line;
            //LineString supermap supports 
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.Geometry.LineString")
            {
                var points = SuperMap.Web.iConnector.Leaflet.transferPoint(array[i].components,pro);
                line = new L.Polyline(points);
            }
            //Support L.Polyline object
            else if(array[i].constructor == L.Polyline)
            {
                var points = SuperMap.Web.iConnector.Leaflet.transferPoint(array[i].getLatLngs(),pro);
                line = new L.Polyline(points);
            }

            lines.push(line);
        }
        return lines;
    }
}
/**
 *  APIMethod:
 * Converts the polygonal array of other coordinate systems to a polygonal array of leaflet support
 * @param array Polygon array, support two forms:
 * 1. var polygons = [new SuperMap.Geometry.Polygon(
 *                          [new SuperMap.Geometry.LinearRing(
 *                                  new SuperMap.Geometry.Point(116.3786889372559,39.90762965106183),
 *                                  new SuperMap.Geometry.Point(116.38632786853032,39.90795884517671),
 *                                  new SuperMap.Geometry.Point(116.38534009082035,39.897432133833574),
 *                                  new SuperMap.Geometry.Point(116.37624058825688,39.89789300648029)
 *                                  )
 *                           ]
 *                        )];
 * 2. var polygons = [new L.Polygon(
 *                                  [
 *                                      new L.LatLng(39.90762965106183,116.3786889372559),
 *                                      new L.LatLng(39.90795884517671,116.38632786853032),
 *                                      new L.LatLng(39.897432133833574,116.38534009082035),
 *                                      new L.LatLng(39.89789300648029,116.37624058825688)
 *                                  ]
 *                          )];
 * @param projection {SuperMap.Projection} The coordinates of a polygon that needs to be converted.
 * @returns {Array} Return L.Polygon object array
 */
SuperMap.Web.iConnector.Leaflet.transferPolygon = function(array,projection){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        var pro = projection || new SuperMap.Projection("EPSG:4326");
        var polygons = [];
       //Several different situations, now only provide two
        for(var i = 0;i<array.length;i++)
        {
            var polygon;
            //Polygon supported by SuperMap
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.Geometry.Polygon")
            {
                var points = SuperMap.Web.iConnector.Leaflet.transferPoint(array[i].getVertices(false),pro);
                polygon = new L.Polygon(points);
            }

            //Support Polygon object
            else if(array[i].constructor  == L.Polygon)
            {
                var points = SuperMap.Web.iConnector.Leaflet.transferPoint(array[i].getLatLngs(),pro);
                polygon = new L.Polygon(points);
            }

            polygons.push(polygon);
        }
        return polygons;
    }
}
/**
 * APIMethod:
* data rectification method, not to achieve.
* because there is standard and offset of the base map and data, when the user base map and data are standard or offset, there's no need to implement this method, if inconsistent requires the user to achieve the conversion between the two
* when the user needs to rectify the deviation, it is necessary to cover this method, the internal conversion before each call this method, will be converted to the longitude and latitude coordinates to come in, through the user's way to achieve the deviation in accordance with the form such as
* {lng:116.4, lat:39.4} format to return to
 *
* LNG {Number} @param The longitude coordinates that need to correct 
* lat {Number} @param The latitude coordinates that need to correct 
* @returns {Object} Returns a Object, such as: {lng:116.4, lat:39.4}
 */
SuperMap.Web.iConnector.Leaflet.transfer = function(lng,lat){
    return {lng:lng,lat:lat};
}
