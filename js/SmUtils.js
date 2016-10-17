/**
 * http://usejsdoc.org/
 */
SmUtil={
	getDistanceFromPixel : function(map,pixcel){
		return Math.floor(map.getResolution()*pixcel);
	}
}