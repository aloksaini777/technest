const LoadingSpinner = ({ size = 24, text }) => (
    <div className="chat-spinner-wrapper">
        <svg 
            className="chat-spinner" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="spinner-head" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        {text && <span className="chat-spinner-text">{text}</span>}
    </div>
);

export default LoadingSpinner;