/**
 * Created with JetBrains WebStorm.
 * User: CC
 * Date: 14-12-23
 * Time: 3:36pm
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
 * PolyMaps adapter class
 *  No corresponding interface of point,line and polygin, so it does not involve the conversion
 * @constructor
 */
SuperMap.Web.iConnector.PolyMaps = function(){

}
/**
 *  APIMethod:
 *  Creat PolyMaps layer po.layer,the TileLayer source is iserver(only for 3857 map and 4326 map)
 * @param url  {String}  Map service URL address, such as:“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options Optional parameter
 * transparent - {Boolean} Set the slice is transparent, the default is true
 * cacheEnabled - {Boolean} Set whether to use the cache, the default is false
 * layersID - {String} Set the temporary layer of ID, the general use of thematic maps
 * projection-{String}Set layer projection as "3857" or "4326",default is "3857"
 * @returns {Object} Return Leaflet object
 */
SuperMap.Web.iConnector.PolyMaps.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }
    var image = po.layer(load, unload);
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

    function load(tile) {
        //Calculate resolution and scale
        var resLen = 17;
        var resStart =0;
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
            image.scales=scales;
        }
        else{
            for(var i=resStart;i<=resLen;i++){
                var res4326 = 1.40625/Math.pow(2,i);
                resolutions.push(res4326);

                var scale4326 = 0.0254*360/dpi/res4326/Math.PI/2/6378137;
                scales.push(scale4326);
            }
            image.scales=scales;
        }

        var cx=tile.column ;
        var cy=-tile.row;
        var z=tile.zoom;
        cx-= Math.pow(2,z-1);
        cy+=Math.pow(2,z-1)-1;

        //Output map bybounds(or use center)
        var left = cx*256*resolutions[z];
        var bottom = cy*256*resolutions[z];
        var right = (cx + 1)*256*resolutions[z];
        var top = (cy + 1)*256*resolutions[z];

        var element = tile.element = po.svg("image"),
            size = image.map().tileSize();
        element.setAttribute("preserveAspectRatio", "none");
        element.setAttribute("width", size.x);
        element.setAttribute("height", size.y);
        var tileUrl = layerUrl;
        //Combine the bounds into the URL
        tileUrl+= "&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";

        tileUrl +="&scale=" +scales[z];
        var epsg=projection==="3857"?3857:4326;
        tileUrl += "&prjCoordSys={\"epsgCode\":"+epsg+"}";
        element.setAttribute("opacity", 0);

        if (tileUrl != null) {
            tile.request = po.queue.image(element, tileUrl, function(img) {
                delete tile.request;
                tile.ready = true;
                tile.img = img;
                element.removeAttribute("opacity");
                image.dispatch({type: "load", tile: tile});
            });
        } else {
            tile.ready = true;
            image.dispatch({type: "load", tile: tile});
        }
    }
    function unload(tile) {
        if (tile.request) tile.request.abort(true);
    }
    return image;
}

