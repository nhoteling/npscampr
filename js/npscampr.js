//
// npscampr - d3.js vis shows campsite demand over the course of the year
// user can select park / dates to see typical planning windows at each
// location.
//
// Created by nhoteling
// Data source: recreation.gov
//
//Width and height
// (Not needed for r2d3; specified automatically OR in chunk header)

/////////////////////
// Plot dimensions //
/////////////////////

// For the inset plot
var width0 = 500; //350;
var height0 = 300;
var margin0 = {top: 20, right: 5, bottom: 0, left: 5};

// For the small multiple plots
var width = 100;
var height = 50;
var margin = {top: 20, right: 5, bottom: 10, left: 5};



// Read data
// (data were prepared and saved with R)
//
d3.json("data/npscampr.json", function(data) {
  console.log(data);
  camprVis(data);
});


//
// NOTES:
// - The data "keys" are short-names for each park.  Since they have
//   spaces and (in one case) special characters, I use
//   d.key.replace(/[^a-zA-Z0-9]/g, '') to remove these
//
// Small multiples methodology was adapted from this example:
// https://www.d3-graph-gallery.com/graph/area_smallmultiple.html
//
// For axis date/time formatting:
// https://bl.ocks.org/d3noob/0e276dc70bb9184727ee47d6dd06e915



