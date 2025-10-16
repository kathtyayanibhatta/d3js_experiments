"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const CappedClusteredColumnChart = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // Setup Dimensions
    const width = 550;
    const height = 400;
    const margin = { top: 60, right: 30, bottom: 50, left: 50 };
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
    // Keys define the segments that make up the main bar body
    const keys = ["sliceA", "sliceB"];
    const maxVal = d3.max(data, (d) => d.capValue);
    const categories = data.map((d) => d.group);

    // --- Scales ---
    const x = d3
      .scaleBand()
      .domain(categories)
      .range([0, chartWidth])
      .paddingInner(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1])
      .range([chartHeight, 0]);

    const colors = {
      sliceA: "#8b5cf6", // Violet - Bottom Slice
      sliceB: "#f472b6", // Pink - Top Slice
      cap: "#eab308", // Amber - Cap Color
    };

    // --- Axes ---
    svg
      .append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

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

    // --- Drawing the Sliced and Capped Columns ---
    const groupContainer = svg
      .selectAll(".group")
      .data(data)
      .join("g")
      .attr("class", "group")
      .attr("transform", (d) => `translate(${x(d.group)}, 0)`);

    const CAP_HEIGHT = 20;
    const SLICE_SPACING = 7; // Distance between horizontal lines (in pixels)

    groupContainer.each(function (d) {
      const groupEl = d3.select(this);
      const barWidth = x.bandwidth();
      const BAR_TOTAL = d.sliceA + d.sliceB;
      const totalBarPixelHeight = chartHeight - y(BAR_TOTAL);

      // --- 1. Draw Sliced Segments as Lines ---
      const numLines = Math.floor(totalBarPixelHeight / SLICE_SPACING);

      // Create line data for the full height
      const allLineData = d3
        .range(numLines)
        .map((i) => {
          // Calculate the Y coordinate of the line (bottom up)
          const lineYPixel = chartHeight - i * SLICE_SPACING;

          // Convert the line's pixel position back to a data value to determine its color
          const lineValue = y.invert(lineYPixel);

          let key = "sliceA";
          let color = colors.sliceA;

          // If lineValue is greater than sliceA, it belongs to slice B.
          if (lineValue > d.sliceA) {
            key = "sliceB";
            color = colors.sliceB;
          }

          return {
            y: lineYPixel,
            segmentKey: key,
            color: color,
            groupKey: d.group,
            lineIndex: i,
          };
        })
        .filter((line) => line.y > y(BAR_TOTAL)); // Ensure lines don't go past the bar top

      // Draw a faint background rectangle for visual grouping, inspired by the image
      groupEl
        .append("rect")
        .attr("x", 0)
        .attr("y", y(BAR_TOTAL))
        .attr("width", barWidth)
        .attr("height", totalBarPixelHeight)
        .attr("fill", "#f0f0f0");

      // Draw the colored slices (lines)
      groupEl
        .selectAll(".line-slice")
        .data(allLineData)
        .join("line")
        .attr("class", (d) => `line-slice line-slice-${d.segmentKey}`)
        .attr("x1", 0)
        .attr("x2", barWidth)
        .attr("stroke", (d) => d.color)
        .attr("stroke-width", 2)
        .attr("opacity", 0.8)
        .attr("y1", chartHeight)
        .attr("y2", chartHeight)
        .transition()
        .duration(800)
        .attr("y1", (d) => d.y)
        .attr("y2", (d) => d.y);

      // --- 2. Draw Cap Box ---
      const capYPos = y(d.capValue); // Y position corresponding to the capValue

      // Cap Box (Outline Rectangle)
      groupEl
        .selectAll(".bar-cap-box")
        .data([d])
        .join("rect")
        .attr("class", "bar-cap-box")
        .attr("x", 0)
        .attr("y", chartHeight)
        .attr("width", barWidth)
        .attr("height", 0)
        .attr("fill", "none")
        .attr("stroke", colors.cap)
        .attr("stroke-width", 2)
        .attr("rx", 3)
        .attr("ry", 3)
        .transition()
        .duration(800)
        .attr("y", capYPos - CAP_HEIGHT / 2)
        .attr("height", CAP_HEIGHT);

      // Cap Label (Value)
      groupEl
        .selectAll(".cap-label")
        .data([d])
        .join("text")
        .attr("class", "cap-label")
        .attr("x", barWidth / 2)
        .attr("y", capYPos) // Center Y inside the box
        .attr("dy", "0.35em") // Center vertically
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", colors.cap)
        .text((d) => `${d.capValue}`)
        .style("opacity", 0)
        .transition()
        .delay(800)
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
      .text("Sliced Stacked Column with Goal Cap");

    // --- Legend ---
    const legendData = [
      { key: "sliceA", label: "Slice A (Bottom)", color: colors.sliceA },
      { key: "sliceB", label: "Slice B (Top)", color: colors.sliceB },
      { key: "cap", label: "Goal/Total Cap", color: colors.cap },
    ];

    const legend = svg
      .append("g")
      .attr("transform", `translate(0, ${chartHeight + 40})`);

    legendData.forEach((item, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(${i * 180}, 0)`);

      // Use a rectangle to represent the bar color/style in the legend
      legendRow
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", item.key === "cap" ? "none" : item.color)
        .attr("stroke", item.key === "cap" ? item.color : "none")
        .attr("stroke-width", item.key === "cap" ? 2 : 0);

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 5)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .text(item.label);
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

export default CappedClusteredColumnChart;
