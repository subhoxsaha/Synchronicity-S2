import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Ban, 
  Clock, 
  Search,
  Settings,
  Award,
  RefreshCw,
  MessageSquare,
  XCircle,
  Building2,
  Inbox,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { useAppContext } from '../contexts/AppContext';
import { CampusEvent, Registration, EventCategory, EventStatus, UserRole, PostType, Organization, InstituteRequest } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import EventBuilder from './EventBuilder';
import { InstituteManager } from './InstituteManager';

export function PlatformAdminPortal() {
  const { events, posts, registrations, currentUser, users, organizations, updateUserRole, updateUserStatus, moderateEvent, deleteEvent, updateEvent, approveOrganization, rejectOrganization, suspendOrganization, reactivateOrganization, instituteRequests, approveInstituteRequest, rejectInstituteRequest } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState('center');
  const [userSearch, setUserSearch] = useState('');
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [rejectDialogOrgId, setRejectDialogOrgId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  // Institute Request review state
  const [reviewingRequest, setReviewingRequest] = useState<InstituteRequest | null>(null);
  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null);
  const [rejectRequestNote, setRejectRequestNote] = useState('');
  const [approveFormData, setApproveFormData] = useState({ shortName: '', description: '', ambassadorEmail: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingRequests = instituteRequests.filter(r => r.status === 'pending');
  const reviewedRequests = instituteRequests.filter(r => r.status !== 'pending');

  if (currentUser?.role !== UserRole.PLATFORM_ADMIN) return null;

  const categoryData = Object.entries(
    events.reduce((acc, e) => {
      e.category.forEach(cat => acc[cat] = (acc[cat] || 0) + 1);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#4F46E5', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const menuItems = [
    { id: 'center', label: 'Command Center', icon: <ShieldAlert size={18} /> },
    { id: 'onboarding', label: `Onboarding${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}`, icon: <Inbox size={18} /> },
    { id: 'institutes', label: 'Institutes', icon: <Building2 size={18} /> },
    { id: 'clubs', label: 'Organization Review', icon: <Award size={18} /> },
    { id: 'events', label: 'Moderation', icon: <Settings size={18} /> },
    { id: 'users', label: 'User Directory', icon: <Users size={18} /> },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen pb-24">
      {/* Horizontal Sub-Navigation */}
      <div className="sticky top-[72px] z-40 bg-background border-b-[3px] border-foreground px-3 sm:px-4 py-2.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-7xl mx-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-[2.5px] border-foreground shrink-0 ${
                activeSubTab === item.id 
                  ? 'bg-foreground text-background shadow-none translate-x-[2px] translate-y-[2px]' 
                  : 'bg-background text-foreground hover:bg-muted shadow-[3px_3px_0_0_var(--foreground)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-8 md:px-8 max-w-7xl mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeSubTab === 'center' && (
                <div className="space-y-10">
                    <div className="flex flex-col gap-1 text-center md:text-left">
                        <h2 className="text-4xl font-black tracking-tighter uppercase">Nexus Oversight</h2>
                        <p className="text-muted-foreground font-medium text-lg italic">Campus-wide health & social interaction monitoring.</p>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <MetricCard label="Total Moments" value={events.length} sub="Published items" />
                        <MetricCard label="Verified Members" value={users.length} sub="Real-time count" />
                        <MetricCard label="Organizations" value={organizations.filter(o => o.status === 'approved').length} sub={`${organizations.filter(o => o.status === 'pending').length} pending`} />
                        <MetricCard label="Mod Queue" value={events.filter(e => e.status === EventStatus.PENDING).length} sub="Awaiting review" />
                    </div>
                    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                        <Card className="lg:col-span-2 rounded-none border-[2.5px] border-foreground shadow-[6px_6px_0_0_var(--foreground)] bg-card overflow-hidden">
                           <CardHeader className="p-5 sm:p-6 pb-0 border-b-[2px] border-foreground/20">
                              <CardTitle className="font-black uppercase tracking-tighter text-lg">Platform Overview</CardTitle>
                           </CardHeader>
                           <CardContent className="p-5 sm:p-6 space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 border-[2px] border-foreground bg-brutal-yellow/10">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Events</p>
                                  <p className="text-xl font-black tabular-nums">{events.filter(e => e.type === PostType.EVENT || !e.type).length}</p>
                                </div>
                                <div className="p-3 border-[2px] border-foreground bg-brutal-blue/10">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Announcements</p>
                                  <p className="text-xl font-black tabular-nums">{posts.filter(p => p.type === PostType.ANNOUNCEMENT).length}</p>
                                </div>
                                <div className="p-3 border-[2px] border-foreground bg-brutal-pink/10">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Recruitments</p>
                                  <p className="text-xl font-black tabular-nums">{posts.filter(p => p.type === PostType.RECRUITMENT).length}</p>
                                </div>
                                <div className="p-3 border-[2px] border-foreground bg-primary/10">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Registrations</p>
                                  <p className="text-xl font-black tabular-nums">{registrations.length}</p>
                                </div>
                              </div>
                              <div className="pt-3 border-t-[2px] border-foreground/20 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Top Organizers</p>
                                {(() => {
                                  const orgCounts = events.reduce((acc, e) => {
                                    const name = e.organizerName || 'Unknown';
                                    acc[name] = (acc[name] || 0) + 1;
                                    return acc;
                                  }, {} as Record<string, number>);
                                  return Object.entries(orgCounts)
                                    .sort(([,a],[,b]) => b - a)
                                    .slice(0, 5)
                                    .map(([name, count]) => (
                                      <div key={name} className="flex items-center justify-between p-2 border-[1.5px] border-foreground/20 bg-card">
                                        <span className="text-xs font-bold truncate">{name}</span>
                                        <span className="text-[10px] font-black tabular-nums text-primary">{count} posts</span>
                                      </div>
                                    ));
                                })()}
                              </div>
                           </CardContent>
                        </Card>

                        <Card className="rounded-none border-[2.5px] border-foreground shadow-[6px_6px_0_0_var(--foreground)] bg-card">
                            <CardHeader className="p-5 sm:p-6 border-b-[2px] border-foreground/20">
                                <CardTitle className="font-black uppercase tracking-tighter text-lg">Category Mix</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[280px] sm:h-[350px] p-4 sm:p-6">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={50}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            cornerRadius={0}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '0', border: '2px solid var(--foreground)', boxShadow: '3px 3px 0 0 var(--foreground)' }} />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* ─── ONBOARDING REQUESTS TAB ─── */}
            {activeSubTab === 'onboarding' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Institute Onboarding Requests</h2>
                  <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Review and approve institute requests from users</p>
                </div>

                {/* Pending Requests */}
                {pendingRequests.length === 0 ? (
                  <div className="bg-card border-[3px] border-foreground p-8 shadow-[6px_6px_0_0_var(--foreground)] text-center">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <p className="font-black uppercase tracking-widest text-sm">All Caught Up!</p>
                    <p className="text-muted-foreground text-xs mt-1">No pending onboarding requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> Pending ({pendingRequests.length})
                    </h3>
                    {pendingRequests.map(req => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border-[3px] border-foreground p-5 shadow-[6px_6px_0_0_var(--foreground)]"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Building2 className="h-5 w-5 text-primary shrink-0" />
                              <h4 className="text-lg font-black uppercase tracking-tight truncate">{req.instituteName}</h4>
                            </div>
                            {(req.state || req.district || req.city) && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                                <MapPin className="h-3 w-3" />
                                {[req.state, req.district, req.city].filter(Boolean).join(' · ')}
                              </p>
                            )}
                            <p className="text-sm bg-accent/30 p-2 rounded border border-foreground/10 mb-2">"{req.reason}"</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                              From: <span className="font-bold text-foreground">{req.requesterName}</span> ({req.requesterEmail})
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              onClick={() => {
                                setReviewingRequest(req);
                                setApproveFormData({ shortName: '', description: '', ambassadorEmail: req.requesterEmail });
                              }}
                              className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-none border-2 border-foreground shadow-[3px_3px_0_0_var(--foreground)] font-black uppercase tracking-widest text-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button
                              onClick={() => {
                                setRejectRequestId(req.id);
                                setRejectRequestNote('');
                              }}
                              variant="outline"
                              className="rounded-none border-2 border-foreground shadow-[3px_3px_0_0_var(--foreground)] font-black uppercase tracking-widest text-xs text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Reviewed Requests */}
                {reviewedRequests.length > 0 && (
                  <div className="space-y-3 mt-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Previously Reviewed ({reviewedRequests.length})</h3>
                    {reviewedRequests.slice(0, 10).map(req => (
                      <div key={req.id} className="bg-card border-2 border-foreground/30 p-3 flex items-center justify-between gap-3 opacity-70">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm truncate">{req.instituteName}</p>
                          <p className="text-[10px] text-muted-foreground">By {req.requesterName}</p>
                        </div>
                        <Badge className={`rounded-none font-black uppercase tracking-widest text-[10px] border ${
                          req.status === 'approved' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                            : 'bg-red-500/10 text-red-600 border-red-500/30'
                        }`}>
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Approve Dialog */}
                <Dialog open={!!reviewingRequest} onOpenChange={() => setReviewingRequest(null)}>
                  <DialogContent className="border-[3px] border-foreground rounded-none shadow-[12px_12px_0_0_var(--foreground)] sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black uppercase tracking-tighter">
                        Approve: {reviewingRequest?.instituteName}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">Fill in details to create the institute</p>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest">Short Name / Acronym *</label>
                        <Input
                          required
                          value={approveFormData.shortName}
                          onChange={e => setApproveFormData({...approveFormData, shortName: e.target.value})}
                          className="rounded-none border-2 border-foreground shadow-[2px_2px_0_0_var(--foreground)]"
                          placeholder="E.g. IIT-B, NIT-T"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest">Description</label>
                        <Input
                          value={approveFormData.description}
                          onChange={e => setApproveFormData({...approveFormData, description: e.target.value})}
                          className="rounded-none border-2 border-foreground shadow-[2px_2px_0_0_var(--foreground)]"
                          placeholder="Brief description of the institute"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest">Ambassador Email</label>
                        <Input
                          type="email"
                          value={approveFormData.ambassadorEmail}
                          onChange={e => setApproveFormData({...approveFormData, ambassadorEmail: e.target.value})}
                          className="rounded-none border-2 border-foreground shadow-[2px_2px_0_0_var(--foreground)]"
                          placeholder="Will be assigned as institute ambassador"
                        />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Pre-filled with requester's email</p>
                      </div>

                      <div className="flex gap-3 pt-3">
                        <Button
                          variant="outline"
                          onClick={() => setReviewingRequest(null)}
                          className="flex-1 rounded-none border-2 border-foreground"
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={isProcessing || !approveFormData.shortName.trim()}
                          onClick={async () => {
                            if (!reviewingRequest) return;
                            setIsProcessing(true);
                            try {
                              const ambassador = users.find(u => u.email.toLowerCase() === approveFormData.ambassadorEmail.toLowerCase());
                              await approveInstituteRequest(reviewingRequest.id, {
                                name: reviewingRequest.instituteName,
                                shortName: approveFormData.shortName.trim(),
                                description: approveFormData.description.trim() || reviewingRequest.instituteName,
                                ambassadorId: ambassador?.id || '',
                                status: 'active',
                                settings: {
                                  requireApprovalForEvents: true,
                                  requireApprovalForAnnouncements: true,
                                  requireApprovalForRecruitment: true,
                                  requireApprovalByDefault: true,
                                  autoPublishOrgIds: [],
                                  autoPublishPostTypes: [],
                                  allowedPostTypes: [],
                                }
                              });
                              setReviewingRequest(null);
                            } catch {
                              // error handled in context
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-none border-2 border-foreground shadow-[4px_4px_0_0_var(--foreground)] font-black uppercase tracking-widest"
                        >
                          {isProcessing ? 'Creating...' : 'Create Institute'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={!!rejectRequestId} onOpenChange={() => setRejectRequestId(null)}>
                  <DialogContent className="border-[3px] border-foreground rounded-none shadow-[12px_12px_0_0_var(--foreground)] sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black uppercase tracking-tighter text-red-600">
                        Reject Request
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest">Reason (optional)</label>
                        <textarea
                          value={rejectRequestNote}
                          onChange={e => setRejectRequestNote(e.target.value)}
                          rows={3}
                          placeholder="Provide a reason for the requester..."
                          className="w-full rounded-none border-2 border-foreground shadow-[2px_2px_0_0_var(--foreground)] bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setRejectRequestId(null)}
                          className="flex-1 rounded-none border-2 border-foreground"
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={isProcessing}
                          onClick={async () => {
                            if (!rejectRequestId) return;
                            setIsProcessing(true);
                            try {
                              await rejectInstituteRequest(rejectRequestId, rejectRequestNote);
                              setRejectRequestId(null);
                            } catch {
                              // error handled in context
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-none border-2 border-foreground shadow-[4px_4px_0_0_var(--foreground)] font-black uppercase tracking-widest"
                        >
                          {isProcessing ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {activeSubTab === 'institutes' && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                <InstituteManager />
              </div>
            )}

            {activeSubTab === 'events' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Content Management</h2>
                        <p className="text-muted-foreground text-[10px] sm:text-xs font-mono uppercase tracking-widest">All published posts — edit or take down</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-[2px] border-foreground px-3 py-1.5 self-start">{events.length} Posts</Badge>
                    </div>
                    
                    {editingEvent ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <Button variant="outline" onClick={() => setEditingEvent(null)} className="rounded-none border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] font-black uppercase tracking-widest text-[10px]">
                                &larr; Back to List
                            </Button>
                            <EventBuilder 
                                initialEvent={editingEvent} 
                                onAdd={(data: any) => {
                                    const updatedEvent = {
                                        ...editingEvent,
                                        ...data,
                                        id: editingEvent.id
                                    };
                                    updateEvent(updatedEvent);
                                    setEditingEvent(null);
                                }} 
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map((event) => {
                                const organizer = users.find(u => u.email === event.organizerEmail || u.id === event.organizerId);
                                const displayName = (event as any).organizationName || event.organizerName || 'Unknown';
                                const displayLogo = (event as any).organizationLogo || organizer?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
                                const eventDate = event.date ? new Date(event.date) : null;
                                const isValid = eventDate && !isNaN(eventDate.getTime());
                                return (
                                 <Card key={event.id} className="rounded-none border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] overflow-hidden bg-card">
                                    <div className="flex flex-col sm:flex-row">
                                       {/* Thumbnail */}
                                       <div className="relative w-full sm:w-32 md:w-40 h-28 sm:h-auto shrink-0 border-b-[2.5px] sm:border-b-0 sm:border-r-[2.5px] border-foreground overflow-hidden">
                                          {event.imageUrl ? (
                                            <img src={event.imageUrl} className="w-full h-full object-cover" alt={event.title} />
                                          ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                              <Calendar className="w-8 h-8 text-muted-foreground/30" />
                                            </div>
                                          )}
                                          <Badge variant="outline" className="absolute top-2 left-2 text-[8px] font-black uppercase bg-background/90 border-foreground">{event.type || 'event'}</Badge>
                                       </div>
                                       {/* Content */}
                                       <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between gap-2">
                                          <div>
                                            <h3 className="font-black text-sm sm:text-base uppercase tracking-tight leading-tight line-clamp-1">{event.title}</h3>
                                            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 mt-0.5">{event.description}</p>
                                          </div>
                                          {/* Organizer row */}
                                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t-[1.5px] border-foreground/10">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <Avatar className="h-6 w-6 border-[1.5px] border-foreground shrink-0">
                                                <AvatarImage src={displayLogo} />
                                                <AvatarFallback className="text-[8px] font-black">{displayName[0]}</AvatarFallback>
                                              </Avatar>
                                              <div className="min-w-0">
                                                <span className="text-[9px] font-black uppercase tracking-tight text-foreground truncate block">{displayName}</span>
                                                <span className="text-[8px] font-mono text-muted-foreground">
                                                  {isValid ? eventDate.toLocaleDateString([], {month:'short', day:'numeric'}) : 'No date'}
                                                  {isValid && ` · ${eventDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                              <Button size="sm" variant="outline" className="h-7 sm:h-8 px-2 sm:px-3 rounded-none border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-[8px] sm:text-[9px] font-black uppercase tracking-widest" onClick={() => setEditingEvent(event)}>Edit</Button>
                                              <Button size="sm" variant="ghost" className="h-7 sm:h-8 px-2 text-destructive hover:bg-destructive/10" onClick={() => {
                                                  if(window.confirm('Permanently delete this post?')) deleteEvent(event.id);
                                              }}>
                                                  <Trash2 size={14} />
                                              </Button>
                                            </div>
                                          </div>
                                       </div>
                                    </div>
                                 </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            
            {activeSubTab === 'users' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black italic tracking-tighter">User Directory</h2>
                            <p className="text-muted-foreground font-medium text-sm">Manage all registered accounts, roles, and access statuses.</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search name or email..." 
                                value={userSearch} 
                                onChange={e => setUserSearch(e.target.value)} 
                                className="pl-10 w-full md:w-72 h-11 rounded-2xl border-2 bg-card font-medium" 
                            />
                        </div>
                    </div>
                    <div className="grid gap-4">
                        {users.filter(u => (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase())).map(user => (
                            <Card key={user.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border-2 border-border/50 shadow-sm hover:shadow-md transition-shadow bg-card">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14 border-2 border-foreground/10">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className="font-black bg-primary/10 text-primary">{user.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-lg leading-none">{user.name}</p>
                                            <Badge variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary'} className="text-[9px] uppercase tracking-widest px-2 py-0.5">
                                                {user.status || 'active'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium mt-1.5">{user.email}</p>
                                        {user.role === 'organizer' && user.orgName && (
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Org: {user.orgName}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    {user.role === UserRole.PLATFORM_ADMIN ? (
                                        <Badge variant="outline" className="h-10 px-6 text-[10px] uppercase font-black bg-primary/10 text-primary border-primary/20 tracking-widest rounded-xl">System Admin</Badge>
                                    ) : (
                                        <>
                                            <Select defaultValue={user.role} onValueChange={(v) => updateUserRole(user.id, v as UserRole)}>
                                                <SelectTrigger className="w-32 h-10 font-bold text-xs rounded-xl border-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-2">
                                                    <SelectItem value="student" className="font-medium text-xs">Student</SelectItem>
                                                    <SelectItem value="organizer" className="font-medium text-xs">Organizer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {user.status === 'suspended' ? (
                                                <Button variant="outline" size="sm" className="h-10 px-4 font-bold text-xs rounded-xl border-2" onClick={() => updateUserStatus(user.id, 'active')}>Unsuspend</Button>
                                            ) : (
                                                <Button variant="ghost" size="sm" className="h-10 px-4 text-destructive hover:bg-destructive/10 font-bold text-xs rounded-xl" onClick={() => {
                                                    if(window.confirm('Are you sure you want to suspend this user?')) {
                                                        updateUserStatus(user.id, 'suspended');
                                                    }
                                                }}>
                                                    <Ban className="w-3.5 h-3.5 mr-2" /> Suspend
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeSubTab === 'clubs' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase">Organization Review</h2>
                        <p className="text-muted-foreground font-medium italic">Verify organizations and grant publishing rights.</p>
                    </div>

                    <div className="grid gap-6">
                        {organizations.filter(o => o.status === 'pending').length === 0 ? (
                            <Card className="p-20 text-center border-[2.5px] border-dashed border-foreground/40 bg-accent/5 shadow-none rounded-none">
                                <Award className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                                <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">No pending applications</p>
                            </Card>
                        ) : (
                            organizations.filter(o => o.status === 'pending').map(org => {
                                const owner = users.find(u => u.id === org.ownerId);
                                return (
                                <Card key={org.id} className="border-[2.5px] border-foreground shadow-[8px_8px_0_0_var(--foreground)] overflow-hidden bg-card rounded-none">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="p-10 bg-accent/30 md:w-80 space-y-6">
                                            <div className="flex flex-col items-center text-center space-y-4">
                                                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                                    <AvatarImage src={org.logo} />
                                                    <AvatarFallback>{org.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-xl font-black">{org.name}</p>
                                                    <Badge variant="secondary" className="uppercase text-[9px] font-black tracking-widest">{org.type}</Badge>
                                                </div>
                                            </div>
                                            <div className="space-y-4 pt-4 border-t border-border/40">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Owner</p>
                                                    <p className="font-bold text-sm truncate">{owner?.name || 'Unknown'}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium">{owner?.email || 'N/A'}</p>
                                                </div>
                                                {org.website && (
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Website</p>
                                                        <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary truncate block hover:underline">
                                                            {org.website.replace('https://', '')}
                                                        </a>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Join Policy</p>
                                                    <p className="text-xs font-bold">{org.joinPolicy === 'open' ? 'Open' : org.joinPolicy === 'approval_required' ? 'Approval Required' : 'Invite Only'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <CardContent className="flex-1 p-10 space-y-8">
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mission Statement</h4>
                                                <p className="text-lg font-medium leading-relaxed italic text-foreground/80">
                                                    "{org.description}"
                                                </p>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-border/40">
                                                <Button 
                                                    className="rounded-none h-14 px-8 font-black uppercase tracking-widest border-[2.5px] border-foreground bg-primary text-white hover:bg-primary/90 shadow-[4px_4px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all flex-1 w-full"
                                                    onClick={() => approveOrganization(org.id)}
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                                                </Button>
                                                <Button 
                                                    className="rounded-none h-14 px-8 font-black uppercase tracking-widest border-[2.5px] border-foreground bg-card text-destructive hover:bg-destructive/10 shadow-[4px_4px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all w-full sm:w-auto"
                                                    onClick={() => { setRejectDialogOrgId(org.id); setRejectionReason(''); }}
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" /> Deny
                                                </Button>
                                            </div>

                                            {/* Tags */}
                                            {(org as any).tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-4">
                                                    {(org as any).tags.map((tag: string) => (
                                                        <Badge key={tag} variant="outline" className="text-[8px] font-black uppercase tracking-wider">{tag}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </div>
                                </Card>
                                );
                            })
                        )}
                    </div>

                    {/* Active Organizations */}
                    <div className="pt-10">
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-6">Active Organizations ({organizations.filter(o => o.status === 'approved').length})</h3>
                        {organizations.filter(o => o.status === 'approved').length === 0 ? (
                            <p className="text-muted-foreground italic text-sm">No active organizations yet.</p>
                        ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {organizations.filter(o => o.status === 'approved').map(org => (
                                <Card key={org.id} className="p-6 rounded-[2rem] border-none shadow-lg bg-card/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                                            <AvatarImage src={org.logo} />
                                            <AvatarFallback className="bg-primary/10 font-black text-primary text-xs">{org.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-sm leading-none mb-1">{org.name}</p>
                                            <p className="text-[9px] text-muted-foreground uppercase font-black">{org.type} • {org.members?.length || 0} members</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-destructive hover:bg-destructive/10" title="Suspend" onClick={() => suspendOrganization(org.id)}>
                                        <Ban className="h-3.5 w-3.5" />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                        )}
                    </div>

                    {/* Suspended Organizations */}
                    {organizations.filter(o => o.status === 'suspended').length > 0 && (
                        <div className="pt-10">
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-6 text-destructive">Suspended ({organizations.filter(o => o.status === 'suspended').length})</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {organizations.filter(o => o.status === 'suspended').map(org => (
                                    <Card key={org.id} className="p-6 rounded-[2rem] border-dashed border-2 border-destructive/30 bg-destructive/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-destructive/20 opacity-60">
                                                <AvatarImage src={org.logo} />
                                                <AvatarFallback className="bg-destructive/10 font-black text-destructive text-xs">{org.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-sm leading-none mb-1 line-through opacity-70">{org.name}</p>
                                                <p className="text-[9px] text-destructive uppercase font-black">Suspended</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-primary hover:bg-primary/10" title="Reactivate" onClick={() => reactivateOrganization(org.id)}>
                                            <RefreshCw className="h-3.5 w-3.5" />
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rejection Reason Dialog */}
                    <Dialog open={!!rejectDialogOrgId} onOpenChange={(v) => { if (!v) setRejectDialogOrgId(null); }}>
                        <DialogContent className="max-w-sm p-0 border-[3px] border-destructive shadow-[6px_6px_0_0_hsl(var(--destructive))] bg-card overflow-hidden">
                            <div className="bg-destructive text-white px-6 py-4">
                                <DialogTitle className="text-base font-black uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" /> Rejection Reason
                                </DialogTitle>
                            </div>
                            <div className="p-6 space-y-4">
                                <textarea
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    placeholder="Provide a reason for rejection (optional)..."
                                    className="w-full px-3 py-2.5 border-[2px] border-foreground bg-background text-sm focus:outline-none rounded-none min-h-[80px] resize-y"
                                />
                                <div className="flex gap-3">
                                    <Button 
                                        className="flex-1 font-black uppercase tracking-widest bg-destructive text-white border-2 border-destructive"
                                        onClick={() => {
                                            if (rejectDialogOrgId) rejectOrganization(rejectDialogOrgId, rejectionReason);
                                            setRejectDialogOrgId(null); setRejectionReason('');
                                        }}
                                    >Confirm Rejection</Button>
                                    <Button variant="ghost" className="font-black uppercase tracking-widest" onClick={() => { setRejectDialogOrgId(null); setRejectionReason(''); }}>Cancel</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {activeSubTab === 'logs' && <div />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string, value: string | number, sub: string }) {
  return (
    <Card className="rounded-none border-[2.5px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] p-5 sm:p-6 space-y-2">
        <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</p>
        <p className="text-2xl sm:text-3xl font-black tracking-tighter tabular-nums">{value}</p>
        <p className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-wider">{sub}</p>
    </Card>
  );
}
