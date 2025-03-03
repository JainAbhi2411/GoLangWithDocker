  import React, { useState, useEffect } from 'react';
  import { useParams } from 'react-router-dom';
  import { Typography, Paper, Tabs, Tab, Button, TextField, List, ListItem, ListItemText, IconButton } from '@mui/material';
  import FolderIcon from '@mui/icons-material/Folder';
  import DeleteIcon from '@mui/icons-material/Delete';
  import PlayArrowIcon from '@mui/icons-material/PlayArrow';
  import StopIcon from '@mui/icons-material/Stop';
  import ReplayIcon from '@mui/icons-material/Replay';
  import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
  import { Grid, Box } from '@mui/material';


  export const ContainerDetails = () => {
    const { name } = useParams();
    const [selectedTab, setSelectedTab] = useState(0);
    const [tabContent, setTabContent] = useState('');
    const [command, setCommand] = useState('');
    const [directory, setDirectory] = useState('/');
    const [fileList, setFileList] = useState([]);

    const apiUrl = process.env.REACT_APP_API_URL;

    const callApi = async (action, containerName = '') => {
      const params = new URLSearchParams({ action });
      if (containerName) params.append("container_name", containerName);

      try {
        const response = await fetch(`${apiUrl}/api/docker?${params.toString()}`, {
          method: 'GET',
        });
        const data = await response.json();
        if (data.error) {
          console.error("Error:", data.error);
        } 
      }catch (error) {
        console.error("API call failed:", error);
      }
    };


    const handleDeleteContainer = (name) => {
      callApi("delete_container", name);
      // Refresh the container list after deletion
    };

    const handleStartContainer = (name) => {
      callApi("start_container", name);
      // Refresh the container list after starting a container
    };

    const handleStopContainer = (name) => {
      callApi("stop_container", name);
      // Refresh the container list after stopping a container
    };

    const handleTabChange = (event, newValue) => {
      setSelectedTab(newValue);
    };
    const handleExecCommand = async () => {
      if (command.trim() === '') {
        setTabContent('Please enter a command to execute.');
        return;
      }

      const encodedCommand = encodeURIComponent(command);
      const data = await fetchApiData('exec', `&command=${encodedCommand}`);
      setTabContent(data.output || 'No output');
    };

    const fetchApiData = async (endpoint, params = '') => {
      try {
        const response = await fetch(`${apiUrl}/api/docker/${endpoint}?container_name=${name}${params}`);
        const data = await response.json();
        if (data.error) {
          setTabContent(`Error: ${data.error}`);
        } else {
          return data;
        }
      } catch (error) {
        setTabContent(`API call failed: ${error}`);
      }
    };

    useEffect(() => {
      const fetchTabContent = async () => {
        let data;
        switch (selectedTab) {
          case 0:
            data = await fetchApiData('logs');
            setTabContent(data.logs || 'No logs available');
            break;
          case 1:
            data = await fetchApiData('inspect');
            setTabContent(JSON.stringify(data.inspect, null, 2));
            break;
          case 2:
            data = await fetchApiData('bindmounts');
            setTabContent(JSON.stringify(data.bind_mounts, null, 2));
            break;
          case 3:
              setTabContent('Enter a command and click Execute to run it inside the container.');
              break;
          case 4:
            data = await fetchApiData('files', `&directory=${encodeURIComponent(directory)}`);
          console.log('Raw data:', data.files); // Log the raw data response

          // Split the data into an array by newlines (or the appropriate delimiter)
          const fileArray = data.files.split('\n').filter(Boolean); // `filter(Boolean)` removes empty strings

          // Transform the plain string data into an array of objects
          const transformedFiles = fileArray.map((fileName) => ({
            name: fileName,
            isDirectory: true // Assuming all items are directories; modify as needed
          }));

          console.log('Transformed files:', transformedFiles); // Log the transformed files array
          setFileList(transformedFiles);
          setTabContent('');
          break;
          case 5:
            data = await fetchApiData('stats');
            setTabContent(JSON.stringify(data.stats, null, 2));
            break;
          default:
            setTabContent('Unknown tab');
        }
      };

      fetchTabContent();
    }, [selectedTab , directory]);

    const handleFileClick = (fileName, isDirectory) => {
      if (isDirectory) {
        setDirectory(`${directory}/${fileName}`);
      } else {
        setTabContent(`Selected file: ${directory}/${fileName}`);
      }
    };
    //console.log(fileList);
    const handleBackClick = () => {
      const parentDir = directory.split('/').slice(0, -1).join('/') || '/';
      setDirectory(parentDir);
    };

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Typography variant="h6">{name}</Typography>
          <div>
            <Button variant="contained" color="primary" startIcon={<PlayArrowIcon />} style={{ marginRight: '10px' }} onClick={() => handleStartContainer(name)}>Start</Button>
            <Button variant="contained" color="secondary" startIcon={<StopIcon />} style={{ marginRight: '10px' }} onClick={() => handleStopContainer(name)}>Stop</Button>
            <Button variant="contained" color="info" startIcon={<ReplayIcon />} style={{ marginRight: '10px' }}>Restart</Button>
            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteContainer(name)}>Delete</Button>
          </div>
        </div>

        <Paper style={{ backgroundColor: '#2D2D2D', color: '#FFFFFF' }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="inherit"
            variant="fullWidth"
            aria-label="container details tabs"
          >
            <Tab label="Logs" />
            <Tab label="Inspect" />
            <Tab label="Bind mounts" />
            <Tab label="Exec" />
            <Tab label="Files" />
            <Tab label="Stats" />
          </Tabs>
        </Paper>

        <div style={{ padding: '20px', backgroundColor: '#2D2D2D', color: '#FFFFFF' }}>
          
          {selectedTab === 0 && (
            <div style={{ maxHeight: '400px', overflowY: 'auto', maxWidth: '100%', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              <Typography>Logs Content for {name}</Typography>
              <pre>{tabContent}</pre>
            </div>
          )}

          {selectedTab === 1 && (
            <div style={{ maxHeight: '400px', overflowY: 'auto', maxWidth: '100%', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              <Typography>Inspect Content for {name}</Typography>
              <Box
                component="pre"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflow: 'auto',
                  backgroundColor: '#333',
                  color: '#fff',
                  padding: '10px',
                  maxHeight: '500px', // Adjust the height as needed
                  borderRadius: '4px',
                }}
              >
                {tabContent}
              </Box>
            </div>
          )}

          {selectedTab === 2 && <Typography>Bind mounts Content for {name}</Typography>}

          {selectedTab === 3 && (
            <div>
              <TextField
                label="Enter Command"
                variant="outlined"
                fullWidth
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
              <Button variant="contained" color="primary" onClick={handleExecCommand}>
                Execute
              </Button>
              <Typography style={{ marginTop: '20px' }}>{tabContent}</Typography>
            </div>
          )}

  {selectedTab === 4 && (
    <div>
      <Button style={{color: '#FFFFFF'}}  onClick={handleBackClick} disabled={directory === '/'}>Back</Button>
      <Grid container spacing={2} style={{ marginTop: '10px' }}>
        {fileList.length > 0 ? (
          fileList.map((file, index) => (
            <Grid item xs={3} sm={2} md={1} key={index}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                onClick={() => handleFileClick(file.name, file.isDirectory)}
                style={{ cursor: 'pointer' }}
              >
                {file.isDirectory ? (
                  <FolderIcon style={{ color: '#FFD700', fontSize: '40px' }} />
                ) : (
                  <InsertDriveFileIcon style={{ color: '#FFFFFF', fontSize: '40px' }} />
                )}
                <Typography
                  style={{
                    textAlign: 'center',
                    marginTop: '5px',
                    fontSize: '12px',
                    color: '#FFFFFF',
                  }}
                >
                  {file.name}
                </Typography>
              </Box>
            </Grid>
          ))
        ) : (
          <Typography>No files or directories available.</Typography>
        )}
      </Grid>
    </div>
  )}


          {selectedTab === 5 && (
            <div>
              <Typography>Stats Content for {name}</Typography>
              <pre>{tabContent}</pre>
            </div>
          )}
        </div>
      </div>
    );
  };
