import baseApi from "./baseApi";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: ({ message, sessionId, token }) => ({
        url: "/chat",
        method: "POST",
        body: { message, sessionId },
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),

    getChatHistory: builder.query({
      query: (token) => ({
        url: "/chat/history",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
      providesTags: ["Chat"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSendMessageMutation,
  useGetChatHistoryQuery,
} = chatApi;