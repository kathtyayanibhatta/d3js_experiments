// components/LineChart.js
"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const LineChart = ({ data, title = "Sales by Month" }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Clear previous drawing
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    // Ensure data is valid
    if (!data || data.length === 0) {
      d3.select(svgRef.current)
        .append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", height / 2 + margin.top)
        .attr("text-anchor", "middle")
        .text("No detail data available.");
      return;
    }

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis scale (categorical for months)
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, width])
      .padding(0.1);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Y axis scale (linear for sales)
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales)])
      .nice()
      .range([height, 0]);

    svg.append("g").call(d3.axisLeft(y));

    // Add X axis label
    svg
      .append("text")
      .attr(
        "transform",
        `translate(${width / 2}, ${height + margin.bottom - 5})`
      )
      .style("text-anchor", "middle")
      .text("Month");

    // Add Y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Sales");

    // Create the line generator
    const line = d3
      .line()
      .x((d) => x(d.month) + x.bandwidth() / 2) // Center line points on band
      .y((d) => y(d.sales));

    // Draw the line
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add circles for data points
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.month) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.sales))
      .attr("r", 4)
      .attr("fill", "steelblue");

    // Add chart title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(title);
  }, [data, title]); // Re-run if data or title changes

  return <svg ref={svgRef}></svg>;
};

export default LineChart;
