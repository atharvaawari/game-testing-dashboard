import React, { useEffect, useContext } from "react";
import { GameContext } from "../Context/gameContext";
import {
  Container,
  Checkbox,
  ListItem,
  ListItemText,
  List
} from "@mui/material";

const ChangesCompo = ({ release }) => {
  const { state, dispatch } = useContext(GameContext);
  const keysToSkip = ["version_id", "game_id", "Note / Suggestion", "id"];

  useEffect(() => {
    const fetchChangesData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/get-changes-data?version=${release.id}`
        );
        const data = await response.json();
        console.log(data)

        if (data && data.length > 0) {

          // Handle data as needed
          dispatch({
            type: "FETCH_CURR_VERSION",
            payload: JSON.parse(data[0].data),
          });
        } else {
          dispatch({
            type: "FETCH_CURR_VERSION",
            payload: [],
          });
        }

      } catch (error) {
        console.error("Error fetching changes data:", error);
      }
    };

    fetchChangesData();
  }, [release.id]);


  const handleCheckboxChange = (rowIndex, checked) => {
    console.log("currVersion", state.currVersion)
    const updatedChangesData = state.currVersion.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, status: checked ? "true" : "false" };
      }
      return row;
    });

    dispatch({
      type: "FETCH_CURR_VERSION",
      payload: updatedChangesData,
    });
    console.log("Updated Data:", updatedChangesData);

    fetch('http://localhost:3001/update-changes-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedVersion: release.id,
        updatedChangesData: updatedChangesData,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update data');
        }
        return response.json();
      })
      .then(data => {
        console.log('Data updated successfully:', data);
        // Dispatch action to handle updated data
        dispatch({
          type: "FETCH_CURR_VERSION",
          payload: updatedChangesData,
        });
      })
      .catch(error => {
        console.error('Error updating data:', error);
        // Dispatch action to handle error
        dispatch({
          type: "UPDATE_DATA_ERROR",
          payload: error.message,
        });
      });
  };


  return (
    <>
      <Container>
        <List>
          {state.currVersion.map((row, rowIndex) => (
            <ListItem key={row.id} // Ensure the key is unique
              sx={{
                padding: "0",
                borderRadius: 0,
              }}>
              <ListItemText
                primary={Object.entries(row)
                  .filter(([key]) => !keysToSkip.includes(key))
                  .map(([key, value]) =>
                    key === "status" ? (
                      <Checkbox
                        checked={value === "true"}
                        onChange={(e) => handleCheckboxChange(rowIndex, e.target.checked)}
                        color="primary"
                        key={key}
                      />
                    ) : (
                      <span key={key}>{`${rowIndex + 1}. ${value}`}</span>
                    )
                  )}
              />
            </ListItem>
          ))}
        </List>
      </Container>
    </>
  );
};

export default ChangesCompo;
