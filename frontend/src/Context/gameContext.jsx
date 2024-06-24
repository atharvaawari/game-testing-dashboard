import React, { createContext, useReducer, useEffect } from 'react';

// Create the context
export const GameContext = createContext();

// Initial state
const initialState = {
  versions: [],
  currVersion:[],
  currVersionTestingData:[],
  filesColsData: [],
  loading: true,
  error: null,
  selectedGame: 1,
  selectedVersion:0,
  dialogOpen: false,
  modalOpen: false,
  testingDialogOpen: false,
  expandedAccordion: null,
};

// Reducer function to manage state updates
const gameReducer = (state, action) => {

  switch (action.type) {
    case 'FETCH_SUCCESS':
      return { ...state, versions: action.payload, loading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, versions: [], loading: false, error: action.payload };
    case 'SET_SELECTED_GAME':
      return { ...state, selectedGame: action.payload };
    case 'TOGGLE_DIALOG':
      return { ...state, dialogOpen: !state.dialogOpen };
    case 'TESTING_TOGGLE_DIALOG':
        return { ...state, testingDialogOpen: !state.testingDialogOpen };  
    case 'TOGGLE_MODAL':
      return { ...state, modalOpen: !state.modalOpen };
    case 'SET_EXPANDED_ACCORDION':
      return { ...state, expandedAccordion: action.payload };
    case 'ADD_VERSION':
        const newVersions = [action.payload, ...state.versions.slice(0, 4)];
        return { 
            ...state, 
            versions: newVersions 
        };    
    case 'SET_SELECTED_VERSION':
    return { ...state, selectedVersion: action.payload };
    case 'FETCH_CURR_VERSION':
    return { ...state, currVersion: action.payload, loading: false, error: null };
    case 'FETCH_CURR_TESTING_DATA':
      return { ...state, currVersionTestingData: action.payload, loading: false, error: null };
    case 'SET_FILES_COLS_DATA':
          return { ...state, filesColsData: action.payload, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Context provider component
export const GameContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const fetchGameVersions = async (game) => {
    try {
      dispatch({ type: 'LOADING' });
      const response = await fetch(`https://mindyourlogic.team/get-game-version?game=${game}`);
      const data = await response.json();
  
      dispatch({ type: 'FETCH_SUCCESS', payload: data.reverse() });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error });
    }
  };

  useEffect(() => {
    fetchGameVersions(state.selectedGame);
  }, [state.selectedGame,state.currVersion]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};
