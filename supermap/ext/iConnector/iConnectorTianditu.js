/**
 * Created with JetBrains WebStorm.
 * User: liuyayun
 * Date: 13-5-27
 * Time: 9:56am
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
 * Tianditu adapter class
 * @constructor
 */
SuperMap.Web.iConnector.Tianditu = function(){

}


/**
 *  APIMethod:
 *  Creat Tianditu layer TTileLayer,the TTileLayer source is iserver(only for 3857 map and 4326 map)
 *  When you add this map into the layer, you will get the current projection from the map is 4326 or 3857 to the dynamic out of the map
 * @param url  {String}  Map service URL address, such as:“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options Optional parameter
 * transparent - {Boolean} Set the slice is transparent, the default is true
 * cacheEnabled - {Boolean} Set whether to use the cache, the default is false
 * layersID - {String} Set the temporary layer of ID, the general use of thematic maps
 * @returns {TTileLayer} Return Tianditu TTileLayer object
 */
SuperMap.Web.iConnector.Tianditu.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }
    var tileLayer = new TTileLayer();
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
    //Calculate resolution and scale
    var resLen = 17;
    var resStart = 0;
    var resolutions4326 = [];
    var resolutions3857 = [];
    var dpi = 95.99999999999984;
    var scales4326 = [];
    var scales3857 = [];
    for(var i=resStart;i<=resLen;i++){
        var res4326 = 1.40625/Math.pow(2,i);
        resolutions4326.push(res4326);

        var scale4326 = 0.0254*360/dpi/res4326/Math.PI/2/6378137;
        scales4326.push(scale4326);
    }

    tileLayer.scales4326 = scales4326;

    for(var i=resStart;i<=resLen;i++){
        var res3857 = 156543.0339/Math.pow(2,i);
        resolutions3857.push(res3857);

        var scale3857 = 0.0254/dpi/res3857;
        scales3857.push(scale3857);
    }
    tileLayer.scales3857 = scales3857;





    tileLayer.setGetTileUrl(
        function(x,y,z)
        {
            if(this.myProjectionCodeName)
            {}
            else
            {
                //Traverse the tileLayer, need to find the current attribute name of the projection system
                var ps = this.tmaps;
                for ( var p in ps )
                {
                    if ( typeof ( ps [ p ]) == " function " )
                    {
                    }
                    else
                    { // P is the attribute name, and ps[p] is the value of the corresponding attribute.
                        if(ps [ p ] == "EPSG:4326" || ps [ p ] == "EPSG:900913")
                        {
                            this.myProjectionCodeName = p;
                            break;
                        }
                    }
                }
            }


            var tileUrl = layerUrl;

            if(this.tmaps[this.myProjectionCodeName] == "EPSG:4326")
            {
                tileUrl +="&scale=" +this.scales4326[z];
                tileUrl += "&prjCoordSys={\"epsgCode\":4326}";
                var orginX = -180;var orginY = 90;
                //Output map bybounds(or use center)
                var centerX = orginX + resolutions4326[z]   *x *256  + resolutions4326[z]*128;
                var centerY = orginY-( resolutions4326[z]   *y *256  + resolutions4326[z]*128)       ;
                tileUrl+= "&center={\"x\":" + centerX+",\"y\":" + centerY + "}" ;
                return tileUrl;
            }
            else if(this.tmaps[this.myProjectionCodeName] == "EPSG:900913")
            {
                var po = Math.pow(2,z);
                x-=po/2;
                y=po/2-y-1;
        //Output map bybounds(or use center)
                var left = x*256*resolutions3857[z];
                var bottom = y*256*resolutions3857[z];
                var right = (x + 1)*256*resolutions3857[z];
                var top = (y + 1)*256*resolutions3857[z];
        //Combine the bounds into the URL
                tileUrl += "&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";

                tileUrl +="&scale=" +this.scales3857[z];
                tileUrl += "&prjCoordSys={\"epsgCode\":3857}";
            }
            return tileUrl;
        }
    );
    return tileLayer;
}



/**
 * APIMethod:
 *  Converts points of other coordinate systems to points of Tianditu support
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
 *                          new TLngLat(116.38,39.9),
 *                          new TLngLat(116.38,39.9)
 *                          ];
 * @param projection  {SuperMap.Projection} The projection system for the conversion point (all points in the array must be uniform), the default is 4326
 * @returns {Array} Return TLngLat object array
 */
SuperMap.Web.iConnector.Tianditu.transferPoint = function(array,projection){
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
            //Support form of Tianditu TLngLat
            else if(array[i].getLng != undefined && array[i].getLat != undefined)
            {
                //Converted to standard coordinates of 4326
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].getLng(),array[i].getLat()),projection,new SuperMap.Projection("EPSG:4326"));

            }
            var point = new TLngLat(smPoint.x,smPoint.y);
            points.push(point);
        }
        return points;
    }
}

/**
 * APIMethod:
 * Converts the line array of other coordinate systems to a line array of Tianditu support
 * @param array Line array,there are two types
 * 1、var lines = [new SuperMap.Geometry.LineString(
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          )];
 * 2、var lines = [new TPolyline(
 *                          new TLngLat(116.38,39.9),
 *                          new TLngLat(116.38,39.9)
 *                          )];
 * @param projection  {SuperMap.Projection}  The coordinates of line that needs to be converted.
 * @returns {Array} Return TPolyline object array
 */
SuperMap.Web.iConnector.Tianditu.transferLine = function(array,projection){
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
                var points = SuperMap.Web.iConnector.Tianditu.transferPoint(array[i].components,pro);
                line = new TPolyline(points);
            }
            //Support TPolyline object
            else if(array[i].polygonType != undefined && array[i].getType() == 4)
            {
                var points = SuperMap.Web.iConnector.Tianditu.transferPoint(array[i].getLngLats(),pro);
                line = new TPolyline(points);
            }

            lines.push(line);
        }
        return lines;
    }
}

/**
 *  APIMethod:
 * Converts the polygonal array of other coordinate systems to a polygonal array of Tianditu support
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
 * 2、var polygons = [new TPolygon(
 *                                  new TLngLat(116.3786889372559,39.90762965106183),
 *                                  new TLngLat(116.38632786853032,39.90795884517671),
 *                                  new TLngLat(116.38534009082035,39.897432133833574),
 *                                  new TLngLat(116.37624058825688,39.89789300648029)
 *                          )];
 * @param projection {SuperMap.Projection} The coordinates of a polygon that needs to be converted.
 * @returns {Array} Return TPolygon object array
 */
SuperMap.Web.iConnector.Tianditu.transferPolygon = function(array,projection){
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
                var points = SuperMap.Web.iConnector.Tianditu.transferPoint(array[i].getVertices(false),pro);
                polygon = new TPolygon(points);
            }

            //Support TPolygon object
            else if(array[i].getType != undefined && array[i].getType() == 5)
            {
                var points = SuperMap.Web.iConnector.Tianditu.transferPoint(array[i].getLngLats(),pro);
                polygon = new TPolygon(points);
            }

            polygons.push(polygon);
        }
        return polygons;
    }
}


