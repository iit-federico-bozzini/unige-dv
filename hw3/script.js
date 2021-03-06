'use strict';

// Global var for FIFA world cup data
var allWorldCupData;
var projection;


/**
 * Render and update the bar chart based on the selection of the data type in the drop-down box
 *
 * @param selectedDimension a string specifying which dimension to render in the bar chart
 */
function createBarChart(selectedDimension) {
    const data = allWorldCupData.sort((d1, d2) => d1.YEAR - d2.YEAR);
    const years = data.map(row => +row.YEAR);
    const n = data.length;

    const svgBounds = d3.select("#barChart").node().getBoundingClientRect();
    const xpad = 100;
    const ypad = 70;
    const heigth = svgBounds.height;
    const width = svgBounds.width;
    const BAR_MARGIN = 1;
    const H = heigth - ypad;
    const W = width - xpad;
    const barWidth = W/n - 2*BAR_MARGIN;
    const transitionDuration = 600;

    // ******* TODO: PART I *******

    // Create the x and y scales; make
    // sure to leave room for the axes
    const yMax = d3.max(data, d=> d[selectedDimension]);

    const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([H, 0]);

    const xScale = d3.scaleBand()
        .domain(years)
        .range([0, W]);

    // Create colorScale

    const lightBlue = "#C0D9D9";
    const darkBlue = "#003F87";

    const colorScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([lightBlue, darkBlue]);

    // Create the axes (hint: use #xAxis and #yAxis)

    //magic constant, ugh!
    const labelLength = 42;

    const xAxis = d3.axisBottom(xScale)
        .ticks(n);

    const yAxis = d3.axisLeft(yScale);

    d3.select("#xAxis")
        .attr("transform", `translate(${xpad},${H})`)
        .call(xAxis)
        .selectAll('text')
        .attr("transform", "rotate(270)")
        .attr('dx',-labelLength)
        .attr('dy',- barWidth/4)
        .style("text-anchor", "start");

    d3.select('#yAxis')
        .attr("transform", `translate(${xpad},0)`)
        .transition()
        .duration(transitionDuration)
        .ease(d3.easeQuad)
        .call(yAxis);

    // Create the bars (hint: use #bars)

    const bars = d3.select("#bars")
        .attr("transform", `translate(${xpad},0)`)
        .selectAll("rect")
        .data(data);
        
    bars.enter()
        .append('rect')
        .attr('width', barWidth)
        .attr('height', d => H - yScale(d[selectedDimension]))
        .attr('y', d => yScale(d[selectedDimension]))
        .attr('x', d => xScale(d.YEAR)+BAR_MARGIN)
        .attr('fill', d => colorScale(d[selectedDimension]));
    
    bars.transition()
        .duration(transitionDuration)
        .ease(d3.easeQuad)
        .attr("height", d => H - yScale(d[selectedDimension]))
        .attr('y', d => yScale(d[selectedDimension]))
        .attr('fill', d => colorScale(d[selectedDimension]));

    bars.exit().remove();


    // ******* TODO: PART II *******

    // Implement how the bars respond to click events
    // Color the selected bar to indicate it has been selected.
    // Make sure only the selected bar has this new color.

    // Call the necessary update functions for when a user clicks on a bar.
    // Note: think about what you want to update when a different bar is selected.
    
    const barsTmp = d3.select("#bars").selectAll("rect");


    barsTmp.on('click', function(d, i) {
         barsTmp
             .attr('fill', d => colorScale(d[selectedDimension]));
        d3.select(this)
            .attr('fill', 'red');

        updateInfo(d);
        updateMap(d);
    });

}

/**
 *  Check the drop-down box for the currently selected data type and update the bar chart accordingly.
 *
 *  There are 4 attributes that can be selected:
 *  goals, matches, attendance and teams.
 */
function chooseData(v) {

    console.log(v);

    // ******* TODO: PART I *******
    // Change the selected data when a user selects a different
    // menu item from the drop down.
    createBarChart(v);
}

/**
 * Update the info panel to show info about the currently selected world cup
 *
 * @param oneWorldCup the currently selected world cup
 */
function updateInfo(oneWorldCup) {

    // ******* TODO: PART III *******

    // Update the text elements in the infoBox to reflect:
    // World Cup Title, host, winner, runner_up, and all participating teams that year

    // Hint: For the list of teams, you can create an list element for each team.
    // Hint: Select the appropriate ids to update the text content.

    const fieldsSelectors = ["#edition", "#host", "#winner", "#silver"];
    const fieldsData = [oneWorldCup.EDITION, oneWorldCup.host, oneWorldCup.winner, oneWorldCup.runner_up];
    const fieldsSelector = fieldsSelectors.join(',');
    d3.selectAll(fieldsSelector).data(fieldsData).text(d => d);

    if (d3.select('#teams').select('ul').empty())
        d3.select('#teams').append('ul');
    const teamList = d3.select("#teams")
        .select('ul')
        .selectAll('li')
        .data(oneWorldCup.teams_names);

    teamList.text(d => d);
    teamList.enter().append('li').text(d => d);
    teamList.exit().remove();

}

/**
 * Renders and updates the map and the highlights on top of it
 *
 * @param the json data with the shape of all countries
 */
