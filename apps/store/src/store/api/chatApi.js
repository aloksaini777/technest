import baseApi from "./baseApi";


export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        chat: builder.mutation({
            query: (body) => ({
                url: '/chat',
                method: 'POST',
                body,
            })
        }),
        getChatHistory: builder.query({
            query: (body) => ({
                url: '/chat/history',
            }),
        }),
    }),
});

export const {
    useChatMutation,
    useGetChatHistoryQuery,
} = authApi;
