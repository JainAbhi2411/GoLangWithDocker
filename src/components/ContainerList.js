import React, { useState, useEffect } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, Switch, TextField, IconButton, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

export const ContainerList = () => {
  const [dockerServerRunning, setDockerServerRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRunningOnly, setShowRunningOnly] = useState(false);
  const [containers, setContainers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  
  // Updated API URL to match the Go backend server
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchContainers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/containers`);
      const data = await response.json();
      if (response.ok) {
        setContainers(data || []);
      } else {
        console.error("Error:", data.error || "Failed to fetch containers");
      }
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  const callApi = async (endpoint, method = "POST", body = {}) => {
    console.log(endpoint, method, body);
    try {
      const response = await fetch(`${apiUrl}/api/${endpoint}`, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify(body) : null,
      });
      const data = await response.json();
      console.log(data);  
      if (response.ok) {
        if (endpoint === "start-docker") 
        setSnackbarOpen(true);
        fetchContainers(); // Refresh container list after action
      } else {
        console.error("Error:", data.error || "API request failed");
      }
    } catch (error) {
      console.error("API call failed:", error);
    }
  };
  const handleDeleteContainer = (containerName) => {
    callApi("delete-container", "POST", { name: containerName });
  };

  const handleStartContainer = (containerName) => {
    callApi("start-container", "POST", { name: containerName });
  };

  const handleStopContainer = (containerName) => {
    callApi("stop-container", "POST", { name: containerName });
  };
  const handleDockerServerToggle = (event) => {
    if (event.target.checked) {
      callApi("start-docker");
      setDockerServerRunning(true);
    } else {
      callApi("stop-docker");
      setDockerServerRunning(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleContainerClick = (containerName) => {
    navigate(`/container/${containerName}`);
  };

  const filteredContainers = containers.filter(container => {
    if (!container.Names || !container.State) return false;
    const matchesSearch = container.Names.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = showRunningOnly ? container.State === 'running' : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Typography variant="h6">Containers</Typography>
        <div>
          <Typography variant="body2" component="span" style={{ marginRight: '10px' }}>
            Docker Server {dockerServerRunning ? "Running" : "Stopped"}
          </Typography>
          <Switch
            checked={dockerServerRunning}
            onChange={handleDockerServerToggle}
            color="primary"
            inputProps={{ 'aria-label': 'docker server toggle' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          style={{ marginRight: '20px' }}
        />
        <div>
          <Switch
            checked={showRunningOnly}
            onChange={(event) => setShowRunningOnly(event.target.checked)}
            color="primary"
            inputProps={{ 'aria-label': 'show running only toggle' }}
          />
          <Typography variant="body2" component="span">
            Only show running containers
          </Typography>
        </div>
      </div>

      <TableContainer component={Paper} style={{ backgroundColor: '#2D2D2D', color: '#FFFFFF' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ color: '#FFFFFF' }}>Name</TableCell>
              <TableCell style={{ color: '#FFFFFF' }}>Image</TableCell>
              <TableCell style={{ color: '#FFFFFF' }}>Status</TableCell>
              <TableCell style={{ color: '#FFFFFF' }}>Ports</TableCell>
              <TableCell style={{ color: '#FFFFFF' }}>CPU (%)</TableCell>
              <TableCell style={{ color: '#FFFFFF' }}>Last Started</TableCell>
              <TableCell style={{ color: '#FFFFFF' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContainers.length > 0 ? (
              filteredContainers.map((container, index) => (
                <TableRow key={index}>
                  <TableCell onClick={() => handleContainerClick(container.Names)} style={{ color: '#FFFFFF' , cursor: 'pointer'}}>{container.Names}</TableCell>
                  <TableCell style={{ color: '#FFFFFF' }}>{container.Image}</TableCell>
                  <TableCell style={{ color: '#FFFFFF' }}>{container.State}</TableCell>
                  <TableCell style={{ color: '#FFFFFF' }}>{container.Ports}</TableCell>
                  <TableCell style={{ color: '#FFFFFF' }}>{container.CPU || 'N/A'}</TableCell>
                  <TableCell style={{ color: '#FFFFFF' }}>{container.Status || 'N/A'}</TableCell>
                  <TableCell>
                    <Button variant="contained" size="small" color="primary" style={{ marginRight: '10px' }} onClick={() => handleStartContainer(container.Names)}>Start</Button>
                    <Button variant="contained" size="small" color="secondary" style={{ marginRight: '10px' }} onClick={() => handleStopContainer(container.Names)}>Stop</Button>
                    <IconButton onClick={() => handleDeleteContainer(container.Names)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} style={{ textAlign: 'center', color: '#FFFFFF' }}>
                  No containers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Docker started successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};
