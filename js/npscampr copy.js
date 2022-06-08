//Width and height
// (Not needed for r2d3; specified automatically OR in chunk header)
var width = 800;
var height = 500;
var padding = 10;
var ncols = 5;   // number of columns
var nrows = 12;  // number of rows
var panelBuffer = padding/2;
var panelWidth = (width-2*padding)/ncols;
var panelHeight = (height-2*padding)/nrows;

console.log(panelWidth);
console.log(panelHeight);


// Read data
// (data were prepared and saved with R)
//
d3.json("data/npscampr-old.json", function(data) {
  console.log(data);
  camprVis(data);
});




// Make the vis
function camprVis(data) {
 

    // D3 code chunk


    
    var dataNest = d3.nest()
        .key(function(d) { return d.parkShort; })
        .entries(data.parks);

    allKeys = dataNest.map(function(d) { return d.key; })
    
    console.log(data.parks);
    console.log(dataNest);
    

    // Scales //
    var xScale = d3.scaleLinear()
                .domain([0,53])
               //.domain([0, d3.max(data.parks.camping, function(d) { return d.week; })])
               .range([1,panelWidth]);
               //.range([padding, width-padding]);
               
    var yScale = d3.scaleLinear()
               .domain([0, 1])
                .range([panelHeight, 1]);
               //.range([height-padding, padding]);

/*
var parkNames = ["Acadia", "Apostle", "Arches", "Assateague", "Big Bend",
                 "Big Cypress", "Big South Fork", "Black Canyon", "Blue Ridge", "Bryce Canyon",
                 "Buffalo River", "C&O Canal", "Canaveral", "Canyonlands", "Cape Hatteras",
                 "Capitol Reef", "Catoctin", "Cedar Breaks", "Chaco", "Channel Islands",
                 "Chickasaw", "Chiricahua", "Colorado", "Congaree", "Curecanti",
                 "Death Valley", "Delaware Gap", "Dinosaur", "Everglades", "Gateway",
                 "Glacier", "Golden Gate", "Grand Canyon", "Great Basin", "Greenbelt",
                 "Gulf Islands", "Joshua Tree", "Lake Roosevelt", "Lassen", "Mammoth Cave",
                 "Mt Rainier", "North Cascades", "Obed River", "Olympic", "Organ Pipe",
                 "Ozark", "Pictured Rocks", "Pinnacles", "Prince William", "Rocky Mountain",
                 "Roosevelt", "Sand Dunes", "Sequoia", "Shenandoah", "Sleeping Bear",
                 "Smokies", "Whiskytown", "Yosemite", "Zion"];
 */
 /*
var panelxScale = d3.scaleOrdinal()
    .domain(parkNames)
    .range([1,2,3,4,5, 1,2,3,4,5, 1,2,3,4,5, 1,2,3,4,5, 1,2,3,4,5, 1,2,3,4,5,
            1,2,3,4,5, 1,2,3,4,5, 1,2,3,4,5, 1,2,3,4,5, 1,2,3,4,5, 1,2,3,4,5]);
var panelyScale = d3.scaleOrdinal()
    .domain(parkNames)
    .range([1,1,1,1,1, 2,2,2,2,2, 3,3,3,3,3, 4,4,4,4,4, 5,5,5,5,5, 6,6,6,6,6,
            7,7,7,7,7, 8,8,8,8,8, 9,9,9,9,9, 10,10,10,10,10, 11,11,11,11,11, 12,12,12,12,12]);

    console.log(panelxScale("Canyonlands")*panelWidth + (panelxScale("Canyonlands")-1)*panelBuffer);
    console.log(panelyScale("Canyonlands")*panelHeight + (panelyScale("Canyonlands")-1)*panelBuffer);
    //console.log(forEach())
   */
/////////////////////////////////////////////////////////////
// Create SVG element
// (Not used for r2d3, but needed for js stuff)

    var svg = d3.select("body")
            .selectAll("uniqueChart")
            .data(dataNest)
            .enter()
			.append("svg")
			.attr("width", width)
			.attr("height", height)
            .append("g");
    
////////

// Tooltips

//
    /*
var area1 = d3.area()
             //.defined(function(d) { return d.parkShort === "Canyonlands"; })
             .x(function(d) {
                 let x = panelxScale(d.parkShort);
                 let val = x*panelWidth + (x-1)*panelBuffer;
                 return val + xScale(d.camping.week); })
             .y0(function(d) {
                 let y = panelyScale(d.parkShort);
                 let val = y*panelHeight + (y-1)*panelBuffer;
                 return val + yScale.range()[0]; })
             .y1(function(d) {
                 let y = panelyScale(d.parkShort);
                 let val = y*panelHeight + (y-1)*panelBuffer;
                 return val + yScale(d.camping.sres); });
             
var area2 = d3.area()
             //.defined(function(d) { return d.parkShort === "Canyonlands"; })
             .x(function(d) {
                 let x = panelxScale(d.parkShort);
                 let val = x*panelWidth + (x-1)*panelBuffer;
                 return val + xScale(d.camping.week); })
             .y0(function(d) {
                 let y = panelyScale(d.parkShort);
                 let val = y*panelHeight + (y-1)*panelBuffer;
                 return val + yScale(d.camping.sres); })
             .y1(function(d) {
                 let y = panelyScale(d.parkShort);
                 let val = y*panelHeight + (y-1)*panelBuffer;
                 return val + yScale(1); });
*/
    
/*
    svg.append("path")
        .attr("fill", "grey")
        .attr("stroke", "none");
        .attr("d", function(d) {
            return d3.area()
            .x(function(d) { return xScale(d.week); })
            .y0(yScale(0))
            .y1(function(d) { return yScale(d.sres); })
        });
*/
    /*
svg.append("path")
   .datum(data.parks)
   .attr("class", "area1")
   .attr("d", area1)
   .attr("fill", "red")
   .attr("opacity", 0.6);



 svg.selectAll("rect")
   .data(data.parks)
   .enter()
   .append("rect")
    //.filter(function(d) { return d.parkShort === "Canyonlands"; })
      .attr("class","bars")
      .attr('width', xScale(1))
      //.attr("height", height)
      .attr('height', function(d, i) { return yScale(0); })
      .attr('x', function(d, i) {
          let x = panelxScale(d.parkShort);
          let val = x*panelWidth + (x-1)*panelBuffer;
          return val + xScale(d.week-0.5); })
      .attr('y', function(d, i) {
          let y = panelyScale(d.parkShort);
          let val = y*panelHeight + (y-1)*panelBuffer;
          return val + yScale(1); })
      .attr('fill', "blue")
      .attr('opacity', 0.0)
      .on("mouseover", function() {
        d3.select(this)
          .attr("opacity", 1.0);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("opacity", 0.0);
      });
   
svg.append("path")
   .datum(data.parks)
   .attr("class", "area2")
   .attr("d", area2)
   .attr("fill", "#f5f5f5")
   .attr("opacity", 1.0);
*/
 

 
 /////////////////////////////

 
}
