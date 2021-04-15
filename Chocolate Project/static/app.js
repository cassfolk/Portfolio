// Dependency Chart
// Reference for chart:  https://bl.ocks.org/curran/8c5bb1e0dd8ea98695d28c8a0ccfc533

// Parameters for chart (like this way better)
var width = 800,
  height = 950,
  outerPadding = 100,
  labelPadding = 5,
  chordPadding = 0.03,
  arcThickness = 20,
  opacity = 0.6,
  fadedOpacity = 0.02,
  transitionDuration = 350,
  transitionRibbonDuration = 100,
  outerRadius = width / 2 - outerPadding,
  innerRadius = outerRadius - arcThickness,
  valueFormat = d3.format(",");

var svg = d3.select(".dependency").append("svg")
  .attr("width", width)
  .attr("height", height)
  g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
    ribbonsG = g.append("g"),
    groupsG = g.append("g");

svg.append("text")
  .attr("class", "chart_title")
  .attr("x", 410)
  .attr("y", 43)
  .attr("text-anchor", "middle")
  .style("font-size", "30px")
  .text("Flow of Cacao Between Origin and Manufacture Countries");



// Import Data
d3.json("http://127.0.0.1:5000/dependency_chart").then(function(data) {
  var array = data.results;
  // console.log(array)

  // Chart starts here
  // D3 layouts, shapes and scales.
  var ribbon = d3.ribbon()
    .radius(innerRadius),
  chord = d3.chord()
    .padAngle(chordPadding)
    .sortSubgroups(d3.descending),
  arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius),
  color = d3.scaleOrdinal()
    .range(d3.schemeCategory20);

  // Renders the given data as a chord diagram.
  function render(data){

    var matrix = generateMatrix(data),
        chords = chord(matrix);
    console.log(matrix) 

    color.domain(matrix.map(function (d, i){
      return i;
    }));
    
    // Render the ribbons.
    ribbonsG.selectAll("path")
        .data(chords)
      .enter()
        .append("path")
        .attr("class", "ribbon")
        .attr("d", ribbon)
        .style("fill", function(d) {
          return color(d.source.index);
        })
        .style("stroke", function(d) {
          return d3.rgb(color(d.source.index)).darker();
        })
        .style("opacity", opacity)
        .call(ribbonHover)
        .append("title")
          .attr("class", "tooltip")
          .attr("role", "tooltip")
          .text(textFunction);
  
    // Function for text for tooltip.
    function textFunction(d){
      var src = matrix.names[d.source.index];
      var dest = matrix.names[d.target.index];
      return `${dest} → ${src}: ${d.source.value}`}

    // Scaffold the chord groups.
    var groups = groupsG
      .selectAll("g")
        .data(chords.groups)
      .enter().append("g");

    // Render the chord group arcs.
    groups
      .append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .style("fill", function(group) {
          return color(group.index);
        })
        .style("stroke", function(group) {
          return d3.rgb(color(group.index)).darker();
        })
        .style("opacity", opacity)
        .call(groupHover);

    // Render the chord group labels and flip.
    var angle = d3.local(),
        flip = d3.local();
    groups
      .append("text")
        .each(function(d) {
          angle.set(this, (d.startAngle + d.endAngle) / 2)
          flip.set(this, angle.get(this) > Math.PI);
        })
        .attr("transform", function(d) {
          return [
            "rotate(" + (angle.get(this) / Math.PI * 180 - 90) + ")",
            "translate(" + (outerRadius + labelPadding) + ")",
            flip.get(this) ? "rotate(180)" : ""
          ].join("");
        })
        .attr("text-anchor", function(d) {
          return flip.get(this) ? "end" : "start";
        })
        .text(function(d) {
          return matrix.names[d.index];
        })
        .attr("alignment-baseline", "central")
        .style("font-family", '"Helvetica Neue", Helvetica')
        .style("font-size", "10pt")
        .style("cursor", "default")
        .call(groupHover);
  }

  // Sets up hover interaction to highlight a chord group.
  function groupHover(selection){
    selection
      .on("mouseover", function (group){
        g.selectAll(".ribbon")
            .filter(function(ribbon) {
              return (
                (ribbon.source.index !== group.index) &&
                (ribbon.target.index !== group.index)
              );
            })
          .transition().duration(transitionDuration)
            .style("opacity", fadedOpacity);
      })
      .on("mouseout", function (){
        g.selectAll(".ribbon")
          .transition().duration(transitionDuration)
            .style("opacity", opacity);
      });
  }

  function ribbonHover(selection){
    selection
      .on("mouseover", function (group){
        g.selectAll(".ribbon")
            .filter(function(ribbon) {
              return (
                (ribbon.source.index !== group.index) &&
                (ribbon.target.index !== group.index)
              );
            })
          .transition().duration(transitionRibbonDuration)
      })
      .on("mouseout", function (){
        g.selectAll(".ribbon")
          .transition().duration(transitionRibbonDuration);
      });
  }

  // Transform data for matrix!!!! 
  function generateMatrix(data){
    var nameToIndex = {},
        names = [],
        matrix = [],
        n = 0, i, j;

    function recordName(name){
      if( !(name in nameToIndex) ){
        nameToIndex[name] = n++;
        names.push(name);
      }
    }

    data.forEach(function (d){
      recordName(d.origin);
      recordName(d.destination);
    });

    for(i = 0; i < n; i++){
      matrix.push([]);
      for(j = 0; j < n; j++){
        matrix[i].push(0);
      }
    }

    data.forEach(function (d){
      i = nameToIndex[d.origin];
      j = nameToIndex[d.destination];
      matrix[j][i] = d.count;
    });

    matrix.names = names;

    return matrix;
  }
  render(array);
});

