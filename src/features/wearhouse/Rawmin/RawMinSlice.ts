import { createSlice } from "@reduxjs/toolkit";
import { RawminState } from "./RawMinType";

const initialState: RawminState = {
  documnetFileData: null,
  createminLoading: false,
  formdata: null,
};

const rawMinSlice = createSlice({
  name: "rawmin",
  initialState,
  reducers: {
    resetDocumentFile: (state) => {
      state.documnetFileData = null;
    },
    resetFormData: (state) => {
      state.formdata = null;
    },
  },
});

export const { resetDocumentFile, resetFormData } = rawMinSlice.actions;
export default rawMinSlice.reducer;
