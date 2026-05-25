import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBox, faCircleCheck, faTruck, faRotateLeft,
    faBan, faGears, faTag,
} from "@fortawesome/free-solid-svg-icons";

const STATUS_CONFIG = {
    placed:           { label: "Order Placed",      icon: faBox,         color: "#2563eb", bg: "#eff6ff" },
    processing:       { label: "Processing",         icon: faGears,       color: "#d97706", bg: "#fffbeb" },
    shipped:          { label: "Shipped",            icon: faTruck,       color: "#7c3aed", bg: "#f5f3ff" },
    out_for_delivery: { label: "Out for Delivery",   icon: faTruck,       color: "#059669", bg: "#ecfdf5" },
    delivered:        { label: "Delivered",          icon: faCircleCheck, color: "#16a34a", bg: "#f0fdf4" },
    cancelled:        { label: "Cancelled",          icon: faBan,         color: "#dc2626", bg: "#fef2f2" },
    returned:         { label: "Returned",           icon: faRotateLeft,  color: "#9333ea", bg: "#faf5ff" },
};

const TYPE_CONFIG = {
    track:          { accent: "#134d37", label: "Order Status"     },
    cancel_confirm: { accent: "#dc2626", label: "Order Cancelled"  },
    cancel_deny:    { accent: "#134d37", label: "Order Safe"       },
    return_confirm: { accent: "#9333ea", label: "Return Initiated" },
};

const OrderCard = ({ data }) => {
    const { type, text, order } = data;
    const status   = STATUS_CONFIG[order.status] || { label: order.status, icon: faBox, color: "#6b7280", bg: "#f9fafb" };
    const typeConf = TYPE_CONFIG[type] || TYPE_CONFIG.track;
    const formattedPrice = order.price ? `₹${order.price.toLocaleString("en-IN")}` : null;

    return (
        <div className="order-card">
            <div className="order-card-header" style={{ background: typeConf.accent }}>
                <span className="order-card-header-label">{typeConf.label}</span>
                <span className="order-card-order-id">#{order.orderId}</span>
            </div>
            <div className="order-card-body">
                <div className="order-card-product-name">{order.productName}</div>
                <div className="order-card-meta">
                    {order.brand && <span className="order-card-meta-item">{order.brand}</span>}
                    {order.gadgetType && (
                        <span className="order-card-meta-item order-card-gadget">
                            <FontAwesomeIcon icon={faTag} style={{ fontSize: 10, marginRight: 3 }} />
                            {order.gadgetType}
                        </span>
                    )}
                    {formattedPrice && <span className="order-card-meta-item order-card-price">{formattedPrice}</span>}
                </div>
                <div className="order-card-status-badge" style={{ background: status.bg, color: status.color }}>
                    <FontAwesomeIcon icon={status.icon} style={{ marginRight: 6 }} />
                    {status.label}
                </div>
            </div>
            <div className="order-card-footer">{text}</div>
        </div>
    );
};

export default OrderCard;