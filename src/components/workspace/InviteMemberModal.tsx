import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { workspaceInviteApi } from '../../api/workspaceInvite';
import Spinner from '../ui/Spinner';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Switch } from '../ui/switch';

interface InviteMemberModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXPIRATION_OPTIONS = [
  { value: 86400000, label: '24 hours' },
  { value: 259200000, label: '3 days' },
  { value: 604800000, label: '7 days' },
  { value: 0, label: 'Never' }
];

const InviteMemberModal = ({ isOpen, onOpenChange }: InviteMemberModalProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [expiresIn, setExpiresIn] = useState<number>(EXPIRATION_OPTIONS[0].value);
  const [singleUse, setSingleUse] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { currentWorkspace, refreshInvitations } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      await workspaceInviteApi.createInvite({
        workspaceId: currentWorkspace.id,
        email,
        role,
        singleUse,
        expiresIn: expiresIn || undefined
      });
      
      await refreshInvitations();
      
      setIsSuccess(true);
      setIsLoading(false);
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send invitation');
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setRole('member');
    setExpiresIn(EXPIRATION_OPTIONS[0].value);
    setSingleUse(true);
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      resetForm();
      setError(null);
      setIsSuccess(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-background-primary">
        <DialogHeader>
          <DialogTitle>
            {isSuccess ? 'Invitation Sent!' : 'Invite Member'}
          </DialogTitle>
        </DialogHeader>
        {isSuccess ? (
          <div className="space-y-4">
            <p className="text-center">The invitation has been sent successfully.</p>
            <div className="flex justify-center">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: 'member' | 'admin') => setRole(value)}>
                <SelectTrigger className="bg-background-primary">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-background-primary">
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration">Expires In</Label>
              <Select 
                value={expiresIn.toString()} 
                onValueChange={(value) => setExpiresIn(parseInt(value))}
              >
                <SelectTrigger className="bg-background-primary">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent className="bg-background-primary">
                  {EXPIRATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={singleUse}
                onCheckedChange={setSingleUse}
              />
              <Label htmlFor="single-use">Single-use invitation</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner inline size={16} /> : 'Send Invitation'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberModal; 