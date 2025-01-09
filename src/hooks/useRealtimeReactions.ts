import { useEffect } from 'react';
import { realtimeService } from '../lib/realtimeService';
import { useMessage } from '../contexts/MessageContext';

export function useRealtimeReactions(channelId: string | undefined) {
  const { updateReactions } = useMessage();

  useEffect(() => {
    if (!channelId) return;

    // Subscribe to reaction changes
    realtimeService.subscribeToReactions(channelId, async ({ reaction }) => {
      console.log('Reaction change received:', reaction); // Add logging
      if (reaction.message_id) {
        await updateReactions(reaction.message_id);
      }
    });

    return () => {
      realtimeService.unsubscribe(channelId);
    };
  }, [channelId, updateReactions]);
} 