import { configureStore } from "@reduxjs/toolkit";
import alertReducer from "./reducers/alertReducer";

export default configureStore({
  reducer: {
    alert: alertReducer
  }
});
