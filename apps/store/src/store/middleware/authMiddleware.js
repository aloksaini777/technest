import { createListenerMiddleware } from '@reduxjs/toolkit';
import { logout } from '../slices/authSlice';
import baseApi from '../api/baseApi';
export const authMiddleware = createListenerMiddleware();


authMiddleware.startListening({
    actionCreator: logout,
    effect: async (action, listenerApi) => {
        const { dispatch } = listenerApi;
        dispatch(baseApi.util.resetApiState());
    },
});
