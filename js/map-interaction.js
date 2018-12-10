map.on('click', function (e) {
    var features = map.queryRenderedFeatures(e.point,{layers:['current-points','historical-points','current-lines','historical-lines']});
    features.forEach(function(feat){
    	console.log(feat.properties['@validSince'], feat.properties['@validUntil'], feat.properties['@id'])
    	console.warn(feat.properties)
    	console.warn(JSON.stringify(feat))
    });
});