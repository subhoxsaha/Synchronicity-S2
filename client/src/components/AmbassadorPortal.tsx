import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Building2,
  Settings,
  Clock,
  Ban,
  XCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAppContext } from '../contexts/AppContext';
import { UserRole, PostStatus } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function AmbassadorPortal() {
  const { currentUser, posts, organizations, moderatePost } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState('center');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectDialogPostId, setRejectDialogPostId] = useState<string | null>(null);

  if (currentUser?.role !== UserRole.AMBASSADOR) return null;

  const myInstituteId = currentUser.instituteId;
  const myInstituteOrgs = organizations.filter(org => org.instituteId === myInstituteId);
  const pendingPosts = posts.filter(post => post.instituteId === myInstituteId && post.status === PostStatus.PENDING);

  const menuItems = [
    { id: 'center', label: 'Dashboard', icon: <ShieldAlert size={18} /> },
    { id: 'approvals', label: 'Approval Queue', icon: <CheckCircle2 size={18} /> },
    { id: 'organizations', label: 'Organizations', icon: <Building2 size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b-4 border-foreground">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase mb-2">
            Ambassador Portal
          </h1>
          <p className="text-muted-foreground font-black tracking-widest uppercase text-xs">
            Institute Oversight & Approval Queue
          </p>
        </div>
        <div className="flex bg-card border-[3px] border-foreground p-1 shadow-[4px_4px_0_0_var(--foreground)] w-full md:w-auto overflow-x-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                activeSubTab === item.id 
                ? 'bg-foreground text-background scale-95' 
                : 'hover:bg-accent hover:scale-95'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'center' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-8 border-[3px] border-foreground bg-primary text-white shadow-[6px_6px_0_0_var(--foreground)]">
                  <h3 className="font-black uppercase tracking-widest text-xs opacity-80 mb-2">Pending Approvals</h3>
                  <p className="text-6xl font-black">{pendingPosts.length}</p>
               </div>
               <div className="p-8 border-[3px] border-foreground bg-secondary text-white shadow-[6px_6px_0_0_var(--foreground)]">
                  <h3 className="font-black uppercase tracking-widest text-xs opacity-80 mb-2">Active Organizations</h3>
                  <p className="text-6xl font-black">{myInstituteOrgs.length}</p>
               </div>
            </div>
          )}

          {activeSubTab === 'approvals' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Approval Queue</h2>
              {pendingPosts.length === 0 ? (
                <div className="p-12 text-center border-[3px] border-dashed border-foreground/20">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="font-black text-muted-foreground uppercase tracking-widest text-sm">All caught up</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingPosts.map(post => (
                    <div key={post.id} className="p-6 border-[3px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest">{post.type}</span>
                          <span className="text-xs font-bold text-muted-foreground">{post.organizationName}</span>
                        </div>
                        <h3 className="text-xl font-black">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.description}</p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button 
                          onClick={() => moderatePost(post.id, PostStatus.APPROVED)}
                          className="flex-1 md:flex-none border-[2.5px] border-foreground bg-green-500 hover:bg-green-600 text-white shadow-[2px_2px_0_0_var(--foreground)]"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                        </Button>
                        <Button 
                          onClick={() => setRejectDialogPostId(post.id)}
                          className="flex-1 md:flex-none border-[2.5px] border-foreground bg-destructive hover:bg-destructive/90 text-white shadow-[2px_2px_0_0_var(--foreground)]"
                        >
                          <Ban className="h-4 w-4 mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'organizations' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Organizations in Institute</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myInstituteOrgs.map(org => (
                  <div key={org.id} className="p-6 border-[3px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] flex flex-col h-full">
                    <h3 className="text-xl font-black uppercase truncate mb-2">{org.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{org.description}</p>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest pt-4 border-t-2 border-foreground/10">
                      <span>{org.entityType}</span>
                      <span className={org.status === 'approved' ? 'text-green-500' : 'text-orange-500'}>{org.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Dialog open={!!rejectDialogPostId} onOpenChange={(open) => !open && setRejectDialogPostId(null)}>
        <DialogContent className="border-[3px] border-foreground rounded-none shadow-[8px_8px_0_0_var(--foreground)] sm:max-w-[425px]">
          <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <XCircle className="text-destructive" /> Provide Rejection Reason
          </DialogTitle>
          <div className="py-4 space-y-4">
            <Input
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Why is this being rejected?"
              className="border-2 border-foreground rounded-none shadow-[2px_2px_0_0_var(--foreground)]"
              autoFocus
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setRejectDialogPostId(null)} className="border-2 border-foreground rounded-none font-black uppercase tracking-widest">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    toast.error("Please provide a reason");
                    return;
                  }
                  if (rejectDialogPostId) {
                    moderatePost(rejectDialogPostId, PostStatus.REJECTED, rejectionReason);
                    setRejectDialogPostId(null);
                    setRejectionReason('');
                  }
                }}
                className="bg-destructive hover:bg-destructive/90 text-white border-2 border-foreground rounded-none shadow-[2px_2px_0_0_var(--foreground)] font-black uppercase tracking-widest"
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
