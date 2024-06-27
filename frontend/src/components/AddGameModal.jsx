import React, { useState, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from '@mui/material';
import { toast , Toaster } from 'react-hot-toast';
import { GameContext } from '../Context/gameContext'; // Import your GameContext here
import BASEURL from '../config'

const AddGameModal = ({ open, game, handleClose }) => {
  const { dispatch } = useContext(GameContext); // Get dispatch function from GameContext

  const [formData, setFormData] = useState({
    version_name: '',
    release_date: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
      game: parseInt(game)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASEURL}/loc/add-game-version`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        
        dispatch({ type: 'ADD_VERSION', payload: {...formData,version_date:formData.release_date} }); // Update global state with new version
        
        toast('New Version Added', {
          position: "top-right"
        });

        setFormData({
          version_name: '',
          release_date: ''
        });

        dispatch({ type: 'TOGGLE_MODAL' });
          } else {
            console.error('Failed to submit form');
        }
    } catch (error) {
      console.error('Error submitting form:', error);
    };

  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add a New Game Release</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the details of the new game release.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Game Version"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.version_name}
            onChange={handleChange}
            name="version_name"
            id="version_name"
          />
          <TextField
            margin="dense"
            label="Release Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={formData.release_date}
            onChange={handleChange}
            name="release_date"
            id="release_date"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster 
        position="top-right"
        toastOptions={{
          // Define default options here
          style: {
            background: '#388e3c',
            color: '#fff',
          },
        }}
      />
    </>
  );
};

export default AddGameModal;
