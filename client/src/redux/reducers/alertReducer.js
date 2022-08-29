import { createSlice } from "@reduxjs/toolkit";
import { v4 } from "uuid";

export const alertSlice = createSlice({
  name: "alert",
  initialState: [],
  reducers: {
    createAlert: (state, action) => {
      state.push(action.payload);
    },
    removeAlert: (state, action) => {
      return state.filter((alert) => alert.id !== action.payload.id);
    }
  }
});

// export actions
export const { createAlert, removeAlert } = alertSlice.actions;

// define and export async action
export const setAlertAsync = (payload) => {
  // generate id
  const id = v4();
  // create an alert and remove it after certain amount of time
  return async (dispatch, getState) => {
    dispatch(createAlert({ ...payload, id }));
    setTimeout(() => {
      dispatch(removeAlert({ id }));
    }, payload.time);
  };
};

export default alertSlice.reducer;
