import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RadarChart = ({ data }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(svgRef.current)
                  .attr("width", width)
                  .attr("height", height);

    const g = svg.append("g")
                 .attr("transform", `translate(${width / 2},${height / 2})`);

    const angleScale = d3.scaleBand()
                         .domain(data.map(d => d.name))
                         .range([0, Math.PI * 2]);

    const radiusScale = d3.scaleLinear()
                          .domain([0, 1])
                          .range([0, radius]);

    // Draw axes
    g.selectAll(".axis")
     .data(data)
     .enter()
     .append("line")
     .attr("class", "axis")
     .attr("x1", 0)
     .attr("y1", 0)
     .attr("x2", (d, i) => radiusScale(1) * Math.cos(angleScale(d.name)))
     .attr("y2", (d, i) => radiusScale(1) * Math.sin(angleScale(d.name)))
     .attr("stroke", "grey");

    // Draw radar chart
    const line = d3.lineRadial()
                   .angle((d, i) => angleScale(d.name))
                   .radius((d, i) => radiusScale(d.value))
                   .curve(d3.curveLinearClosed);

    g.append("path")
     .datum(data)
     .attr("d", line)
     .attr("fill", "green")
     .attr("fill-opacity", 0.5);

    // Add circles
    g.selectAll(".circle")
     .data(data)
     .enter()
     .append("circle")
     .attr("class", "circle")
     .attr("cx", (d, i) => radiusScale(d.value) * Math.cos(angleScale(d.name)))
     .attr("cy", (d, i) => radiusScale(d.value) * Math.sin(angleScale(d.name)))
     .attr("r", 4) // Adjust circle radius as needed
     .attr("fill", "red"); // Change circle fill color here

  }, [data]);


  return (
    <div className='Chart' ref={containerRef}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RadarChart;