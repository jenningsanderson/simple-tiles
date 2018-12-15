'use strict';

var fs = require('fs')
var path = require('path');
var tileReduce = require('@mapbox/tile-reduce');
var _ = require('lodash')

var mapScript = "map-daily-counts.js"

var file = process.argv[2]
if (file==null){
  console.warn("Need an mbtiles file")
  process.exit(1)
}

console.warn(file)

var dailyCounts = new Map();

tileReduce({
    map: path.join(__dirname, mapScript),
    zoom: 12,
    sources: [{name: 'tilesInQuestion', mbtiles: path.join(file), raw: false}],
    bbox: [-105.354594,39.986353,-105.169442,40.061742]
})
.on('reduce', function(res){
  JSON.parse(res).forEach(function(tuple){
    var sumDailyCount = dailyCounts.get(tuple[0])
    if (sumDailyCount == undefined){
      dailyCounts.set(tuple[0],tuple[1])
    }else{
      sumDailyCount.h += tuple[1].h
      sumDailyCount.b += tuple[1].b
      sumDailyCount.e += tuple[1].e
      dailyCounts.set(tuple[0],sumDailyCount)
    }
  })
})
.on('end', function(){
  var output = []
  let days =[ ...dailyCounts.keys() ];
  _.sortBy(days).forEach(function(day){
    var edits = dailyCounts.get(day)
    edits.e += edits.h
    edits.e += edits.b

    day *= (3600*24)
    var date = new Date(day*1000)
    output.push({ d: date, edits: edits } )
  })
  console.log(JSON.stringify(output,null,2))
})
