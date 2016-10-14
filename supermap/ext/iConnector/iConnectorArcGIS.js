﻿/**
 * Created with JetBrains WebStorm.
 * User: liuyayun
 * Date: 13-5-27
 * Time: 下午4:01
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
 * ArcGIS adapter class
 * @constructor
 */
SuperMap.Web.iConnector.ArcGIS = function(){

}
/**
 *  APIMethod:
 *  Create a ArcGIS extension layer（Layer inherits from TiledMapServiceLayer）,the layer source is iserver
 * @param url  {String}  Map service URL address, such as:“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options Optional parameter
 * transparent - {Boolean} Set the slice is transparent, the default is true
 * cacheEnabled - {Boolean} Set whether to use the cache, the default is false
 * layersID - {String} Set the temporary layer of ID, the general use of thematic maps
 * @returns {Object} Returns the extended layer object for the ArcGIS map
 */
SuperMap.Web.iConnector.ArcGIS.getLayer = function(url,options){
    dojo.declare("MyTiledMapServiceLayer", esri.layers.TiledMapServiceLayer, {
        constructor: function(url,options) {
            if(url == undefined)
            {
                return;
            }
            this.spatialReference = new esri.SpatialReference({ wkid:3857 });
            this.initialExtent = (this.fullExtent = new esri.geometry.Extent(-20037508.3392, -20037508.3392, 20037508.3392, 20037508.3392, this.spatialReference));

            this.tileInfo = new esri.layers.TileInfo({
                "rows" : 256,
                "cols" : 256,
                "dpi" : 96,
                "compressionQuality" : 0,
                "origin" : {
                    "x" : -20037508.3392,
                    "y" : 20037508.3392
                },
                "spatialReference" : {
                    "wkid" : 3857
                },
                "lods" : [
                    {"level" : 0, "resolution" : 156543.033928, "scale" : 591657527.591555},
                    {"level" : 1, "resolution" : 78271.5169639999, "scale" : 295828763.795777},
                    {"level" : 2, "resolution" : 39135.7584820001, "scale" : 147914381.897889},
                    {"level" : 3, "resolution" : 19567.8792409999, "scale" : 73957190.948944},
                    {"level" : 4, "resolution" : 9783.93962049996, "scale" : 36978595.474472},
                    {"level" : 5, "resolution" : 4891.96981024998, "scale" : 18489297.737236},
                    {"level" : 6, "resolution" : 2445.98490512499, "scale" : 9244648.868618},
                    {"level" : 7, "resolution" : 1222.99245256249, "scale" : 4622324.434309},
                    {"level" : 8, "resolution" : 611.49622628138, "scale" : 2311162.217155},
                    {"level" : 9, "resolution" : 305.748113140558, "scale" : 1155581.108577},
                    {"level" : 10, "resolution" : 152.874056570411, "scale" : 577790.554289},
                    {"level" : 11, "resolution" : 76.4370282850732, "scale" : 288895.277144},
                    {"level" : 12, "resolution" : 38.2185141425366, "scale" : 144447.638572},
                    {"level" : 13, "resolution" : 19.1092570712683, "scale" : 72223.819286},
                    {"level" : 14, "resolution" : 9.55462853563415, "scale" : 36111.909643},
                    {"level" : 15, "resolution" : 4.77731426794937, "scale" : 18055.954822},
                    {"level" : 16, "resolution" : 2.38865713397468, "scale" : 9027.977411},
                    {"level" : 17, "resolution" : 1.19432856685505, "scale" : 4513.988705},
                    {"level" : 18, "resolution" : 0.597164283559817, "scale" : 2256.994353},
                    {"level" : 19, "resolution" : 0.298582141647617, "scale" : 1128.497176}
                ]

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
            this.url = layerUrl;
            var resLen = 17;
            var resStart = 0;
            this.resolutions3857 = [];
            var dpi = 95.99999999999984;
            this.scales3857 = [];
            for(var i=resStart;i<=resLen;i++){
                var res3857 = 156543.0339/Math.pow(2,i);
                this.resolutions3857.push(res3857);

                var scale3857 = 0.0254/dpi/res3857;
                this.scales3857.push(scale3857);
            }
            this.loaded = true;
            this.onLoad(this);
        },

        getTileUrl: function(level, row, col) {
            var zoom = level;
            var po = Math.pow(2,zoom);
            var x = col;
            var y = row;
            x-=po/2;
            y=po/2-y-1;
        //Use bounds to output map
            var left = x*256*this.resolutions3857[zoom];
            var bottom = y*256*this.resolutions3857[zoom];
            var right = (x + 1)*256*this.resolutions3857[zoom];
            var top = (y + 1)*256*this.resolutions3857[zoom];
        //Combine the bounds into the URL
            tileUrl =this.url + "&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";

            tileUrl +="&scale=" +this.scales3857[zoom];
            tileUrl += "&prjCoordSys={\"epsgCode\":3857}";
            return tileUrl;
        }
    });
    var layer = new MyTiledMapServiceLayer(url,options);
    return layer;
}
/**
 * APIMethod:
 *  Converts points of other coordinate systems to points of ArcGIS map support
 * @param array Point array,support five point type：
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
 *                          new esri.geometry.Point(116.38,39.9),
 *                          new esri.geometry.Point(116.35,39.9)
 *                          ];
 * 5、var points = [
 *                              [106,39],
 *                              [109,40]
 *                          ]
 * @param projection  {SuperMap.Projection} The projection system for the conversion point (all points in the array must be uniform), the default is 4326
 * @returns {Array} Array of esri.geometry.Point object

 */
SuperMap.Web.iConnector.ArcGIS.transferPoint = function(array,projection){
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
            //Support AMap.LngLat form
            else if(array[i].constructor == Array)
            {
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i][0],array[i][1]),pro,new SuperMap.Projection("EPSG:4326"));
            }
            var traPoint = SuperMap.Web.iConnector.ArcGIS.transfer(smPoint.x,smPoint.y);
            var point = new esri.geometry.Point(traPoint.lng,traPoint.lat);
            points.push(point);
        }
        return points;
    }
}
/**
 * APIMethod:
 * Converts the line array of other coordinate systems to a line array of ArcGIS support
 * @param array Line array,there are teo types
 * 1、var lines = [new SuperMap.Geometry.LineString(
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          )];
 * 2、var lines = [new esri.geometry.Polyline(
 *                              {
 *                              "paths":[[[-122.68,45.53], [-122.58,45.55],[-122.57,45.58],[-122.53,45.6]]],
 *                              "spatialReference":{"wkid":4326}
 *                              }
 *                          )];
 * @param projection  {SuperMap.Projection}  The coordinates of line that needs to be converted.
 * @returns {Array}  Return array of esri.geometry.Polyline object
 */
