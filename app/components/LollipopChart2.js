"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const LollipopChart2 = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // Setup Dimensions
    const width = 550;
    const height = 400;
    const margin = { top: 40, right: 30, bottom: 40, left: 50 };
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

    // Calculate min and max across all keys and groups to handle negatives
    const minVal = d3.min(data, (d) => d3.min(keys, (key) => d[key]));
    const maxVal = d3.max(data, (d) => d3.max(keys, (key) => d[key]));

    // --- Scales ---
    const x0 = d3
      .scaleBand()
      .domain(data.map((d) => d.group))
      .range([0, chartWidth])
      .paddingInner(0.2);

    const x1 = d3
      .scaleBand()
      .domain(keys)
      .range([0, x0.bandwidth()])
      .padding(0.1);

    // Y Scale: Handle negative to positive range
    const y = d3
      .scaleLinear()
      .domain([minVal < 0 ? minVal * 1.1 : 0, maxVal > 0 ? maxVal * 1.1 : 0])
      .range([chartHeight, 0]);

    const color = d3.scaleOrdinal().domain(keys).range(["#9333ea", "#10b981"]);

    // --- Axes ---

    // Zero Line (The origin baseline for sticks)
    const zeroLineY = y(0);

    // X Axis - Positioned at y(0) so it crosses the center if there are negatives
    svg
      .append("g")
      .attr("transform", `translate(0, ${zeroLineY})`)
      .call(d3.axisBottom(x0).tickSize(0))
      .call((g) => g.select(".domain").attr("stroke", "#ccc"))
      .selectAll("text")
      // Push labels to the bottom of the chart area so they don't overlap with bars
      .attr("transform", `translate(0, ${chartHeight - zeroLineY + 10})`)
      .style("text-anchor", "middle");

    // Y Axis
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
      .attr("transform", (d) => `translate(${x0(d.group)}, 0)`);

    groupContainer
      .selectAll(".lollipop")
      .data((d) => keys.map((key) => ({ key, value: d[key], group: d.group })))
      .join("g")
      .attr("class", "lollipop")
      .each(function (d) {
        const barXCenter = x1(d.key) + x1.bandwidth() / 2;
        const yValue = y(d.value);
        const colorKey = color(d.key);

        // 1. Stick (Vertical Line) - Originates from zeroLineY
        d3.select(this)
          .append("line")
          .attr("x1", barXCenter)
          .attr("x2", barXCenter)
          .attr("y1", zeroLineY)
          .attr("y2", yValue)
          .attr("stroke", colorKey)
          .attr("stroke-width", 2);

        // 2. Head (Circle)
        d3.select(this)
          .append("circle")
          .attr("cx", barXCenter)
          .attr("cy", yValue)
          .attr("r", 5)
          .attr("fill", colorKey)
          .attr("stroke", d3.color(colorKey).darker(0.5))
          .attr("stroke-width", 1.5);

        // 3. Add Value Label
        // Position label above head if positive, below head if negative
        const labelOffset = d.value >= 0 ? -8 : 15;

        d3.select(this)
          .append("text")
          .attr("x", barXCenter)
          .attr("y", yValue + labelOffset)
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .style("fill", colorKey)
          .text(d.value);
      });

    // --- Title ---
    svg
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "1.2em")
      .style("font-weight", "bold")
      .text("Bidirectional Lollipop Chart");

    // --- Legend ---
    const legend = svg
      .append("g")
      .attr("transform", `translate(${chartWidth - 100}, -10)`);

    keys.forEach((key, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

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

export default LollipopChart2;
