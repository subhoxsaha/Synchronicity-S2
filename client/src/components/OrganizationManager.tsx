import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, ShieldCheck, ShieldAlert, UserMinus, Plus, Clock, UserPlus } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Organization, OrgMemberRole } from '../types';
import { toast } from 'sonner';

interface OrganizationManagerProps {
  org: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationManager({ org, open, onOpenChange }: OrganizationManagerProps) {
  const { users, currentUser, addOrgMember, removeOrgMember, updateOrgMemberRole, handleJoinRequest } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<OrgMemberRole>('member');
  
  const myMemberEntry = org.members?.find(m => m.userId === currentUser?.id);
  const myRole = myMemberEntry?.role;
  const isOwner = myRole === 'owner';
  const isAdminOrOwner = isOwner || myRole === 'admin';

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    
    // Find user by email
    const userToAdd = users.find(u => u.email.toLowerCase() === newMemberEmail.trim().toLowerCase());
    if (!userToAdd) {
      toast.error('User not found with this email.');
      return;
    }
    
    await addOrgMember(org.id, userToAdd.id, newMemberRole);
    setNewMemberEmail('');
  };

  const getRoleBadge = (role: OrgMemberRole) => {
    switch(role) {
      case 'owner': return <Badge variant="pink" className="text-[8px] uppercase">Owner</Badge>;
      case 'admin': return <Badge variant="blue" className="text-[8px] uppercase">Admin</Badge>;
      case 'member': return <Badge variant="outline" className="text-[8px] uppercase">Member</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)] gap-0">
        <div className="bg-foreground text-background p-6">
          <DialogTitle className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
            <Users className="h-6 w-6" />
            Manage {org.name}
          </DialogTitle>
          <DialogDescription className="text-background/70 font-mono text-xs uppercase mt-1">
            Members and Access Control
          </DialogDescription>
        </div>

        {/* Tabs */}
        <div className="flex border-b-[2.5px] border-foreground bg-accent/20">
          <button 
            className={`flex-1 p-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'members' ? 'bg-background border-b-2 border-foreground' : 'hover:bg-accent/40'}`}
            onClick={() => setActiveTab('members')}
          >
            Current Members ({org.members?.length || 0})
          </button>
          {org.joinPolicy === 'approval_required' && (
            <button 
              className={`flex-1 p-3 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-background border-b-2 border-foreground' : 'hover:bg-accent/40'}`}
              onClick={() => setActiveTab('requests')}
            >
              Requests 
              {org.joinRequests && org.joinRequests.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">{org.joinRequests.length}</span>
              )}
            </button>
          )}
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto bg-background">
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Add Member Form */}
              {isAdminOrOwner && (
                <form onSubmit={handleAddMember} className="flex gap-2 items-end border-[2.5px] border-foreground p-4 bg-brutal-yellow/10">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">User Email</label>
                    <input 
                      type="email" 
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="student@campus.edu" 
                      className="w-full h-10 border-[2px] border-foreground px-3 text-sm focus:shadow-[2px_2px_0_0_var(--foreground)] outline-none"
                    />
                  </div>
                  {isOwner && (
                    <div className="w-32 space-y-1">
                      <label className="text-[10px] font-black uppercase text-muted-foreground">Role</label>
                      <select 
                        value={newMemberRole} 
                        onChange={(e) => setNewMemberRole(e.target.value as OrgMemberRole)}
                        className="w-full h-10 border-[2px] border-foreground px-2 text-xs font-bold uppercase outline-none focus:shadow-[2px_2px_0_0_var(--foreground)]"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  )}
                  <Button type="submit" disabled={!newMemberEmail} className="h-10 border-[2.5px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-black uppercase tracking-widest text-[10px]">
                    <UserPlus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </form>
              )}

              {/* Members List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b-[2px] border-foreground/10 pb-2">Directory</h4>
                {org.members?.map(member => {
                  const user = users.find(u => u.id === member.userId);
                  const isSelf = currentUser?.id === member.userId;
                  return (
                    <div key={member.userId} className="flex items-center justify-between p-3 border-[2px] border-foreground/20 hover:border-foreground/60 transition-colors bg-card">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-[2px] border-foreground">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="font-bold text-xs">{user?.name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold flex items-center gap-2">
                            {user?.name || 'Unknown User'}
                            {isSelf && <span className="text-[9px] font-black text-muted-foreground uppercase">(You)</span>}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getRoleBadge(member.role)}
                        
                        {isAdminOrOwner && !isSelf && member.role !== 'owner' && (
                          <div className="flex gap-1 ml-2 border-l-[2px] border-foreground/10 pl-3">
                            {isOwner && (
                              <select 
                                value={member.role}
                                onChange={(e) => updateOrgMemberRole(org.id, member.userId, e.target.value as OrgMemberRole)}
                                className="text-[10px] font-bold uppercase border-[1.5px] border-foreground px-1 py-1 outline-none cursor-pointer hover:bg-muted"
                              >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeOrgMember(org.id, member.userId)}
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {(!org.joinRequests || org.joinRequests.length === 0) ? (
                <div className="flex flex-col items-center justify-center p-12 border-[2.5px] border-dashed border-foreground/20">
                  <Clock className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No pending requests</p>
                </div>
              ) : (
                org.joinRequests.map(userId => {
                  const user = users.find(u => u.id === userId);
                  return (
                    <div key={userId} className="flex items-center justify-between p-4 border-[2px] border-foreground bg-brutal-blue/5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-[2px] border-foreground">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="font-bold text-xs">{user?.name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold">{user?.name || 'Unknown User'}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleJoinRequest(org.id, userId, false)}
                          className="h-8 text-[9px] font-black uppercase border-[2px] border-foreground text-destructive hover:bg-destructive/10"
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleJoinRequest(org.id, userId, true)}
                          className="h-8 text-[9px] font-black uppercase border-[2.5px] border-foreground shadow-[2px_2px_0_0_var(--foreground)]"
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
