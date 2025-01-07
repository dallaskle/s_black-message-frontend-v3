import { useChannel } from '../../contexts/ChannelContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export function ChannelList() {
  const { channels, currentChannel, setCurrentChannel, isLoading, error } = useChannel();
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return (
      <div className="p-4 text-text-secondary">
        Select a workspace to view channels
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-text-secondary">
        Loading channels...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-accent-error">
        {error}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="p-4 text-text-secondary">
        No channels found. Create your first channel to get started.
      </div>
    );
  }

  // Separate channels by type
  const regularChannels = channels.filter(c => c.type === 'channel');
  const dmChannels = channels.filter(c => c.type === 'dm');

  return (
    <div className="space-y-6">
      {/* Regular Channels */}
      <div className="space-y-2">
        <h2 className="px-4 text-sm font-semibold text-text-secondary uppercase">
          Channels
        </h2>
        <ul className="space-y-1">
          {regularChannels.map((channel) => (
            <li key={channel.id}>
              <button
                onClick={() => setCurrentChannel(channel)}
                className={`w-full text-sm px-4 py-2 text-left transition-colors ${
                  currentChannel?.id === channel.id
                    ? 'bg-accent-primary/10 text-text-primary'
                    : 'text-text-secondary hover:bg-background-secondary'
                }`}
              >
                <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis block">
                    # {channel.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Direct Messages */}
      {dmChannels.length > 0 && (
        <div className="space-y-2">
          <h2 className="px-4 text-sm font-semibold text-text-secondary uppercase">
            Direct Messages
          </h2>
          <ul className="space-y-1">
            {dmChannels.map((channel) => (
              <li key={channel.id}>
                <button
                  onClick={() => setCurrentChannel(channel)}
                  className={`w-full px-4 py-2 text-left transition-colors ${
                    currentChannel?.id === channel.id
                      ? 'bg-accent-primary/10 text-text-primary'
                      : 'text-text-secondary hover:bg-background-secondary'
                  }`}
                >
                  <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis block">
                        # {channel.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
