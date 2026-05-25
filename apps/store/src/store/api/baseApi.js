import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";
import { storageManager } from "../../utils/storageManager";
const BASE_URL = import.meta.env.VITE_BASE_URL;


const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    timeout: 10000,
    prepareHeaders: (headers, { getState, endpoint, type, arg }) => {
        const token = getState().auth.token || storageManager.getToken();

        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }

        const isFormData = arg && arg.body instanceof FormData;
        if (!isFormData) {
            headers.set("content-type", "application/json");
        }

        return headers;
    },
});

// Simple base query without refresh logic
const baseQueryWithAuth = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error && 
        (result.error.status === 401 || result.error.originalStatus === 401 ||
        result.error.status === 403 || result.error.originalStatus === 403)
    ) {
        storageManager.clearAuth();
        api.dispatch(logout());
    }

    return result;
};

// Create the base API slice
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithAuth,
    tagTypes: ['orders'],
    endpoints: () => ({}),
});

export default baseApi;
