"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const LollipopChart = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // Setup Dimensions
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
    const keys = ["q1", "q2"];
    const maxVal = d3.max(data, (d) => d3.max(keys, (key) => d[key]));

    // --- Scales ---
    // X0 Scale: Groups (e.g., 'Product A')
    const x0 = d3
      .scaleBand()
      .domain(data.map((d) => d.group))
      .range([0, chartWidth])
      .paddingInner(0.2);

    // X1 Scale: Subgroups (clustering q1/q2 within each group)
    const x1 = d3
      .scaleBand()
      .domain(keys)
      .range([0, x0.bandwidth()])
      .padding(0.1);

    // Y Scale: Height/Value
    const y = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1]) // 10% buffer at the top
      .range([chartHeight, 0]);

    // Color Scale
    const color = d3.scaleOrdinal().domain(keys).range(["#9333ea", "#10b981"]); // Purple and Green for contrast

    // --- Axes ---

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
      .text("Performance Score");

    // --- Drawing the Lollipop Columns ---
    const groupContainer = svg
      .selectAll(".group")
      .data(data)
      .join("g")
      .attr("class", "group")
      .attr("transform", (d) => `translate(${x0(d.group)}, 0)`); // Move to the start of the group

    groupContainer
      .selectAll(".lollipop")
      .data((d) => keys.map((key) => ({ key, value: d[key], group: d.group })))
      .join("g")
      .attr("class", "lollipop")
      .each(function (d) {
        const barXCenter = x1(d.key) + x1.bandwidth() / 2; // X center of the sub-group bar
        const yValue = y(d.value);
        const yBase = chartHeight;
        const colorKey = color(d.key);

        // 1. Stick (Vertical Line)
        d3.select(this)
          .append("line")
          .attr("x1", barXCenter)
          .attr("x2", barXCenter)
          .attr("y1", yBase)
          .attr("y2", yValue)
          .attr("stroke", colorKey)
          .attr("stroke-width", 2);

        // 2. Head (Circle)
        d3.select(this)
          .append("circle")
          .attr("cx", barXCenter)
          .attr("cy", yValue)
          .attr("r", 5) // Radius of the lollipop head
          .attr("fill", colorKey)
          .attr("stroke", d3.color(colorKey).darker(0.5))
          .attr("stroke-width", 1.5);

        // 3. Add Value Label above the head
        if (d.value > 0) {
          d3.select(this)
            .append("text")
            .attr("x", barXCenter)
            .attr("y", yValue - 8)
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .style("fill", colorKey)
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
      .text("Lollipop Clustered Comparison");

    // --- Legend ---
    const legend = svg
      .append("g")
      .attr("transform", `translate(${chartWidth - 100}, 0)`);

    keys.forEach((key, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      // Draw small circle in legend
      legendRow
        .append("circle")
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 5)
        .attr("fill", color(key));

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 5)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .text(key.toUpperCase());
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

export default LollipopChart;
