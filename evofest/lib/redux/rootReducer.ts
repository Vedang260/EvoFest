// features/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import loadingReducer from './slice/loadingSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  loading: loadingReducer,
  // Add other reducers here when needed
});

export default rootReducer;