// END dependency chart

// Donut Chart

function renderIcons() {
  // Australia
  if (!this.series[0].icon) {
      this.series[0].icon = this.renderer.path(['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8])
          .attr({
              stroke: '#303030',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'stroke-width': 2,
              zIndex: 10
          })
          .add(this.series[2].group);
  }
  this.series[0].icon.translate(
      this.chartWidth / 2 - 10,
      this.plotHeight / 2 - this.series[0].points[0].shapeArgs.innerR -
          (this.series[0].points[0].shapeArgs.r - this.series[0].points[0].shapeArgs.innerR) / 2
  );

  // Denmark
  if (!this.series[1].icon) {
      this.series[1].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
          .attr({
              stroke: '#ffffff',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'stroke-width': 2,
              zIndex: 10
          })
          .add(this.series[2].group);
  }
  this.series[1].icon.translate(
      this.chartWidth / 2 - 10,
      this.plotHeight / 2 - this.series[1].points[0].shapeArgs.innerR -
          (this.series[1].points[0].shapeArgs.r - this.series[1].points[0].shapeArgs.innerR) / 2
  );

  // Canada
  if (!this.series[2].icon) {
      this.series[2].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
          .attr({
              stroke: '#303030',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'stroke-width': 2,
              zIndex: 10
          })
          .add(this.series[2].group);
  }

  this.series[2].icon.translate(
      this.chartWidth / 2 - 10,
      this.plotHeight / 2 - this.series[2].points[0].shapeArgs.innerR -
          (this.series[2].points[0].shapeArgs.r - this.series[2].points[0].shapeArgs.innerR) / 2
  );

  // France
if (!this.series[3].icon) {
  this.series[3].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
      .attr({
          stroke: '#303031',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': 2,
          zIndex: 10
      })
      .add(this.series[3].group);
}

this.series[3].icon.translate(
  this.chartWidth / 2 - 10,
  this.plotHeight / 2 - this.series[3].points[0].shapeArgs.innerR -
      (this.series[3].points[0].shapeArgs.r - this.series[3].points[0].shapeArgs.innerR) / 2
);

 // Netherlands
 if (!this.series[4].icon) {
    this.series[4].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
        .attr({
            stroke: '#303031',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': 2,
            zIndex: 10
        })
        .add(this.series[4].group);
  }
  
  this.series[4].icon.translate(
    this.chartWidth / 2 - 10,
    this.plotHeight / 2 - this.series[4].points[0].shapeArgs.innerR -
        (this.series[4].points[0].shapeArgs.r - this.series[4].points[0].shapeArgs.innerR) / 2
  );

 // U.S.A
 if (!this.series[5].icon) {
    this.series[5].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
        .attr({
            stroke: '#303031',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': 2,
            zIndex: 10
        })
        .add(this.series[5].group);
  }
  
  this.series[5].icon.translate(
    this.chartWidth / 2 - 10,
    this.plotHeight / 2 - this.series[5].points[0].shapeArgs.innerR -
        (this.series[5].points[0].shapeArgs.r - this.series[5].points[0].shapeArgs.innerR) / 2
  );

   // New Zealand
if (!this.series[6].icon) {
    this.series[6].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
        .attr({
            stroke: '#303031',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': 2,
            zIndex: 10
        })
        .add(this.series[6].group);
  }
  
  this.series[6].icon.translate(
    this.chartWidth / 2 - 10,
    this.plotHeight / 2 - this.series[6].points[0].shapeArgs.innerR -
        (this.series[6].points[0].shapeArgs.r - this.series[6].points[0].shapeArgs.innerR) / 2
  );

   // Japan
if (!this.series[7].icon) {
    this.series[7].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
        .attr({
            stroke: '#303031',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': 2,
            zIndex: 10
        })
        .add(this.series[7].group);
  }
  
  this.series[7].icon.translate(
    this.chartWidth / 2 - 10,
    this.plotHeight / 2 - this.series[7].points[0].shapeArgs.innerR -
        (this.series[7].points[0].shapeArgs.r - this.series[7].points[0].shapeArgs.innerR) / 2
  );

 // Belgium
 if (!this.series[8].icon) {
    this.series[8].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
        .attr({
            stroke: '#303031',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': 2,
            zIndex: 10
        })
        .add(this.series[8].group);
  }
  
  this.series[8].icon.translate(
    this.chartWidth / 2 - 10,
    this.plotHeight / 2 - this.series[8].points[0].shapeArgs.innerR -
        (this.series[8].points[0].shapeArgs.r - this.series[8].points[0].shapeArgs.innerR) / 2
  );

   // U.K.
if (!this.series[9].icon) {
    this.series[9].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
        .attr({
            stroke: '#303031',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': 2,
            zIndex: 10
        })
        .add(this.series[9].group);
  }
  
  this.series[9].icon.translate(
    this.chartWidth / 2 - 10,
    this.plotHeight / 2 - this.series[9].points[0].shapeArgs.innerR -
        (this.series[9].points[0].shapeArgs.r - this.series[9].points[0].shapeArgs.innerR) / 2
  );
};

Highcharts.chart('container', {

  chart: {
      type: 'solidgauge',
      height: '100%',
      events: {
          render: renderIcons
      }
  },

  title: {
      text: "Top 10 Countries' 70% Cacao Bar Average Ratings",
      style: {
          fontSize: '28px'
      }
  },

  tooltip: {
      borderWidth: 0,
      backgroundColor: 'none',
      shadow: false,
      style: {
          fontSize: '16px'
      },
      
      pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}</span>',
      positioner: function (labelWidth) {
          return {
              x: (this.chart.chartWidth) / 2,
              y: (this.chart.plotHeight / 2) + 15
          };
      }
  },

  pane: {
    startAngle: 0,
    endAngle: 650,
    background: [{ // Track for Australia
        outerRadius: '118%',
        innerRadius: '108%',
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[0])
            .setOpacity(0.3)
            .get(),
        borderWidth: 0
    }, { // Track for Denmark
        outerRadius: '107%',
        innerRadius: '97%',
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[1])
            .setOpacity(0.3)
            .get(),
        borderWidth: 0
    }, { // Track for Canada
        outerRadius: '96%',
        innerRadius: '86%',
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[2])
            .setOpacity(0.3)
            .get(),
        borderWidth: 0
    }, { // Track for France
        outerRadius: '85%',
        innerRadius: '75%',
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[3])
            .setOpacity(0.3)
            .get(),
        borderWidth: 0
    }, { // Track for Netherlands
        outerRadius: '74%',
        innerRadius: '64%',
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[4])
            .setOpacity(0.3)
            .get(),
        borderWidth: 0
    }, { // Track for U.S.A
        outerRadius: '63%',
        innerRadius: '53%',
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[5])
            .setOpacity(0.3)
            .get(),
        borderWidth: 0
    }, { // Track for New Zealand
        outerRadius: '52%',
        innerRadius: '42%',
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[6])
            .setOpacity(0.3)
            .get(),
        borderWidth: 0
    }, { // Track for Japan
        outerRadius: '41%',
        innerRadius: '31%',
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[7])
            .setOpacity(0.3)
            .get(),
        borderWidth: 0
    }, { // Track for Belgium
        outerRadius: '30%',
        innerRadius: '20%',
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[8])
            .setOpacity(0.3)
            .get(),
        borderWidth: 0
    }, { // Track for U.K.
        outerRadius: '19%',
        innerRadius: '9%',
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[9])
            .setOpacity(0.3)
            .get(),
        borderWidth: 0
    }]
    
},

  yAxis: {
      min: 3,
      max: 4,
      lineWidth: 0,
      tickPositions: []
  },

  plotOptions: {
      solidgauge: {
          dataLabels: {
              enabled: false
          },
          linecap: 'round',
          stickyTracking: false,
          rounded: true
      }
  },

  series: [{
    name: 'Australia',
    data: [{
        color: Highcharts.getOptions().colors[0],
        radius: '118%',
        innerRadius: '108%',
        y: 3.500
    }]
}, {
    name: 'Denmark',
    data: [{
        color: Highcharts.getOptions().colors[1],
        radius: '107%',
        innerRadius: '97%',
        y: 3.482
    }]
}, {
    name: 'Canada',
    data: [{
        color: Highcharts.getOptions().colors[2],
        radius: '96%',
        innerRadius: '86%',
        y: 3.438
    }]
}, {
    name: 'France',
    data: [{
        color: Highcharts.getOptions().colors[3],
        radius: '85%',
        innerRadius: '75%',
        y: 3.346
    }]
}, {
    name: 'Netherlands',
    data: [{
        color: Highcharts.getOptions().colors[4],
        radius: '74%',
        innerRadius: '64%',
        y: 3.292
    }]
}, {
    name: 'U.S.A',
    data: [{
        color: Highcharts.getOptions().colors[5],
        radius: '63%',
        innerRadius: '53%',
        y: 3.289
    }]
}, {
    name: 'New Zealand',
    data: [{
        color: Highcharts.getOptions().colors[6],
        radius: '52%',
        innerRadius: '42%',
        y: 3.271
    }]
}, {
    name: 'Japan',
    data: [{
        color: Highcharts.getOptions().colors[7],
        radius: '41%',
        innerRadius: '31%',
        y: 3.346
    }]
}, {
    name: 'Belgium',
    data: [{
        color: Highcharts.getOptions().colors[8],
        radius: '30%',
        innerRadius: '20%',
        y: 3.346
    }]
}, {
    name: 'U.K.',
    data: [{
        color: Highcharts.getOptions().colors[9],
        radius: '19%',
        innerRadius: '9%',
        y: 3.346
    }]
}]
});

