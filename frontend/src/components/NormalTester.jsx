import React, { useEffect, useContext, useState } from "react";
import { testingContext } from "../Context/testingContext";
import { GameContext } from "../Context/gameContext";
import {
  Container,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography
} from "@mui/material";

const TestingCompo = ({ release }) => {
  const { state } = useContext(GameContext);
  const {testingState, testingDispatch } = useContext(testingContext);
  const [selectedTesterId, setSelectedTesterId] = useState(null);
  const [currTestStatus, setCurrTestStatus] = useState({done:0,total:0});
  const [fullyVetted, setfullyVetted] = useState({fullyTestedCount:0,total:0});


  
  useEffect(() => {
    const fetchChangesData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/get-testing-data?version=${release.id}`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          testingDispatch({
            type: "FETCH_CURR_VERSION_TestingData",
            payload: data,
          });

          tempfunc(data);
        } else {
          testingDispatch({
            type: "FETCH_CURR_VERSION_TestingData",
            payload: [],
          });
        }
        countFullyTestedPoints(data);

      } catch (error) {
        console.error("Error fetching changes data:", error);
      }
    };

    fetchChangesData();
    
  }, [release.id, testingDispatch]);

  const handleCheckboxChange = (row, checked) => {

    const testerData =testingState.TestingData.find(
      (entry) => entry.tester_id === parseInt(selectedTesterId)
    );

    const tempTesterParseData = typeof testerData.data === "string"
      ? JSON.parse(testerData.data)
      : testerData.data;

    const updatedTestingData = tempTesterParseData.map((item) =>
    row.id === item.id ? { ...item, status: checked ? "true" : "false" } : item
  );

  const updatedTestingDataArray =testingState.TestingData.map((entry) =>
  entry.tester_id === parseInt(selectedTesterId)
    ? { ...entry, data: JSON.stringify(updatedTestingData) }
    : entry
  );

    testingDispatch({
      type: "CURR_TESTER_DATA",
      payload: updatedTestingData,
    });

    testingDispatch({
      type: "FETCH_CURR_VERSION_TestingData",
      payload: updatedTestingDataArray,
    });

    updateTesterData(updatedTestingData);

    const done = countTrueStatus(updatedTestingData);
    setCurrTestStatus({done:done,total:updatedTestingData.length})

    const fullyTestedTaskCount = countFullyTestedPoints(updatedTestingDataArray);
    console.log('Number of tasks fully tested by all testers:', fullyTestedTaskCount);

  };

  const updateTesterData = (updatedTestingData) => {
    fetch("http://localhost:3001/update-testing-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        testerId: selectedTesterId,
        updatedTestingData: updatedTestingData,
        versionId: release.id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update data");
        }
        return response.json();
      })
      .then((data) => {
        testingDispatch({
          type: "FETCH_CURR_VERSION",
          payload: updatedTestingData,
        });
      })
      .catch((error) => {
        console.error("Error updating data:", error);
        testingDispatch({
          type: "UPDATE_DATA_ERROR",
          payload: error.message,
        });
      });
  };

  const countTrueStatus = (data) => {
    return data.filter(item => JSON.parse(item.status)).length;
  };

  const countFullyTestedPoints = (testersData) => {


    if (testersData.length === 0) return { fullyTestedCount: 0, detailedStatus: [] };
  
    // Parse all data fields
    const parsedData = testersData.map(tester => JSON.parse(tester.data));
  
    // Get all unique points
    const allPoints = [...new Set(parsedData.flatMap(testerData => testerData.map(task => task.Point)))];
  
    // Initialize detailed status array
    const detailedStatus = allPoints.map(point => {
      const pointStatus = parsedData.map(testerData => {
        const task = testerData.find(t => t.Point === point);
        return { testerId: testerData.tester_id, point, status: task ? task.status === "true" : false };
      });
      const isFullyTested = pointStatus.every(status => status.status);
      return { point, isFullyTested, pointStatus };
    });
  
    // Count fully tested points
    const fullyTestedCount = detailedStatus.filter(status => status.isFullyTested).length;
  
    setfullyVetted({ fullyTestedCount:fullyTestedCount,total: detailedStatus.length })
    return { fullyTestedCount, detailedStatus };
  };


  const tempfunc = (data) => {
    state.allTesters.map((item)=>{

        if(item.email===state.loginTester.email){
            setSelectedTesterId(item.id)
            const testerData = data.find(
                (entry) => entry.tester_id === parseInt(item.id)
              );

              if (testerData && testerData.data) {
                const parsedData =
                  typeof testerData.data === "string"
                    ? JSON.parse(testerData.data)
                    : testerData.data;
          
                testingDispatch({
                  type: "CURR_TESTER_DATA",
                  payload: parsedData,
                });       
              }
        }
    })
  };

  return (
    <Container>
      <Box sx={{ width: "100%", mx: "auto", mt: 5 }}>
        <Box       style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2196f3',
        padding: '1.5rem 1rem',
        borderRadius: '5px',
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)'
      }}>
        <span
            variant="contained"
            color="primary"
            style={{
              backgroundColor: 'white',
              padding: '3px 6px',
              borderRadius: '4px',
              fontWeight: 600,
              marginRight: '.5rem',
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)'
            }}
            >
User : {state.loginTester.name}
        </span>
        <div>
        <span
            variant="contained"
            color="primary"
            style={{
              backgroundColor: 'white',
              padding: '3px 6px',
              borderRadius: '4px',
              fontWeight: 600,
              marginRight: '.5rem',
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)'
            }}
            >
            Fully vetted : {fullyVetted.fullyTestedCount}/{fullyVetted.total}
        </span>
        <span
            variant="contained"
            color="primary"
            style={{
              backgroundColor: 'white',
              padding: '3px 6px',
              borderRadius: '4px',
              fontWeight: 600,
              marginRight: '.5rem',
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)'
            }}
            >
            Task Status : {currTestStatus.done}/{currTestStatus.total}
        </span>
          </div>
        </Box>
        <Box sx={{ mt: 3 }}>
        {selectedTesterId && testingState.currTesterData.length > 0 ? (
  <Table size="small" style={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
    <TableHead sx={{ backgroundColor: "#ffd966" }}>
      <TableRow>
        <TableCell>POINT</TableCell>
        <TableCell>STATUS</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {testingState.currTesterData.map((row, index) => (
        <TableRow key={row.id + index}>
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
) : (
  <Typography style={{
    textAlign: 'center',
    background: 'aliceblue',
    padding: '1rem',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px',
  }} variant="body1">No data available or no tester setected.</Typography>
)}

        </Box>
      </Box>
    </Container>
  );
};

export default TestingCompo;