function drawMap(world) {

    //(note that projection is global!
    // updateMap() will need it to add the winner/runner_up markers.)

    projection = d3.geoConicConformal().scale(150).translate([400, 350]);

    const path = d3.geoPath().projection(projection);

    const graticule = d3.geoGraticule()
      .step([10, 10]);
    
    // ******* TODO: PART IV *******


    // Draw the background (country outlines; hint: use #map)
    // Make sure and add gridlines to the map

    // Hint: assign an id to each country path to make it easier to select afterwards
    // we suggest you use the variable in the data element's .id field to set the id

    // Make sure and give your paths the appropriate class (see the .css selectors at
    // the top of the provided html file)

    var topology = topojson.feature(world, world.objects.countries).features;

    d3.select('#map')
        .selectAll(".countries")
        .data(topology, d => d.id)
        .enter()
        .insert("path")
        .attr("class", "countries")
        .attr("id", d => d.id)
        .attr("d", path);

    d3.select('#mapcontainer')
        .insert('g')
        .attr("id", "graticule")
        .selectAll('.grat')
        .data([graticule()])
        .enter()
        .insert('path')
        .attr('class', 'grat')
        .attr('d', path);

    d3.select('#mapcontainer')
        .selectAll(".countries")
        .on('click', d => {
            if (d3.select('body').select('#years').empty()) {
                const yearsEl = d3.select('body')
                .append('div')
                .attr('id', 'years');

                yearsEl.append('h3');
                yearsEl.append('ul');
            }

            const countryIso = d.id ? d.id : d;

            const yearsData = allWorldCupData
                        .filter(worldCup => worldCup.teams_iso.includes(countryIso))
                        .map(worldCup => {
                            // this selection is not correct because the property teams_iso and teams_names are not synchronized. It's more like a proof of concept.
                            const countryPosition = worldCup.teams_iso.findIndex(c => c === countryIso);
                            const countryName = worldCup.teams_names[countryPosition];
                            const winner = countryName === worldCup.winner;
                            const runnerUp = countryName === worldCup.runner_up;
                            return {
                                year: worldCup.year,
                                winner,
                                runnerUp
                            };
                        });

            d3.select("#years").select('h3').text(countryIso);

            d3.select("#years")
                .select('ul')
                .selectAll('li')
                .data(yearsData)
                .select("span")
                .text(d => d.year + (d.winner ? ' (winner)' : '') + (d.runnerUp ? ' (runner up)' : ''));
            
            d3.select("#years")
                .select('ul')
                .selectAll('li')
                .data(yearsData)
                .enter()
                .append('li')
                .append("span")
                .text(d => d.year + (d.winner ? ' (winner)' : '') + (d.runnerUp ? ' (runner up)' : ''));
            
            d3.select("#years")
                .select('ul')
                .selectAll('li')
                .data(yearsData).exit().remove();

    });

}

/**
 * Clears the map
 */
function clearMap() {

    // ******* TODO: PART V*******
    //Clear the map of any colors/markers; You can do this with inline styling or by
    //defining a class style in styles.css

    //Hint: If you followed our suggestion of using classes to style
    //the colors and markers for hosts/teams/winners, you can use
    //d3 selection and .classed to set these classes on and off here.

    d3.select('#map').select('.host').classed('host', false);
    d3.select('#points').selectAll('circle').remove();
    d3.select('#map').selectAll('.team').classed('team', false).classed('countries', true);

}


/**
 * Update Map with info for a specific FIFA World Cup
 * @param the data for one specific world cup
 */
function updateMap(worldcupData) {

    //Clear any previous selections;
    clearMap();

    // ******* TODO: PART V *******

    // Add a marker for the winner and runner up to the map.

    //Hint: remember we have a conveniently labeled class called .winner
    // as well as a .silver. These have styling attributes for the two
    //markers.


    //Select the host country and change it's color accordingly.

    //Iterate through all participating teams and change their color as well.

    //We strongly suggest using classes to style the selected countries.

    const winProjection = projection([worldcupData.WIN_LON, worldcupData.WIN_LAT]);
    const winCoordinates = {
        lon: winProjection[0],
        lat: winProjection[1],
        class: 'gold'
    };
    const rupProjection = projection([worldcupData.RUP_LON, worldcupData.RUP_LAT]);
    const rupCoordinates = {
        lon: rupProjection[0],
        lat: rupProjection[1],
        class: 'silver'
    };
    const markerCoordinates = [winCoordinates, rupCoordinates];
    const markerSize = 6;

    d3.select('#points')
        .selectAll("circle")
        .data(markerCoordinates)
        .enter()
        .append("circle")
        .attr('class', d => d.class)
        .attr('r', markerSize)
        .attr('cx', d => d.lon)
        .attr('cy', d => d.lat);

    d3.select('#map')
        .selectAll('.countries')
        .data(worldcupData.teams_iso, d => d.id ? d.id : d)
        .attr('id', d => d)
        .attr('class', 'team');

    d3.select("#" + worldcupData.host_country_code).classed('host', true);

}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)
//Load in json data to make map

d3.json("data/world.json", function (error, world) {
    if (error) {
        console.log(error);  //Log the error.
        throw error;
    }

    drawMap(world);
});


// Load CSV file
d3.csv("data/fifa-world-cup.csv", function (error, csv) {
    if (error) {
        console.log(error);  //Log the error.
        throw error;
    }

    csv.forEach(function (d) {

        // Convert numeric values to 'numbers'
        d.year = +d.YEAR;
        d.teams = +d.TEAMS;
        d.matches = +d.MATCHES;
        d.goals = +d.GOALS;
        d.avg_goals = +d.AVERAGE_GOALS;
        d.attendance = +d.AVERAGE_ATTENDANCE;
        //Lat and Lons of gold and silver medals teams
        d.win_pos = [+d.WIN_LON, +d.WIN_LAT];
        d.ru_pos = [+d.RUP_LON, +d.RUP_LAT];

        //Break up lists into javascript arrays
        d.teams_iso = d3.csvParse(d.TEAM_LIST).columns;
        d.teams_names = d3.csvParse(d.TEAM_NAMES).columns;

    });

    // Store csv data in a global variable
    allWorldCupData = csv;
    // Draw the Bar chart for the first time
    createBarChart('attendance');

    console.log(allWorldCupData);
});