// END dount

// Scatter Plot Chart

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 0,
  right: 0,
  bottom: 150,
  left: 0
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

///Import Data
d3.json("http://127.0.0.1:5000/scatterplot_chart").then(function(info) {

  // console.log(info)
// Add X axis

var xTicks = [];
var xTicksIndex = [];
for(i=0;i<info.results.length;i++){
var xTickData = info["results"][i]["company_location"];

  if(xTicks.includes(xTickData)){
    // document.write("Value exists!")
  }
  else{
  xTicks.push(xTickData)
  xTicksIndex.push(xTicks.length);}
}
//  console.log(xTicksIndex)

var ticksData =[
  {index:xTicksIndex,
  country:xTicks}
];
// console.log(ticksData)

var company_location_index = [];
for(i=0;i<info.results.length;i++){
  for(j=0;j<xTicksIndex.length;j++ ){
   if(info["results"][i]["company_location"]===xTicks[j]){
    company_location_index.push(xTicksIndex[j])
   }
  }
}
// console.log(company_location_index)

info.results.forEach(function(data,i){
 data.ID = data.ID;
 data.company_location = data.company_location;
 data.country_of_bean_origin = data.country_of_bean_origin;
 data.rating = data.rating;
 data.company_location_index = company_location_index[i];
})

// console.log(info)


var x = d3.scaleLinear()
.domain([-4,ticksData[0].index.length+1])
.range([ 0, width*1 ]);


// axis(d3.scalePoint().domain([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]))
//   .tickValues([..."AEIOUY"])
//   .render()

var xAxis = svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x))
// .call(d3.axisBottom(x).tickValues(ticksData[0].index).tickFormat((d,i)=>ticksData[0].country[i]))
// .selectAll("text")
//     .attr("transform", "translate(-10,10)rotate(-90)")
//     .style("text-anchor", "end")
//     .style("font-size", 12)
//     .style("fill", "#69a3b2")

