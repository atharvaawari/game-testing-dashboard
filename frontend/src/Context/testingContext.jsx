import React, { createContext, useReducer } from 'react';

const initialState = {
  currTesterData: [],
  TestingData: [],
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

const testingContext = createContext(initialState);

const testingReducer = (testingState, action) => {
  switch (action.type) {
    case 'FETCH_CURR_TESTING_DATA':
      return { ...testingState, currTesterData: action.payload };
    case 'FETCH_CURR_VERSION_TestingData':
      return { ...testingState, TestingData: action.payload };
    case 'FETCH_CURR_VERSION':
      return { ...testingState, currVersion: action.payload };
    case 'CURR_TESTER_DATA':
      return { ...testingState, currTesterData: action.payload };
    case 'CURR_TESTER_TASK_STATUS':
      return { ...testingState, currTesterData: action.payload };
    
    default:
      return testingState;
  }
};

const TestingContextProvider = ({ children }) => {
  const [testingState, testingDispatch] = useReducer(testingReducer, initialState);

  return (
    <testingContext.Provider value={{ testingState, testingDispatch }}>
      {children}
    </testingContext.Provider>
  );
};

export { testingContext, TestingContextProvider };