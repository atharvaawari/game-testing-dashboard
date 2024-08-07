import React, { useContext } from "react";
import { TestingContextProvider } from './Context/testingContext';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Typography,
  Button,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import AddSheetDialog from "./components/AddSheetDialog";
import AddTestingSheet from "./components/AddTestingSheet";
import AddGameModal from "./components/AddGameModal";
import { GameContext } from "./Context/gameContext";
import ChangesCompo from "./components/ChangesCompo";
import TestingCompo from "./components/TestingCompo";
import NormalTester from "./components/NormalTester";
import "./GameReleases.css";
import { Toaster } from 'react-hot-toast';
import TaskBox from "./components/TasksBox/TaskBox";
import BASEURL from "./config";

const GameReleases = () => {
  const { state, dispatch } = useContext(GameContext);

  const handleAccordionChange = (panel, release) => (event, isExpanded) => {
    if (isExpanded) {
      dispatch({ type: "SET_SELECTED_VERSION", payload: release.id });
      getCurrVersionData(release.id);
    }

    dispatch({
      type: "SET_EXPANDED_ACCORDION",
      payload: isExpanded ? panel : null,
    });
  };

  const toggleDialog = () => {
    dispatch({ type: "TESTING_TOGGLE_DIALOG" });
  };

  const handleDialogOpen = () => {
    dispatch({ type: "TOGGLE_DIALOG" });
  };

  const handleDialogClose = () => {
    dispatch({ type: "TOGGLE_DIALOG" });
  };

  const handleOpenModal = () => {
    dispatch({ type: "TOGGLE_MODAL" });
  };

  const handleCloseModal = () => {
    dispatch({ type: "TOGGLE_MODAL" });
  };

  const handleSheetChange = (event) => {
    dispatch({ type: "SET_SELECTED_GAME", payload: event.target.value });
  };

  const handleAddSheet = (sheetName, data) => {
    dispatch({
      type: "FETCH_CURR_VERSION",
      payload: { versionId: sheetName, data: data },
    });
  };

  const getCurrVersionData = async (selectedVersion) => {
    try {
      const response = await fetch(
        `${BASEURL}/get-current-version-data?version=${selectedVersion}`
      );
      const data = await response.json();
      if (data.length > 0) {
        data[0].data = JSON.parse(data[0].data);
        dispatch({
          type: "FETCH_CURR_VERSION",
          payload: { versionId: selectedVersion, data: data },
        });
        
      }
    } catch (error) {
      dispatch({ type: "FETCH_ERROR", payload: error });
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <TaskBox/>
      <Container
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}>
        <Box
          className="dash-head"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}>
          <FormControl variant="outlined">
            <InputLabel id="game-select-label">Game</InputLabel>
            <Select
              labelId="game-select-label"
              id="game-select"
              value={state.selectedGame}
              onChange={handleSheetChange}
              label="Game">
              <MenuItem value={1}>Detective IQ</MenuItem>
              <MenuItem value={2}>Pug G</MenuItem>
              <MenuItem value={3}>GTA 5</MenuItem>
            </Select>
          </FormControl>
          {state.privilege&&(
          <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}>
          Add Version
        </Button>
          )}

        </Box>
        <Typography variant="h6" style={{ fontWeight: "700",margin:"1rem  0" }} gutterBottom>
          Last 5 Releases
        </Typography>
        {state.loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          state.versions.map((release, index) => (
            <Accordion
              key={index}
              expanded={state.expandedAccordion === index}
              onChange={handleAccordionChange(index, release)}
              style={{ marginBottom: "10px" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography style={{ fontWeight: "700" }}>
                  {`[ Version ${state.versions.length - index} ]`}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  style={{
                    margin: "0 10px",
                    float: "right",
                    marginLeft: "auto",
                  }}>
                  {` Release Date : ${release.version_date} 	`}
                </Button>
              </AccordionSummary>

              <AccordionDetails style={{borderTop: '1px solid rgb(204, 204, 204)',paddingTop: '1rem'}}>
              {state.privilege&&(
              <Box
                sx={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                {/* <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  color="primary"
                  onClick={handleDialogOpen}>
                  Add Changes Sheet
                </Button> */}
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  color="primary"
                  onClick={toggleDialog}>
                  Add file
                </Button>
              </Box>    
              )}            
              {state.expandedAccordion === index && (
                  <Container>
                    <Box>
                      <Typography
                        variant="h5"
                        component="div"
                        gutterBottom
                        sx={{
                          padding: "1rem",
                          borderRadius: 0,
                          width: "100%",
                          textAlign: "center",
                          fontWeight:"700"
                        }}>
                        Changes Status
                      </Typography>
                      <ChangesCompo release={release} />
                    </Box>
                    
                    <Box>
                    <Typography
                      variant="h5"
                      component="div"
                      gutterBottom
                      sx={{
                        padding: "1rem",
                        borderRadius: 0,
                        width: "100%",
                        textAlign: "center",
                        fontWeight:"700"
                      }}>
                      Testing Status
                    </Typography>
                    {state.privilege ? (
                    <TestingContextProvider>
                    <TestingCompo release={release} />
                    <AddTestingSheet
                    open={state.testingDialogOpen}
                    onClose={toggleDialog}
                    />
                    </TestingContextProvider>
                    ):(
                     
                      <TestingContextProvider>
                      <NormalTester release={release} />
                      <AddTestingSheet
                      open={state.testingDialogOpen}
                      onClose={toggleDialog}
                      />
                      </TestingContextProvider>
                    )}
                  </Box>


                  </Container>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Container>

      <AddSheetDialog
        open={state.dialogOpen}
        onClose={handleDialogClose}
        onAdd={handleAddSheet}
      />

      <AddGameModal
        open={state.modalOpen}
        game={state.selectedGame}
        handleClose={handleCloseModal}
      />
      <Toaster 
        position="top-right"
        toastOptions={{
          // Define default options here
          style: {
            background: '#fff',
            color: 'black',
          },
        }}
      />
    </div>
  );
};

export default GameReleases;
