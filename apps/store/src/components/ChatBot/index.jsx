import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { Chat, SilentRemoteModuleWrapper } from '../remote-modules';


const ChatBot = () => {
    const auth = useSelector(state => state.auth);

    const handleChatError = (error, errorInfo) => {
        console.error('Chat Bot failed:', error.message);
    };
    
    if(!auth.isAuthenticated || !auth.token || !auth.user) return null;
    return(
        <div className={'light'}>
            <SilentRemoteModuleWrapper onError={handleChatError}>
                <Chat 
                    token={auth.token}
                    userId={auth.user?.id}
                />
            </SilentRemoteModuleWrapper>
        </div>
    );
}

export default memo(ChatBot);