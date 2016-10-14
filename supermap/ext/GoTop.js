/**
 * When the page scroll bar is not at the top, the top button appears. You can click the button to go back to the top of the page.
 *
 * use <script src="./js/GoTop.js" id="js_gotop"></script>
 */
window.onload = function() {
    //Get the current path and then handle the image path, which is an absolute path (to avoid errors for reference at multiple places)
    var path = document.getElementById('js_gotop').src;
    path_out = path.replace("js/GoTop.js","images/gotop_out.png");
    path_over = path.replace("js/GoTop.js","images/gotop_over.png");
    // html element
    var div = document.createElement('div');
    div.id = "gotop";
    div.onmouseout = function(e){this.firstChild.src = path_out};
    div.onmouseover = function(e){this.firstChild.src = path_over};
    div.setAttribute("style","display:'';position:fixed;width:30px;height:30px;bottom:50px;right:50px;opacity:0;margin: 20px");
    document.body.appendChild(div);
    var inner = '<img border=0 src='+'"'+path_out+'"'+'>';
    document.getElementById('gotop').innerHTML = inner;

    //Screen scroll    element fade    parameter settings
    window.onscroll = function() {
        getScrollTop() > 0 ? fadein(div,100,1000,5): fadeout(div,0,1000,5);
    };
    //Element click event
    div.onclick = function() {
        var goTop = setInterval(scrollMove, 10);
        function scrollMove() {
            setScrollTop(getScrollTop() / 1.1);
            if (getScrollTop() < 1) clearInterval(goTop);
        }
    };

    /**
     * Get the scroll bar height
     *
     * @returns {number} The scroll bar height
     */
    function getScrollTop() {
        return document.documentElement.scrollTop + document.body.scrollTop;
    }
    /**
     * Set the value of the scroll bar
     *
     * @param value
     */
    function setScrollTop(value) {
        if (document.documentElement.scrollTop) {
            document.documentElement.scrollTop = value;
        } else {
            document.body.scrollTop = value;
        }
    }

    /**
     * Element transparency settings    browser compatibility
     *
     * @param element Element
     * @param opacity Transparency 0-100 positive integer
     */
    function setOpacity(element,opacity){
        //Compatible with the new version of IE and firefox Chrome
        if(element.style.opacity !== undefined)
        {
            element.style.opacity = opacity/100;
        }
        else {
            element.style.filter = "alpha(opacity = "+ opacity +")"; //兼容老版的IE
        }
    }

    /**
     * Fade in
     *
     * @param element Element
     * @param opacity Final transparency 0-100 positive integer
     * @param time Total time in milliseconds
     * @param value Change of each time, positive integer value 0-100
     */
    function fadein(element, opacity,time,value){
        if(element){
            //Gets the current transparency
            var v = element.style.opacity || element.style.filter.replace("alpha(opacity=","").replace(")","");
            v = v > 1 ? v*1 : v*100;
            //Change transparency
            var changeopacity = opacity - v;
            if(changeopacity <= 0) return;
            //Element is visible
            element.style.display = "";
            //Times change
            var count = changeopacity/value;
            //Change time interval
            var speed = time/count;
            var timer = null;
            timer = setInterval(function(){
                if(v<opacity) {
                    v +=value;
                    setOpacity(element,v);
                }
                else{
                    clearInterval(timer);
                }
            },speed);
        }
    }

    /**
     * Fade out
     *
     * @param element Element
     * @param opacity Final transparency 0-100 positive integer
     * @param time Total time in milliseconds
     * @param value Change of each time, positive integer value 0-100
     */
    function fadeout(element,opacity,time,value){
        if(element){
            //Gets the current transparency
            var v = element.style.filter.replace("alpha(opacity=","").replace(")","") || element.style.opacity || 100;
            v = v > 1 ? v*1 : v*100;
            //Change transparency
            var changeopacity = v - opacity;
            if(changeopacity <= 0) return;
           //Times change
            var count = changeopacity/value;
            //Change time interval
            var speed = time/count;
            var timer = null;
            timer = setInterval(function(){
                if((v-value) >= opacity){
                    v -= value;
                    setOpacity(element,v);
                }
                else {
                    clearInterval(timer);
                    element.style.display = "none";
                }
            },speed)
        }
    }
};