// xAxis.selectAll(".tick text")
//      .attr("transform", "translate(-10,10)rotate(-90)")
//          .style("text-anchor", "end")
//          .style("font-size", 12)
//          .style("fill", "#69a3b2")
    

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", -margin.top+550)
    .attr("y", height + margin.bottom-20)
    .text("Company Locations");
    


// Add Y axis
var y = d3.scaleLinear()
  .domain([1.5, 4.5])
  .range([ height, 0]);

svg.append("g")
  .attr("transform", "translate(50,0)") 
  .call(d3.axisLeft(y))

svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left+15)
    .attr("x", -margin.top-170)
    .text("Rating")

svg.append("g")
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", -margin.left+500)
    .attr("y", -margin.top+22)
    .style("font-size", "30px")
    .text("Ratings vs. Country Locations")



// Add a clipPath: everything out of this area won't be drawn.
var clip = svg.append("defs").append("svg:clipPath")
  .attr("id", "clip")
  .append("svg:rect")
  .attr("width", width )
  .attr("height", height )
  .attr("x", 0)
  .attr("y", 0);

// Color scale: give me a specie name, I return a color
var colorLabel = ["000000","#8C0044","#880000","#A42D00","#BB5500","#886600","#888800",
"#668800","#227700","#008800","#008844","#008866","#008888","#007799","#003377",
"#000088","#220088","#3A0088","#550088","#660077","#770077"]



