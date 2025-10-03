"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const RainbowParliamentChart = ({ data, totalSeats }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 500;
    const height = 300;
    const margin = 20;
    const centerX = width / 2;
    const centerY = height;

    // --- CHART SHAPE CONTROLS ---
    const SEAT_RADIUS = 4;
    const SEAT_SPACING = 2;
    const ROW_HEIGHT = SEAT_RADIUS * 2 + SEAT_SPACING;
    const INNER_RADIUS_COEF = 0.2;
    const MIN_RADIUS = (height - margin) * INNER_RADIUS_COEF + SEAT_RADIUS;
    const MAX_RADIUS = height - margin - SEAT_RADIUS;
    const ARC_TOTAL_ANGLE = Math.PI; // 180 degrees

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // --- Data Preparation and Total Seats ---
    let allSeats = [];

    const dataTotalSeats = d3.sum(data, (d) => d.seats);

    // --- RAINBOW COLOR LOGIC: Use d3.interpolateRainbow ---
    const rainbowScale = d3
      .scaleSequential(d3.interpolateRainbow)
      .domain([0, data.length]);

    data.forEach((party, index) => {
      const color = rainbowScale(index);
      party.color = color;
      for (let i = 0; i < party.seats; i++) {
        // Populate the array with all seats, colored by party
        allSeats.push({
          category: party.category,
          color: color,
          seatIndex: allSeats.length,
        });
      }
    });

    // --- CONCENTRIC ARC LAYOUT ALGORITHM (Semi-Circles) ---

    const maxRows = Math.floor((MAX_RADIUS - MIN_RADIUS) / ROW_HEIGHT) + 1;
    let totalCapacity = 0;
    const seatsPerRow = [];

    // 1. Determine capacity of each row
    for (let r = 0; r < maxRows; r++) {
      const currentRadius = MIN_RADIUS + r * ROW_HEIGHT;
      if (currentRadius > MAX_RADIUS + 0.1) break;

      // Calculate max seats that fit at this specific radius
      const currentArcLength = ARC_TOTAL_ANGLE * currentRadius;
      const seatsThatFit = Math.max(
        1,
        Math.floor(currentArcLength / (SEAT_RADIUS * 2 + SEAT_SPACING))
      );
      seatsPerRow.push(seatsThatFit);
      totalCapacity += seatsThatFit;
    }

    let seatIndex = 0; // Tracks the index within the allSeats array

    // 2. Place seats sequentially in the concentric arcs
    for (let r = 0; r < maxRows && seatIndex < dataTotalSeats; r++) {
      const currentRadius = MIN_RADIUS + r * ROW_HEIGHT;
      const maxSeatsInThisRow = seatsPerRow[r];

      if (currentRadius > MAX_RADIUS + 0.1) break;

      // The angular spacing is determined by dividing the 180-degree arc by the number of seats that fit.
      const angularSpacing = ARC_TOTAL_ANGLE / maxSeatsInThisRow;

      const seatsToPlaceInRow = Math.min(
        maxSeatsInThisRow,
        dataTotalSeats - seatIndex
      );

      for (let c = 0; c < seatsToPlaceInRow; c++) {
        if (seatIndex >= dataTotalSeats) break;

        const seat = allSeats[seatIndex];

        // Calculate the angle for the current seat, distributing them evenly from PI to 0
        // (c + 0.5) centers the seat within its angular slot
        const angle = ARC_TOTAL_ANGLE - (c + 0.5) * angularSpacing;

        // Convert polar (radius, angle) to Cartesian (x, y)
        seat.x = currentRadius * Math.cos(angle);
        seat.y = currentRadius * Math.sin(angle) * -1;

        seatIndex++;
      }
    }

    const positionedSeats = allSeats.filter((d) => d.x !== undefined);

    // --- Drawing Seats (Drawn with Grouping and Hover) ---
    // Group seats by category for hover functionality
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

      .on("mouseover", function (event, d) {
        // Highlight all seats belonging to the same party
        d3.selectAll(".party-group")
          .filter((p) => p[0] === d.category)
          .selectAll("circle")
          .transition()
          .duration(100)
          .attr("r", SEAT_RADIUS * 1.5)
          .attr("fill", d3.color(d.color).darker(0.5));

        // Show Tooltip
        g.append("text")
          .attr("class", "tooltip-text-rainbow")
          .attr("x", d.x)
          .attr("y", d.y - SEAT_RADIUS * 3)
          .attr("text-anchor", "middle")
          .style("fill", "#333")
          .style("font-size", "14px")
          .style("pointer-events", "none")
          .text(
            `${d.category} (${
              data.find((p) => p.category === d.category)?.seats || 0
            } seats)`
          );
      })
      .on("mouseout", function (event, d) {
        // Restore size and color
        d3.selectAll(".party-group")
          .filter((p) => p[0] === d.category)
          .selectAll("circle")
          .transition()
          .duration(100)
          .attr("r", SEAT_RADIUS)
          .attr("fill", d.color);

        g.select(".tooltip-text-rainbow").remove();
      });

    // --- Title ---
    svg
      .append("text")
      .attr("x", centerX)
      .attr("y", margin + 10)
      .attr("text-anchor", "middle")
      .style("font-size", "1.2em")
      .style("font-weight", "bold")
      .text(`Parliament Chart (Arc View - Total Seats: ${dataTotalSeats})`);
  }, [data, totalSeats]);

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RainbowParliamentChart;
