// components/ParliamentChart.js
"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ParliamentChart = ({ data, totalSeats = 543 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 600;
    const height = 300;
    const margin = 20;
    const centerX = width / 2;
    const centerY = height;

    // --- CHART SHAPE CONTROLS ---
    const SEAT_RADIUS = 4;
    const SEAT_SPACING = 2;
    const ROW_HEIGHT = SEAT_RADIUS * 2 + SEAT_SPACING;

    // Control the hollow middle (20% inner radius)
    const INNER_RADIUS_COEF = 0.2;
    const MIN_RADIUS = (height - margin) * INNER_RADIUS_COEF + SEAT_RADIUS;
    const MAX_RADIUS = height - margin - SEAT_RADIUS; // Max radius for the outermost seat

    // Total angle is Math.PI (180 degrees)
    const ARC_TOTAL_ANGLE = Math.PI;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // --- Data Preparation and Angular Scaling ---
    let allSeats = [];
    const partyColors = [
      "#A98B8B",
      "#8E6C6C",
      "#C7B0A4",
      "#6D4C41",
      "#80CBC4",
      "#4DD0E1",
      "#9575CD",
      "#D32F2F",
      "#FFEE58",
      "#B0BEC5",
      d3.schemeCategory10[0],
      d3.schemeCategory10[1],
      d3.schemeCategory10[2],
    ];
    let colorIndex = 0;

    const dataTotalSeats = d3.sum(data, (d) => d.seats);

    // Scale to map total seats to the 180-degree semi-circle [PI (left) to 0 (right)]
    const angularScale = d3
      .scaleLinear()
      .domain([0, dataTotalSeats])
      .range([ARC_TOTAL_ANGLE, 0]);

    let currentAngle = ARC_TOTAL_ANGLE; // Start from the far left (PI)
    let currentGlobalIndex = 0;

    data.forEach((party) => {
      const color = partyColors[colorIndex % partyColors.length];

      party.color = color;

      // Calculate the angular span for this party
      const partyAngleSize = angularScale(0) - angularScale(party.seats);
      party.endAngle = currentAngle - partyAngleSize;
      party.startAngle = currentAngle;

      party.angleSpan = partyAngleSize;
      party.midAngle = party.startAngle - partyAngleSize / 2;

      party.startGlobalIndex = currentGlobalIndex;

      for (let i = 0; i < party.seats; i++) {
        allSeats.push({
          category: party.category,
          color: color,
        });
        currentGlobalIndex++;
      }
      currentAngle = party.endAngle;
      colorIndex++;
    });

    if (allSeats.length === 0) {
      g.append("text")
        .attr("x", 0)
        .attr("y", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("No seat data available.");
      return;
    }

    // --- REFINED SECTOR/SLICE LAYOUT ALGORITHM ---

    // Calculate the total number of concentric rows available
    const maxRows = Math.floor((MAX_RADIUS - MIN_RADIUS) / ROW_HEIGHT) + 1;

    data.forEach((party) => {
      const seatsPerParty = party.seats;
      let seatsPlacedInParty = 0;

      // --- 1. Determine the Best Column/Row Layout for this Party ---

      // Start by determining how many seats fit on the outermost row of this party's slice
      const partyOuterArcLength = party.angleSpan * MAX_RADIUS;
      const maxColsInOuterRow = Math.max(
        1,
        Math.floor(partyOuterArcLength / (SEAT_RADIUS * 2 + SEAT_SPACING))
      );

      // Estimate the minimum number of rows needed
      let targetCols = maxColsInOuterRow;
      let targetRows = Math.max(1, Math.ceil(seatsPerParty / targetCols));

      // If target rows exceeds physical max, adjust columns down and rows up
      if (targetRows > maxRows) {
        targetRows = maxRows;
        targetCols = Math.max(1, Math.ceil(seatsPerParty / targetRows));
      }

      let currentRow = 0;

      // --- 2. Place Seats in the Determined Grid ---
      for (let r = 0; r < targetRows; r++) {
        // Calculate the radius for this row
        const currentRadius = MIN_RADIUS + r * ROW_HEIGHT;

        // In the slice layout, the number of columns must remain constant to maintain vertical lines.
        const colsInThisRow = targetCols;

        // Seats remaining to be placed in this party
        const remainingSeats = seatsPerParty - seatsPlacedInParty;

        // Number of seats to fill in this specific row (don't overfill the party's total)
        const seatsToPlaceInRow = Math.min(colsInThisRow, remainingSeats);

        // If there are no seats left, or we are outside the max radius, stop.
        if (seatsToPlaceInRow === 0 || currentRadius > MAX_RADIUS) break;

        for (let c = 0; c < seatsToPlaceInRow; c++) {
          const globalIndex = party.startGlobalIndex + seatsPlacedInParty;
          const seat = allSeats[globalIndex];

          // Angle Calculation: Distribute seats evenly across the party's angle span
          // Anchor the first seat at the start angle and the last at the end angle.
          const angleFraction =
            colsInThisRow > 1 ? c / (colsInThisRow - 1) : 0.5;
          const angle = party.startAngle - angleFraction * party.angleSpan;

          // Convert polar to Cartesian (x, y)
          seat.x = currentRadius * Math.cos(angle);
          seat.y = currentRadius * Math.sin(angle) * -1;

          seatsPlacedInParty++;
        }
        currentRow++;
      }
    });

    const positionedSeats = allSeats.filter((d) => d.x !== undefined);

    // --- Drawing Seats (Drawn with Grouping and Hover) ---
    const seatsForDrawing = d3.groups(positionedSeats, (d) => d.category);

    g.selectAll(".party-group")
      .data(seatsForDrawing)
      .join("g")
      .attr("class", "party-group")
      .selectAll("circle")
      .data((d) => d[1])
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", SEAT_RADIUS)
      .attr("fill", (d) => d.color)
      .attr("stroke", "none")
      .style("cursor", "pointer")

      // Hover Effect Logic
      .on("mouseover", function (event, d) {
        d3.selectAll(".party-group")
          .filter((p) => p[0] === d.category)
          .selectAll("circle")
          .transition()
          .duration(100)
          .attr("r", SEAT_RADIUS * 1.5)
          .attr("fill", d3.color(d.color).darker(0.5));

        // Tooltip
        g.append("text")
          .attr("class", "tooltip-text")
          .attr("x", d.x)
          .attr("y", d.y - SEAT_RADIUS * 3)
          .attr("text-anchor", "middle")
          .style("fill", "#333")
          .style("font-size", "14px")
          .style("pointer-events", "none")
          .text(
            `${d.category} (${
              data.find((p) => p.category === d.category).seats
            } seats)`
          );
      })
      .on("mouseout", function (event, d) {
        d3.selectAll(".party-group")
          .filter((p) => p[0] === d.category)
          .selectAll("circle")
          .transition()
          .duration(100)
          .attr("r", SEAT_RADIUS)
          .attr("fill", d.color);

        g.select(".tooltip-text").remove();
      });

    // --- Title ---
    svg
      .append("text")
      .attr("x", centerX)
      .attr("y", margin)
      .attr("text-anchor", "middle")
      .style("font-size", "1.2em")
      .style("font-weight", "bold")
      .text("2024 GE Seat Share (Parliament Sectors)");
  }, [data, totalSeats]);

  return <svg ref={svgRef}></svg>;
};

export default ParliamentChart;
