/**
 * @requires SuperMap.Feature.Theme.js
 * @requires SuperMap.Feature.Theme.Graph.js
 */

/**
 * Class: SuperMap.Feature.Theme.Bar3D
 * 3D Bar graph
 *
 * Bar Bar configuration object chartsSetting（<SuperMap.Layer.Graph::chartsSetting>） properties setting are as follows：
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
 * length for 3 of the array, the first element is the blank space between left of first figure and the left end of the data view box, the second element is the blank space between graphics.
 * third elements that represent the end of the right end of the graph and the blank space between the right end of the data view.
 *
 * bar3DParameter - {Number} 3D bar parameter, the 3D column positive direction relative to the back direction of the X axis and the Y axis, the default value: 10.
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
* axis3DParameter - {Number} 3D axis parameters, this property value is effective when it is greater than or equal to 15, the default value: 20.
 *
 * barFaceStyle - {Object} A 3d bar graph front face based style，This parameter controls the bar front face base style, the priority is lower than the barFaceStyleByFields and barFaceStyleByCodomain。
 * This style object can be set to properties: <SuperMap.Feature.ShapeParameters.Polygon::style> 。
 * barFaceStyleByFields - {Array{Object}} Set style for bar front face according to themeFields（<SuperMap.Layer.Graph::themeFields>）,this parameter controls the bar front face  base style,
 * The priority is lower than barFaceStyleByCodomain,and higher than barFaceStyle. The element in this array is a style object, which can be set to a property: <SuperMap.Feature.ShapeParameters.Polygon::style> 。
 * The style in this parameter corresponds to the field in the themeFields.such as: themeFields（<SuperMap.Layer.Graph::themeFields>） is ["POP_1992", "POP_1995", "POP_1999"],
 * barFaceStyleByFields is [style1, style2, style3],in the graph, the bar front face corresponding to the field of POP_1992 using the style1, a POP_1995 field corresponding to the bar side face using the style2 column, the bar roof face field corresponds to POP_1999 using style3.
 * barFaceStyleByCodomain - {Array{Object}} Value range of the bar control the style, a higher priority than barFaceStyle and barFaceStyleByFields。
 * (start code)
 * // barFaceStyleByCodomain  Each element is an object containing information and domain and range corresponding to the style information, the object has three properties (must):
 * // end: range lower limit (included);
 * // end: range upper limit (not included);
 * // style:Data visualization graphics style, this style object can be set properties: <SuperMap.Feature.ShapeParameters.Polygon::style> 。
 * // barFaceStyleByCodomain array like：
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
 *
 * barSideStyle - {Object} A 3d bar graph side face based style，This parameter controls the bar side face base style, the priority is lower than the barSideStyleByFields and barSideStyleByCodomain。
 * This style object can be set to properties: <SuperMap.Feature.ShapeParameters.Polygon::style>.
 * barSideStyleByFields - {Array{Object}} Set style for bar front face according to themeFields（<SuperMap.Layer.Graph::themeFields>）,this parameter controls the bar side face base style,
 * The priority is lower than barFaceStyleByCodomain,and higher than barFaceStyle. The element in this array is a style object, which can be set to a property: <SuperMap.Feature.ShapeParameters.Polygon::style> 。
 * The style in this parameter corresponds to the field in the themeFields.such as: themeFields（<SuperMap.Layer.Graph::themeFields>） is ["POP_1992", "POP_1995", "POP_1999"],
 * barSideStyleByFields is [style1, style2, style3],in the graph, the bar front face corresponding to the field of POP_1992 using the style1, a POP_1995 field corresponding to the bar side face using the style2 , the bar roof face field corresponds to POP_1999 using style3.
 * barSideStyleByCodomain - {Array{Object}} Value range of the bar control the style, a higher priority than barSideStyle and barSideStyleByFields。
 * (start code)
 * // barSideStyleByCodomain  Each element is an object containing information and domain and range corresponding to the style information, the object has three properties (must):
 * // end: range lower limit (included);
 * // end: range upper limit (not included);
 * // style:Data visualization graphics style, this style object can be set properties: <SuperMap.Feature.ShapeParameters.Polygon::style> 。
 * // barSideStyleByCodomain array like：
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
 * 
 * barTopStyle - {Object} A 3d bar graph top face based style，This parameter controls the bar side face base style, the priority is lower than the barTopStyleByFields and barTopStyleByCodomain。
 * This style object can be set to properties: <SuperMap.Feature.ShapeParameters.Polygon::style>.
 * barTopStyleByFields - {Array{Object}} Set style for bar front face according to themeFields（<SuperMap.Layer.Graph::themeFields>）,this parameter controls the bar side face base style,
 * The priority is lower than barTopStyleByCodomain,and higher than barTopStyle. The element in this array is a style object, which can be set to a property: <SuperMap.Feature.ShapeParameters.Polygon::style> 。
 * The style in this parameter corresponds to the field in the themeFields.such as: themeFields（<SuperMap.Layer.Graph::themeFields>） is ["POP_1992", "POP_1995", "POP_1999"],
 * barTopStyleByFields is [style1, style2, style3],in the graph, the bar front face corresponding to the field of POP_1992 using the style1, a POP_1995 field corresponding to the bar side face using the style2 , the bar roof face field corresponds to POP_1999 using style3.
 * barTopStyleByCodomain - {Array{Object}} Value range of the bar control the style, a higher priority than barTopStyle and barTopStyleByFields。
 * (start code)
 * // barTopStyleByCodomain  Each element is an object containing information and domain and range corresponding to the style information, the object has three properties (must):
 * // end: range lower limit (included);
 * // end: range upper limit (not included);
 * // style:Data visualization graphics style, this style object can be set properties: <SuperMap.Feature.ShapeParameters.Polygon::style> 。
 * // barTopStyleByCodomain array like：
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
 *
 
 * barFaceHoverStyle - {Object} 3d Bar front face hover state style, effective when barHoverAble is true.
 * barSideHoverStyle - {Object} 3d Bar side face hover state style, effective when barHoverAble is true.The default value:barFaceHoverStyle.
 * barTopHoverStyle - {Object}  3d Bar roof face hover state style, effective when barHoverAble is true.The default value:barFaceHoverStyle.
 *
 * barHoverAble - {Object} Whether to allowe the bar to use the hover state, the default is allowed. At the same time, set the barHoverAble and barClickAble false, can be directly on the shielding column thematic layer event response.
 * barClickAble - {Object} Whether to allowe the bar is clicked, the default is allowed. At the same time, barHoverAble and barClickAble are set to false, which can directly screen the response of the column strip to the event layer.
 *
 * Inherits:
 *  - <SuperMap.Feature.Theme.Graph>
 */
