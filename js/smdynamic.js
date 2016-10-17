/**
 * http://usejsdoc.org/
 */
$(document).ready(function(){
	SmDynamic.initMap("map");
	
});
var SmDynamic = {
	stTime : 0,
	edTime : 0,
	map : null,
	layerStatusList:[],
	vworldUrl : "http://xdworld.vworld.kr:8080/2d/Base/201310/${z}/${x}/${y}.png", 
	vworldLayer : null,
	dynamicUrl : "http://61.32.6.18:9090/iserver/services/map-Change_SuperMan/rest/maps/도시가스지도",
	dynamicLayer : null,
	initMap : function(mapid){
		SmDynamic.vworldLayer = new SuperMap.Layer.XYZ(
			"vWorldLayer",
			SmDynamic.vworldUrl,{
				attribution: "VWORLD",
				sphericalMercator: true
		});
		
		SmDynamic.map = new SuperMap.Map(mapid);
		SmDynamic.map.addLayer(SmDynamic.vworldLayer);
		SmDynamic.map.setCenter(new SuperMap.LonLat(14145820.89, 4520532.067),13);
		SmDynamic.dynamicLayer = new SuperMap.Layer.TiledDynamicRESTLayer("dynamic", SmDynamic.dynamicUrl,
				{transparent: true, redirect: true,cacheEnabled: false}, 
				{isBaseLayer:false,maxResolution: "auto",bufferImgCount:0 });
		SmDynamic.dynamicLayer.events.on({"layerInitialized": SmDynamic.addLayer});
		//Layer 정보 설정
		this.getLayersInfo();
	},
	/**
	 * Layer 정보 호출
	 */
	getLayersInfo : function(){
		 var getLayersInfoService = new SuperMap.REST.GetLayersInfoService(SmDynamic.dynamicUrl);
         getLayersInfoService.events.on({ 
        	 "processCompleted": this.getLayersInfoCompleted, "processFailed": this.serviceFailed
         });
         getLayersInfoService.processAsync();
	},
	/**
	 * Layer 정보 호출 결과
	 * 화면이 Select 설정 및 레이어 정보를 SmDynamic.layerStatusList에 설정
	 */
	getLayersInfoCompleted : function(getLayersInfoEventArgs){
		SmDynamic.layerStatusList=[];
		if (getLayersInfoEventArgs.result) {
			$.each(getLayersInfoEventArgs.result.subLayers.layers,function(idx,layer){
				if(layer.visible){
					$("#selectLayer").append($("<option/>").val(idx).text(layer.name));
				}
				var layerStatus = new SuperMap.REST.LayerStatus();
				layerStatus.isVisible = layer.visible;
				layerStatus.displayFilter="";
		        layerStatus.layerName = layer.name; //"GNODE_WM@PostgreSQL"
		        SmDynamic.layerStatusList.push(layerStatus);
			});
		}
	},
	/**
	 * SetLayerStatusService를 이용하여 TempLayer 생성
	 */
	createTempLayer : function(idx,query){
		var layerStatusParameters = new SuperMap.REST.SetLayerStatusParameters();
		$.each(SmDynamic.layerStatusList,function(idx,layerStatus){
			layerStatus.displayFilter="";
		})
		// 레이어에 검색 쿼리 설정
		SmDynamic.layerStatusList[idx].displayFilter = query;
		layerStatusParameters.layerStatusList = SmDynamic.layerStatusList;
		var setLayerStatusService = new SuperMap.REST.SetLayerStatusService(SmDynamic.dynamicUrl);
        setLayerStatusService.events.on({ "processCompleted": SmDynamic.createTempLayerCompleted, "processFailed": this.serviceFailed});
        setLayerStatusService.processAsync(layerStatusParameters);
	},
	/**
	 * Templayer 생성 결과
	 * SmDynamic.dynamicLayer에 Templayer id 설정 후 SmDynamic.dynamicLayer redraw()
	 */
	createTempLayerCompleted : function(createTempLayerEventArgs){
		var tempLayerID = createTempLayerEventArgs.result.newResourceID;
		SmDynamic.dynamicLayer.params["layersID"] = tempLayerID;;
		SmDynamic.dynamicLayer.redraw();
	},
	serviceFailed : function(error){
		console.log(error);
	},
	addLayer:function(){
		SmDynamic.map.addLayer(SmDynamic.dynamicLayer);
	}	
}