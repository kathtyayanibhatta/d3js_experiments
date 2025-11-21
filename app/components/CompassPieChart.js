"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const CompassPieChart = ({
  data,
  totalValue = 342,
  totalLabel = "Total Seats",
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // Chart Dimensions and Configuration
    const width = 500;
    const height = 500;
    const margin = 20;

    // --- Radii Definitions (Adjusted slightly for tighter look) ---
    const innerRadiusSlice = 120; // Inner radius of the pie slices (start of colored ring)
    const outerRadiusSlice = Math.min(width, height) / 2 - margin; // Outer radius of the pie slices
    const centerCircleRadius = innerRadiusSlice - 20; // Radius of the central circle for text
    const pointerStartRadius = centerCircleRadius + 5; // Pointers start slightly outside center circle
    const pointerEndRadius = innerRadiusSlice - 5; // Pointers end slightly inside pie slices

    // Setup SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // --- Data Preparation ---
    const totalSum = d3.sum(data, (d) => d.value);

    const pieData = d3
      .pie()
      .value((d) => d.value)
      .sort(null);

    // --- Custom Color Scheme (Exactly matching the image) ---
    const customColors = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.category))
      .range([
        "#F0D4B2", // Light cream/orange (top right)
        "#E7A887", // Peach/light orange (top left)
        "#BC858C", // Muted rose/pink (bottom right)
        "#C79D4D", // Gold/brown (bottom left)
        "#AA947C", // Darker brown (far left)
      ]);

    // --- D3 Arc Generator for Slices ---
    const arcGenerator = d3
      .arc()
      .innerRadius(innerRadiusSlice)
      .outerRadius(outerRadiusSlice);

    // --- Drawing Slices ---
    const arcs = g
      .selectAll("arc")
      .data(pieData(data))
      .join("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", (d) => customColors(d.data.category))
      .attr("stroke", "white") // White separation lines
      .attr("stroke-width", 1)
      .style("filter", "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.15))"); // More pronounced shadow for depth

    // --- Add Percentage and Category Labels within Slices ---
    arcs.each(function (d) {
      const sliceCentroid = arcGenerator.centroid(d);
      const percentage = ((d.data.value / totalSum) * 100).toFixed(0);

      // Percentage text
      g.append("text")
        .attr(
          "transform",
          `translate(${sliceCentroid[0]}, ${sliceCentroid[1] - 12})`
        ) // Adjusted Y
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-family", "Inter, sans-serif")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("fill", d.data.category === "7%" ? "#8B5A3F" : "#FFF") // Darker text for light slice
        .text(`${percentage}%`);

      // Category text
      g.append("text")
        .attr(
          "transform",
          `translate(${sliceCentroid[0]}, ${sliceCentroid[1] + 12})`
        ) // Adjusted Y
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-family", "Inter, sans-serif")
        .style("font-size", "14px")
        .style("fill", d.data.category === "7%" ? "#8B5A3F" : "#FFF") // Darker text for light slice
        .text(d.data.label || d.data.category);
    });

    // --- Add Central Circle with Total ---
    g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", centerCircleRadius)
      .attr("fill", "#D9C8A1") // Center circle background
      .attr("stroke", "#AA947C") // Center circle border
      .attr("stroke-width", 1);

    // Total Value Text
    g.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-family", "Inter, sans-serif")
      .style("font-size", "30px")
      .style("font-weight", "bold")
      .style("fill", "#8B5A3F") // Dark brown text
      .text(totalValue);

    // Total Label Text
    g.append("text")
      .attr("x", 0)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-family", "Inter, sans-serif")
      .style("font-size", "16px")
      .style("fill", "#8B5A3F") // Dark brown text
      .text(totalLabel);

    // --- Add Compass Pointers (Custom Path Shapes) ---
    // These pointers originate from the center circle and point to the slice.
    arcs.each(function (d) {
      const midAngle = (d.startAngle + d.endAngle) / 2;
      const pointerWidth = 5; // Width of the pointer base
      const pointerColor = "#8B5A3F"; // Dark brown color for the pointers

      // Convert angles to radians (D3 already provides in radians)
      // x = r * sin(angle), y = -r * cos(angle) - standard D3 polar to cartesian

      // Calculate the two base points near the center circle
      const xStartLeft =
        pointerStartRadius *
        Math.sin(midAngle - pointerWidth / pointerStartRadius / 2);
      const yStartLeft =
        pointerStartRadius *
        -Math.cos(midAngle - pointerWidth / pointerStartRadius / 2);

      const xStartRight =
        pointerStartRadius *
        Math.sin(midAngle + pointerWidth / pointerStartRadius / 2);
      const yStartRight =
        pointerStartRadius *
        -Math.cos(midAngle + pointerWidth / pointerStartRadius / 2);

      // Calculate the tip point near the slice inner edge
      const xEnd = pointerEndRadius * Math.sin(midAngle);
      const yEnd = pointerEndRadius * -Math.cos(midAngle);

      // Create a path string for the triangle
      const pointerPath = `M ${xStartLeft},${yStartLeft} L ${xEnd},${yEnd} L ${xStartRight},${yStartRight} Z`;

      g.append("path")
        .attr("d", pointerPath)
        .attr("fill", pointerColor)
        .attr("stroke", pointerColor)
        .attr("stroke-width", 0.5)
        .style("filter", "drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.1))"); // Subtle shadow for pointers
    });
  }, [data, totalValue, totalLabel]);

  return (
    <div className="flex justify-center p-4">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap");
      `}</style>
      <div
        className="shadow-2xl rounded-xl"
        style={{
          border: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          maxWidth: "520px",
          overflow: "hidden", // Important to clip any overflow from shadows
        }}
      >
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default CompassPieChart;