SuperMap.Feature.Theme.Bar3D = SuperMap.Class(SuperMap.Feature.Theme.Graph, {

    /**
     * Constructor: SuperMap.Feature.Theme.Bar3D
     * Create a 3D bar graph
     *
     * Parameters:
     * data - {<SuperMap.Feature.Vector>}  User data,required parameter
     * layer - {<SuperMap.Layer.Graph>}   The layer thematic elements in,required parameter.
     * fields - {Array{String}} data   Fields name that generate graph,required parameter.
     * setting - {Object}   Graph configure object,required parameter.。
     * lonlat - {<SuperMap.LonLat>} Location of thematic elements,default is the geographical elements bound center that data refer to.
     *
     * Returns:
     * {<SuperMap.Feature.Theme.Bar3D>}  Return a bar graph onject
     */
    initialize: function(data, layer, fields, setting, lonlat) {
        SuperMap.Feature.Theme.Graph.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: destroy
     * Destroy object. All properties of the object are null after calling destory function
     */
    destroy: function() {
        SuperMap.Feature.Theme.Graph.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: assembleShapes
     * Graphic assembly function
     */
    assembleShapes: function(){
        // Graph configure object
        var sets = this.setting;

        // Default dataView box
        if(!sets.dataViewBoxParameter){
            if(typeof(sets.useAxis) === "undefined" || sets.useAxis){
                sets.dataViewBoxParameter = [45, 25, 20, 20];
            }
            else{
                sets.dataViewBoxParameter = [5, 5, 5, 5];
            }
        }

        // 3D bar graph of the default axis using the default arrow
        sets.axisUseArrow = (typeof(sets.axisUseArrow) !== "undefined")? sets.axisUseArrow: true;
        sets.axisXLabelsOffset = (typeof(sets.axisXLabelsOffset) !== "undefined")? sets.axisXLabelsOffset: [-10, 10];

        // Important step:Initialization parameters
        if(!this.initBaseParameter()) return;

        // Value
        var codomain = this.DVBCodomain;
        // Important step:Defines the meaning of unit values in the graph Bar data view box
        this.DVBUnitValue = (codomain[1]-codomain[0])/this.DVBHeight;

        // dataView box
        var dvb = this.dataViewBox;
        // Data value
        var fv = this.dataValues;
        if(fv.length < 1) return;       // No data

        // Process data overflow
        for(var i = 0, fvLen = fv.length; i < fvLen; i++){
            if(fv[i] < codomain[0] || fv[i] > codomain[1]) return;
        }

        // Get graphic information on the X axis
        var xShapeInfo = this.calculateXShapeInfo(dvb, sets, "Bar3D", fv.length);
        if(!xShapeInfo) return;
        // X position of each bar
        var xsLoc = xShapeInfo.xPositions;
        // Bar width
        var xsWdith = xShapeInfo.width;

        // Background box, enabled by default
        if(typeof(sets.useBackground) === "undefined" || sets.useBackground){
            this.shapes.push(SuperMap.Feature.ShapeFactory.Background(this.shapeFactory, this.chartBox, sets));
        }

        // Coordinate axis
        if(!sets.axis3DParameter || isNaN(sets.axis3DParameter) || sets.axis3DParameter < 15){
            sets.axis3DParameter = 20;
        }
        if(typeof(sets.useAxis) === "undefined" || sets.useAxis){
            this.shapes = this.shapes.concat(SuperMap.Feature.ShapeFactory.GraphAxis(this.shapeFactory, dvb, sets, xShapeInfo));
        }

        // 3d offset, default value is 10;
        var offset3d = (sets.bar3DParameter && !isNaN(sets.bar3DParameter))? sets.bar3DParameter: 10;

        for(var i = 0; i < fv.length; i++){
            // Cylinder top y coordinates without 3D offset
            var yPx = dvb[1] - (fv[i] - codomain[0])/this.DVBUnitValue;
            // x and y coordinates of the bar without 3D offset
            var iPoiL =  xsLoc[i] - xsWdith/2;
            var iPoiR =  xsLoc[i] + xsWdith/2;

            // The top surface node of the 3D bar
            var bar3DTopPois = [
                [iPoiL, yPx],
                [iPoiR, yPx],
                [iPoiR - offset3d, yPx + offset3d],
                [iPoiL - offset3d, yPx + offset3d]
            ];

            // The side surface node of the 3D bar
            var bar3DSidePois = [
                [iPoiR, yPx],
                [iPoiR - offset3d, yPx + offset3d],
                [iPoiR - offset3d, dvb[1] + offset3d],
                [iPoiR,  dvb[1]]
            ];

            // The front surface node of the 3D bar
            var bar3DFacePois = [
                [iPoiL - offset3d, dvb[1] + offset3d],
                [iPoiR - offset3d, dvb[1] + offset3d],
                [iPoiR - offset3d, yPx + offset3d],
                [iPoiL - offset3d, yPx + offset3d]
            ];
            if(offset3d <= 0){  // offset3d <= 0 front face without 3D offset
                bar3DFacePois = [
                    [iPoiL, dvb[1]],
                    [iPoiR, dvb[1]],
                    [iPoiR, yPx],
                    [iPoiL, yPx]
                ];
            }

            // Creat 3D bar parameter object of top,side and front suface.
            var polyTopSP = new SuperMap.Feature.ShapeParameters.Polygon(bar3DTopPois);
            var polySideSP = new SuperMap.Feature.ShapeParameters.Polygon(bar3DSidePois);
            var polyFaceSP = new SuperMap.Feature.ShapeParameters.Polygon(bar3DFacePois);


            // Default style of side and front suface
            sets.barSideStyle = sets.barSideStyle? sets.barSideStyle: sets.barFaceStyle;
            sets.barSideStyleByFields = sets.barSideStyleByFields? sets.barSideStyleByFields: sets.barFaceStyleByFields;
            sets.barSideStyleByCodomain = sets.barSideStyleByCodomain? sets.barSideStyleByCodomain: sets.barFaceStyleByCodomain;
            sets.barTopStyle = sets.barTopStyle? sets.barTopStyle: sets.barFaceStyle;
            sets.barTopStyleByFields = sets.barTopStyleByFields? sets.barTopStyleByFields: sets.barFaceStyleByFields;
            sets.barTopStyleByCodomain = sets.barTopStyleByCodomain? sets.barTopStyleByCodomain: sets.barFaceStyleByCodomain;
            // Style of front,side and front suface style
            polyFaceSP.style = SuperMap.Feature.ShapeFactory.ShapeStyleTool({stroke: true, strokeColor: "#ffffff", fillColor: "#ee9900"},
                sets.barFaceStyle, sets.barFaceStyleByFields, sets.barFaceStyleByCodomain, i, fv[i]);
            polySideSP.style = SuperMap.Feature.ShapeFactory.ShapeStyleTool({stroke: true, strokeColor: "#ffffff", fillColor: "#ee9900"},
                sets.barSideStyle, sets.barSideStyleByFields, sets.barSideStyleByCodomain, i, fv[i]);
            polyTopSP.style = SuperMap.Feature.ShapeFactory.ShapeStyleTool({stroke: true, strokeColor: "#ffffff", fillColor: "#ee9900"},
                sets.barTopStyle, sets.barTopStyleByFields, sets.barTopStyleByCodomain, i, fv[i]);

            // 3d bar hover style
            sets.barSideHoverStyle = sets.barSideHoverStyle? sets.barSideHoverStyle: sets.barFaceHoverStyle;
            sets.barTopHoverStyle = sets.barTopHoverStyle? sets.barTopHoverStyle: sets.barFaceHoverStyle;
            polyFaceSP.highlightStyle = SuperMap.Feature.ShapeFactory.ShapeStyleTool({stroke: true}, sets.barFaceHoverStyle);
            polySideSP.highlightStyle = SuperMap.Feature.ShapeFactory.ShapeStyleTool({stroke: true}, sets.barSideHoverStyle);
            polyTopSP.highlightStyle = SuperMap.Feature.ShapeFactory.ShapeStyleTool({stroke: true}, sets.barTopHoverStyle);

            // Data ID information & highlight mode the graph with
            polyTopSP.refDataID = polySideSP.refDataID = polyFaceSP.refDataID = this.data.id;
            // hover style(combination)
            polyTopSP.isHoverByRefDataID = polySideSP.isHoverByRefDataID = polyFaceSP.isHoverByRefDataID = true;
            // Hove group(When the mouse hover to any one of the graphics group, the entire group will be highlighted.refDataHoverGroup makes effect when isHoverByRefDataID is true)
            polyTopSP.refDataHoverGroup = polySideSP.refDataHoverGroup = polyFaceSP.refDataHoverGroup = SuperMap.Util.createUniqueID("lr_shg");
            // Data information the graph with
            polyTopSP.dataInfo = polySideSP.dataInfo = polyFaceSP.dataInfo = {
                field: this.fields[i],
                value: fv[i]
            };

            // 3d bar hover click  setting
            if(typeof(sets.barHoverAble) !== "undefined"){
                polyTopSP.hoverable = polySideSP.hoverable = polyFaceSP.hoverable = sets.barHoverAble;
            }
            if(typeof(sets.barClickAble) !== "undefined"){
                polyTopSP.clickable = polySideSP.clickable = polyFaceSP.clickable = sets.barClickAble;
            }

            // Create top, side, and positive graphics of the 3D bar and add to the list of graphics in the graph.
            this.shapes.push(this.shapeFactory.createShape(polySideSP));
            this.shapes.push(this.shapeFactory.createShape(polyTopSP));
            this.shapes.push(this.shapeFactory.createShape(polyFaceSP));
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
    * length for 3 of the array, the first element is the blank space between left of first figure and the left end of the data view box, the second element is the blank space between graphics.
    * third elements that represent the end of the right end of the graph and the blank space between the right end of the data view.
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

        //  Process of blank interval parameter on the X axis
        if(sets.xShapeBlank && sets.xShapeBlank.length && sets.xShapeBlank.length == 3){
            xBlank = sets.xShapeBlank;
            var xsLen =  dvbWidth - (xBlank[0] + xBlank[2] + (fvc - 1)*xBlank[1])
            if(xsLen <= fvc){ return null; }
            xShapeWidth = xsLen/fvc
        }
        else{
            //Default equal blank interval is graph width
            xShapeWidth = dvbWidth/(2*fvc + 1);
            xBlank = [xShapeWidth, xShapeWidth, xShapeWidth];
        }

        // Calculation of graphic location on the X axis
        var xOffset = 0
        for(var i = 0; i < fvc; i++){
            if(i == 0){
                xOffset = xBlank[0] + xShapeWidth/2;
            }
            else{
                xOffset += (xShapeWidth + xBlank[1]);
            }

            xShapePositions.push(dvb[0] + xOffset);
        }

        return {
            "xPositions": xShapePositions,
            "width": xShapeWidth
        };
    },

    CLASS_NAME: "SuperMap.Feature.Theme.Bar3D"
});
