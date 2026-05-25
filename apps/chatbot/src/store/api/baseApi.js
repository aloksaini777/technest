import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const baseApi = createApi({
    reducerPath: "remoteChatApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        timeout: 10000,
        prepareHeaders: (headers, { endpoint, type, arg }) => {
            const isFormData = arg?.body instanceof FormData;
            if (!isFormData) {
                headers.set("Content-Type", "application/json");
            }
            return headers;
        },
    }),
    tagTypes: ["Chat"],
    endpoints: () => ({}),
});

export default baseApi;
