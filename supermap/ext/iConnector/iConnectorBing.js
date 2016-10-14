
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
 * Bing map adapter class
 * @constructor
 */
SuperMap.Web.iConnector.Bing = function(){

}


SuperMap.Web.iConnector.Bing.getTileLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }
    var layerUrl = url + "/image.png?redirect=false&width=256&height=256";

    //分辨率
    var resAry= [];
    resAry[0] = 78271.5170;
    resAry[1] = 39135.7585;
    resAry[2] = 19567.8792;
    resAry[3] = 9783.9396;
    resAry[4] = 4891.9698;
    resAry[5] = 2445.9849;
    resAry[6] = 1222.9925;
    resAry[7] = 611.4962;
    resAry[8] = 305.7481;
    resAry[9] = 152.8741;
    resAry[10] = 76.4370;
    resAry[11] = 38.2185;
    resAry[12] = 19.1093;
    resAry[13] = 9.5546;
    resAry[14] = 4.7773;
    resAry[15] = 2.3887;
    resAry[16] = 1.1943;
    resAry[17] = 0.5972;
    resAry[18] = 0.2986;
    resAry[19] = 0.1493;
    resAry[20] = 0.0746;
    resAry[21] = 0.0373;
    resAry[22] = 0.0187;


    //Calculate scale array
    var scaAry = [];
    for(var i = 0;i<17;i++)
    {
        scaAry[i] = 0.0254/(96*resAry[i]);    //0.0254是meters和pixel的转换
    }

    var tileSource = new Microsoft.Maps.TileSource({uriConstructor: getTilePath});

    var tilelayer= new Microsoft.Maps.TileLayer({ mercator: tileSource, opacity: 1 });


    ///Whether the slice is transparent
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
    if(options && options.layersID !=undefined)
    {
        layerUrl += "&layersID=" +options.layersID;
    }

    //Re write gettilesource method of bing map 
    function getTilePath(tile){
        var x = tile.x;
        var y = tile.y;
        var z = tile.levelOfDetail;

        var po = Math.pow(2,z);
        x-=po/2;
        y=po/2-y-1;
        //Output map by bounds(or use center)
        var left = x*256*resAry[z-1];
        var bottom = y*256*resAry[z-1];
        var right = (x + 1)*256*resAry[z-1];
        var top = (y + 1)*256*resAry[z-1];
        //Combine the bounds into the URL
        var  tileUrl = layerUrl+"&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";
        tileUrl +="&scale=" +scaAry[z];
        //var epsg=projection==="3857"?3857:4326;
        tileUrl += "&prjCoordSys={\"epsgCode\":"+3857+"}";
        return tileUrl;
    }

    return tilelayer;
};







