import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieChart = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Set the dimensions and margins of the graph
    const width = 200;
    const height = 200;
    const margin = 20;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    const radius = Math.min(width, height) / 2 - margin;

    // Create the SVG object
    const svg = d3.select(svgRef.current)
                  .attr("width", width)
                  .attr("height", height)
                .append("g")
                  .attr("transform", `translate(${width / 2},${height / 2})`);

    // Convert data object to array of objects
    const data_ready = [
      { key: "Wins", value: data.wins },
      { key: "Losses", value: data.losses }
    ];

    // Set the color scale
    const color = d3.scaleOrdinal()
                    .domain(data_ready.map(d => d.key))
                    .range(["red", "green"]);

    // Compute the position of each group on the pie
    const pie = d3.pie()
                  .value(function(d) { return d.value; });
    const arcs = pie(data_ready);

    // Build the pie chart
    svg.selectAll('whatever')
       .data(arcs)
       .enter()
       .append('path')
       .attr('d', d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius)
       )
       .attr('fill', function(d) { return color(d.data.key); })
       .attr("stroke", "white")
       .style("stroke-width", "2px")
       .style("opacity", 0.7);

       
  }, [data]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default PieChart;