// Make the vis
function camprVis(data) {
 
    
    // Nested data: parks
    var dataNest = d3.nest()
        .key(function(d) { return d.parkShort; })
        .entries(data.parks);

    // Nested data: planning
    var dataPlan = d3.nest()
        .key(function(d) { return d.parkShort; })
        .entries(data.planning);
    
    
    // Working with data in javascript is stupid
    // Here are some hoops to jump through to get to
    // the %$&! date data, to use for date scales
    var parseTime = d3.timeParse("%Y-%m-%d");
    // dates for parks data
    let stupidData1 = [];
    dataNest.forEach(function(d) {
        d.values.forEach(function(p) {
            stupidData1.push(parseTime(p.pseudo_date));
        })
    });
    // dates for planning data
    let stupidData2 = [];
    dataPlan.forEach(function(d) {
        d.values.forEach(function(p) {
            stupidData2.push(parseTime(p.pseudo_book));
        })
    })
    
    // Testing & experimenting //
    // console.log(d3.min(stupidData2));
    // console.log(d3.max(stupidData2));
    // console.log(dataNest[2].values[0].cluster);  // access to nested data
    // console.log(data.parks);
    // console.log(dataNest[2].values[0].pseudo_date);
    ////

    ////////////
    // Scales //
    ////////////
    
    // inset plot scales
    var xScale0 = d3.scaleLinear()
                .domain([0,53])
                .range([ 1, width0 - margin.right ]);
    
    var yScale0 = d3.scaleLinear()
                .domain([0, 1])
                .range([height0*0.5, 40]);
    // inset - lower plot scale
    var yScale2 = d3.scaleLinear()
                .domain([0, 100])
                .range([ 25+height0*0.5, height0*0.9 ]);
    
    // Date scale
    // scale-min from planning, scale-max from camping
    var dateScale0 = d3.scaleTime()
            .domain([ d3.min(stupidData2), d3.max(stupidData1) ])
            .range([ margin.left, width0 - margin.right ]);
    
    // Create axes
    var xAxis0 = d3.axisBottom(dateScale0)
        .tickFormat(d3.timeFormat("%b"));
    
    var xAxis2 = d3.axisTop(dateScale0)
        .tickFormat(d3.timeFormat(""));
    
    // Small multiple plot scales
    var xScale = d3.scaleLinear()
                .domain([0,53])
               //.domain([0, d3.max(data.parks.camping, function(d) { return d.week; })])
               .range([ 1, width ]);
               //.range([padding, width-padding]);
               
    var yScale = d3.scaleLinear()
               .domain([0, 1])
                .range([ height, 1 ]);
               //.range([height-padding, padding]);
    
    // color scale, based on cluster value
    var colorScale = d3.scaleOrdinal()
                .domain([1,2,3])
                .range(['#fbb4ae', '#ccebc5', '#b3cde3']);


///////////////////////////////////////////////////////
// Create SVG element
// (Not used for r2d3, but needed for js stuff)
///////////////////////////////////////////////////////
    
    // SVG0 is for the inset plot
    var svg0 = d3.select("#container0")
        .append("svg")
        .attr("width", width0 + margin.left + margin.right)
        .attr("height", height0 + margin.top + margin.bottom);
    
    // Create details for the inset:
    // Rectangle with shading
    // Text annotations
    svg0.append("rect")
        .attr("id", "box1")
        .attr("x", 1)
        .attr("y", 1)
        .attr("width", width0)
        .attr("height", height0)
        //.attr("stroke", "grey")
        //.attr("fill", "white")
        .attr("stroke", "#E8E8E8")
        .attr("fill", "#E8E8E8")
        .attr("opacity", 0.5);
    
    svg0.append("text")
        .attr("id", "instruction")
        .attr("text-anchor", "middle")
        .attr("font-size", "25px")
        .attr("y", height0*0.5)
        .attr("x", width0*0.5)
        .text("select a park")
        .style("fill", "grey")
        .attr("opacity", 0.6);
    
    svg0.append("text")
        .attr("id", "campsite-demand")
        .attr("text-anchor", "middle")
        .attr("text-align", "left")
        .attr("font-size", "14px")
        .attr("y", height0*0.30)
        .attr("x", width0*0.15)
        .text("Campsite Demand")
        .style("fill", "grey")
        .attr("opacity", 0.0);  // start transparant, change later
    
    svg0.append("text")
        .attr("id", "campsite-window")
        .attr("text-anchor", "middle")
        .attr("text-align", "left")
        .attr("font-size", "14px")
        .attr("y", height0*0.95)
        .attr("x", width0*0.15)
        .text("Planning Window")
        .style("fill", "grey")
        .attr("opacity", 0.0); // start transparent, change later
    
    
    
    //
    // SVG1 contains all the area chart small multiples
    //
    var svg1 = d3.select("#container1")
            //.selectAll("uniqueChart")
            .data(dataNest)
            .enter()
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");
    
    // Add area charts
    svg1.append("path")
        .attr("class", "test")
        .attr("id", function(d,i) { return d.key.replace(/[^a-zA-Z0-9]/g, ''); })
        //.attr("id", function(d,i) { return d.key.replace(/\s/g, ''); })
        .attr("fill", function(d, i) { return colorScale(dataNest[i].values[0].cluster); })
        .attr("opacity", 0.85)
        .attr("stroke", "grey")
        .attr("d", function(d) {
            return d3.area()
            .x(function(d) { return xScale(d.week); })
            .y0(yScale(0))
            .y1(function(d) { return yScale(d.sres); })
                (d.values)
            })
        .on("mouseover", function() {
            d3.select(this)
            .attr("opacity", 1.0)
            .attr("stroke", "black");
            
            d3.selectAll("#"+this.getAttribute("id")+".park-labels").style("fill","black");
            //console.log(this.getAttribute("id"));
            })
        .on("mouseout", function() {
            d3.select(this)
            .attr("opacity", 0.85)
            .attr("stroke", "grey");
            
            d3.selectAll("#"+this.getAttribute("id")+".park-labels").style("fill","grey");
            })
        .on("click", clickAction)

    
    // Add text labels to each chart
    svg1.append("text")
        .attr("class", "park-labels")
        .attr("id", function(d,i) { return d.key.replace(/[^a-zA-Z0-9]/g, ''); })
        //.attr("id", function(d,i) { return d.key.replace(/\s/g, ''); })
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("y", -5)
        .attr("x", xScale(25))
        .text(function(d) { return d.key; })
        .style("fill", "grey");
    
 
    //
    // Define click events for area charts
    //
    function clickAction() {
        
        // short name for the park
        let pk = this.getAttribute("id");
        console.log(pk);
        
        // filter park data to only the park selected
        let newData =
        dataNest.filter(function(d) {
            return d.key.replace(/[^a-zA-Z0-9]/g, '') == pk;
            })[0].values;
        
        // Testing output
        //console.log(newData);
        //console.log(dataNest);
        
        // Define the area chart
        pkarea = d3.area()
            .x(function(d) { return dateScale0(parseTime(d.pseudo_date)); })
            .y0(function() { return yScale0.range()[0]; })
            .y1(function(d) { return yScale0(d.sres); });
        
        
        // Adjust elements in the inset
        // Show campsite demand annotation
        d3.select("#campsite-demand")
            .attr("opacity", 0.8);
        // Hide campsite window annotation
        d3.select("#campsite-window")
            .attr("opacity", 0.0);
        // Hide instruction
        d3.select("#instruction")
            .attr("opacity", 0.0);
        // Remove lower chart
        d3.select(".lowerarea")
            .remove();
        // Remove old version of the area chart
        d3.select(".parkarea")
            .remove();
        //////////////////////////////////
        
        
        // Create upper plot
        var upperPlot = svg0.datum(newData)
            .append("g")
            .attr("class", "parkarea");
        
        upperPlot.append("path")
            .attr("id", "upper-area")
            .transition()
            .duration(500)
            .attr("fill", function(d) { return colorScale(d[0].cluster); })
            .attr("opacity", 0.85)
            .attr("stroke", "grey")
            .attr("d", pkarea);
        
        upperPlot.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (0.5*height0) + ")")
            .call(xAxis0);
        
        upperPlot.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("y", 20)
            .attr("x", xScale0(26.5))
            .text(function(d) { return d[0].parkLong; })
            .style("fill", "#505050");
         
 
        // Add rectangles for selecting dates
        upperPlot.selectAll("rect")
            .data(newData)
            .enter()
            .append("rect")
            .attr("id", "date-select")
            .attr("class", "bar-unselect")
            .attr("x", function(d) { return dateScale0(parseTime(d.pseudo_date)); })
            //.attr("x", function(d) { return xScale0(d.week-0.5); })
            .attr("y", function(d) { return yScale0(1); })
            .attr("width", function(d,i) { return xScale0(2) - xScale0(1); })
            .attr("height", function(d,i) { return 0.5*height0-40; })
            .attr("fill", "grey")
            .attr("opacity", 0.0)
            .on("mouseover", function() {
                d3.select(this)
                    .attr("class", "bar-hover")
                    .attr("opacity", 0.5);
            })
            .on("mouseout", function() {
                d3.selectAll(".bar-hover")
                    .attr("class", "bar-unselect")
                    .attr("opacity", 0.0);
            })
            .on("click", function(d) {
                d3.selectAll("#date-select")
                    .attr("class", "bar-unselect")
                    .attr("opacity", 0);
                d3.select(this)
                    .attr("class", "bar-select")
                    .attr("opacity", 0.75);
            
                // Some test output
                console.log(pk);            // park shortName
                console.log(d.pseudo_date); // date
                //console.log(dataPlan);
                
                // Define area chart
                bkarea = d3.area()
                    .x(function(d) { return dateScale0(parseTime(d.pseudo_book)); })
                    .y0(function() { return yScale2.range()[0]; })
                    .y1(function(d) { return yScale2(d.pct); });
                
                let bookData = dataPlan
                    .filter(function(p) {
                        return p.key.replace(/[^a-zA-Z0-9]/g, '') == pk;
                        })[0].values
                    .filter(function(p) {
                        return p.pseudo_date == d.pseudo_date;
                    });
                
                //console.log(bookData);
                
                
                // Adjust some layers
                // Show campsite window annotation
                d3.select("#campsite-window")
                    .attr("opacity", 0.8);
                // Remove old version of the chart
                d3.select(".lowerarea")
                    .remove();
                
                // Create lower plot
                var lowerPlot = svg0.datum(bookData)
                    .append("g")
                    .attr("class", "lowerarea");
                
                lowerPlot.append("path")
                    .attr("id", "lower-plot")
                    .transition()
                    .duration(500)
                    .attr("fill", function(d) { return colorScale(d[0].cluster); })
                    .attr("opacity", 0.85)
                    .attr("stroke", "grey")
                    .attr("d", bkarea);
                
                
                lowerPlot.selectAll("rect")
                    .data(bookData)
                    .enter()
                    .append("rect")
                    .attr("id", "lower-rect")
                    .attr("x", function(d,i) { return dateScale0(parseTime(d.pseudo_book)); })
                    .attr("y", function() { return yScale2(0); })
                    .attr("width", "1px")
                    .attr("height", function(d,i) { return d.pct-5; })
                    .attr("fill", "grey")
                    .attr("opacity", 0.4);
                
                lowerPlot.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + (0.58*height0) + ")")
                    .call(xAxis2);
            });
 
    };
 /////////////////////////////

 
}
