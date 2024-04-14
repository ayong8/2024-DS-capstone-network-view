import React, { useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import './App.css';
import NetworkVis from './components/NetworkVis';

import networkData from './static/legislators_network_updated.json';

function App() {
  const [ nodeProperty, setNodeProperty ] = useState('party');
  return (
    <div className="App">
      <header className="App-header">
        <h2>Network View</h2>
      </header>
      {/* Dropdown menu */} 
      <div style={{ display: 'flex' }}>
        <FormControl sx={{ m: 1, minWidth: 120, marginLeft: 'auto' }} size="small">
          <InputLabel 
            id="demo-select-small-label" 
            sx={{
              '&.MuiInputLabel-shrink':{
              }
            }}
          >Properties</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            // defaultValue={'gender'}
            value={nodeProperty}
            label="Property"
            onChange={(e) => {
              console.log('e.target.value: ', e.target.value)
              // if (e.target.value != group) {
                setNodeProperty(e.target.value);
              // }
            }}
            // input={<StyledInput 
            //   label="Platform"
            // />}
            sx={{
              height: '2.5rem',
              color: 'black',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'gray'
              },
              '& .MuiSvgIcon-root': {
                  color: 'gray'
              },
            }}
          >
            <MenuItem value='party'>Party</MenuItem>
            <MenuItem value='state'>State</MenuItem>
          </Select>
        </FormControl>
      </div>
      <NetworkVis 
        networkData={networkData} 
        nodeProperty={nodeProperty}
      />
    </div>
  );
}

export default App;
