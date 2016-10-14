/**
 * @requires SuperMap.Feature.Theme.js
 * @requires SuperMap.Feature.Theme.Graph.js
 */

/**
 * Class: SuperMap.Feature.Theme.Point
 * Point graph
 *
 * Point configuration object chartsSetting（<SuperMap.Layer.Graph::chartsSetting>） properties setting are as follows：
 *
 * Symbolizer properties:
 * width - {Number} Thematic elements (Graph) width, required parameters.
 * height - {Number} Thematic elements (Graph) height, required parameters.
 * codomain - {Array{Number}} Charts allow the display of the data range, the length of two one-dimensional arrays, the first element is range lower limit, the second element is range limit, required parameters.
 * XOffset - {Number}  Thematic elements (graphs) offset value in the X direction, unit pixel.
 * YOffset - {Number}  Thematic elements (graphs) offset value in the Y direction, unit pixel.
 * dataViewBoxParameter - {Array{Number}} dataViewBox parameters.
 * It refers to the chartBox (chartBox constituted by chart position, width chart, chart highly) in the left , down,right,up four direction within the offset value.
 * When using the coordinate axis,the default value of dataViewBoxParameter is:[45, 15, 15, 15]；When it is not used,the default value of dataViewBoxParameter is:[5, 5, 5, 5].
 * decimalNumber - {Number} Data value array dataValues elements of the decimal value, the decimal processing parameters of data, range: [0, 16]. If you do not set this parameter in data value is not a digital data processing.
 *
 * useBackground - {Boolean} Whetjer to use Background box,default true
 * backgroundStyle - {Object} Background style, this style objectcan be set properties: <SuperMap.Feature.ShapeParameters.Rectangle::style>。
 * backgroundRadius - {Array} Rectangular corner radius of the background frame, you can use the array to specify the four corners of the fillet radius,Set: the radius of upper left, upper right, lower left and lower left corner in turn is: r1、r2、r3、r4 ,
 * backgroundRadius is [r1、r2、r3、r4 ],default [0, 0, 0, 0]。
 *
 * xShapeBlank - {Array{Number}} Blank space parameters in horizontal direction.
 * A three length array, the first element is the blank space between left of first figure and the left end of the data view box, the second element is the blank space between graphics.
  *
 * useAxis - {Boolean} Whether to use axis,default is true.
 * axisStyle - {Object} Coordinate axis style, this style object can be set properties: <SuperMap.Feature.ShapeParameters.Line::style> 。
 * axisUseArrow - {Boolean}  Whether to use arrow axis,default is false.
 * axisYTick - {Number} Y axis scale, the default value: 0, do not use the scale
 * axisYLabels - {Array{String}} Label group content on the Y axis, a tag sequence along the data view box left side from top to bottom, equidistant arrangement.For example["1000", "750", "500", "250", "0"]。
 * axisYLabelsStyle - {Object} Y axis on the label group style, this style object can be set up properties: <SuperMap.Feature.ShapeParameters.Label::style> 。
 * axisYLabelsOffset - {Array{Number}} Label group offset on Y axis. A 2 length array, the array of the first to represent the Y axis tag group lateral offset, the left is positive, the default value: 0;
 * Array second item represents the offset in the Y axis label group, down to the positive, the default value: 0.
 * axisXLabels - {Array{String}} X axis label group content and sequence tagged along the data view box below edges from left to right arrangement.For example["92年", "95年", "99年"]。
 * Label arrangement of rules: when the number of attribute xShapeCenter tag number and xShapeInfo same (i.e. label a number of data and is equal to the number of), in accordance with xShapeCenter position arrangement of tags.
 * Or along the dataView box below the edge label equidistant arrangement.
 * axisXLabelsStyle - {Object} X axis on the label group style, this style object can be set up properties: <SuperMap.Feature.ShapeParameters.Label::style> 。
 * axisXLabelsOffset - {Array{Number}} Label group offset on X axis. A 2 length array, the array of the first to represent the Y axis tag group lateral offset, the left is positive, the default value: 0;
 * Array second item represents the offset in the X axis label group, down to the positive, the default value: 0.
 * useXReferenceLine - {Boolean) Whether to use a horizontal reference line, if true, when axisYTick greater than 0 it is effective, the horizontal reference line is an extension of the Y axis scale in the data view box.
 * xReferenceLineStyle - {Object) Horizontal reference line style, this style object can be set properties: <SuperMap.Feature.ShapeParameters.Line::style> 。
 *
 * pointStyle - {Object} A bar graph based style，This parameter controls the point base style, the priority is lower than the barStyleByFields and barStyleByCodomain。
 * This style object can be set to properties: <SuperMap.Feature.ShapeParameters.point::style> 。
 * pointStyleByFields - {Array{Object}} Set style for bar according to themeFields（<SuperMap.Layer.Graph::themeFields>）, this parameter field control the bar style,
 * The priority is lower than pointStyleByCodomain，and higher than pointStyle. The element in this array is a style object, which can be set to a property: <SuperMap.Feature.ShapeParameters.Point::style> 。
 * The style in this parameter corresponds to the field in the themeFields.such as: themeFields（<SuperMap.Layer.Graph::themeFields>） is ["POP_1992", "POP_1995", "POP_1999"],
 * pointStyleByFields is [style1, style2, style3],in the graph, points corresponding to the field of POP_1992 using the style1, a POP_1995 field corresponding to the point using the style2 , point field corresponds to POP_1999 using style3.
 * pointStyleByCodomain - {Array{Object}} Value range of the bar control the style, a higher priority than pointStyle and pointStyleByFields。
 * (start code)
 * // pointStyleByCodomain  Each element is an object containing information and domain and range corresponding to the style information, the object has three properties (must):
 * // start: range lower limit (included);
 * // end: range upper limit (not included);
 * // style:Data visualization graphics style, this style object can be set properties: <SuperMap.Feature.ShapeParameters.Point::style> 。
 * // pointStyleByCodomain array like：
 * [
 *   {
 *     start:0,
 *     end:250,
 *     style:{
 *          fillColor:"#00CD00"
 *      }
 *  },
 *   {
 *     start:250,
 *     end:500,
 *     style:{
 *          fillColor:"#00EE00"
 *      }
 *  },
 *   {
 *     start:500,
 *     end:750,
 *     style:{
 *          fillColor:"#00FF7F"
 *      }
 *  },
 *   {
 *     start:750,
 *     end:1500,
 *     style:{
 *          fillColor:"#00FF00"
 *      }
 *  }
 * ]
 * (end)
 * pointHoverStyle - {Object} Bar hover state style, effective when pointHoverAble is true.
 * pointHoverAble - {Object} Whether to allowe the bar to use the hover state, the default is allowed. At the same time, set the pointHoverAble and pointClickAble false, can be directly on the shielding point thematic layer event response.
 * pointClickAble - {Object} Whether to allowe the bar is clicked, the default is allowed. At the same time, pointHoverAble and pointClickAble are set to false, which can directly screen the response of the point strip to the event layer.
 * Inherits:
 *  - <SuperMap.Feature.Theme.Graph>
 */
