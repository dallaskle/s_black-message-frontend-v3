import React, { createContext, useContext, useState, useCallback } from 'react';
import { MemberWithUser, MemberContextType } from '../../types/member';
import { getWorkspaceMembers, getChannelMembers } from '../../api/memberApi';

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const useMemberContext = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMemberContext must be used within a MemberProvider');
  }
  return context;
};

export const MemberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaceMembers, setWorkspaceMembers] = useState<Record<string, MemberWithUser[]>>({});
  const [channelMembers, setChannelMembers] = useState<Record<string, MemberWithUser[]>>({});
  const [loadingWorkspaceMembers, setLoadingWorkspaceMembers] = useState(false);
  const [loadingChannelMembers, setLoadingChannelMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaceMembers = useCallback(async (workspaceId: string) => {
    if (workspaceMembers[workspaceId]) return;
    
    setLoadingWorkspaceMembers(true);
    setError(null);
    
    const response = await getWorkspaceMembers(workspaceId);
    
    if (response.error) {
      setError(response.error);
    } else {
      setWorkspaceMembers(prev => ({
        ...prev,
        [workspaceId]: response.data
      }));
    }
    
    setLoadingWorkspaceMembers(false);
  }, [workspaceMembers]);

  const fetchChannelMembers = useCallback(async (channelId: string) => {
    if (channelMembers[channelId]) return;
    
    setLoadingChannelMembers(true);
    setError(null);
    
    const response = await getChannelMembers(channelId);
    
    if (response.error) {
      setError(response.error);
    } else {
      setChannelMembers(prev => ({
        ...prev,
        [channelId]: response.data
      }));
    }
    
    setLoadingChannelMembers(false);
  }, [channelMembers]);

  const clearMembers = useCallback(() => {
    setWorkspaceMembers({});
    setChannelMembers({});
    setError(null);
  }, []);

  const value = {
    workspaceMembers,
    channelMembers,
    loadingWorkspaceMembers,
    loadingChannelMembers,
    error,
    fetchWorkspaceMembers,
    fetchChannelMembers,
    clearMembers
  };

  return (
    <MemberContext.Provider value={value}>
      {children}
    </MemberContext.Provider>
  );
}; 