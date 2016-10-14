/**
 * Created with JetBrains WebStorm.
 * User: CC
 * Date: 14-12-30
 * Time: 下午5:09
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
 * AMap adapter class
 * @constructor
 */
SuperMap.Web.iConnector.AMap = function(){

}
/**
 *  APIMethod:
 *  Create a AMap extension layer, the layer source is iserver service
 * @param url  {String}  Map service URL address, such as:“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options Optional parameter
 * transparent - {Boolean} Set the slice is transparent, the default is true
 * cacheEnabled - {Boolean} Set whether to use the cache, the default is false
 * layersID - {String} Set the temporary layer of ID, the general use of thematic maps
 * @returns {Object} Returns the extended layer object for the AMap map
 */
SuperMap.Web.iConnector.AMap.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }
    var tileLayer = new AMap.TileLayer({
        getTileUrl:getTileUrl
    });
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
    //If there is projection,only supports 4326 or 3857 of the map currently
    var projection="3857";
    if(options&&options.projection){
        if(options.projection==="4326"){
            projection="4326";
        }
    }
    //Calculate resolution and scale
    var resLen = 17;
    var resStart = 0;
    var resolutions = [];
    var dpi = 95.99999999999984;
    var scales = [];
    if(projection==="3857"){
        for(var i=resStart;i<=resLen;i++){
            var res3857 = 156543.0339/Math.pow(2,i);
            resolutions.push(res3857);
            var scale3857 = 0.0254/dpi/res3857;
            scales.push(scale3857);
        }
        tileLayer.scales=scales;
    }
    else{
        for(var i=resStart;i<=resLen;i++){
            var res4326 = 1.40625/Math.pow(2,i);
            resolutions.push(res4326);

            var scale4326 = 0.0254*360/dpi/res4326/Math.PI/2/6378137;
            scales.push(scale4326);
        }
        tileLayer.scales=scales;
    }

    function getTileUrl(x, y, z){
        var po = Math.pow(2,z);
        x-=po/2;
        y=po/2-y-1;
        //Use bounds to output map
        var left = x*256*resolutions[z];
        var bottom = y*256*resolutions[z];
        var right = (x + 1)*256*resolutions[z];
        var top = (y + 1)*256*resolutions[z];
        //Combine the bounds into the URL
        var  tileUrl = layerUrl+"&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";
        tileUrl +="&scale=" +scales[z];
        var epsg=projection==="3857"?3857:4326;
        tileUrl += "&prjCoordSys={\"epsgCode\":"+epsg+"}";
        return tileUrl;
    }
    return tileLayer;
}
/**
 * APIMethod:
 *  Converts points of other coordinate systems to points of Gaode map support
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
 *                          new AMap.LngLat(116.404, 39.915),
 *                         new AMap.LngLat(39.9,116.35)
 *                          ];
 * @param projection  {SuperMap.Projection} The projection system for the conversion point (all points in the array must be uniform), the default is 4326
 * @returns {Array} Array of Amap.LatLng object
 */
SuperMap.Web.iConnector.AMap.transferPoint = function(array,projection){

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
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].x,array[i].y),projection,new SuperMap.Projection("EPSG:4326"));

            }

            //Support AMap.LngLat form
            else if(array[i].getLng != undefined && array[i].getLat != undefined)
            {
                //Converted to standard coordinates of 4326
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].getLng(),array[i].getLat()),projection,new SuperMap.Projection("EPSG:4326"));

            }
            var point =new AMap.LngLat(smPoint.x,smPoint.y);
            points.push(point);
        }
        return  points;
    }
}
/**
 * APIMethod:
 * Converts the line array of other coordinate systems to a line array of Gaode map support
 * @param array Line array,there are two types
 * 1、var lines = [new SuperMap.Geometry.LineString(
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          )];
 * 2、var lines = [new   AMap.Polyline(
 *                           new AMap.LngLat(116.3 ,39.9)
 *                           new AMap.LngLat(116.3 ,38.9)
 *                          )];
 * @param projection  {SuperMap.Projection}  The coordinates of line that needs to be converted.
 * @returns {Array}  Return array of AMap.Polyline object
 */
SuperMap.Web.iConnector.AMap.transferLine = function(array,projection){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        var pro = projection || new SuperMap.Projection("EPSG:4326");
        var lines = [];
        //Several different situations, now only provide two
        for(var i = 0;i<array.length;i++)
        {
            var line;
            // Support supermap LineString
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.Geometry.LineString")
            {
                var points = SuperMap.Web.iConnector.AMap.transferPoint(array[i].components,pro);
                line = new AMap.Polyline({path:points,strokeColor:"#87CEFF"});
            }
            // Support AMap.Polyline Objects
            else if(array[i].constructor == AMap.Polyline)
            {
                var points = SuperMap.Web.iConnector.AMap.transferPoint(array[i].getLngLats(),pro);
                line = new  AMap.Polyline({path:points,strokeColor:"#87CEFF"});
            }
            lines.push(line);
        }
        return lines;
    }
}
/**
 * APIMethod:
 * Converts the polygonal array of other coordinate systems to a polygonal array of Gaode map support
 * @param array Polygon array, support two forms:
 * 1、var polygons = [new SuperMap.Geometry.Polygon(
 *                                [new SuperMap.Geometry.LinearRing(
 *                                    new SuperMap.Geometry.Point(116.3786889372559,39.90762965106183),
 *                                    new SuperMap.Geometry.Point(116.38632786853032,39.90795884517671),
 *                                    new SuperMap.Geometry.Point(116.38534009082035,39.897432133833574),
 *                                    new SuperMap.Geometry.Point(116.37624058825688,39.89789300648029)
 *                                  )
 *                           ]
 *                        )];
 * 2、var polygons = [ new AMap.Polygon(
 *                                   new AMap.LngLat(116.3786889372559,39.90762965106183),
 *                                   new AMap.LngLat(116.38632786853032,39.90795884517671),
 *                                  new AMap.LngLat(116.38534009082035,39.897432133833574),
 *                                  new AMap.LngLat(116.37624058825688,39.89789300648029)
 *                          )];
 * @param projection {SuperMap.Projection} The coordinates of a polygon that needs to be converted.
 * @returns {Array} Return array of AMap.Polygon object
 */
SuperMap.Web.iConnector.AMap.transferPolygon = function(array,projection){
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
                var points = SuperMap.Web.iConnector.AMap.transferPoint(array[i].getVertices(false),pro);
                polygon = new AMap.Polygon({path:points, fillColor:"#87CEFF"});
            }

            //Object that supported AMap.Polygon
            else if(array[i].constructor  == AMap.Polygon)
            {
                var points = SuperMap.Web.iConnector.AMap.transferPoint(array[i].getLngLats(),pro);
                polygon = new AMap.Polygon({path:points,strokeColor:"#87CEFF"});
            }

            polygons.push(polygon);
        }
        return polygons;
    }
}

