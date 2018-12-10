var startDate, endDate
var maxDate, minDate
var brushOn

var D3Timeline1D = function(brushEventFunction){
    
  var x,y,data;

  this.stepBrush = function(){
    var outOfBounds = false;
    var step = Number( document.getElementById('stepVal').value ) 
    
    if ( (startDate.getTime() == minDate.getTime()) && (endDate.getTime() == maxDate.getTime()) ){
      console.log("Declaring new dates")
      endDate   = new Date(startDate.getTime() + data.length/10 * MILLISECONDS_IN_A_DAY)
      drawBrush();
      console.log(startDate, endDate)
    }
    
    startDate = new Date(startDate.getTime() + step * MILLISECONDS_IN_A_DAY)
    endDate   = new Date(endDate.getTime() + step * MILLISECONDS_IN_A_DAY)
      
    if (endDate > maxDate){
      endDate = maxDate
      outOfBounds = true;
    }
      
    if (startDate > maxDate){
      startDate = minDate
      brushEvent([startDate, endDate])
      return true
    }
    
    d3.select('.brush').transition().call(brush.move, [x(startDate), x(endDate)]);
    brushEvent([startDate, endDate])
    console.log("Stepped: "+step+" days | "+startDate + " - " + endDate)
      
    return outOfBounds;
  }

  //Main constructor  
  this.createD3Timeline = function(params){
    params.docID = params.docID || "timeline-svg"
        
    var svg = d3.select("#"+params.docID),
        margin = {top: 10, right: 20, bottom: 20, left: 50},
        width  = + svg.attr("width")  - margin.left - margin.right,
        height = + svg.attr("height") - margin.top  - margin.bottom;
  
    //clear the existing canvas
    svg.selectAll("*").remove();
      
    x = d3.scaleTime().range([0, width]).clamp(true);

    y = d3.scaleLinear().range([height, 0]);
      
    var xAxis = d3.axisBottom(x),
        yAxis = d3.axisLeft(y)
                  .ticks(4);

    var area = d3.area()
      .curve(d3.curveMonotoneX)
      .x(function(d) { return x(d.date); })
      .y0(height)
      .y1(function(d) { return y(d.count); });

    svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    var focus = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data = params.data //Or something else?

    maxDate = d3.max(data, function(d) { return d.date; })
    minDate = d3.min(data, function(d) { return d.date; })

    x.domain([minDate, maxDate]);

    //max within the dates
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    var daysShown = ( maxDate.getTime() - minDate.getTime() ) / MILLISECONDS_IN_A_DAY
    var bandWidth = (width / daysShown)

    // focus.selectAll(".bar")
    // .data(data)
    // .enter().append("rect")
    //   .attr("class", "bar")
    //   .attr("x", function(d) { return x(d.date); })
    //   .attr("y", function(d) { return y(d.count); })
    //   .attr("width", bandWidth)
    //   .attr("height", function(d) { return height - y(d.count); });

    focus.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

    focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

    var slider = svg.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")");

    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() { dragged(x.invert(d3.event.x))}) );

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    function dragged(d){
      handle.attr("cx", x(d));
      brushEventFunction(d);
    }

  
    if ( brushOn && ( (startDate > minDate ) || (endDate < maxDate) ) ){
      drawBrush();
    }else{
      startDate = minDate
      endDate   = maxDate
    }
  }
}


/*
Zoom stuff?
*/
 //var zoom = d3.zoom()
  //  .scaleExtent([1, 200])
  //  .translateExtent([[0, 0], [width, height]])
  //  .extent([0, 0], [width,height])
  //  .on("zoom", zoomed);

  //function zoomed() {
  //  console.log("ZOOMED")
  //  var t = d3.event.transform;
  //  console.warn(x.domain())
  //  //set the new domain
  //  x.domain(t.rescaleX(x).domain());
  //  console.warn(x.domain())
  //  focus.select(".axis--x").call(xAxis);
  //}

  ////This calls the zoom objects
  //var zoomRect = focus.append("rect")
  //  .attr("width", width)
  //  .attr("height", height)
  //  .attr("class", "zoomRect")
  //  .attr("fill", "none")
  //  .attr("pointer-events", "all")
  //  .call(zoom);