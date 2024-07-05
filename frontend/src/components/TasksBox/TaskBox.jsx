import React, {useEffect, useState} from 'react'
import { Accordion, AccordionSummary, AccordionDetails, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, DialogActions } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TaskBoxPopUp from './TaskBoxPopUp';

function TaskBox() {


  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);


  useEffect( () =>{
    const fetchTskBoxData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/get-taskdata`
        );
        const data = await response.json();


        if (data && data.length > 0) {
          setRows(data)
        } else {
          console.log("error fetching data")
        }
      } catch (error) {
        console.error("Error fetching changes data:", error);
      }
    };
    fetchTskBoxData()
  }, [setRows] )

  

  const handleDelete = (id) => {
    const updatedRows = rows.filter(row => row.id !== id);
    setRows(updatedRows);
  };

  const handleOpen = () => {
    setOpen(true);
    
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddFile = (newTask) => {
    setRows([...rows, newTask]);
  };

  return (
    <div>
      <Accordion style={{ maxWidth: '1200px', margin:'auto'}}>
        
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <h4>Tasks</h4>
        </AccordionSummary  >
        <DialogActions style={{ marginRight: ".5rem", justifyContent: "center" }}>
          <Button 
          style={{ fontSize: "1.2rem", background: "#2196f3", color: "white" }} 
          onClick={handleOpen}>
            Add+
          </Button>
        </DialogActions>
        <AccordionDetails >
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ background: "#FFD966", padding: ".5rem .5rem" }}>
                  <TableCell style={{ lineHeight: ".5rem", textAlign: 'center' }}>Sr No</TableCell>
                  <TableCell style={{ lineHeight: ".5rem", textAlign: 'center' }}>Files</TableCell>
                  <TableCell style={{ lineHeight: ".5rem", textAlign: 'center' }}>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) =>  row ? (
                  <TableRow key={row.id}>
                    <TableCell style={{ lineHeight: ".5rem", textAlign: 'center', padding:'10px', borderBottom:'0' }}>{row.id}</TableCell>
                    <TableCell style={{ lineHeight: ".5rem", textAlign: 'center', padding:'10px', borderBottom:'0' }}>{row.title}</TableCell>
                    <TableCell style={{ lineHeight: ".5rem", textAlign: 'center', padding:'10px', borderBottom:'0'  }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDelete(row.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ):  "error")}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
      <TaskBoxPopUp open={open} handleClose={handleClose} handleAddFile={handleAddFile} />
    </div>
  )
}

export default TaskBox
