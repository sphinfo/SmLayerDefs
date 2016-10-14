(function(){
    /*-----------To add a new item, just add a item in the corresponding place-----------*/
    /*-----------And make up its relative address relative to the root directory, as well as its name-----------*/
    var nav=[
        {href:"index.html",text:"Home"},
        {href:"examples/intro.html",text:"Production Introduction"},
        {href:"examples/developGuide.html",text:"Develper Guide"},
        {href:"examples/examples.html",text:"Samples"},
        {href:"examples/UML.pdf",text:"Class Diagram"},
        {href:"apidoc/index.html",text:"API"},
        {href:"",text:"Technical Themes",dropdown:[
            {href:"examples/dyncSegmentationTopic.html",text:"Dynamic Segmentation"},
            {href:"examples/rendererTopic.html",text:"Vector Rendering"},
            {href:"examples/mobileTopic.html",text:"Offline Cache and APP"},
            {href:"examples/Win8AppTopic.html",text:"Win8 APP Store Development"},
           {href:"examples/VisualTopic.html",text:"Visual",dropdown:[
                {href:"examples/HeatMapLayerTopic.html",text:"Heat Map"},
               {href:"examples/ClusterLayerTopic.html",text:"Cluster Layer"},
                {href:"examples/HeatGridLayerTopic.html",text:"Heat Grid Layer"},
                {href:"examples/UTFGridLayerTopic.html",text:"UTF Grid"},
                {href:"examples/GOISTopic.html",text:"GOIs"},
                {href:"examples/ElementsTopic.html",text:"Extension"},
                {href:"examples/TileVectorTopic.html",text:"Vector Tiles"},
                {href:"examples/AnimatorTopic.html",text:"Space-time Data"},
                {href:"examples/ThemeLayerGraphTopic.html",text:"Client statistical thematic map"}
            ]}
        ]
        }
    ];

    var _getScriptLocation=(function() {
        var r = new RegExp("(^|(.*?\\/))(js/navbar.js)(\\?|$)"),
            s = document.getElementsByTagName('script'),
            src, m, l = "";
        for(var i=0, len=s.length; i<len; i++) {
            src = s[i].getAttribute('src');
            if(src) {
                var m = src.match(r);
                if(m) {
                    l = m[1];
                    break;
                }
            }
        }
        return (function() { return l; });
    })();

    var commonPath=commonPath=_getScriptLocation();
    commonPath=commonPath.indexOf("examples")>-1?commonPath.replace("examples","."):"../"+commonPath;

    var path00= commonPath+nav[0]["href"];
    var outer_head='<div class="navbar-inner">'+
        '<div class="container">'+
        '<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">'+
        '<span class="icon-bar"></span>'+
        '<span class="icon-bar"></span>'+
        '<span class="icon-bar"></span>'+
        '</a>'+
        '<a class="brand" href="'+path00+'">JavaScript API</a> '+
        '<div class="nav-collapse"> '+
        '<ul class="nav" id="titleContent"> ';
    var outer_foot='</ul>'+
        '</div>'+
        '</div>'+
        '</div> ';
    var inner="";
    for(var i=0;i<nav.length;i++)
    {
        var li=nav[i];
        if(li.dropdown==undefined)
        {
            var pathii=commonPath+li["href"];
            inner+='<li class=""><a href="'+pathii+'">'+li["text"]+'</a></li>';
        }
        else
        {
            var h= '<li class="dropdown"> '+
                '<a class="dropdown-toggle" data-toggle="dropdown" href="">'+li["text"]+' <b class="caret"></b></a> '+
                '<ul class="dropdown-menu"> ';
            var f= '</ul>'+
                '</li>';
            var dropDown="";
            var d_li=li["dropdown"];
            for(var j=0;j<d_li.length;j++)
            {
                var pathjj=commonPath+d_li[j]["href"];
                if(d_li[j].dropdown==undefined)
                {
                    dropDown+='<li class=""><a href="'+pathjj+'">'+d_li[j]["text"]+'</a></li>';
                }
                else
                {
                    var h2= '<li class=""><a href="'+pathjj+'">'+d_li[j]["text"]+'</a>'+
                        '<ul > ';
                    var f2= '</ul>'+
                        '</li>';
                    var dropDown2="";
                    var d_li2=d_li[j]["dropdown"];
                    for(var k=0;k<d_li2.length;k++)
                    {
                        var pathkk=commonPath+d_li2[k]["href"];
                        dropDown2+='<li class=""><a href="'+pathkk+'">'+d_li2[k]["text"]+'</a></li>';
                    }
                    dropDown+=h2+dropDown2+f2;
                }
            }
            inner+=h+dropDown+f;
        }
    }


    var navHtml=outer_head +inner+outer_foot;
    var navElement=document.getElementById("navbar");
    navElement.innerHTML=navHtml;

    /*Find the consistent file with open document address in navigation bar, and the corresponding Li label className to active, to use the style*/
    var all_li=navElement.getElementsByTagName("li");
    var path=window.location.href;
    for(var i=0;i<all_li.length;i++)
    {
        var a=all_li[i].childNodes[0];
        if(a&&a.href&&(path.indexOf(a.href)>-1|| (path.match(/-js\.html/)&& a.href.indexOf("apidoc/index.html")>-1)))
        {
            all_li[i].className="active";
        }
    }
})();
