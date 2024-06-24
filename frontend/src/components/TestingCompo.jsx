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

        console.log("data", data)

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


  //   // const handleCheckboxChange = (rowIndex, checked) => {
  //   //   console.log("function called")
  //   //   const updatedData = state.currVersionTestingData.map((row, index) => {
  //   //     if (index === rowIndex) {
  //   //       return { ...row, status: checked ? "true" : "false" };
  //   //     }
  //   //     return row;
  //   //   });
  //   //   console.log("updatedData", updatedData)
  //   //   dispatch({
  //   //     type: "FETCH_CURR_TESTING_DATA",
  //   //     payload: updatedData,
  //   //   });
  //   // };

  console.log(state.currVersionTestingData)

    const handleCheckboxChange = (rowIndex, checked) => {
      const updatedData = getSelectedTesterData().map((item, index) => {
        if (index === rowIndex) {
          return { ...item, status: checked ? "true" : "false" };
        }
        return item;
      });

      const updatedTesterData = state.currVersionTestingData.find(entry => entry.tester_id === parseInt(selectedTesterId));

      if (updatedTesterData) {
        updatedTesterData.data = JSON.stringify(updatedData);
      }
      // setSelectedTesterId(selectedTesterId); // Trigger re-render
      console.log("updatedTesterData.data", updatedTesterData.data)
    };
    

  const handleChange = (event) => {
    setSelectedTesterId(event.target.value);
  };

  const getSelectedTesterData = () => {
    const testerData = state.currVersionTestingData.find(entry => entry.tester_id === parseInt(selectedTesterId));
    return testerData ? JSON.parse(testerData.data) : [];
  };

  const selectedTesterData = getSelectedTesterData();

  return (

    <Container>
      {/* <Table size="small" style={{border: '1px solid rgba(224, 224, 224, 1)'}}>
        <TableHead sx={{ backgroundColor: "#ffd966" }}>
          <TableRow>
            {console.log("currVersionTestingData",state.currVersionTestingData)}
            {Object.keys(state.currVersionTestingData[0] || {})
              .filter((key) => !keysToSkip.includes(key))
              .map((key) => (
                <TableCell key={key}>{key.toUpperCase()}</TableCell>
              ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {state.currVersionTestingData.map((row, rowIndex) => (
            <TableRow key={row.id}>
              {Object.entries(row)
                .filter(([key]) => !keysToSkip.includes(key))
                .map(([key, value]) => (
                  <TableCell key={key}>
                    {key === "status" ? (
                      <Checkbox
                        checked={value === "true"}
                        onChange={(e) => handleCheckboxChange(rowIndex, e.target.checked)}
                        color="primary"
                      />
                    ) : (
                      value
                    )}
                  </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table> */}



      {/* <FormControl fullWidth>
          <InputLabel id="tester-select-label">Select Tester</InputLabel>
          <Select
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
        </FormControl> */}


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
          {selectedTesterId && selectedTesterData.length > 0 && (
            <>
              <Table size="small" style={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                <TableHead sx={{ backgroundColor: "#ffd966" }}>
                  <TableRow>
                    <TableCell>POINT</TableCell>
                    <TableCell>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedTesterData.map((row, rowIndex) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.Point}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={row.status === "true"}
                          onChange={(e) => handleCheckboxChange(rowIndex, e.target.checked)}
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