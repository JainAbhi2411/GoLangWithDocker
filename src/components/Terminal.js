import React, { useState } from 'react';
import { Paper, Typography, TextField, Button} from '@mui/material';

export const Terminal = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleCommandChange = (event) => {
    setCommand(event.target.value);
  };

  const handleExecute = async () => {
    if (!command) {
      alert("Please enter a command.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.text();
      console.log(result);
      setOutput(result);
      setError('');
    } catch (error) {
      setError('Error executing command: ' + error.message);
      setOutput('');
    }
  };

  return (
    <Paper style={{ padding: '20px', backgroundColor: '#2D2D2D', color: '#FFFFFF' }}>
      <Typography variant="h6">Terminal</Typography>
      <TextField
        fullWidth
        variant="outlined"
        style={{ marginTop: '20px', marginBottom: '10px', backgroundColor: '#3C3C3C', color: '#FFFFFF' }}
        InputProps={{ style: { color: '#FFFFFF' } }}
        placeholder="Enter Docker command..."
        value={command}
        onChange={handleCommandChange}
      />
      <Button variant="contained" color="primary" onClick={handleExecute}>Execute</Button>
      {output && (
        <Typography variant="body1" style={{ marginTop: '20px' }}>
          <pre>{output}</pre>
        </Typography>
      )}
      {error && (
        <Typography variant="body1" color="error" style={{ marginTop: '20px' }}>
          <pre>{error}</pre>
        </Typography>
      )}
    </Paper>
  );
};
