import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '../../store/store'
import FloatingChatButton from '../FloatinButton/FloatingChatButton'
import { AuthProvider } from '../../context/authContext'
import '../../App.css';

const ChatSupport = ( props ) => {
    const { cssVariableMapping, token, userId, chatIcon='' } = props;

    useEffect(() => {
        if (cssVariableMapping) {
            const root = document.documentElement;
            const computedStyle = getComputedStyle(root);
            
            Object.entries(cssVariableMapping).forEach(([remoteVar, hostVar]) => {
                const hostValue = computedStyle.getPropertyValue(hostVar).trim();
                
                if (hostValue) {
                    root.style.setProperty(remoteVar, hostValue);
                }
            });
        }
    
        return () => {
            if (cssVariableMapping) {
                const root = document.documentElement;
                Object.keys(cssVariableMapping).forEach((remoteVar) => {
                    root.style.removeProperty(remoteVar);
                });
            }
        };
    }, [cssVariableMapping]);



    if(!userId || !token) {
        throw new Error('token or userId missing!');
    }
    return (
        <Provider store={store}>
            <AuthProvider values={{ token, userId, chatIcon }} >
                <FloatingChatButton />
            </AuthProvider>
        </Provider>
    )
}

export default ChatSupport;