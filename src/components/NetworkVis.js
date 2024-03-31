import React, { useEffect, useRef } from "react";
import * as d3 from 'd3';
import styled from 'styled-components';

const NetworkVisWrapper = styled.div.attrs({
  className: 'network_vis_wrapper'
})`
  border: 1px dashed black;
  width: 500px;
  height: 500px;
`;

const NetworkVis = ({
  networkData
}) => {
  const ref = useRef(null);
  console.log('networkData: ', networkData);
  useEffect(() => {
    //* your code here *//

    // sample circle
    d3.select(ref.current)
      .append("circle")
      .style("stroke", "gray")
      .style("fill", "black")
      .attr("r", 40)
      .attr("cx", 50)
      .attr("cy", 50);
  }, [ref.current]);

  return (<NetworkVisWrapper>
    <svg 
      width={500}
      height={500} 
      // preserveAspectRatio="xMinYMin"
      ref={ref} 
    />
  </NetworkVisWrapper>)
}

export default NetworkVis;