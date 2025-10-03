"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const RadialBarChart = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 500;
    const height = 500; // Use a square aspect ratio for better radial visualization
    const margin = 50;
    const innerRadius = 50;
    const outerRadius = Math.min(width, height) / 2 - margin;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // --- Scales and Data Prep ---
    const xScale = d3
      .scaleBand()
      .range([0, 2 * Math.PI]) // 360 degrees
      .align(0)
      .domain(data.map((d) => d.item));

    const yScale = d3
      .scaleRadial()
      .range([innerRadius, outerRadius]) // Bar length varies between inner and outer radius
      .domain([0, d3.max(data, (d) => d.value) * 1.1]); // Start at 0, end slightly above max value

    const colorScale = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.item))
      .range(d3.schemeDark2);

    // --- D3 Arc Generator ---
    const arcGenerator = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius((d) => yScale(d.value)) // The bar length is driven by the data value
      .startAngle((d) => xScale(d.item))
      .endAngle((d) => xScale(d.item) + xScale.bandwidth())
      .padAngle(0.01)
      .padRadius(innerRadius);

    // --- Drawing the Bars ---
    g.selectAll("path")
      .data(data)
      .join("path")
      .attr("fill", (d) => colorScale(d.item))
      .attr("d", arcGenerator)
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(100).attr("opacity", 0.8);
        // Tooltip position near the end of the bar
        g.append("text")
          .attr("class", "tooltip-rbc")
          .attr("transform", `translate(${arcGenerator.centroid(d)})`)
          .attr("text-anchor", "middle")
          .style("fill", "#000")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .text(`${d.item}: ${d.value}`);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(100).attr("opacity", 1);
        g.select(".tooltip-rbc").remove();
      });

    // --- Labels (Items) ---
    g.selectAll("text.item-label")
      .data(data)
      .join("text")
      .attr("class", "item-label")
      .attr("x", (d) => {
        // Calculate midpoint angle for the label
        const midAngle = xScale(d.item) + xScale.bandwidth() / 2;
        const x = (outerRadius + 10) * Math.sin(midAngle);
        return x;
      })
      .attr("y", (d) => {
        const midAngle = xScale(d.item) + xScale.bandwidth() / 2;
        const y = (outerRadius + 10) * -Math.cos(midAngle);
        return y;
      })
      .attr("text-anchor", (d) => {
        const midAngle = xScale(d.item) + xScale.bandwidth() / 2;
        return midAngle > Math.PI || midAngle < 0 ? "end" : "start";
      })
      .attr("transform", (d) => {
        const midAngle = xScale(d.item) + xScale.bandwidth() / 2;
        const angleDeg = (midAngle * 180) / Math.PI - 90;
        const rotateDeg =
          midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2
            ? angleDeg + 180
            : angleDeg;

        // Text position for rotation reference
        const xPos = (outerRadius + 10) * Math.sin(midAngle);
        const yPos = (outerRadius + 10) * -Math.cos(midAngle);

        return `translate(${xPos}, ${yPos}) rotate(${rotateDeg})`;
      })
      .style("font-size", "11px")
      .style("fill", "#333")
      .text((d) => d.item);

    // --- Title ---
    d3.select(svgRef.current)
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin + 10)
      .attr("text-anchor", "middle")
      .style("font-size", "1.2em")
      .style("font-weight", "bold")
      .text("Radial Bar Chart");
  }, [data]);

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RadialBarChart;
