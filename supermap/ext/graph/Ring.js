/**
 * @requires SuperMap.Feature.Theme.js
 * @requires SuperMap.Feature.Theme.Graph.js
 *
 */

/**
 * Class: SuperMap.Feature.Theme.Ring
 * Ring graph
 *
 * Ring configuration object chartsSetting（<SuperMap.Layer.Graph::chartsSetting>） properties setting are as follows：
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
 * innerRingRadius - {Number} The radius of the inner ring, the default value: 0, the range of more than 0, less than the outer radius of the outer ring (outer ring radius: data view frame length and width of the smaller value of 1/2).
 *
 * sectorStyle - {Object} Based style of sector in a ring graph.This parameter controls the column base style, the priority is lower than the sectorStyleByFields and sectorStyleByCodomain。
 * This style object can be set to properties: <SuperMap.Feature.ShapeParameters.Sector::style> 。
 * sectorStyleByFields - {Array{Object}}  Set style for sector according to themeFields（<SuperMap.Layer.Graph::themeFields>）,this parameter field control the bar style,
 * The priority is lower than sectorStyleByCodomain,and higher than sectorStyle.The element in this array is a style object, which can be set to a property:  <SuperMap.Feature.ShapeParameters.Sector::style> 。
 * The style in this parameter corresponds to the field in the themeFields.such as: themeFields（<SuperMap.Layer.Graph::themeFields>） is ["POP_1992", "POP_1995", "POP_1999"],
 * sectorStyleByFields is [style1, style2, style3],in the graph, sector corresponding to the field of POP_1992 using the style1, a POP_1995 field corresponding to the sector using the style2 , sector field corresponds to POP_1999 using style3.
 * sectorStyleByCodomain - {Array{Object}} Value range of the Ring control the style, a higher priority than sectorStyle and sectorStyleByFields
 * (start code)
 * // sectorStyleByCodomain  Each element is an object containing information and domain and range corresponding to the style information, the object has three properties (must):
 * // start: range lower limit (included);
 * // end: range upper limit (not included);
 * // style:Data visualization graphics style, this style object can be set properties: <SuperMap.Feature.ShapeParameters.Sector::style> 。
 * // sectorStyleByCodomain array like：
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
 * sectorHoverStyle - {Object} Sector hover state style, effective when sectorHoverAble is true.
 * sectorHoverAble - {Object} Whether to allowe the bar to use the hover state, the default is allowed. At the same time, set the sectorHoverAble and sectorClickAble false, can be directly on the shielding sector thematic layer event response.
 * sectorClickAble - {Object} Whether to allowe the bar is clicked, the default is allowed. At the same time, sectorHoverAble and sectorClickAble are set to false, which can directly screen the response of the sector strip to the event layer.
 *
 * Inherits:
 *  - <SuperMap.Feature.Theme.Graph>
 */