SuperMap.Web.iConnector.ArcGIS.transferLine = function(array,projection){
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
                var points = SuperMap.Web.iConnector.ArcGIS.transferPoint(array[i].components,pro);
                line = new esri.geometry.Polyline();
                line.addPath(points);
            }
            // Support AMap.Polyline Objects
            else if(array[i].constructor  == esri.geometry.Polyline)
            {
                line = new esri.geometry.Polyline();
                for(var j = 0;j<array[i].paths.length;j++)
                {
                    var points = SuperMap.Web.iConnector.ArcGIS.transferPoint(array[i].paths[j],pro);
                    line.addPath(points);
                }
            }

            lines.push(line);
        }
        return lines;
    }
}
/**
 * APIMethod:
 * Converts the polygonal array of other coordinate systems to a polygonal array of ArcGIS map support
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
 * 2、var polygons = [new esri.geometry.Polygon(
 *                                  {
 *                                  "rings":[
 *                                              [[-122.63,45.52],[-122.57,45.53],[-122.52,45.50],[-122.49,45.48],[-122.64,45.49],[-122.63,45.52],[-122.63,45.52]]
 *                                              ],
 *                                  "spatialReference":{" wkid":4326 }
 *                                  }
 *                          )];
 * @param projection {SuperMap.Projection} The coordinates of a polygon that needs to be converted.
 * @returns {Array} Return array of esri.geometry.Polygon object
 */
SuperMap.Web.iConnector.ArcGIS.transferPolygon = function(array,projection){
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
                var points = SuperMap.Web.iConnector.ArcGIS.transferPoint(array[i].getVertices(false),pro);

                polygon = new esri.geometry.Polygon();
                polygon.addRing(points);
            }

            //Object that supported esri.geometry.Polyline
            else if(array[i].constructor  == esri.geometry.Polygon)
            {
                polygon = new esri.geometry.Polygon();
                for(var j = 0;j<array[i].rings.length;j++)
                {
                    var points = SuperMap.Web.iConnector.ArcGIS.transferPoint(array[i].rings[j],pro);
                    polygon.addRing(points);
                }

            }

            polygons.push(polygon);
        }
        return polygons;
    }
}

SuperMap.Web.iConnector.ArcGIS.transfer = function(lng,lat){
    return {lng:lng,lat:lat};
}
