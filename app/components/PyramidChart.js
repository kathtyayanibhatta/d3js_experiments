"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const PyramidChart = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // Adjusted dimensions for a clean vertical clustered layout
    const width = 550;
    const height = 400;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // --- Data Extraction ---
    // Keys for clustering (Male/Female)
    const keys = ["male", "female"];
    // Max value for the Y scale
    const maxVal = d3.max(data, (d) => d3.max(keys, (key) => d[key]));

    // --- Scales ---
    // X0 Scale: Groups (e.g., '0-18', '19-35')
    const x0 = d3
      .scaleBand()
      .domain(data.map((d) => d.group))
      .range([0, chartWidth])
      .paddingInner(0.1);

    // X1 Scale: Subgroups (clustering Male/Female within each group)
    const x1 = d3
      .scaleBand()
      .domain(keys)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    // Y Scale: Height/Value
    const y = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1]) // Added 10% buffer at the top
      .range([chartHeight, 0]);

    // Color Scale
    const color = d3.scaleOrdinal().domain(keys).range(["#1f77b4", "#ff7f0e"]);

    // --- Axes and Labels ---

    // X Axis (Groups)
    svg
      .append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x0));

    // Y Axis (Value)
    svg.append("g").call(d3.axisLeft(y).ticks(5));

    // Y-Axis Label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - chartHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text("Value");

    // --- Drawing the Triangular Columns ---
    const groupContainer = svg
      .selectAll(".group")
      .data(data)
      .join("g")
      .attr("class", "group")
      .attr("transform", (d) => `translate(${x0(d.group)}, 0)`); // Move to the start of the group

    groupContainer
      .selectAll(".bar")
      .data((d) => keys.map((key) => ({ key, value: d[key], group: d.group })))
      .join("g")
      .attr("class", "bar")
      .each(function (d) {
        const barX = x1(d.key); // X position within the group's band
        const barWidth = x1.bandwidth();
        const yBase = chartHeight;

        // Coordinates for the Triangle (Vertical Bar)

        // P1: Bottom Left corner
        const x1_P1 = barX;
        const y1_P1 = yBase;

        // P2: Bottom Right corner
        const x1_P2 = barX + barWidth;
        const y1_P2 = yBase;

        // P3: Top Center (Apex)
        const x1_P3 = barX + barWidth / 2;
        const y1_P3 = y(d.value); // Height determined by data value

        // Path definition: M (P1) L (P2) L (P3) Z (close)
        const pathData = `
          M ${x1_P1} ${y1_P1}
          L ${x1_P2} ${y1_P2}
          L ${x1_P3} ${y1_P3}
          Z
        `;

        // Draw the triangle path
        d3.select(this)
          .append("path")
          .attr("d", pathData)
          .attr("fill", color(d.key))
          .attr("stroke", d3.color(color(d.key)).darker(0.3))
          .attr("stroke-width", 0.5);

        // Add Value Label above the apex
        if (d.value > 0) {
          d3.select(this)
            .append("text")
            .attr("x", x1_P3)
            .attr("y", y1_P3 - 5) // 5 pixels above the apex
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .style("fill", "#333")
            .text(d.value);
        }
      });

    // --- Title ---
    svg
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "1.2em")
      .style("font-weight", "bold")
      .text("Vertical Clustered Triangular Chart");

    // --- Legend ---
    const legend = svg
      .append("g")
      .attr("transform", `translate(${chartWidth - 80}, 0)`);

    keys.forEach((key, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      // Draw small triangle in legend
      legendRow
        .append("path")
        .attr("d", "M 0 10 L 10 10 L 5 0 Z") // Upward pointing triangle for legend
        .attr("fill", color(key));

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 5)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .text(key.charAt(0).toUpperCase() + key.slice(1));
    });
  }, [data]);

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PyramidChart;
