import { createSlice } from "@reduxjs/toolkit";
import { storageManager } from "../../utils/storageManager";


const initialState = {
  user: storageManager.getUser(),
  token: storageManager.getToken(),
  isAuthenticated: Boolean(storageManager.getToken()),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      storageManager.setToken(token)
      storageManager.setUser(user)
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      storageManager.clearAuth()
    },
  },
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
