import { supabase } from './supabaseClient';
import type { Message } from '../types/message';
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
    if (this.subscriptions[key]) return;

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
        (payload: RealtimePostgresChangesPayload<Message>) => {
          try {
            callback({
              eventType: payload.eventType,
              message: payload.new as Message,
            });
          } catch (error) {
            console.error('Error processing message change:', error);
          }
        }
      )
      .subscribe((status) => {
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
        (payload: RealtimePostgresChangesPayload<Reaction>) => {
          try {
            callback({
              eventType: payload.eventType,
              reaction: payload.new as Reaction,
            });
          } catch (error) {
            console.error('Error processing reaction change:', error);
          }
        }
      )
      .subscribe((status) => {
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