var color = d3.scaleOrdinal()
.domain(ticksData[0].country)
.range(colorLabel)

// console.log(ticksData[0].country)

// Add brushing
var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
  .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
  .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function




// Create the scatter variable: where both the circles and the brush take place
var scatter = svg.append('g')
.attr("clip-path", "url(#clip)")


// Add circles

scatter
.selectAll("circle")
.data(info.results)
.enter()
.append("circle")
  .attr("cx", function (d) { return x(d.company_location_index); } )
  .attr("cy", function (d) { return y(d.rating); } )
  .attr("r", 5)
  // .style("fill", function (d) { return color(d.company_location) } )
  .style("opacity", 0.15)

// Add the brushing
scatter
.append("g")
  .attr("class", "brush")
  .call(brush);

// A function that set idleTimeOut to null
var idleTimeout
function idled() { idleTimeout = null; }

// A function that update the chart for given boundaries
function updateChart() {

extent = d3.event.selection

// If no selection, back to initial coordinate. Otherwise, update X axis domain
if(!extent){
  if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
  x.domain([ -4,xTicksIndex.length+1]).range([ 0, width*1 ]);
}else{
  x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
  scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
}

// Update axis and circle position

xAxis.transition().duration(1000)
.call(d3.axisBottom(x).tickValues(ticksData[0].index).tickFormat((d,i)=>ticksData[0].country[i]))
.selectAll(".tick text")
.attr("transform", "translate(-10,10)rotate(-90)")
    .style("text-anchor", "end")
    .style("font-size", 12)
    .style("fill", "#69a3b2")

 

scatter
  .selectAll("circle")
  .transition().duration(1000)
  .attr("cx", function (d) { return x(d.company_location_index); } )
  .attr("cy", function (d) { return y(d.rating); } )
  .style("fill", function (d) { return color(d.company_location) } )
  .attr("r", 8)

}

})

