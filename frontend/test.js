import React, { useContext } from "react";
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
  Checkbox,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import AddSheetDialog from "./components/AddSheetDialog";
import AddGameModal from "./components/AddGameModal";
import { GameContext } from "./Context/gameContext";
import "./GameReleases.css";

const GameReleases = () => {
  const { state, dispatch } = useContext(GameContext);
  const keysToSkip = ["version_id", "game_id", "Note / Suggestion", "id"];

  const handleAccordionChange = (panel, release) => async (event, isExpanded) => {
    if (isExpanded) {
      dispatch({ type: "SET_SELECTED_VERSION", payload: release.id });
      await getCurrVersionData(release.id);
    }

    dispatch({
      type: "SET_EXPANDED_ACCORDION",
      payload: isExpanded ? panel : null,
    });
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
    console.log("Adding sheet:", sheetName, data);
  };

  const getCurrVersionData = async (selectedVersion) => {
    try {
      const response = await fetch(
        `http://localhost:3001/get-current-version-data?version=${selectedVersion}`
      );
      const data = await response.json();

      if (data.length > 0) {
        dispatch({
          type: "FETCH_CURR_VERSION",
          payload: { versionId: selectedVersion, data: data },
        });
      }
    } catch (error) {
      dispatch({ type: "FETCH_ERROR", payload: error });
    }
  };

  const handleStatusChange = (rowId) => {
    const updatedData = state.currVersion.map((row) =>
      row.id === rowId
        ? { ...row, status: row.status === "true" ? "false" : "true" }
        : row
    );
    dispatch({ type: "FETCH_CURR_VERSION", payload: updatedData });
  };

  return (
    <div style={{ padding: "1rem" }}>
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
              <MenuItem value={1}>Game 1</MenuItem>
              <MenuItem value={2}>Game 2</MenuItem>
              <MenuItem value={3}>Game 3</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}>
            Add Version
          </Button>
        </Box>
        <Typography variant="h6" gutterBottom>
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
                <Typography>{`${release.version_name} - [ Version ${
                  index + 1
                }]`}</Typography>
              </AccordionSummary>
              <Box
                sx={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  color="primary"
                  onClick={handleDialogOpen}>
                  Add Changes Sheet
                </Button>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  color="primary"
                  onClick={handleDialogOpen}>
                  Add Testing Sheet
                </Button>
              </Box>

              <AccordionDetails>
                {state.currVersion[release.id] && (
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
                      }}>
                      Changes List
                    </Typography>
                    <List>
                      {state.currVersion[release.id].map((row, rowIndex) => (
                        <ListItem key={row.id + rowIndex}>
                          <ListItemText
                            primary={Object.entries(row)
                              .filter(([key]) => !keysToSkip.includes(key))
                              .map(([key, value]) =>
                                key === "status" ? (
                                  <Checkbox
                                    checked={value === "true"}
                                    onChange={() => handleStatusChange(row.id)}
                                    color="primary"
                                    key={key}
                                  />
                                ) : (
                                  `${key.replaceAll("_", " ")}: ${value}`
                                )
                              )}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
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
    </div>
  );
};

export default GameReleases;
