import React, { useEffect, useContext, useState } from "react";
import { GameContext } from "../Context/gameContext";
import {
  Container,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from "@mui/material";

const TestingCompo = ({ release }) => {
  const { state, dispatch } = useContext(GameContext);
  const [selectedTesterId, setSelectedTesterId] = useState('');

  useEffect(() => {
    const fetchChangesData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/get-testing-data?version=${release.id}`
        );
        const data = await response.json();

        if (data && data.length > 0) {

          dispatch({
            type: "FETCH_CURR_TESTING_DATA",
            payload: data,
          });
        } else {
          dispatch({
            type: "FETCH_CURR_TESTING_DATA",
            payload: [],
          });
        }
      } catch (error) {
        console.error("Error fetching changes data:", error);
      }
    };

    fetchChangesData();
  }, [release.id]);


  const handleCheckboxChange = (row, checked) => {
    const updatedData = state.currTesterData.map((item, index) => {
      if (row.id === item.id) {
        return { ...item, status: checked ? "true" : "false" };
      }
      return item;
    });

    dispatch({
      type: "CURR_TESTER_DATA",
      payload: updatedData
    });

    console.log('selectedTesterId',selectedTesterId)
    console.log('updatedData data',updatedData)
    console.log('currVersionTestingData',state.currVersionTestingData[0].version_id)

  };

  
    
  const handleChange = (event) => {
    setSelectedTesterId(event.target.value);
    getSelectedTesterData();
  };

  const getSelectedTesterData = () => {

    const testerData = state.currVersionTestingData.find(entry => entry.tester_id === parseInt(selectedTesterId));
    
    if(testerData && testerData.data){
      testerData.data = typeof testerData.data == 'string' ? JSON.parse(testerData.data) : testerData.data;

      dispatch({
        type: "CURR_TESTER_DATA",
        payload: testerData.data,
      });
    }
  };


  return (

    <Container>

      <Box sx={{ width: '100%', mx: 'auto', mt: 5 }}>
        <FormControl fullWidth>
          <InputLabel id="tester-select-label">Select Tester</InputLabel>
          <Select
            width='100%'
            labelId="tester-select-label"
            value={selectedTesterId}
            label="Select Tester"
            onChange={handleChange}
          >
            {state.currVersionTestingData.map((entry) => (
              <MenuItem key={entry.tester_id} value={entry.tester_id}>
                Tester {entry.tester_id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ mt: 3 }}>
          {selectedTesterId && state.currTesterData.length > 0 && (
            <>
              <Table size="small" style={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                <TableHead sx={{ backgroundColor: "#ffd966" }}>
                  <TableRow>
                    <TableCell>POINT</TableCell>
                    <TableCell>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.currTesterData.map((row, rowIndex) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.Point}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={row.status === "true"}
                          onChange={(e) => handleCheckboxChange(row, e.target.checked)}
                          color="primary"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </Box>
      </Box>

    </Container>
  );
};

export default TestingCompo;