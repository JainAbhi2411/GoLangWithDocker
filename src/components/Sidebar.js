import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Home, Storage, Layers, Terminal, Settings } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export const Sidebar = () => {
  return (
    <div style={{ width: '240px', backgroundColor: '#1E1E1E', height: '100vh', color: '#FFFFFF' }}>
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <Home style={{ color: '#FFFFFF' }} />
          </ListItemIcon>
          <ListItemText primary="Containers" />
        </ListItem>
        <ListItem button component={Link} to="/images">
          <ListItemIcon>
            <Storage style={{ color: '#FFFFFF' }} />
          </ListItemIcon>
          <ListItemText primary="Images" />
        </ListItem>
        <ListItem button component={Link} to="/volumes">
          <ListItemIcon>
            <Layers style={{ color: '#FFFFFF' }} />
          </ListItemIcon>
          <ListItemText primary="Volumes" />
        </ListItem>
        <ListItem button component={Link} to="/terminal">
          <ListItemIcon>
            <Terminal style={{ color: '#FFFFFF' }} />
          </ListItemIcon>
          <ListItemText primary="Terminal" />
        </ListItem>
        <ListItem button component={Link} to="/settings">
          <ListItemIcon>
            <Settings style={{ color: '#FFFFFF' }} />
          </ListItemIcon>
          <ListItemText primary="Settings" />
          
        </ListItem>
        <ListItem button component={Link} to="/kubernetes">
          <ListItemIcon>
            <Settings style={{ color: '#FFFFFF' }} />
          </ListItemIcon>
          <ListItemText primary="kubernetes" />
          
        </ListItem>
      </List>
    </div>
  );
};
