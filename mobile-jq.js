// Start with the map page
window.location.replace(window.location.href.split("#")[0] + "#mappage");

var selectedFeature = null;

$(document).ready(function() {

    // fix height of content
    function fixContentHeight() {
        var footer = $("div[data-role='footer']:visible"),
            content = $("div[data-role='content']:visible:visible"),
            viewHeight = $(window).height(),
            contentHeight = viewHeight - footer.outerHeight();

        if ((content.outerHeight() + footer.outerHeight()) !== viewHeight) {
            contentHeight -= (content.outerHeight() - content.height() + 1);
            content.height(contentHeight);
        }

        if (window.map && window.map instanceof OpenLayers.Map) {
            map.updateSize();
        } else {
            // initialize map
            init(function(feature) { 
                selectedFeature = feature; 
                $.mobile.changePage("#popup", "pop"); 
            });
            //initLayerList();
        }
    }
    $(window).bind("orientationchange resize pageshow", fixContentHeight);
    document.body.onload = fixContentHeight;

    // Map zoom  
    $("#plus").click(function(){
        map.zoomIn();
    });
    $("#minus").click(function(){
        map.zoomOut();
    });
    $("#locate").click(function(){
        var control = map.getControlsBy("id", "locate-control")[0];
        if (control.active) {
            control.getCurrentLocation();
        } else {
            control.activate();
        }
    });
    
    $('#popup').live('pageshow',function(event, ui){
        var cur_intID = '';
        for (var attr in selectedFeature.attributes){
            if (attr == "node_id") {
                cur_intID = selectedFeature.attributes[attr];
                document.getElementById("intersectionID").innerHTML = cur_intID;
            }
        }

        /*put the query together to get info from the corners table in CartoDB*/
        var stNmQuery = "q=SELECT st_rt_nm, st_lf_nm from corners where intersecti = '" +cur_intID+"' limit 1";
        var url = "http://pdxmele.cartodb.com/api/v2/sql?"+stNmQuery;

        /*request & parse the json*/
        $.getJSON(url, function (data) {
             $.each(data.rows[0], function(key, val) {
                //name of right street
                if (key == 'st_rt_nm') {
                    document.getElementById("streetR").innerHTML = val;
                    }
                //name of left street
                if (key == 'st_lf_nm') {
                    document.getElementById("streetL").innerHTML = val;
                    }
                });
            });

        /* old popup info fill code
        for (var attr in selectedFeature.attributes){
            if (attr == "id") {
                document.getElementById("cornerID").innerHTML = selectedFeature.attributes[attr];
            }
            if (attr == "c_direct"){
                document.getElementById("direction").innerHTML = selectedFeature.attributes[attr];
            }
            if (attr == "st_lf_nm"){
                document.getElementById("streetR").innerHTML = selectedFeature.attributes[attr];
            }
            if (attr == "st_rt_nm"){
                document.getElementById("streetL").innerHTML = selectedFeature.attributes[attr];
            }
        }
        */
        
    });
    $('#intersectionpage').live('pageshow',function(event, ui){
        init_two();
    });

});

/* function initLayerList() {
    $('#layerspage').page();
    $('<li>', {
            "data-role": "list-divider",
            text: "Base Layers"
        })
        .appendTo('#layerslist');
    var baseLayers = map.getLayersBy("isBaseLayer", true);
    $.each(baseLayers, function() {
        addLayerToList(this);
    });

    $('<li>', {
            "data-role": "list-divider",
            text: "Overlay Layers"
        })
        .appendTo('#layerslist');
    var overlayLayers = map.getLayersBy("isBaseLayer", false);
    $.each(overlayLayers, function() {
        addLayerToList(this);
    });
    $('#layerslist').listview('refresh');
    
    map.events.register("addlayer", this, function(e) {
        addLayerToList(e.layer);
    });
}

function addLayerToList(layer) {
    var item = $('<li>', {
            "data-icon": "check",
            "class": layer.visibility ? "checked" : ""
        })
        .append($('<a />', {
            text: layer.name
        })
            .click(function() {
                $.mobile.changePage('#mappage');
                if (layer.isBaseLayer) {
                    layer.map.setBaseLayer(layer);
                } else {
                    layer.setVisibility(!layer.getVisibility());
                }
            })
        )
        .appendTo('#layerslist');
    layer.events.on({
        'visibilitychanged': function() {
            $(item).toggleClass('checked');
        }
    });
} */