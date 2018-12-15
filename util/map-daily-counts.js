var _     = require('lodash');
var topojson = require('topojson');
var turf = require("@turf/turf");

/*
*    Reconstruct historical objects (generator style)
*    [ Could consider making a "smart" feature object that could handle *much* of this? ]
*/
function* historyGenerator(historyString){
    let hT = JSON.parse(historyString) //hT = historical topology
    let keys   = _.sortBy(Object.keys(hT.objects),function(v){return Number(v)});
    for (var i=0;i<keys.length; i++){
        yield topojson.feature(hT,hT.objects[keys[i]]);
        // yield [topojson.feature(hT,hT.objects[keys[i]]),i,keys.length];
    }
    return keys.length
}

var dailyCounts = new Map();

function countEdit(obj,feature){
  if (feature.properties.hasOwnProperty('highway') ){
    obj.h ++;
  }else if (feature.properties.hasOwnProperty('building') && feature.properties.building != 'no'){
    obj.b ++;
  }else{
    obj.e++;
  }
  return obj
}

module.exports = function(data, tile, writeData, done) {

  //What layers do we even have?
  var possibleLayers = Object.keys(data.tilesInQuestion);

  var layerOfChoice = data.tilesInQuestion[possibleLayers[0]] //Stubbing this for future, but likely the only layer we care about?

  var featCount = 0;

  // layer.features.forEach(function(feat){
  layerOfChoice.features.forEach(function(feat){

    //Check if we're talking about history or not?
    if (feat.properties.hasOwnProperty("@history")) {
      // console.warn('hist')
        hG = historyGenerator(feat.properties['@history'])
        var done, version, vIt, newName, thisUser, prevUser
        while(!done){
          vIt     = hG.next();
          version = vIt.value
          done    = vIt.done

          if (!done){
            var day = Math.floor(version.properties['@validSince'] / (3600*24));
            var prevCount = dailyCounts.get(day)
            if (prevCount == undefined){
              dailyCounts.set(day,countEdit({h:0,b:0,e:0},feat)) //incase minor versioning doesn't have props
            }else{
              dailyCounts.set(day,countEdit(prevCount,feat)) //incase minor versioning doesn't have props
            }
          }
      }
    //If no history, then hopefully a validSince (could be a rendering-specific tileset)
    }else if (feat.properties.hasOwnProperty('@validSince')) {
      // console.warn(feat.properties['@validSince'])
      var day = Math.floor(feat.properties['@validSince'] / (3600*24));
      var prevCount = dailyCounts.get(day)
      if (prevCount == undefined){
        dailyCounts.set(day,countEdit({h:0,b:0,e:0},feat))
      }else{
        dailyCounts.set(day,countEdit(prevCount,feat))
      }
    //This works with standard osmium export output (osm-qa-tiles)
    }else if (feat.properties.hasOwnProperty('@timestamp')) {
      // console.warn(feat.properties['@validSince'])
      var day = Math.floor(feat.properties['@timestamp'] / (3600*24));
      var prevCount = dailyCounts.get(day)
      if (prevCount == undefined){
        dailyCounts.set(day,countEdit({h:0,b:0,e:0},feat))
      }else{
        dailyCounts.set(day,countEdit(prevCount,feat))
      }
    }
  })
  done(null, JSON.stringify([...dailyCounts]))
};
