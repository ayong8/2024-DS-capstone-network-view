import React, { useEffect, useRef } from "react";
import * as d3 from 'd3';
import _ from 'lodash';
import styled from 'styled-components';

const NetworkVisWrapper = styled.div.attrs({
  className: 'network_vis_wrapper'
})`
  display: flex;
  width: 800px;
  height: 550px;
`;

const width = 650;
const height = 650;

const NetworkVis = ({
  networkData, 
  nodeProperty
}) => {
  const ref = useRef(null);
  console.log('networkData: ', networkData, nodeProperty);

  const links = networkData.links.map(d => ({...d}));
  const nodes = networkData.nodes.map(d => ({...d}));

  const r = 4;
  const uniqueStates = _.keys(_(_.countBy(nodes.map(d => d.state))).toPairs().orderBy(1, 'desc').fromPairs().value()),
        stateColorScale = d3.scaleOrdinal()
          .domain(uniqueStates)
          .range([...d3.schemeCategory10, ...Array(uniqueStates.length-10).fill('lightgray')]);
  const partyColorScale = d3.scaleOrdinal().domain(['republican', 'democratic', 'independent']).range(['blue', 'red', 'green']),
      distanceNodeScale = d3.scaleLinear().domain(d3.extent(nodes.map(d => d.degree))).range([r-2, r+2]),
      distanceLineScale = d3.scaleLinear().domain([0, 1]).range([0.1, 1]);

  useEffect(() => {

    // Create the SVG container.
    const svg = d3.select(ref.current);

    // Filter out invalid nodes and links
    // var validLinks = networkData.links.filter((link) => {
    //     return link.source && link.target;
    // });

    // var validNodes = networkData.nodes.filter((node) => {
    //     return node.name && node.party;
    // });

    const simulation = d3.forceSimulation(nodes)
        // .force("x", d3.forceY(width/2))
        // .force("y", d3.forceY(height/2))
        .force("collide", d3.forceCollide(r).radius(d => distanceNodeScale(d.degree)+0.5 ))
        .force("link", d3.forceLink(links).id(d => d.name).distance(5).strength(d => 1 - d.distance).iterations(100))
        .force("charge", d3.forceManyBody().strength(-20).distanceMax(50))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    // Update simulation with valid nodes and links
    simulation
      .nodes(nodes)
      .on("tick", ticked)
      .force("link")
          .links(links);

    d3.select('.g_network').remove();
    
    const G = svg.append('g').attr('class', 'g_network')
    // Add a line for each link, and a circle for each node.
    // const link = svg.append("g")
    //     .attr("stroke", "#999")
    //     .attr("stroke-opacity", 0.6)
    //   .selectAll()
    //   .data(links)
    //   .join("line")
    //     .attr("stroke-width", d => Math.sqrt(d.distance));

    const node = G
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
      .selectAll()
      .data(nodes)
      .join("circle")
        .attr("r", d => distanceNodeScale(d.degree))
        .attr("fill", d => nodeProperty == 'party' ? partyColorScale(d.party) : stateColorScale(d.state))
        .on("mouseenter", mouseEnter)
        .on("mouseleave", mouseLeave)
        // .on('mouseover', (event, d) => {
        //   // let htmlForFalseInfo = '';
        //   // const numCurrentRect = d.length;
  
        //   // const numFalses = d.length,
        //   //     numAllFalses = Object.values(uuScores).filter(e => e != 0).length;
        //   // const ratioAmongFalses = numFalses / numAllFalses;
  
        //   const htmlForFalseInfo = `
        //     <div>
        //       <span>UU score - </span>
        //       <span style="font-size: 1rem">${'dddd'}</span>
        //     </div>
        //     <div style="display: flex; padding-top: 5px;">
        //       <div>
        //         <div>Ratio among all falses</div>
        //         <div style="font-size: 1.3rem; margin-top: 5px;">
        //         <div style="font-size: 1rem">(instances)</div>
        //       </div>
        //       </div>
        //     </div>`;
          
        //   tooltip
        //     .html(htmlForFalseInfo);
        //   tooltip
        //     .style("left", (event.pageX + 3) + "px")
        //     .style("top", (event.pageY +  5) + "px")
        //   tooltip.show();
        // })
        // .on('mouseout', d => {
        //   tooltip.hide();
        // });
      
      function mouseEnter(event, d) {
        d3.select(this).style("stroke", "black");
        d3.select(this).style('stroke-width', 2);
        var tooltip = document.getElementById("tooltip")
        tooltip.style.top = event.clientY - 100 + "px"
        tooltip.style.left = event.clientX - 95 + "px"
        tooltip.classList.add("active")
      
        document.getElementById("tooltip_name").innerHTML = _.capitalize(d.name)
        document.getElementById("tooltip_party").innerHTML = _.capitalize(d.party)
        document.getElementById("tooltip_state").innerHTML = d.state.toUpperCase()
      }

      function mouseLeave(d) {
          d3.select(this).style("stroke", "none")
          document.getElementById("tooltip").classList.remove("active")
      }

    // node.append("title")
    //     .text(d => d.id);

    // Add a drag behavior.
    node.call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked() {
      // link
      //     .attr("x1", d => d.source.x)
      //     .attr("y1", d => d.source.y)
      //     .attr("x2", d => d.target.x)
      //     .attr("y2", d => d.target.y);

      node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
    }

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, [ref.current, nodeProperty]);

  return (<NetworkVisWrapper>
    {/* <div className="network_vis" style={{ border: '1px dashed black' }} /> */}
    <svg 
      className="network_vis" 
      style={{ border: '1px dashed black' }}
      width={width}
      height={height} 
      // preserveAspectRatio="xMinYMin"
      ref={ref} 
    />
    <div style={{ marginLeft: 10 }}>
      <div>Top 10 states</div>
      {uniqueStates.slice(0, 10).map((d, i) => (
        <div style={{display: 'flex'}}>
          <div>{d.toUpperCase()}</div>&nbsp;
          <div width={10} style={{backgroundColor: d3.schemeCategory10[i]}}>&nbsp;&nbsp;</div>
        </div>))}
    </div>
    <div id="tooltip">
        <div class="item">
            <i class="fas fa-address-card"></i>Name: <label id="tooltip_name" class="item"></label><br />
            <i class="fas fa-address-card"></i>Party: <label id="tooltip_party" class="item"></label><br />
            <i class="fas fa-address-card"></i>State: <label id="tooltip_state" class="item"></label><br />
        </div>
        {/* <hr> */}
        {/* <table>
            <tr>
                <td id="tooltip_party" class="item">Party: </td>
                <td id="tooltip_chamber" class="item">Chamber: </td>
            </tr>
        </table> */}
    </div>
  </NetworkVisWrapper>)
}

export default NetworkVis;