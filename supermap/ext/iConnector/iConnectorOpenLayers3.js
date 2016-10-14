/**
 * Created with JetBrains WebStorm.
 * User: CC
 * Date: 15-3-3
 * Time: 1:39pm
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
 * OpenLayers3 adapter class
 * @constructor
 */
SuperMap.Web.iConnector.OpenLayers3 = function(){

}
/**
 *  APIMethod:
 *  Creat OpenLayers3 layer new ol.Layer.Tile,the TileLayer source is iserver(only for 3857 map and 4326 map)
 * @param url  {String}  Map service URL address, such as:“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options Optional parameter
 * transparent - {Boolean} Set the slice is transparent, the default is true
 * cacheEnabled - {Boolean} Set whether to use the cache, the default is false
 * layersID - {String} Set the temporary layer of ID, the general use of thematic maps
 * @returns {object} Return OpenLayers3 object
 */
SuperMap.Web.iConnector.OpenLayers3.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }
    var tileLayer= new ol.layer.Tile({
        source:getSource()
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
    //If there has projection，it only can be 4326 or 3857 map。
    var pro="3857";
    if(options&&options.pro){
        if(options.pro==="4326"){
            pro="4326";
        }
    }
    layerUrl+="&projection="+pro;
    //Calculate resolution and scale
    var resLen = 17;
    var resStart = 0;
    var dpi = 95.99999999999984;
    var scales3857=[];
    var scales4326=[];
    var resolutions3857=[];
    var resolutions4326=[];

        for(var i=resStart;i<=resLen;i++){
            var res3857 = 156543.0339/Math.pow(2,i);

            resolutions3857.push(res3857);

            var scale3857 = 0.0254/dpi/res3857;
            scales3857.push(scale3857);
        }
        tileLayer.scales=scales3857;


        for(var i=resStart;i<=resLen;i++){
            var res4326 = 1.40625/Math.pow(2,i);
            resolutions4326.push(res4326);

            var scale4326 = 0.0254*360/dpi/res4326/Math.PI/2/6378137;
            scales4326.push(scale4326);
        }
        tileLayer.scales=scales4326;

    function getSource(){

        var tileUrl;
        var source= new ol.source.TileImage({
              tileUrlFunction:function(tileCoord, pixelRatio, projection){
                  var z=tileCoord[0], x= tileCoord[1],y =tileCoord[2];
                  if(pro==="3857"){
                    x-= Math.pow(2,z-1);
                    y+=Math.pow(2,z-1);
                    var left = x*256*resolutions3857[z];
                      var bottom = y*256*resolutions3857[z];
                      var right = (x + 1)*256*resolutions3857[z];
                      var top = (y+1)*256*resolutions3857[z];
                      tileUrl  = layerUrl+"&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";
                      tileUrl +="&scale=" +scales3857[z];

                  }
                  else if(pro==="4326"){
                      x-=Math.pow(2,z-1);
                    y+=Math.pow(2,z-1);
                      var left = x*256*resolutions4326[z];
                      var bottom = y*256*resolutions4326[z];
                      var right = (x + 1)*256*resolutions4326[z];
                      var top = (y+1)*256*resolutions4326[z];
                      tileUrl  = layerUrl+"&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";
                      tileUrl +="&scale=" +scales4326[z];

                  }
                  var epsg=pro==="3857"?3857:4326;
                  tileUrl += "&prjCoordSys={\"epsgCode\":"+epsg+"}";
             return tileUrl;
              }
        });
        return  source;
    }
    return tileLayer;
}
/**
 * APIMethod:
 *  Converts points of other coordinate systems to points of OpenLayers3 support
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
 *                          new ol.geom.Point([39.9,116.38]),
 *                          new ol.geom.Point([39.9,116.35])
 *                          ];
 * @param projection  {SuperMap.Projection} The projection system for the conversion point (all points in the array must be uniform), the default is 4326
 * @returns {Array} Return ol.geom.Point object array
 */
SuperMap.Web.iConnector.OpenLayers3.transferPoint = function(array,projection){
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
            //Support form of OpenLayers3 LatLng
            else if(array[i].lat != undefined && array[i].lng != undefined)
            {
                //Converted to standard coordinates of 4326
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].lng,array[i].lat),projection,new SuperMap.Projection("EPSG:4326"));

            }
            var point = new ol.geom.Point([smPoint.x,smPoint.y]);
            points.push(point);
        }
        return points;
    }
}
/**
 * APIMethod:
 * Converts the line array of other coordinate systems to a line array of OpenLayers3 support
 * @param array Line array,there are two types
 * 1、var lines = [new SuperMap.Geometry.LineString(
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          )];
 * 2、var lines = [new  ol.geom.LineString(  [39.9,116.38],[0,0])];
 *
 *
* @param projection  {SuperMap.Projection}  The coordinates of line that needs to be converted.
 * @returns {Array} Return LineString object array

 */
SuperMap.Web.iConnector.OpenLayers3.transferLine = function(array,projection){
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
             var points = SuperMap.Web.iConnector.OpenLayers3.transferPoint(array[i].components,pro);

                line = new ol.geom.LineString(getcoordinate(points));
            }
            else if(array[i].polygonType != undefined && array[i].getType() == 4)
            {
                var points = SuperMap.Web.iConnector.Tianditu.transferPoint(array[i].getLngLats(),pro);
                line = new ol.geom.LineString(getcoordinate(points));
            }
            lines.push(line);
        }
        return lines;
    }
}
function getcoordinate(points){
    var coordinates=[];
    for(var i=0;i<points.length;i++){
         coordinates.push(points[i].getCoordinates());
    }
    return coordinates;
}

/**
 *  APIMethod:
 * Converts the polygonal array of other coordinate systems to a polygonal array of OpenLayers3 support
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
 * 2、var polygons = [new ol.geom.Polygon([[39.9,116.38],[0,0],[30.34,110.34]])];
 *
* @param projection {SuperMap.Projection} The coordinates of a polygon that needs to be converted.
 * @returns {Array} Return L.Polygon object array

 */
SuperMap.Web.iConnector.OpenLayers3.transferPolygon = function(array,projection){
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
                var points = SuperMap.Web.iConnector.OpenLayers3.transferPoint(array[i].getVertices(false),pro);
                polygon = new ol.geom.Polygon([getcoordinate(points)]);
            }

            //Support Polygon object
            else if(array[i].getType != undefined && array[i].getType() == 5)
            {
                var points = SuperMap.Web.iConnector.OpenLayers3.transferPoint(array[i].getLngLats(),pro);
                polygon = new ol.geom.Polygon([getcoordinate(points)]);
            }

            polygons.push(polygon);
        }
        return polygons;
    }
}
