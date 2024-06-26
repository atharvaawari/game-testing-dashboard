import React, { useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl } from '@mui/material';
import * as XLSX from 'xlsx';
import { GameContext } from "../Context/gameContext";
import { testingContext } from "../Context/testingContext";
import { Toaster , toast } from 'react-hot-toast';

const AddSheetDialog = ({ open, onClose}) => {
  const { state, dispatch } = useContext(GameContext);
  const { testingState, testingDispatch } = useContext(testingContext);
  const [excelData, setExcelData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(worksheet);

      const newEntries = findNewEntries(jsonData);
      const columns = extractColumns(newEntries);
      dispatch({ type: 'SET_FILES_COLS_DATA', payload: columns });
    };

    reader.readAsArrayBuffer(file);
  };

  const handleAdd = () => {
    setExcelData([]);
    addSheetDB();
    onClose();
  };

  const findNewEntries = (jsonData) => {
    const existingIds = new Set(excelData.map(item => item.id));
    return jsonData.filter(item => !existingIds.has(item.id));
  };

  const extractColumns = (data) => {
    if (data.length === 0) return {};

    const columnData = {};
    const keys = Object.keys(data[0]);

    keys.forEach((key) => {
      columnData[key] = data.map(row => row[key]);
    });

    return columnData;
  };

  const addSheetDB = async () => {

    const firstColName = Object.keys(state.filesColsData)[0];
    const firstColData = state.filesColsData[firstColName];
    
    const formattedTasks = firstColData.map((task, index) => ({
      id: index + 1,
      Point: task,
      status: "false",
      "Note / Suggestion": ""
    }));
    
    try {
      const response = await fetch('https://mindyourlogic.team/add-testing-file-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filesColsData:formattedTasks,
          selectedVersion:state.selectedVersion,
          selectedGame:state.selectedGame,
          totalTesters:state.allTesters
        })
      });

      const resData = await response.json();
      const id = resData.insertId
      const tempObj = { id: id, game_id: state.selectedGame, version_id:state.selectedVersion, data:formattedTasks}
      const tempTestingData = [];
        const data1 = [];
        data1.push(tempObj)

        for (const item of state.allTesters) {
          tempTestingData.push({
            id: item.id,
            game_id: state.selectedGame, 
            version_id:state.selectedVersion, 
            tester_id:item.id,
            data:formattedTasks
          })
        }

        testingDispatch({
          type: "FETCH_CURR_VERSION_TestingData",
          payload:tempTestingData
        });

        testingDispatch({
          type: "CURR_TESTER_DATA",
          payload:data1[0].data
        });

        toast('Testing File Added', {
          position: "top-right"
        });

    } catch (error) {
      console.error('Error submitting form:', error);
    };
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Testing Sheet</DialogTitle>
      <DialogContent>
        <FormControl fullWidth style={{ marginTop: '20px' }}>
          <input
            type="file"
            id="excel-file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button variant="contained" component="label" htmlFor="excel-file">
            Choose File
          </Button>
        </FormControl>
        {excelData.length > 0 && (
          <pre>{JSON.stringify(excelData, null, 2)}</pre>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAdd} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSheetDialog;
