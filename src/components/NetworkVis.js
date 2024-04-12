import React, { useEffect, useRef } from "react";
import * as d3 from 'd3';
import * as PIXI from "pixi.js";
import { Viewport } from 'pixi-viewport';
import * as application from '@pixi/display';
import _ from 'lodash';
import styled from 'styled-components';

const NetworkVisWrapper = styled.div.attrs({
  className: 'network_vis_wrapper'
})`
  border: 1px dashed black;
  width: 500px;
  height: 500px;
`;

const NetworkVis = ({
  networkData, 
  nodeProperty
}) => {
  const ref = useRef(null);
  console.log('networkData: ', networkData);
  useEffect(() => {
    const width = 500;
    const height = 500;

    // Setup PIXI
    const stage = new PIXI.Container();
    const renderer = PIXI.autoDetectRenderer({
      width: width,
      height: height,
      antialias: true,
      autoResize:true,
      resolution: 2, 
      backgroundColor: 0xFFFFFF
    });
    const context = new PIXI.Graphics();
    stage.addChild(context);

    const links = networkData.links.map(d => ({...d}));
    const nodes = networkData.nodes.map(d => ({...d}));

    d3.selectAll('.canvas').remove();

    let canvas = d3.select('.network_vis')
      .append('foreignObject')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'canvas')
      .append("canvas")
      .attr('width', width)
      .attr('height', height);
      
    const r = 2,
      color = d3.scaleOrdinal(['blue', 'red']),
      distanceNodeScale = d3.scaleLinear().domain(d3.extent(nodes.map(d => d.degree))).range([r, r+3]),
      distanceLineScale = d3.scaleLinear().domain([0, 1]).range([0.1, 1]);

    const ctx = canvas.node().getContext("2d"),
      simulation = d3.forceSimulation(nodes)
          .force("collide", d3.forceCollide().radius(function(d) { return distanceNodeScale(d.degree)-1; }))
          .force("link", d3.forceLink(links).id(d => d.name).distance(5).strength(d => 1 - d.distance).iterations(30))
          .force("charge", d3.forceManyBody().strength(-40).distanceMax(12))
          .force("center", d3.forceCenter(width / 2, height / 2));

    console.log(_(_.countBy(nodes.map(d => d.state))).toPairs().orderBy(1, 'desc').fromPairs().value())
    const uniqueStates = _.keys(_(_.countBy(nodes.map(d => d.state))).toPairs().orderBy(1, 'desc').fromPairs().value()),
        stateColorScale = d3.scaleOrdinal()
          .domain(uniqueStates)
          .range([...d3.schemeCategory10, ...Array(uniqueStates.length-10).fill('gray')]);

    // const nodePropertyScale = 

    d3.selectAll('circle')

    // Filter out invalid nodes and links
    var validLinks = networkData.links.filter((link) => {
        return link.source && link.target;
    });

    var validNodes = networkData.nodes.filter((node) => {
        return node.name && node.party;
    });

    // Update simulation with valid nodes and links
    simulation
      .nodes(validNodes)
      .on("tick", update)
      .force("link")
          .links(validLinks);

    canvas
      .call(d3.drag()
      .container(canvas.node())
      .subject(dragsubject)
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));


    console.log(d3.schemeCategory10)

    function update() {
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = "#aaa";
        validLinks.forEach(drawLink);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        validNodes.forEach(drawNode);
    }

    function drawNode(d) {
        ctx.beginPath();
        // ctx.fillStyle = color(d.party);
        ctx.fillStyle = stateColorScale(d.state);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 0.75;
        ctx.moveTo(d.x, d.y);
        ctx.arc(d.x, d.y, distanceNodeScale(d.degree), 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    function drawLink(l) {
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        // ctx.lineWidth = distanceLineScale(l.distance);
        // ctx.strokeStyle = 'lightgray';
        // ctx.stroke();
        // .attr("stroke-width", d => Math.sqrt(d.distance));

    }

    function dragsubject(event, d) {
        return simulation.find(event.x, event.y);
    }

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event, d) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
  }, [ref.current]);

  return (<NetworkVisWrapper>
    <div className="network_vis"/>
    
    {/* <svg 
      width={1000}
      height={1000} 
      // preserveAspectRatio="xMinYMin"
      ref={ref} 
    /> */}
  </NetworkVisWrapper>)
}

export default NetworkVis;