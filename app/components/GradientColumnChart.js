"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const GradientColumnChart = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // Setup Dimensions
    const width = 550;
    const height = 400;
    const margin = { top: 40, right: 30, bottom: 50, left: 50 };
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
    const keys = ["sales", "profit"];
    const maxVal = d3.max(data, (d) => d3.max(keys, (key) => d[key]));

    // --- Color and Gradient Setup ---
    const baseColors = {
      sales: "#2563eb", // Indigo Blue
      profit: "#059669", // Emerald Green
    };

    // Define Gradients (Dark at top, faded at bottom)
    keys.forEach((key) => {
      const id = `gradient-${key}`;
      const baseColor = baseColors[key];

      const gradient = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", id)
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%") // Gradient starts at the top of the bar (dark color)
        .attr("y2", "100%"); // Gradient ends at the bottom of the bar (light/faded color)

      // Stop 1: Darkest color at the top (0%)
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.color(baseColor).darker(0.5)) // Darker shade at top
        .attr("stop-opacity", 1);

      // Stop 2: Lighter color at the bottom (100%)
      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.color(baseColor).brighter(1)) // Lighter shade at bottom
        .attr("stop-opacity", 0.8);
    });

    // --- Scales ---
    const x0 = d3
      .scaleBand()
      .domain(data.map((d) => d.group))
      .range([0, chartWidth])
      .paddingInner(0.15);

    const x1 = d3
      .scaleBand()
      .domain(keys)
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1])
      .range([chartHeight, 0]);

    // --- Axes ---

    // X Axis (Groups)
    svg
      .append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0));

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

    // --- Drawing the Columns with Gradients ---
    const groupContainer = svg
      .selectAll(".group")
      .data(data)
      .join("g")
      .attr("class", "group")
      .attr("transform", (d) => `translate(${x0(d.group)}, 0)`);

    groupContainer
      .selectAll(".bar")
      .data((d) => keys.map((key) => ({ key, value: d[key], group: d.group })))
      .join("g")
      .attr("class", "bar")
      .each(function (d) {
        const barX = x1(d.key);
        const barWidth = x1.bandwidth();
        const yValue = y(d.value);
        const yBase = chartHeight;
        const gradientId = `url(#gradient-${d.key})`;

        // 1. Rectangle Bar
        d3.select(this)
          .append("rect")
          .attr("x", barX)
          .attr("y", yBase) // Start at the bottom
          .attr("width", barWidth)
          .attr("height", 0) // Start height at 0 for animation
          .attr("fill", gradientId)
          .attr("rx", 4) // Rounded corners for aesthetics
          .attr("ry", 4)
          .transition()
          .duration(800)
          .attr("y", yValue) // Transition to final height
          .attr("height", yBase - yValue);

        // 2. Value Label
        d3.select(this)
          .append("text")
          .attr("x", barX + barWidth / 2)
          .attr("y", yValue - 5)
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .style("fill", "#333")
          .text(d.value)
          .style("opacity", 0)
          .transition()
          .delay(800) // Appear after bar animation
          .duration(300)
          .style("opacity", 1);
      });

    // --- Title ---
    svg
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -margin.top / 2 + 10)
      .attr("text-anchor", "middle")
      .style("font-size", "1.2em")
      .style("font-weight", "bold")
      .text("Clustered Column Chart with Fade");

    // --- Legend ---
    const legend = svg
      .append("g")
      .attr("transform", `translate(${chartWidth - 100}, 0)`);

    keys.forEach((key, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      // Draw small gradient rectangle in legend
      legendRow
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", `url(#gradient-${key})`); // Use the gradient here too

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
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default GradientColumnChart;
