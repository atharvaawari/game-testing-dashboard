import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions } from '@mui/material';
import toast from 'react-hot-toast';

function TaskBoxPopUp({ open, handleClose, handleAddFile }) {
  const [formData, setFormData] = useState({
    Tasksheettitle: '',
    Link: '',
    category: 'game', 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Prepare data in the form of an array
    const dataArray = [
      { Tasksheettitle: formData.Tasksheettitle },
      { Link: formData.Link },
      { category: "game" }
    ];

    try {
      const response = await fetch('http://localhost:3001/add-task-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataArray)
      });

      const resData = await response.json();
      const id = resData.insertId;

      toast('Task Added', {
        position: "top-right"
      });

      handleAddFile(id); 
      handleClose();

      console.log("Successfully submited Data")
    } catch (error) {
      console.error('Error submitting form:', error);
    } 
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle style={{ textAlign: 'center' }}>Add File</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="File Name"
          type="text"
          fullWidth
          name="Tasksheettitle"
          value={formData.Tasksheettitle}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="File Link"
          type="text"
          fullWidth
          name="Link"
          value={formData.Link}
          onChange={handleChange}
        />
        
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center' }}>
        <Button onClick={handleClose} color="primary" style={{ border: "1px solid" }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" style={{ border: "1px solid" }}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskBoxPopUp;
