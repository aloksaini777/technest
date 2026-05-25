import { useDispatch, useSelector } from 'react-redux';
import { useGetMyOrdersQuery } from '../../store/api/ordersApi';
import { logout } from '../../store/slices/authSlice';
import { LuSparkles, LuPackage, LuShoppingBag } from 'react-icons/lu';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdOutlineSmartphone, MdOutlineLaptop, MdOutlineHeadphones, MdOutlineDevicesOther } from 'react-icons/md';
import { TbLogout2 } from 'react-icons/tb';
import ChatBot from '../../components/ChatBot';


// ── helpers ────────────────────────────────────────────────────────────────────

const STATUS_MAP = {
    delivered:       { label: 'Delivered',        bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    processing:      { label: 'Processing',       bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
    shipped:         { label: 'Shipped',           bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500'  },
    out_for_delivery:{ label: 'Out for Delivery',  bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
    cancelled:       { label: 'Cancelled',         bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-500'     },
};

const GADGET_ICON = {
    smartphone: MdOutlineSmartphone,
    laptop:     MdOutlineLaptop,
    headphones: MdOutlineHeadphones,
};

const formatPrice = (n) =>
    '₹' + Number(n).toLocaleString('en-IN');

const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── sub-components ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}>
            <span className={`size-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
};

const OrderCard = ({ order }) => {
    const GadgetIcon = GADGET_ICON[order.product.gadgetType] ?? MdOutlineDevicesOther;
    const eta = formatDate(order.estimatedDelivery);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(59,110,248,0.12)]">

            {/* Top row */}
            <div className="mb-4 flex items-start justify-between gap-2">
                {/* Icon bubble */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-linear-to-br from-[#3b6ef8]/10 to-[#7c5cfc]/10">
                    <GadgetIcon className="text-lg text-[#3b6ef8]" />
                </div>
                <StatusBadge status={order.status} />
            </div>

            {/* Product info */}
            <h3 className="mb-0.5 text-[15px] font-bold leading-snug text-gray-900">
                {order.product.name}
            </h3>
            <p className="mb-4 text-xs font-medium capitalize text-gray-400">
                {order.product.brand} · {order.product.gadgetType}
            </p>

            {/* Divider */}
            <div className="mt-auto border-t border-dashed border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Order ID</span>
                        <span className="text-xs font-semibold text-gray-600">#{order.orderId}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 block">
                            {isCancelled ? 'Refund' : 'Total'}
                        </span>
                        <span className={`text-base font-extrabold ${isCancelled ? 'text-red-500' : 'text-gray-900'}`}>
                            {formatPrice(order.product.price)}
                        </span>
                    </div>
                </div>

                {/* ETA row */}
                {eta && !isCancelled && (
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2">
                        <LuPackage className="shrink-0 text-xs text-gray-400" />
                        <span className="text-[11px] text-gray-500">
                            {order.status === 'delivered' ? 'Delivered on' : 'Est. delivery'}&nbsp;
                            <span className="font-semibold text-gray-700">{eta}</span>
                        </span>
                    </div>
                )}

                {/* Refund row for cancelled */}
                {isCancelled && order.refundStatus !== 'not_applicable' && (
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2">
                        <span className="text-[11px] text-red-400">
                            Refund&nbsp;
                            <span className="font-semibold capitalize text-red-600">{order.refundStatus}</span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── main screen ────────────────────────────────────────────────────────────────

const OrdersScreen = () => {
    const dispatch  = useDispatch();
    const isLoggedIn = useSelector(state => state.auth.isAuthenticated);

    const { orders, isLoading, isError } = useGetMyOrdersQuery(undefined, {
        skip: !isLoggedIn,
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
        selectFromResult: ({ data, isLoading, isError }) => ({
            orders: Array.isArray(data?.orders) ? data?.orders : [],
            isLoading,
            isError,
        }),
    });

    // ── loading ──
    if (isLoading) return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f5f6fa]">
            <AiOutlineLoading3Quarters className="animate-spin text-3xl text-[#3b6ef8]" />
            <p className="text-sm font-medium text-gray-500">Loading your orders…</p>
        </div>
    );

    // ── error ──
    if (isError) return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#f5f6fa]">
            <span className="text-4xl">😕</span>
            <p className="text-sm font-medium text-red-500">Failed to load orders. Please try again.</p>
        </div>
    );

    return (
        <>
            <div className="relative min-h-screen overflow-x-hidden bg-[#f5f6fa]">

                {/* Blobs */}
                <div className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-[#c7d9ff] opacity-40 blur-[80px]" />
                <div className="pointer-events-none absolute -right-20 top-40 size-72 rounded-full bg-[#e0d4ff] opacity-35 blur-[80px]" />

                <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6">

                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-[12px] bg-linear-to-br from-[#3b6ef8] to-[#7c5cfc]">
                                <LuSparkles className="text-base text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">My Orders</h1>
                                <p className="text-xs text-gray-400">
                                    {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => dispatch(logout())}
                            className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-500 shadow-sm transition-all duration-150 hover:border-red-200 hover:bg-red-50 active:scale-95"
                        >
                            <TbLogout2 size={16} />
                            Logout
                        </button>
                    </div>

                    {/* Empty state */}
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-gray-50">
                                <LuShoppingBag className="text-2xl text-gray-300" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">No orders yet</p>
                                <p className="mt-1 text-xs text-gray-400">Your recent orders will appear here.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {orders.map(order => (
                                <OrderCard key={order._id} order={order} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <ChatBot />
        </>
    );
};

export default OrdersScreen;