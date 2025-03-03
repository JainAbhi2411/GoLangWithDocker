import React, { useState , useEffect } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, Button, MenuItem, Typography, Grid, InputAdornment } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';

export const ImageList = () => {
    const [images, setImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [containerName, setContainerName] = useState('');
    const [hostPort, setHostPort] = useState('');
    const [volumes, setVolumes] = useState([{ hostPath: '', containerPath: '' }]);
    const [envVars, setEnvVars] = useState([{ variable: '', value: '' }]);
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const [manualImageName, setManualImageName] = useState('');
    const [manualTagName, setManualTagName] = useState('');
    const [predefinedImages, setPredefinedImages] = useState([
        { name: 'ubuntu', tag: 'latest' },
        { name: 'centos', tag: 'latest' },
        // Add more predefined images as needed
    ]);
    const [selectedPredefinedImage, setSelectedPredefinedImage] = useState('');
    const navigate = useNavigate();
  

  const apiUrl = process.env.REACT_APP_API_URL;
  

  useEffect(() => {
    fetchImages();
    const interval = setInterval(fetchImages, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);   

  const fetchImages = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/images`);
      const data = await response.json();
      //console.log(data);
      if (data.error) {
        console.error("Error:", data.error);
      } else {
        setImages(data.images || []); // Handle cases where data.images might be undefined
      }
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Reset state on close
    setContainerName('');
    setHostPort('');
    setVolumes([{ hostPath: '', containerPath: '' }]);
    setEnvVars([{ variable: '', value: '' }]);
  };
  const handleDownloadDialogClose = () => {
    setDownloadDialogOpen(false);
    setManualImageName('');
    setManualTagName('');
    setSelectedPredefinedImage('');
};

  const handleAddVolume = () => {
    setVolumes([...volumes, { hostPath: '', containerPath: '' }]);
  };

  const handleVolumeChange = (index, field, value) => {
    const newVolumes = [...volumes];
    newVolumes[index][field] = value;
    setVolumes(newVolumes);
  };

  const handleAddEnvVar = () => {
    setEnvVars([...envVars, { variable: '', value: '' }]);
  };

  const handleEnvVarChange = (index, field, value) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };

  const handleRunContainer = async () => {
    const payload = {
      image: selectedImage,
      container_name: containerName || '',
      host_port: hostPort || '',
      volumes: volumes.filter(v => v.hostPath && v.containerPath).map(v => ({
        host_path: v.hostPath,
        container_path: v.containerPath
      })),
      env_vars: envVars.filter(ev => ev.variable && ev.value).map(ev => ({
        key: ev.variable,
        value: ev.value
      }))
    };
  
    try {
      const response = await fetch(`${apiUrl}/api/containerimage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      console.log(data);
      if (data.status === 'success') {
        setSnackbarOpen(true);
        handleDialogClose();
        fetchImages(); // Refresh the image list
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error running container:', error);
    }
  };

  const handleDownloadImage = async () => {
    const payload = {
        image_name: manualImageName || selectedPredefinedImage,
        tag_name: manualTagName || 'latest'
    };

    try {
        const response = await fetch(`${apiUrl}/api/download-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.status === 'success') {
            setSnackbarOpen(true);
            handleDownloadDialogClose();
            fetchImages(); // Refresh the image list
        } else {
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error downloading image:', error);
    }
};


  const handleDeleteImage = async (imageName) => {
    //console.log(imageName);
    try {
      const response = await fetch(`${apiUrl}/api/delete-image?image_name=${encodeURIComponent(imageName)}`, {
        method: 'DELETE',  
      })
      const data = await response.json();
      if (data.error) {
        console.error("Error:", data.error);
      } else {
        fetchImages(); // Refresh the image list after deletion
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  
  const handleRunClick = (image) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };


  const handleRefresh = () => {
    fetchImages();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredImages = images.filter(image => {
    return image.Repository.toLowerCase().includes(searchQuery.toLowerCase());
  }); 

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Typography variant="h6">Images</Typography>
        
        <Button variant="contained" color="primary" onClick={handleRefresh} startIcon={<RefreshIcon />}>
          Refresh
        </Button>
        
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
        <IconButton onClick={() => setDownloadDialogOpen(true)} color="primary" size="small">
            <DownloadIcon />
        </IconButton>
      </div>
      

      <TableContainer component={Paper} style={{ backgroundColor: '#2D2D2D', color: '#FFFFFF' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ color: '#FFFFFF' }}>Name</TableCell>
              <TableCell style={{ color: '#FFFFFF' }}>Tag</TableCell>
              <TableCell style={{ color: '#FFFFFF' }}>Status</TableCell>
              <TableCell style={{ color: '#FFFFFF' }}>Created</TableCell>
              <TableCell style={{ color: '#FFFFFF' }}>Size</TableCell>
              <TableCell style={{ color: '#FFFFFF' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredImages.length > 0 ? (
              filteredImages.map((image, index) => (
                <TableRow key={index}>
                  <TableCell style={{ color: '#FFFFFF' }}>{image.Repository}</TableCell>
                  <TableCell style={{ color: '#FFFFFF' }}>{image.Tag}</TableCell>
                  <TableCell style={{ color: '#FFFFFF' }}>N/A</TableCell>
                  <TableCell style={{ color: '#FFFFFF' }}>{image.CreatedSince}</TableCell>
                  <TableCell style={{ color: '#FFFFFF' }}>{image.VirtualSize}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleRunClick(image.Repository)} color="primary" size="small" style={{ marginRight: '10px' }}>
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteImage(image.Repository)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: 'center', color: '#FFFFFF' }}>
                  No images found.
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
          Image deleted successfully!
        </Alert>
      </Snackbar>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Run a New Container (Optional parameters)</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Container Name"
                fullWidth
                value={containerName}
                onChange={(e) => setContainerName(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Host Port (auto forwarded with :80/tcp)"
                fullWidth
                value={hostPort}
                onChange={(e) => setHostPort(e.target.value)}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">:80/tcp</InputAdornment>,
                }}
              />
            </Grid>
            {volumes.map((volume, index) => (
              <Grid item xs={12} key={index}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={5}>
                    <TextField
                      label="Host Path"
                      fullWidth
                      value={volume.hostPath}
                      onChange={(e) => handleVolumeChange(index, 'hostPath', e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      label="Container Path"
                      fullWidth
                      value={volume.containerPath}
                      onChange={(e) => handleVolumeChange(index, 'containerPath', e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={handleAddVolume} color="primary" size="small">
                      <AddIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            ))}
            {envVars.map((envVar, index) => (
              <Grid item xs={12} key={index}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={5}>
                    <TextField
                      label="Variable"
                      fullWidth
                      value={envVar.variable}
                      onChange={(e) => handleEnvVarChange(index, 'variable', e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      label="Value"
                      fullWidth
                      value={envVar.value}
                      onChange={(e) => handleEnvVarChange(index, 'value', e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={handleAddEnvVar} color="primary" size="small">
                      <AddIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRunContainer} color="primary">
            Run
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={downloadDialogOpen} onClose={handleDownloadDialogClose}>
                <DialogTitle>Download Image</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1">Select a Predefined Image</Typography>
                    {predefinedImages.map((img, index) => (
                        <MenuItem
                            key={index}
                            onClick={() => setSelectedPredefinedImage(img.name)}
                        >
                            {img.name}:{img.tag}
                        </MenuItem>
                    ))}
                    <Typography variant="subtitle1" style={{ marginTop: '16px' }}>Or Enter Image Details</Typography>
                    <TextField
                        label="Image Name"
                        value={manualImageName}
                        onChange={(e) => setManualImageName(e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Tag Name"
                        value={manualTagName}
                        onChange={(e) => setManualTagName(e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDownloadDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDownloadImage} color="primary">
                        Done
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success">
                    Operation completed successfully!
                </Alert>
            </Snackbar>
    </div>
  );
};
