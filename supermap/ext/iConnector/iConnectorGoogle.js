/**
 * Created with JetBrains WebStorm.
 * User: liuyayun
 * Date: 13-5-27
 * Time: 11:19am
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
 * Google adapter class
 * @constructor
 */
SuperMap.Web.iConnector.Google = function(){

}
/**
 *  APIMethod:
 * Create a google TileLayer,the TileLayer source is iserver(only for 3857 map)
 * @param url  {String}  Map service URL address, such as:“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options Optional parameter
 * transparent - {Boolean} Set the slice is transparent, the default is true
 * cacheEnabled - {Boolean} Set whether to use the cache, the default is false
 * layersID - {String} Set the temporary layer of ID, the general use of thematic maps
 * @returns {object} Return google object
 */
SuperMap.Web.iConnector.Google.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }
    var layer = new Object();
    layer.tileSize = new google.maps.Size(256, 256);
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
    var resLen = 17;
    var resStart = 0;
    layer.resolutions3857 = [];
    var dpi = 95.99999999999984;
    layer.scales3857 = [];
    for(var i=resStart;i<=resLen;i++){
        var res3857 = 156543.0339/Math.pow(2,i);
        layer.resolutions3857.push(res3857);

        var scale3857 = 0.0254/dpi/res3857;
        layer.scales3857.push(scale3857);
    }
    layer.url = layerUrl;
    layer.getTile = function(coord, zoom, ownerDocument){
        var po = Math.pow(2,zoom);
        x = coord.x;
        y = coord.y;
        x-=po/2;
        y=po/2-y-1;
        //Output map bybounds(or use center)
        var left = x*256*this.resolutions3857[zoom];
        var bottom = y*256*this.resolutions3857[zoom];
        var right = (x + 1)*256*this.resolutions3857[zoom];
        var top = (y + 1)*256*this.resolutions3857[zoom];
        //Combine the bounds into the URL
        tileUrl =this.url + "&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";

        tileUrl +="&scale=" +this.scales3857[zoom];
        tileUrl += "&prjCoordSys={\"epsgCode\":3857}";

        var div = ownerDocument.createElement('div');
        div.innerHTML = "<img src=\'" + tileUrl + "\' >";
        div.style.width = this.tileSize.width + 'px';
        div.style.height = this.tileSize.height + 'px';
        div.style.borderStyle = 'solid';
        div.style.borderWidth = '0px';
        return div;
    }
    return layer;
}
/**
 * APIMethod:
 *  Converts points of other coordinate systems to points of google map support
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
 *                          new google.maps.LatLng(39.9,116.38),
 *                          new google.maps.LatLng(39.9,116.35)
 *                          ];
 * @param projection  {SuperMap.Projection} The projection system for the conversion point (all points in the array must be uniform), the default is 4326
 * @returns {Array} Return google.maps.LatLng object array
 */
SuperMap.Web.iConnector.Google.transferPoint = function(array,projection){
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
            //Support form of Google LatLng,google is the reverse of the latitude and longitude, latitude, and then longitude
            else if(array[i].lat != undefined && array[i].lng != undefined)
            {
                //Converted to standard coordinates of 4326
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].lng(),array[i].lat()),projection,new SuperMap.Projection("EPSG:4326"));

            }
            var traPoint = SuperMap.Web.iConnector.Google.transfer(smPoint.x,smPoint.y);
            var point = new google.maps.LatLng(traPoint.lat,traPoint.lng);
            points.push(point);
        }
        return points;
    }
}
/**
 * APIMethod:
 * Converts the line array of other coordinate systems to a line array of google support
 * @param array Line array,there are two types
 * 1、var lines = [new SuperMap.Geometry.LineString(
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          )];
 * 2、var lines = [new google.maps.Polyline(
 *                              {path:[
 *                                  new google.maps.LatLng(39.9,116.38),
 *                                  new google.maps.LatLng(39.8,116.38)
 *                              ]}
 *                          )];
 * @param projection  {SuperMap.Projection}  The coordinates of line that needs to be converted.
 * @returns {Array} Return google.maps.Polyline object array
 */
SuperMap.Web.iConnector.Google.transferLine = function(array,projection){
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
                var points = SuperMap.Web.iConnector.Google.transferPoint(array[i].components,pro);
                line = new google.maps.Polyline({path:points});
            }
            //Support google.maps.Polyline object
            else if(array[i].constructor  == google.maps.Polyline)
            {
                var points = SuperMap.Web.iConnector.Google.transferPoint(array[i].getPath(),pro);
                line = new google.maps.Polyline({path:points});
            }

            lines.push(line);
        }
        return lines;
    }
}
/**
 *  APIMethod:
 * Converts the polygonal array of other coordinate systems to a polygonal array of google map support
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
 * 2、var polygons = [new google.maps.Polygon(
 *                                  {path:[
 *                                      new google.maps.LatLng(39.90762965106183,116.3786889372559),
 *                                      new google.maps.LatLng(39.90795884517671,116.38632786853032),
 *                                      new google.maps.LatLng(39.897432133833574,116.38534009082035),
 *                                      new google.maps.LatLng(39.89789300648029,116.37624058825688)
 *                                  ]}
 *                          )];
 * @param projection {SuperMap.Projection} The coordinates of a polygon that needs to be converted.
 * @returns {Array} Return google.maps.Polygon object array
 */
SuperMap.Web.iConnector.Google.transferPolygon = function(array,projection){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        var pro = projection || new SuperMap.Projection("EPSG:4326");
        var polygons = [];
       //Several different situations, now only provide two
        for(var i = 0;i<array.length;i++)
        {
            var polygon;
            //Linestring supported by SuperMap
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.Geometry.Polygon")
            {
                var points = SuperMap.Web.iConnector.Google.transferPoint(array[i].getVertices(false),pro);
                polygon = new google.maps.Polygon({paths:points});
            }

            //Support TPolyline object
            else if(array[i].constructor  == google.maps.Polygon)
            {
                var points = SuperMap.Web.iConnector.Google.transferPoint(array[i].getPath(),pro);
                polygon = new google.maps.Polygon({paths:points});
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
* such as the user's map for China's Google map (is done offset), if you do not buy Google correction data, with their true data overlay will appear on the position error,
* at this time it is required to implement this method, the correction of each coordinate
 *
* LNG {Number} @param The longitude coordinates that need to correct 
* lat {Number} @param The latitude coordinates that need to correct 
* @returns {Object} Returns a Object, such as: {lng:116.4, lat:39.4}
 */
SuperMap.Web.iConnector.Google.transfer = function(lng,lat){
    return {lng:lng,lat:lat};
}