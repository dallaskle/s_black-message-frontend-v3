import { supabase } from './supabaseClient';
import type { Message } from '../types/message';
import type { FileData } from '../types/file';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Reaction } from '../types/reaction';

type MessageCallback = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  message: Message;
}) => void;

type ReactionCallback = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  reaction: Reaction;
}) => void;

export class RealtimeService {
  private subscriptions: Record<string, any> = {};

  subscribeToMessages(channelId: string, callback: MessageCallback) {
    const key = `messages:${channelId}`;
    console.log('Setting up message subscription for channel:', channelId);
    
    if (this.subscriptions[key]) {
      console.log('Subscription already exists for channel:', channelId);
      return;
    }

    this.subscriptions[key] = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Message>) => {
          try {
            console.log('Received message event:', {
              type: payload.eventType,
              new: payload.new,
              old: payload.old
            });

            if (!payload.new || !('user_id' in payload.new)) {
              console.log('Invalid message payload:', payload);
              return;
            }
            
            console.log('Fetching additional message data for:', payload.new.id);
            // Fetch complete message data including files
            const { data: messageData } = await supabase
              .from('messages')
              .select(`
                *,
                files:message_files (
                  file:files (
                    id,
                    file_url,
                    file_name,
                    file_size,
                    mime_type,
                    thumbnail_url
                  )
                )
              `)
              .eq('id', payload.new.id)
              .single();

            const { data: userData } = await supabase
              .from('users')
              .select('name')
              .eq('id', payload.new.user_id)
              .single();

            const messageWithDetails = {
              ...messageData,
              name: userData?.name || 'Unknown User',
              files: messageData?.files?.map((f: { file: FileData }) => f.file) || [],
              reactions: {},
              userReactions: []
            } as Message;

            callback({
              eventType: payload.eventType,
              message: messageWithDetails,
            });
          } catch (error) {
            console.error('Error processing message change:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for channel ${channelId}:`, status);
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to messages for channel ${channelId}`);
        } else if (status === 'CLOSED') {
          console.log(`Subscription closed for messages in channel ${channelId}`);
          delete this.subscriptions[key];
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error in message subscription for channel ${channelId}`);
          this.unsubscribe(channelId);
        }
      });
  }

  subscribeToReactions(channelId: string, callback: ReactionCallback) {
    const key = `reactions:${channelId}`;
    if (this.subscriptions[key]) return;

    console.log(`Subscribing to reactions for channel ${channelId}`);

    this.subscriptions[key] = supabase
      .channel('reactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Reaction>) => {
          try {
            console.log('Reaction change payload:', payload);
            
            switch (payload.eventType) {
              case 'INSERT':
                // New reaction added
                if (payload.new) {
                  callback({
                    eventType: 'INSERT',
                    reaction: payload.new as Reaction,
                  });
                }
                break;

              case 'UPDATE':
                // Reaction updated (though this should be rare)
                if (payload.new) {
                  callback({
                    eventType: 'UPDATE',
                    reaction: payload.new as Reaction,
                  });
                }
                break;

              case 'DELETE':
                // Reaction removed
                if (payload.old) {
                  callback({
                    eventType: 'DELETE',
                    reaction: payload.old as Reaction,
                  });
                }
                break;

              default:
                console.warn('Unknown reaction event type');
            }
          } catch (error) {
            console.error('Error processing reaction change:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Reaction subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to reactions for channel ${channelId}`);
        } else if (status === 'CLOSED') {
          console.log(`Subscription closed for reactions in channel ${channelId}`);
          delete this.subscriptions[key];
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error in reaction subscription for channel ${channelId}`);
          this.unsubscribe(channelId);
        }
      });
  }

  unsubscribe(channelId: string) {
    const messagesSub = this.subscriptions[`messages:${channelId}`];
    const reactionsSub = this.subscriptions[`reactions:${channelId}`];

    if (messagesSub) {
      supabase.removeChannel(messagesSub);
      delete this.subscriptions[`messages:${channelId}`];
    }

    if (reactionsSub) {
      supabase.removeChannel(reactionsSub);
      delete this.subscriptions[`reactions:${channelId}`];
    }
  }

  cleanup() {
    // Remove all subscriptions
    Object.keys(this.subscriptions).forEach(key => {
      const subscription = this.subscriptions[key];
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    });
    this.subscriptions = {};
  }
}

export const realtimeService = new RealtimeService(); 