SuperMap.Feature.Theme.Point = SuperMap.Class(SuperMap.Feature.Theme.Graph, {

    /**
     * Constructor: SuperMap.Feature.Theme.Point
     * Create a point graph
     *
     * Parameters:
     * data - {<SuperMap.Feature.Vector>}  User data,required parameter
     * layer - {<SuperMap.Layer.Graph>}   The layer thematic elements in,required parameter.
     * fields - {Array{String}} data   Fields name that generate graph,required parameter.
     * setting - {Object}   Graph configure object,required parameter.。
     * lonlat - {<SuperMap.LonLat>} Location of thematic elements,default is the geographical elements bound center that data refer to.
     *
     * Returns:
     * {<SuperMap.Feature.Theme.Point}  Return a point graph object
     */
    initialize: function(data, layer, fields, setting, lonlat, options) {
        SuperMap.Feature.Theme.Graph.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: destroy
     * Destroy object. All properties of the object are null after calling destory function
     */
    destroy: function() {
        SuperMap.Feature.Theme.Graph.prototype.destroy.apply(this, arguments);
    },

    //Assembly graphics (Extended Interface)
    assembleShapes: function(){
        // Graph configure object
        var sets = this.setting;

        // Default dataView box
        if(!sets.dataViewBoxParameter){
            if(typeof(sets.useAxis) === "undefined" || sets.useAxis){
                sets.dataViewBoxParameter = [45, 15, 15, 15];
            }
            else{
                sets.dataViewBoxParameter = [5, 5, 5, 5];
            }
        }

        // Important step:Initialization parameters
        if(!this.initBaseParameter()) return;

        var dvb = this.dataViewBox;

        //Value
        var codomain = this.DVBCodomain;
        // Important step:Defines the meaning of unit values in the graph point data view box
        this.DVBUnitValue =  (codomain[1]-codomain[0])/this.DVBHeight;
        var uv = this.DVBUnitValue;
        var fv = this.dataValues;


        //Get graphic information on the X axis
        var xShapeInfo = this.calculateXShapeInfo();
        if(!xShapeInfo) return;
        // X value of each node of the broken line
        var xsLoc = xShapeInfo.xPositions;

        // Background box, enabled by default
        if(typeof(sets.useBackground) === "undefined" || sets.useBackground){
            // Add the background frame to the model shapes array, pay attention to order, the later added graphics above the previous added graphics.将背景框图形添加到模型的 shapes 数组，注意添加顺序，后添加的图形在先添加的图形之上。
            this.shapes.push(SuperMap.Feature.ShapeFactory.Background(this.shapeFactory, this.chartBox, sets));
        }

        // The point graph must use the coordinate axis
        this.shapes = this.shapes.concat(SuperMap.Feature.ShapeFactory.GraphAxis(this.shapeFactory, dvb, sets, xShapeInfo));

        var isDataEffective = true;

        var xPx;        //  x coordinates of point graph
        var yPx;        // y coordinates of point graph
        for(var i = 0, len = fv.length; i < len; i++){
            // Data overflow check
            if(fv[i] < codomain[0] || fv[i] > codomain[1]) {isDataEffective = false; return null;}

            xPx = xsLoc[i];
            yPx = dvb[1] - (fv[i] - codomain[0])/uv;

            // Point parameter object
            var poiSP = new SuperMap.Feature.ShapeParameters.Point(xPx, yPx);
            // Point style
            poiSP.style = SuperMap.Feature.ShapeFactory.ShapeStyleTool({fillColor: "#ee9900"}, sets.pointStyle, sets.pointStyleByFields, sets.pointStyleByCodomain, i, fv[i]);
            // Point hover style
            poiSP.highlightStyle = SuperMap.Feature.ShapeFactory.ShapeStyleTool(null, sets.pointHoverStyle);

            // Point hover click
            if(typeof(sets.pointHoverAble) !== "undefined"){
                poiSP.hoverable = sets.pointHoverAble;
            }
            if(typeof(sets.pointClickAble) !== "undefined"){
                poiSP.clickable = sets.pointClickAble;
            }

            //  Data information the graph with
            poiSP.refDataID = this.data.id;
            poiSP.dataInfo =  {
                field: this.fields[i],
                value:  fv[i]
            };

            // Create a point graph and add it to the Point graph array
            this.shapes.push(this.shapeFactory.createShape(poiSP));
        }

        // Data range detection not passed, clear graphics
        if(isDataEffective === false){
            this.shapes = [];
        }

        // Important steps: the picture transfer on the grounds of relative coordinates graphics, in order to fast redraw graphics when map panning and zooming 
        // (statistical thematic map module requirements using relative coordinates in the structure, assembleShapes () funtion call shapesConvertToRelativeCoordinate() function after the completion of the assembly graph.
        this.shapesConvertToRelativeCoordinate();
    },

    /**
     * Method: calculateXShapeInfo
    * calculate the graphic information on the X axis, this information is an object that contains two properties,
    * property xPositions is a one-dimensional array that represents the pixel coordinates of the pattern in the X axis direction,
    * if the graph has a certain width in the X direction, usually the center point of the graph in the X direction is the coordinate value of the figure in the X direction.
    * width represents the width of the graph (special attention: the width of the point is always 0, not its diameter).
     *
    * graphical configuration object setting in this function can be set to properties:
    * properties: Symbolizer
    * {Array{Number}} - xShapeBlank horizontal direction on the graph blank interval parameters.
    * length for 2 of the array, the first element is the blank space between left of first figure and the left end of the data view box, the second element is the blank space between graphics.
    *
     * Returns:
     * {Object} If the calculation fails, return null; if successful, return to the X axis direction of the graphics information, this information is an object that contains the following two properties:
     * Symbolizer properties:
    * xPositions {Array{Number}} said graphics on the X axis coordinates of the pixel value, if graphics in the X direction with a certain width, usually graphics in the X direction the center point of the graphics in the X direction coordinate value.
    * {Number} - width represents the width of the graph (special note: the width of the point is always 0, not its diameter).。
     *
     */
    calculateXShapeInfo: function(){
        var dvb = this.dataViewBox;     // Data view box
        var sets = this.setting;     // Graph configure object
        var fvc = this.dataValues.length;      // Length of array

        if(fvc < 1) return null;

        var xBlank;        // Blank interval parameter on the X axis
        var xShapePositions = [];         // Graphic location on the X axis
        var xShapeWidth = 0;          //Graphic width on the X axis
        var dvbWidth = this.DVBWidth;            //  Width of dataViewbox
        var unitOffset = 0;               // Unit offset
        //  Process of blank interval parameter on the X axis
        if(sets.xShapeBlank && sets.xShapeBlank.length && sets.xShapeBlank.length == 2){
            xBlank = sets.xShapeBlank;
            var xsLen =  dvbWidth - (xBlank[0] + xBlank[1]);
            if(xsLen <= fvc){  return null; }
            unitOffset = xsLen/(fvc - 1);
        }
        else{
            //Default equal blank interval is graph width
            unitOffset = dvbWidth/(fvc + 1);
            xBlank = [unitOffset, unitOffset, unitOffset];
        }

        // Calculation of graphic location on the X axis
        var xOffset = 0
        for(var i = 0; i < fvc; i++){
            if(i == 0){
                xOffset = xBlank[0];
            }
            else{
                xOffset += unitOffset;
            }

            xShapePositions.push(dvb[0] + xOffset);
        }

        return {
            "xPositions": xShapePositions,
            "width": xShapeWidth
        };
    },

    CLASS_NAME: "SuperMap.Feature.Theme.Point"
});
