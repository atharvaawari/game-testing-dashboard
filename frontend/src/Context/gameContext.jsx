import React, { createContext, useReducer, useEffect } from 'react';

// Create the context
export const GameContext = createContext();

// Initial state
const initialState = {
  versions: [],
  currVersion:[],
  currVersionTestingData:[],
  filesColsData: [],
  loginTester:'',
  loading: true,
  error: null,
  selectedGame: 1,
  selectedVersion:0,
  dialogOpen: false,
  modalOpen: false,
  testingDialogOpen: false,
  expandedAccordion: null,
  currTesterData:[],
  allTesters:[
  {
    name:'Rupesh ',
    id:1,
    email:'rupesh.sappata@mindyourlogic.in'
  },
  {
    name:'Kanchan Mam',
    id:2,
    email:'kanchan.balani@mindyourlogic.in'
  },
  {
    name:'Shubhadeep Sir',
    id:3,
    email:'subhadip.singha@mindyourlogic.in'
  },
  {
    name:'Vivek',
    id:4,
    email:'vivek.prajapati@mindyourlogic.in'
  },
]
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
    case 'CURR_TESTER_DATA':
      return { ...state, currTesterData: action.payload };    
    case 'PRIVILAGE':
      return { ...state, privilege: action.payload };  
    case 'LOGIN_TESTER':
      return { ...state,loginTester: action.payload };                 
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
      const response = await fetch(`http://localhost:3001/get-game-version?game=${game}`);
      const data = await response.json();
  
      dispatch({ type: 'FETCH_SUCCESS', payload: data.data });
      dispatch({ type: 'PRIVILAGE', payload: JSON.parse(data.user_data.p1).GameAdmin });
      dispatch({ type: "LOGIN_TESTER",payload:data.user_data });
  
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error });
    }
  };

  useEffect(() => {
    fetchGameVersions(state.selectedGame);
  }, [state.selectedGame,state.currVersion,state.currTesterData]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};
