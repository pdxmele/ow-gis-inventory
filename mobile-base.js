// My Bing API key. Please get your own at http://bingmapsportal.com/ and use that instead.
var apiKey = "Ao5Ew1XnxVey8Mh0jgfL32mbQN1pNLQoDv48u1r5BJrGsf8r0Bach7FYO5wTpbHl";

// initialize map when page ready
var map;
var i_map;
var wgs = new OpenLayers.Projection("EPSG:4326");
var sm = new OpenLayers.Projection("EPSG:900913");

    //unique styling so evaluated = y shows up differently
    var myStyleMap = new OpenLayers.StyleMap({pointRadius: 7});
    var lookup = {
        "y": {fillColor: "red"},
        "n": {fillColor: "green"}
        };
    myStyleMap.addUniqueValueRules("default", "evaluated", lookup);

/* first map */

var init = function (onSelectFeatureFunction) {

    var vector = new OpenLayers.Layer.Vector("Location range", {});

        var intersections = new OpenLayers.Layer.Vector("Intersections", {
        projection: wgs,
        strategies: [new OpenLayers.Strategy.BBOX(), 
            new OpenLayers.Strategy.Refresh({interval: 60000, force: true})],
        protocol: new OpenLayers.Protocol.Script({
            url: "http://pdxmele.cartodb.com/api/v2/sql",
            params: {
                q: "select * from intersections", 
                format: "geojson"
                },
            format: new OpenLayers.Format.GeoJSON({
                ignoreExtraDims: true
                }),
                callbackKey: "callback"
                }),
            styleMap: myStyleMap,
        });

    var selectControl = new OpenLayers.Control.SelectFeature(intersections, {
        autoActivate:true,
        onSelect: onSelectFeatureFunction});

    var geolocate = new OpenLayers.Control.Geolocate({
        id: 'locate-control',
        geolocationOptions: {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 7000
        }
    });
    // create map
    map = new OpenLayers.Map({
        div: "map",
        theme: null,
        projection: sm,
        numZoomLevels: 18,
        controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            }),
            geolocate,
            selectControl
        ],
        layers: [
            new OpenLayers.Layer.OSM("OpenStreetMap", null, {
                transitionEffect: 'resize'
            }),
            vector, //the geolocation display
            intersections
        ],
        center: new OpenLayers.LonLat(-13654000, 5705400),
        zoom:18
    });

    /*geolocation stuff*/
    var style = {
        fillOpacity: 0.1,
        fillColor: '#000',
        strokeColor: '#f00',
        strokeOpacity: 0.6
    };
    geolocate.events.register("locationupdated", this, function(e) {
        vector.removeAllFeatures();
        vector.addFeatures([
            new OpenLayers.Feature.Vector(
                e.point,
                {},
                {
                    graphicName: 'cross',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 10
                }
            ),
            //after geolocates, draws a location range on the map
            new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                    e.position.coords.accuracy / 2,
                    50,
                    0
                ),
                {},
                style
            )
        ]);
        map.zoomToExtent(vector.getDataExtent());
    });
};

/* initialize ramp-by-ramp intersection page */

function init_two() {
    $('#i_map').empty(); //clears map div to fix duplicating map bug?

    var cStyleMap = new OpenLayers.StyleMap({
        "default": {
            externalGraphic: "img/two_arrows_plain.png",
            //graphicWidth: 17,
            graphicHeight: 30,
            //graphicXOffset: 4,
            //graphicYOffset: 4,
            rotation: "${im_angle}", //this is the field representing the proper angle/bearing for the image so that it properly represents the ramp directions
            fillOpacity: 1 //"${opacity}"
            }/*,
        "select": {
            cursor: "crosshair",
            //externalGraphic: "../img/marker.png"
            }*/
        });


    var cartoDB = new OpenLayers.Layer.Vector("Ramps", {
        projection: wgs,
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.Script({
            url: "http://pdxmele.cartodb.com/api/v2/sql",
            params: {
                q: "select * from corners where intersecti ='" +document.getElementById("intersectionID").innerHTML+ "'", 
                format: "geojson"
                },
            format: new OpenLayers.Format.GeoJSON({
                ignoreExtraDims: true
                }),
                callbackKey: "callback"
                }),
            styleMap: cStyleMap,
            //zoom to extent
            eventListeners: {
                "featuresadded": function() {
                        this.map.zoomToExtent(this.getDataExtent());
                        }
                    }
        });
    // create map
    i_map = new OpenLayers.Map({
        div: "i_map",
        theme: null,
        projection: sm,
        numZoomLevels: 18,
        controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            })//,
            //selectControl
        ],
        layers: [
            new OpenLayers.Layer.Bing({
                key: apiKey,
                type: "AerialWithLabels",
                name: "Bing Aerial + Labels",
                transitionEffect: 'resize'
            }),
            cartoDB
        ],
        center: new OpenLayers.LonLat(-13654000, 5705400),
        zoom:18
    });

    document.getElementById("streetR2").innerHTML = document.getElementById("streetR").innerHTML;
    document.getElementById("streetL2").innerHTML = document.getElementById("streetL").innerHTML;
}
