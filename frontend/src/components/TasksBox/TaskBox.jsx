import React, { useEffect, useState } from 'react'
import { Accordion, AccordionSummary, AccordionDetails, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, DialogActions } from '@mui/material';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { pink } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TaskBoxPopUp from './TaskBoxPopUp';
import BASEURL from '../../config'

function TaskBox() {

  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);


  useEffect(() => {
    const fetchTskBoxData = async () => {

      try {
        const response = await fetch(
          `${BASEURL}/get-taskdata`
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

  }, [rows])



  const handleDelete = async (id) => {
    // Optimistically update the UI by filtering out the deleted row
    const updatedRows = rows.filter(row => row.id !== id);
    setRows(updatedRows);

    try {
      const res = await fetch(`${BASEURL}/delete-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: id,
          category: 'game',
          targets_category: 'game',
        }),
      });


      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Delete successful:', data);

    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };


  const handleOpen = () => {
    setOpen(true);

  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddFile = (newTask) => {
    setRows([...rows, newTask]);
    console.log(rows)
  };

  return (
    <div>
      <Accordion style={{ maxWidth: '1200px', margin: 'auto' }}>

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
                <TableRow
                  style={{
                    background: "#FFD966",
                    padding: ".5rem .5rem"
                  }}
                >
                  <TableCell
                    style={{
                      lineHeight: ".5rem",
                      textAlign: 'center'
                    }}
                  >
                    Sr No
                  </TableCell>
                  <TableCell
                    style={{
                      lineHeight: ".5rem",
                      textAlign: 'center'
                    }}>
                    Files
                  </TableCell>
                  <TableCell
                    style={{
                      lineHeight: ".5rem",
                      textAlign: 'center'
                    }}
                  >
                    Delete
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => row ? (
                  <TableRow key={row.id}>
                    <TableCell
                      style={{
                        lineHeight: ".5rem",
                        textAlign: 'center',
                        padding: '10px',
                        borderBottom: '0'
                      }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell
                      style={{
                        lineHeight: ".5rem",
                        textAlign: 'center',
                        padding: '10px',
                        borderBottom: '0'
                      }}
                    >
                      <a
                        href={row.link}
                        target='_blank'
                        style={{ textUnderlineOffset: 'none' }}
                      >
                        {row.title}
                      </a>
                    </TableCell>

                    <TableCell
                      style={{
                        lineHeight: ".5rem",
                        textAlign: 'center',
                        padding: '10px',
                        borderBottom: '0'
                      }}
                    >
                      <DeleteTwoToneIcon
                        variant="contained"
                        sx={{ color: pink[500], fontSize: 35 }}
                        onClick={() => handleDelete(row.id)}
                      >
                      </DeleteTwoToneIcon>
                    </TableCell>
                  </TableRow>
                ) : <TableRow key={index}>
                  <TableCell
                    colSpan={3}
                    style={{ textAlign: 'center' }}
                  >
                    No data available
                  </TableCell>
                </TableRow>
                )}
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