SuperMap.Feature.Theme.Ring = SuperMap.Class(SuperMap.Feature.Theme.Graph, {

    /**
     * Constructor: SuperMap.Feature.Theme.Ring
     * Create a ring graph
     *
     * Parameters:
     * data - {<SuperMap.Feature.Vector>}  User data,required parameter
     * layer - {<SuperMap.Layer.Graph>}   The layer thematic elements in,required parameter.
     * fields - {Array{String}} data   Fields name that generate graph,required parameter.
     * setting - {Object}   Graph configure object,required parameter.。
     * lonlat - {<SuperMap.LonLat>} Location of thematic elements,default is the geographical elements bound center that data refer to.
     *
     * Returns:
     * {<SuperMap.Feature.Theme.Ring>}  Return a ring graph object
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

    //Assembly graphics (Extended Interface)
    assembleShapes: function(){
        // Important step:Initialization parameters
        if(!this.initBaseParameter()) return;
        // Default style array
        // A style array by default
        var defaultStyleGroup = [
            { fillColor: "#ff9277" }, { fillColor: "#dddd00" }, { fillColor: "#ffc877" }, { fillColor: "#bbe3ff" }, { fillColor: "#d5ffbb" },
            { fillColor: "#bbbbff" }, { fillColor: "#ddb000" }, { fillColor: "#b0dd00" }, { fillColor: "#e2bbff" }, { fillColor: "#ffbbe3" },
            { fillColor: "#ff7777" }, { fillColor: "#ff9900" }, { fillColor: "#83dd00" }, { fillColor: "#77e3ff" }, { fillColor: "#778fff" },
            { fillColor: "#c877ff" }, { fillColor: "#ff77ab" }, { fillColor: "#ff6600" }, { fillColor: "#aa8800" }, { fillColor: "#77c7ff" },
            { fillColor: "#ad77ff" }, { fillColor: "#ff77ff" }, { fillColor: "#dd0083" }, { fillColor: "#777700" }, { fillColor: "#00aa00" },
            { fillColor: "#0088aa" }, { fillColor: "#8400dd" }, { fillColor: "#aa0088" }, { fillColor: "#dd0000" }, { fillColor: "#772e00" }
        ];

        // Graph configure object
        var sets = this.setting;


        // Background box, unenabled by default
        if(sets.useBackground){
            this.shapes.push(SuperMap.Feature.ShapeFactory.Background(this.shapeFactory, this.chartBox, sets));
        }

        // Data value array
        var fv = this.dataValues;
        if(fv.length < 1) return;       // No data

        // Value range
        var codomain = this.DVBCodomain;
        // Detection of value range
        for(var i = 0; i < fv.length; i++){
            if(fv[i] < codomain[0] || fv[i] > codomain[1]) { return; }
        }

        // Sum of absolute value of a value
        var valueSum = 0;
        for(var i = 0; i < fv.length; i++){
            valueSum += Math.abs(fv[i]);
        }

        // Important steps: the definition of unit chart Ring data view box value meaning, unit value: value of each representative of
        this.DVBUnitValue = 360/valueSum;
        var uv = this.DVBUnitValue;
        
        var dvbCenter = this.DVBCenterPoint;        // Data view center as the center of the sector

        var startAngle = 0;         // Sector start edge angle
        var endAngle = 0;          // Sector end edge angle
        var startAngleTmp = startAngle;           // Temporary sector start edge angle
        // Sector (adaptive) radius
        var r = this.DVBHeight < this.DVBWidth? this.DVBHeight/2 : this.DVBWidth/2;

        // Sector inner ring (adaptive) radius
        var r0 = (typeof(sets.innerRingRadius) !== "undefined"
            && !isNaN(sets.innerRingRadius)
            && sets.innerRingRadius >= 0
            && sets.innerRingRadius < r)? sets.innerRingRadius: 0;

        for(var i = 0; i < fv.length; i++){
            var fvi = Math.abs(fv[i]);

            // End of calculation
            if(i === 0){
                endAngle = startAngle + fvi*uv;
            }
            else if(i === fvi.length -1){
                endAngle = startAngleTmp;
            }
            else{
                endAngle = startAngle + fvi*uv;
            }

            // Sector parameter object
            var sectorSP =  new SuperMap.Feature.ShapeParameters.Sector(dvbCenter[0], dvbCenter[1], r, startAngle, endAngle, r0);
            // Sector style
            if(typeof(sets.sectorStyleByFields) === "undefined"){
                // Use style array by default
                var colorIndex = i % defaultStyleGroup.length;
                sectorSP.style = SuperMap.Feature.ShapeFactory.ShapeStyleTool(null, sets.sectorStyle, defaultStyleGroup, null, colorIndex);
            }
            else{
                sectorSP.style = SuperMap.Feature.ShapeFactory.ShapeStyleTool(null, sets.sectorStyle, sets.sectorStyleByFields, sets.sectorStyleByCodomain, i, fv[i]);
            }

            // Sector hover style
            sectorSP.highlightStyle = SuperMap.Feature.ShapeFactory.ShapeStyleTool(null, sets.sectorHoverStyle);
            // Sector hover and click setting
            if(typeof(sets.sectorHoverAble) !== "undefined"){
                sectorSP.hoverable = sets.sectorHoverAble;
            }
            if(typeof(sets.sectorClickAble) !== "undefined"){
                sectorSP.clickable = sets.sectorClickAble;
            }
            // Data information the graphic with
            sectorSP.refDataID = this.data.id;
            sectorSP.dataInfo =  {
                field: this.fields[i],
                value:  fv[i]
            };;

            // Create a sector and add this sector to the graph array
            this.shapes.push(this.shapeFactory.createShape(sectorSP));

            // To the end angle as the starting angle of the next
            startAngle = endAngle;
        }

        // mportant steps: the graphics to the ground by the relative coordinates of the graphics, so we can re drawing graphics in the process of map translation and zooming
        this.shapesConvertToRelativeCoordinate();
    },

    CLASS_NAME: "SuperMap.Feature.Theme.Ring"
});
