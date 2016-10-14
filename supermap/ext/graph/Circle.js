/**
 * @requires SuperMap.Feature.Theme.js
 * @requires SuperMap.Feature.Theme.Graph.js
 *
 */

/**
 * Class: SuperMap.Feature.Theme.Circle
 * Circle
 *
 * Properties of symbolSetting (<SuperMap.Layer.RankSymbol::setting>) object of Circle:
 *
 * Symbolizer properties:
 * codomain - {Array{Number}} Data range can be represented by the graph. The length of the array is 2, with the 1st element indicating the lower limit and the 2nd element the uppper limit. Required.
 * maxR - {Number} Maximum radius of circle.
 * minR - {Number} Minimum radius of circle.
 * fillColor - {String} Fill color of circle, such as fillColor: "#FFB980"。
 * circleStyle - {Object} The base style style of the circle, with priority lower than circleStyleByFields and circleStyleByCodomain.
 * decimalNumber - {Number} The decimal number of ataValues array, with the range being [0, 16]. If not set, decimal number will not be handled while getting data values.
 * circleHoverStyle - {Object} The style of hover status for the circle. Valid when circleHoverAble is true.
 * circleHoverAble - {Object} Whether to allow the usage of hover status for circle. Default value is yes. Meanwhile, circleHoverAble and circleClickAble are set to false to disable response of grahics to thematic layer events.
 * circleClickAble - {Object} Whetehr to allow circle to be selected. The default value is yes. Meanwhile, circleHoverAble and circleClickAble are set to false to disable response of grahics to thematic layer events.
 *
 * Inherits:
 *  - <SuperMap.Feature.Theme.RankSymbol>
 */
SuperMap.Feature.Theme.Circle = SuperMap.Class(SuperMap.Feature.Theme.RankSymbol, {

    /**
     * Constructor: SuperMap.Feature.Theme.Circle
     * Create a circle.
     *
     * Parameters:
     * data - {<SuperMap.Feature.Vector>}  User data, required.
     * layer - {<SuperMap.Layer.RankSymbol>} Layer where this thematic feature is located. Required.
     * fields - {Array{String}} Fields participated in the graphic generation in data. Required.
     * setting - {Object} Graphic configuration object. Required.
     * lonlat - {<SuperMap.LonLat>} The geographic position of thematic feature. Default is center of bounds for geographic feature represented by data.
     *
     * Returns:
     * {<SuperMap.Feature.Theme.Circle>} Return a circle.
     */
    initialize: function(data, layer, fields, setting, lonlat) {
        SuperMap.Feature.Theme.RankSymbol.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: destroy
     * Destroy this thematic feature. The property of this object will be set to null after Call destroy 后此对象所以属性置为 null。
     */
    destroy: function() {
        SuperMap.Feature.Theme.Graph.prototype.destroy.apply(this, arguments);
    },

    //Grahpic configuration (extend interface)
    assembleShapes: function(){
        //Default fill color
        var defaultFillColor = "#ff9277";

        // Whether assigning value to setting property has been successful or not
        if(!this.setting) return false;
        var sets = this.setting;
        // Detect the requird parameters for setting
        if(!(sets.codomain)) return false;

        // Data
        var decimalNumber = (typeof(sets.decimalNumber) !== "undefined" && !isNaN(sets.decimalNumber))? sets.decimalNumber: -1;
        var dataEffective = SuperMap.Feature.Theme.getDataValues(this.data, this.fields, decimalNumber);
        this.dataValues = dataEffective? dataEffective: [];

        // Array of values
        var fv = this.dataValues;
        //if(fv.length != 1) return;       // No data or data is not unique
        //if(fv[0] < 0) return;            //Data is negative

        //The user should define the maximum radius and minimum radius. The default maximum radius is MaxR:100, and minimum radius is MinR:0;
        if(!sets.maxR) sets.maxR = 100;
        if(!sets.minR) sets.minR = 0;

        // Value range
        var codomain = this.DVBCodomain;

        // Important step: Define the meaning of unit valiue in the Circle data view box. Unit value: length that 1 represents
        // User defined value range
        if(codomain && codomain[1] - codomain[0] > 0){
            this.DVBUnitValue = sets.maxR/(codomain[1] - codomain[0]);
        }
        else{
            this.DVBUnitValue = sets.maxR/maxValue;
        }

        var uv = this.DVBUnitValue;
        //Circle radius
        var r = fv[0]*uv + sets.minR;
        this.width = 2*r;
        this.height = 2*r;

        // Important step: Initialization parameter
        if(!this.initBaseParameter()) return;

        //If the user has set value range, return directly if not in range
        if(codomain){
            if(fv[0] < codomain[0] || fv[0] > codomain[1]) { return; }
        }

        var dvbCenter = this.DVBCenterPoint;        // Data view box center as circel center

        //Circle object parameter
        var circleSP = new SuperMap.Feature.ShapeParameters.Circle(dvbCenter[0],dvbCenter[1],r);

        //circleSP.sytle initialization
        circleSP.style = SuperMap.Feature.ShapeFactory.ShapeStyleTool(null,sets.circleStyle,null,null,0);
        //Graphic fill color
        if(typeof (sets.fillColor) !== "undefined"){
            //User define
            circleSP.style.fillColor = sets.fillColor;
        }else{
            //Current default
            circleSP.style.fillColor = defaultFillColor;
        }
        //Circle hover style
        circleSP.highlightStyle = SuperMap.Feature.ShapeFactory.ShapeStyleTool(null,sets.circleHoverStyle);
        //Circle Hover and click setting
        if(typeof(sets.circleHoverAble) !== "undefined"){
            circleSP.hoverable = sets.circleHoverAble;
        }
        if(typeof(sets.circleClickAble) !== "undefined"){
            circleSP.clickable = sets.circleClickAble;
        }

        //Data info brought by graphic
        circleSP.refDataID = this.data.id;
        circleSP.dataInfo = {
            field: this.fields[0],
            r: r,
            value: fv[0]
        };

        // Create sector and add sector to graphic array
        this.shapes.push(this.shapeFactory.createShape(circleSP));

        // Important step: convert graphic into graphic represented by relative coordinates to ensure the fast drawing of grahic during map zoom
        // (Relative coordinates are required by graphic map, the assembleShapes() function must call the shapesConvertToRelativeCoordinate() function after configuration of the graphic
        this.shapesConvertToRelativeCoordinate();
    },

    CLASS_NAME: "SuperMap.Feature.Theme.Circle"
});
