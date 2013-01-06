$( document ).delegate("#one", "pageinit", function() {
	//alert('A page with an id of "one" was just created by jQuery Mobile!');

//$(document).ready(function() {

	//$('#map').css('height', '350px');

    var bing = new L.BingLayer("Ao5Ew1XnxVey8Mh0jgfL32mbQN1pNLQoDv48u1r5BJrGsf8r0Bach7FYO5wTpbHl");

    /*var mapQuest = new L.TileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
        maxZoom: 18,
        subdomains: ["otile1", "otile2", "otile3", "otile4"],
        attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Map data (c) <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.'
        });  */        

    var map = new L.Map('map', {
        center: new L.LatLng(45.53266, -122.66002),
        zoom: 18,
        zoomControl: false,
        });
           
    //map.addLayer(mapQuest);
    map.addLayer(bing);

    var myQuery = 'SELECT * FROM {{table_name}} WHERE "intersecti" = \'' + intdata + '\'';

    cartodb.createLayer(map, 'http://pdxmele.cartodb.com/api/v1/viz/corners/viz.json', {
        query: myQuery,
        opacity: 1,
        //interactivity: "cartodb_id, id, intersecti",
        }).on('done', function(layer) {
            map.addLayer(layer);
            layer.setInteraction(false);
            layer.on('error', function(err) {
                cartodb.log.log('error: ' + err);
                });
            }).on('error', function() {
                cartodb.log.log("some error occurred");
                });

    //pan to features
    myQuery2 = 'SELECT * FROM corners WHERE "intersecti" = \'' + intdata + '\'';
    var sql = new cartodb.SQL({ user: 'pdxmele' });
    sql.getBounds(myQuery2).done(function(bounds) {
        //should return [[sw_lat, sw_lon], [ne_lat, ne_lon ]] 
        console.log(bounds);
        });

    //map.setView(intersection center);

    //jQuery / leaflet trouble handling
    setTimeout(function(){
        map.invalidateSize();
        }, 1);

	});
