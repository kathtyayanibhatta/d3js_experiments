// components/VariableSemiPie.js
"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// Renamed the internal component to keep the file name convention
const VariableSemiPie = ({ data }) => {
  const svgRef = useRef(null);
  // State to determine which chart to show: 'pie' or 'line'
  const [currentView, setCurrentView] = useState("pie");
  // State to hold the specific detail data if a slice is clicked
  const [selectedDetailData, setSelectedDetailData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // 1. CLEAR: Clear previous drawing regardless of current view
    d3.select(svgRef.current).selectAll("*").remove();

    const chartWidth = 600;
    const chartHeight = 300; // Total SVG height
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };

    const svg = d3
      .select(svgRef.current)
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`);

    if (currentView === "pie") {
      // ------------------------------------
      // --- RENDER SEMI-PIE CHART ---
      // ------------------------------------

      const innerRadius = 30;
      const pieMargin = 20;
      const maxOuterRadius = chartHeight - pieMargin;

      if (!data || data.length === 0) {
        svg
          .append("text")
          .attr("x", chartWidth / 2)
          .attr("y", chartHeight / 2)
          .attr("text-anchor", "middle")
          .text("No data available for pie chart.");
        return;
      }

      const radiusScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.radiusValue)])
        .range([innerRadius, maxOuterRadius]);

      // Translate group to the bottom center for semi-pie
      const g = svg
        .append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight})`);

      const pieGenerator = d3
        .pie()
        .value((d) => d.angleValue)
        .sort(null)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2);

      const arcGenerator = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius((d) => radiusScale(d.data.radiusValue));

      const arcs = pieGenerator(data);

      g.selectAll("path")
        .data(arcs)
        .join("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, i) => d3.schemeCategory10[i])
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .style("cursor", "pointer")
        .on("click", (event, d) => {
          // On click, switch to line view and set detail data
          setSelectedDetailData(d.data.detailData);
          setSelectedCategory(d.data.category);
          setCurrentView("line"); // Trigger re-render to draw line chart
        })
        .on("mouseover", function (event, d) {
          d3.select(this)
            .transition()
            .duration(100)
            .attr(
              "fill",
              d3.color(d3.schemeCategory10[arcs.indexOf(d)]).darker(0.5)
            );
        })
        .on("mouseout", function (event, d) {
          d3.select(this)
            .transition()
            .duration(100)
            .attr("fill", d3.schemeCategory10[arcs.indexOf(d)]);
        });

      // Add labels
      g.selectAll("text")
        .data(arcs)
        .join("text")
        .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black")
        .text((d) => d.data.category);
    } else if (currentView === "line" && selectedDetailData) {
      // ------------------------------------
      // --- RENDER LINE CHART ---
      // ------------------------------------

      const innerWidth = chartWidth - margin.left - margin.right;
      const innerHeight = chartHeight - margin.top - margin.bottom;

      const lineChartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      if (!selectedDetailData || selectedDetailData.length === 0) {
        lineChartGroup
          .append("text")
          .attr("x", innerWidth / 2)
          .attr("y", innerHeight / 2)
          .attr("text-anchor", "middle")
          .text(`No detail data available for ${selectedCategory}.`);
        return;
      }

      // X axis scale (categorical for months)
      const x = d3
        .scaleBand()
        .domain(selectedDetailData.map((d) => d.month))
        .range([0, innerWidth])
        .padding(0.1);

      // Y axis scale (linear for sales)
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(selectedDetailData, (d) => d.sales)])
        .nice()
        .range([innerHeight, 0]);

      // Draw Axes
      lineChartGroup
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

      lineChartGroup.append("g").call(d3.axisLeft(y));

      // Create and Draw the line generator
      const line = d3
        .line()
        .x((d) => x(d.month) + x.bandwidth() / 2)
        .y((d) => y(d.sales));

      lineChartGroup
        .append("path")
        .datum(selectedDetailData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

      // Data points
      lineChartGroup
        .selectAll("circle")
        .data(selectedDetailData)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.month) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d.sales))
        .attr("r", 4)
        .attr("fill", "steelblue");

      // Chart Title
      svg
        .append("text")
        .attr("x", chartWidth / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`Monthly Sales for ${selectedCategory}`);

      // Back to Pie Button
      svg
        .append("text")
        .attr("x", margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "start")
        .style("font-size", "14px")
        .style("fill", "blue")
        .style("cursor", "pointer")
        .text("← Back to Overview")
        .on("click", () => setCurrentView("pie"));
    }
  }, [currentView, data, selectedDetailData, selectedCategory]);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      {/* Dynamic Header based on view */}
      <h2>
        {currentView === "pie"
          ? "Fruit Categories Overview"
          : `Detail View for ${selectedCategory}`}
      </h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default VariableSemiPie;
