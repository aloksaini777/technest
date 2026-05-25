import baseApi from "./baseApi";


export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyOrders: builder.query({
            query: () => ({
                url: `/orders`,
            }),
            providesTags: ['orders'],
        }),
        seedOrders: builder.mutation({
            query: (body) => ({
                url: '/orders/seed',
                method: 'POST',
                body: {},
                headers: { Authorization: `Bearer ${body.token}` },
            }),
            invalidatesTags: ['orders']
        }),
        getAnOrder: builder.query({
            query: ({orderId}) => ({
                url: `/orders/${orderId}`,
            })
        }),
    }),
});

export const {
    useGetMyOrdersQuery,
    useLazyGetAnOrderQuery,
    useSeedOrdersMutation,
    useGetAnOrderQuery,
} = authApi;
