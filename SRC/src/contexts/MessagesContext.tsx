import React, { createContext, useContext, useState } from 'react';
import { GetMessagesQuery, IMessage } from 'src/types/utils.type';
import { User } from 'src/types/user.type';
import {GroupReponse} from 'src/types/user.type';


interface MessagesContextType {
    messagesData: GetMessagesQuery | null;
    setMessagesData: React.Dispatch<React.SetStateAction<GetMessagesQuery | null>>;
    userData: User | null;
    setUserData: React.Dispatch<React.SetStateAction<User | null>>;
    groupResponse: GroupReponse | null;
    setGroupResponse: React.Dispatch<React.SetStateAction<GroupReponse | null>>;
  }

  const MessagesContext = createContext<MessagesContextType | undefined>(undefined);
  export const useMessages = (): MessagesContextType => {
    const context = useContext(MessagesContext);
    if (!context) {
      throw new Error('useMessages must be used within a MessagesProvider');
    }
    return context;
  };
  
  export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messagesData, setMessagesData] = useState<GetMessagesQuery | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [groupResponse, setGroupResponse] = useState<GroupReponse | null>(null);
    
    return (
      <MessagesContext.Provider value={{ messagesData, setMessagesData, userData, setUserData, groupResponse, setGroupResponse }}>
        {children}
      </MessagesContext.Provider>
    );
  };