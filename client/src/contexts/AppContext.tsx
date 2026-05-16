import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, CampusEvent, Registration, UserRole, Notification, NotificationType, EventCategory, EventStatus, PostType, Organization, OrgMember, OrgStatus, OrgJoinPolicy, OrgMemberRole, Institute, AnyPost, PostStatus, InstituteRequest } from '../types';
import { toast } from 'sonner';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  runTransaction,
  serverTimestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { setCookie, eraseCookie } from '../lib/cookies';

interface AppContextType {
  currentUser: User | null;
  events: CampusEvent[];
  registrations: Registration[];
  notifications: Notification[];
  users: User[];
  organizations: Organization[];
  myOrganizations: Organization[];
  institutes: Institute[];
  posts: AnyPost[];
  instituteRequests: InstituteRequest[];
  authLoading: boolean;
  isInitializing: boolean;
  loadingProgress: number;
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole) => void;
  login: (targetRole?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, status: 'pending' | 'active' | 'suspended' | 'review') => Promise<void>;
  submitOnboarding: (details: Partial<User>) => Promise<void>;
  createOrganization: (data: Partial<Organization>) => Promise<void>;
  approveOrganization: (orgId: string) => Promise<void>;
  rejectOrganization: (orgId: string, reason?: string) => Promise<void>;
  suspendOrganization: (orgId: string) => Promise<void>;
  reactivateOrganization: (orgId: string) => Promise<void>;
  joinOrganization: (orgId: string) => Promise<void>;
  leaveOrganization: (orgId: string) => Promise<void>;
  handleJoinRequest: (orgId: string, userId: string, accept: boolean) => Promise<void>;
  addOrgMember: (orgId: string, userId: string, role: OrgMemberRole) => Promise<void>;
  removeOrgMember: (orgId: string, userId: string) => Promise<void>;
  updateOrgMemberRole: (orgId: string, userId: string, newRole: OrgMemberRole) => Promise<void>;
  followOrganization: (orgId: string) => Promise<void>;
  unfollowOrganization: (orgId: string) => Promise<void>;
  updateOrganization: (orgId: string, data: Partial<Organization>) => Promise<void>;
  registerForEvent: (eventId: string) => Promise<void>;
  checkInUser: (eventId: string, userEmail: string) => Promise<boolean>;
  addEvent: (event: any) => Promise<void>;
  updateEvent: (event: any) => Promise<void>;
  moderateEvent: (eventId: string, status: EventStatus) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  cancelRegistration: (registrationId: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  toggleBookmark: (eventId: string) => Promise<void>;
  toggleLike: (eventId: string) => Promise<void>;
  toggleFollow: (targetUserId: string) => Promise<void>;
  addComment: (eventId: string, text: string) => Promise<void>;
  createInstitute: (data: Partial<Institute>) => Promise<void>;
  updateInstitute: (id: string, data: Partial<Institute>) => Promise<void>;
  createPost: (post: Partial<AnyPost>) => Promise<void>;
  updatePost: (id: string, data: Partial<AnyPost>) => Promise<void>;
  moderatePost: (postId: string, status: PostStatus, rejectionReason?: string) => Promise<void>;
  submitInstituteRequest: (data: { instituteName: string; state?: string; district?: string; city?: string; reason: string }) => Promise<void>;
  approveInstituteRequest: (requestId: string, instituteData: Partial<Institute>) => Promise<void>;
  rejectInstituteRequest: (requestId: string, reviewNote?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [loginIntent, setLoginIntent] = useState<UserRole | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [organizationsLoaded, setOrganizationsLoaded] = useState(false);
  const [institutesLoaded, setInstitutesLoaded] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [instituteRequestsLoaded, setInstituteRequestsLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [posts, setPosts] = useState<AnyPost[]>([]);
  const [instituteRequests, setInstituteRequests] = useState<InstituteRequest[]>([]);

  // Derived: organizations the current user is a member of
  const myOrganizations = useMemo(() => {
    if (!currentUser) return [];
    return organizations.filter(org =>
      org.status === 'approved' && org.members?.some(m => m.userId === currentUser.id)
    );
  }, [organizations, currentUser]);

  // Auth State Listener
  useEffect(() => {
    setLoadingProgress(10);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoadingProgress(30);
      
      // Cleanup previous user snapshot listener if any
      if ((window as any)._userUnsubscribe) {
        (window as any)._userUnsubscribe();
        (window as any)._userUnsubscribe = null;
      }

      if (firebaseUser) {
        setAuthLoading(true);
        const userDoc = doc(db, 'users', firebaseUser.uid);
        
        let retryCount = 0;
        const maxRetries = 2;

        const startListener = () => {
          const unsub = onSnapshot(userDoc, (snapshot) => {
            setLoadingProgress(60);
            if (snapshot.exists()) {
              const userData = snapshot.data() as User;
              
              const bootstrappedAdmins = ['subhoxsaha@gmail.com'];
              if (bootstrappedAdmins.includes(userData.email) && userData.role !== UserRole.PLATFORM_ADMIN) {
                  updateDoc(userDoc, { role: UserRole.PLATFORM_ADMIN, status: 'active', isApproved: true });
                  return; 
              }

              setCurrentUser(userData);
              
              if (userData.status === 'suspended') {
                setActiveRole(UserRole.STUDENT); 
                toast.error("Your account has been suspended.");
              } else if (userData.role === UserRole.ORGANIZER && !userData.isApproved) {
                if (!activeRole || activeRole === UserRole.ORGANIZER) setActiveRole(UserRole.STUDENT);
              } else {
                if (!activeRole) setActiveRole(userData.role);
              }

              setLoadingProgress(100);
              setAuthLoading(false);
            } else {
              const isBootstrappedAdmin = ['subhoxsaha@gmail.com'].includes(firebaseUser.email || '');
              const savedIntent = localStorage.getItem('campus_login_intent') as UserRole | null;
              const role = isBootstrappedAdmin ? UserRole.PLATFORM_ADMIN : (savedIntent || UserRole.STUDENT);
              
              const newUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Campus Member',
                email: firebaseUser.email || '',
                role: role,
                avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
                attendanceStreak: 0,
                isApproved: role !== UserRole.ORGANIZER,
                status: role === UserRole.ORGANIZER ? 'pending' : 'active'
              };
              setDoc(userDoc, newUser)
                .then(() => {
                  setAuthLoading(false);
                  localStorage.removeItem('campus_login_intent');
                })
                .catch(e => {
                  if (auth.currentUser) {
                    handleFirestoreError(e, OperationType.WRITE, `users/${firebaseUser.uid}`);
                  }
                  setAuthLoading(false);
                });
            }
          }, (error: any) => {
            if (error?.code === 'permission-denied' && retryCount < maxRetries) {
              retryCount++;
              setTimeout(startListener, 1000);
              return;
            }
            if (auth.currentUser) {
                handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
            }
            setAuthLoading(false);
          });
          (window as any)._userUnsubscribe = unsub;
          return unsub;
        };

        startListener();
      } else {
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if ((window as any)._userUnsubscribe) {
        (window as any)._userUnsubscribe();
      }
    };
  }, [loginIntent]);

  // Events Listener — no dependency on currentUser, always listens
  useEffect(() => {
    const q = collection(db, 'events');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CampusEvent));
      setEvents(eventList);
      setEventsLoaded(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
      setEventsLoaded(true); // Don't block forever on error
    });

    return () => unsubscribe();
  }, []);

  // Registrations Listener (Filtered by user if not admin/organizer)
  useEffect(() => {
    if (authLoading || !currentUser) {
      setRegistrations([]);
      return;
    }

    let q;
    try {
      if (currentUser.role === UserRole.PLATFORM_ADMIN) {
        q = collection(db, 'registrations');
      } else if (currentUser.role === UserRole.ORGANIZER) {
        q = query(collection(db, 'registrations'), where('organizerEmail', '==', currentUser.email));
      } else {
        q = query(collection(db, 'registrations'), where('userEmail', '==', currentUser.email));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const regList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
        setRegistrations(regList);
      }, (error) => {
        // Only log if we are still the same user
        if (auth.currentUser?.email === currentUser.email) {
          handleFirestoreError(error, OperationType.LIST, 'registrations');
        }
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Query buildup failed", e);
    }
  }, [currentUser, authLoading]);

  // Notifications Listener
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notifList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Users Listener — depends only on auth state, not the full currentUser object
  useEffect(() => {
    if (authLoading) return;

    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(d => d.data() as User);
      setUsers(userList);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    });

    return () => unsubscribe();
  }, [authLoading]);

  // Organizations Listener
  useEffect(() => {
    if (authLoading) return;

    const q = collection(db, 'organizations');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orgList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Organization));
      setOrganizations(orgList);
      setOrganizationsLoaded(true);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'organizations');
      }
      setOrganizationsLoaded(true);
    });

    return () => unsubscribe();
  }, [authLoading]);

  // Institutes Listener
  useEffect(() => {
    if (authLoading) return;
    const q = collection(db, 'institutes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const instituteList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Institute));
      setInstitutes(instituteList);
      setInstitutesLoaded(true);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'institutes');
      }
      setInstitutesLoaded(true);
    });
    return () => unsubscribe();
  }, [authLoading]);

  // Posts Listener
  useEffect(() => {
    if (authLoading) return;
    const q = collection(db, 'posts');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AnyPost));
      setPosts(postList);
      setPostsLoaded(true);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'posts');
      }
      setPostsLoaded(true);
    });
    return () => unsubscribe();
  }, [authLoading]);

  // Institute Requests Listener
  useEffect(() => {
    if (authLoading) return;
    const q = collection(db, 'instituteRequests');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InstituteRequest));
      setInstituteRequests(requestList);
      setInstituteRequestsLoaded(true);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'instituteRequests');
      }
      setInstituteRequestsLoaded(true);
    });
    return () => unsubscribe();
  }, [authLoading]);

  // Handle Global Initialization State
  useEffect(() => {
    if (!authLoading && eventsLoaded && institutesLoaded && postsLoaded && instituteRequestsLoaded && organizationsLoaded) {
      setIsInitializing(false);
    } else {
      setIsInitializing(true);
    }
  }, [authLoading, eventsLoaded, organizationsLoaded, institutesLoaded, postsLoaded, instituteRequestsLoaded]);

  const login = async (targetRole?: UserRole) => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      if (targetRole) {
          setLoginIntent(targetRole);
          localStorage.setItem('campus_login_intent', targetRole);
      }
      setAuthLoading(true);
      const result = await signInWithPopup(auth, provider);
      // Proper cookie integration for session hint
      setCookie('campus_session', result.user.uid);
      toast.success("Welcome to Campus Pulse!");
    } catch (error: any) {
      setAuthLoading(false);
      setLoginIntent(null);
      localStorage.removeItem('campus_login_intent');
      if (error.code === 'auth/popup-closed-by-user') return;
      
      if (error.code === 'auth/network-request-failed') {
          toast.error("Network error. This is common in some restricted environments. Please try again or open the app in a New Tab.");
          console.error("Auth Network Error:", error);
          return;
      }

      if (error.code === 'auth/unauthorized-domain') {
          toast.error("Domain not authorized for login. If testing locally, please make sure you are accessing the app via http://localhost:3000 and NOT an IP address (like 127.0.0.1 or 192.168.x.x). Otherwise, add this domain in the Firebase Console -> Auth -> Settings -> Authorized domains.");
          console.error("Auth Unauthorized Domain Error:", error);
          return;
      }
      
      console.error("Login failed", error);
      toast.error(`Login failed: ${error.message || 'Please try again.'}`);
    }
  };

  const logout = async () => {
    try {
      setAuthLoading(true);
      await signOut(auth);
      eraseCookie('campus_session');
      // Clear data from memory
      setEvents([]);
      setRegistrations([]);
      setNotifications([]);
      setUsers([]);
      setOrganizations([]);
      setActiveRole(null);
      setLoginIntent(null);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Error signing out");
    } finally {
      setAuthLoading(false);
    }
  };

  const setRole = async (role: UserRole) => {
    if (!currentUser) return;
    
    // Safety check for Admin role - cannot self-promote to Admin
    if (role === UserRole.PLATFORM_ADMIN && currentUser.role !== UserRole.PLATFORM_ADMIN) {
      toast.error("Unauthorized: Admin status must be granted by the Dean.");
      return;
    }

    // Safety check for Organizer role
    if (role === UserRole.ORGANIZER && !currentUser.isApproved) {
        toast.info("You must be an approved Organizer to switch to this role. Please apply.");
        return;
    }

    const userDoc = doc(db, 'users', currentUser.id);
    try {
      const updates: any = { role };
      if (role !== UserRole.PLATFORM_ADMIN) {
        updates.status = 'active';
      }
      
      await updateDoc(userDoc, updates);
      toast.success(`Role updated to ${role}`);
      setActiveRole(role);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    if (currentUser?.role !== UserRole.PLATFORM_ADMIN) {
      toast.error("Unauthorized: Admin access required");
      return;
    }
    
    if (role === UserRole.PLATFORM_ADMIN) {
      toast.error("Action denied. There can only be one Admin.");
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), { 
          role, 
          isApproved: true,
          status: 'active' 
      });
      toast.success(`User role updated to ${role}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const updateUserStatus = async (userId: string, status: 'pending' | 'active' | 'suspended' | 'review') => {
    if (currentUser?.role !== UserRole.PLATFORM_ADMIN) {
        toast.error("Unauthorized: Admin access required");
        return;
    }
    try {
        await updateDoc(doc(db, 'users', userId), { 
            status,
            isApproved: status === 'active'
        });
        toast.success(`User status updated to ${status}`);
    } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const submitOnboarding = async (details: Partial<User>) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        ...details,
        onboardingComplete: true,
        status: 'active',
        isApproved: true
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  // ═══════════════════════════════════════════
  // Organization Functions
  // ═══════════════════════════════════════════

  const createOrganization = async (data: Partial<Organization>) => {
    if (!currentUser) { toast.error("Please login first"); return; }
    if (!data.name?.trim() || !data.description?.trim()) {
      toast.error("Organization name and description are required.");
      return;
    }
    const orgId = `org-${Math.random().toString(36).substr(2, 9)}`;
    const newOrg: Organization = {
      id: orgId,
      name: data.name.trim(),
      description: data.description.trim(),
      type: data.type || 'club',
      entityType: (data.entityType || data.type || 'club') as any,
      instituteId: data.instituteId || '',
      logo: data.logo || '',
      website: data.website || '',
      verificationDocuments: data.verificationDocuments || [],
      status: 'pending',
      joinPolicy: data.joinPolicy || 'open',
      ownerId: currentUser.id,
      members: [{ userId: currentUser.id, role: 'owner', joinedAt: new Date().toISOString() }],
      followerIds: [],
      joinRequests: [],
      createdAt: new Date().toISOString(),
      postCount: 0,
      tags: data.tags || [],
    };
    try {
      await setDoc(doc(db, 'organizations', orgId), newOrg);
      toast.success("Organization submitted for admin review!");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `organizations/${orgId}`);
    }
  };

  const approveOrganization = async (orgId: string) => {
    if (currentUser?.role !== UserRole.PLATFORM_ADMIN) { toast.error("Admin access required"); return; }
    try {
      const orgRef = doc(db, 'organizations', orgId);
      const orgSnap = await getDoc(orgRef);
      if (!orgSnap.exists()) { toast.error("Organization not found"); return; }
      const org = orgSnap.data() as Organization;
      await updateDoc(orgRef, { status: 'approved' });
      // Auto-promote owner to ORGANIZER
      const ownerRef = doc(db, 'users', org.ownerId);
      const ownerSnap = await getDoc(ownerRef);
      if (ownerSnap.exists()) {
        const ownerData = ownerSnap.data() as User;
        if (ownerData.role !== UserRole.PLATFORM_ADMIN) {
          await updateDoc(ownerRef, {
            role: UserRole.ORGANIZER,
            isApproved: true,
            status: 'active',
            organizationIds: arrayUnion(orgId)
          });
        }
      }
      toast.success(`"${org.name}" has been approved!`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const rejectOrganization = async (orgId: string, reason?: string) => {
    if (currentUser?.role !== UserRole.PLATFORM_ADMIN) { toast.error("Admin access required"); return; }
    try {
      const updates: any = { status: 'rejected' };
      if (reason?.trim()) updates.rejectionReason = reason.trim();
      await updateDoc(doc(db, 'organizations', orgId), updates);
      toast.success("Organization rejected.");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const suspendOrganization = async (orgId: string) => {
    if (currentUser?.role !== UserRole.PLATFORM_ADMIN) { toast.error("Admin access required"); return; }
    try {
      await updateDoc(doc(db, 'organizations', orgId), { status: 'suspended' });
      toast.success("Organization suspended.");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const reactivateOrganization = async (orgId: string) => {
    if (currentUser?.role !== UserRole.PLATFORM_ADMIN) { toast.error("Admin access required"); return; }
    try {
      await updateDoc(doc(db, 'organizations', orgId), { status: 'approved', rejectionReason: '' });
      toast.success("Organization reactivated!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const joinOrganization = async (orgId: string) => {
    if (!currentUser) { toast.error("Please login first"); return; }
    const org = organizations.find(o => o.id === orgId);
    if (!org) { toast.error("Organization not found"); return; }
    if (org.status !== 'approved') { toast.error("This organization is not active"); return; }
    if (org.members?.some(m => m.userId === currentUser.id)) { toast.error("You're already a member"); return; }

    try {
      const orgRef = doc(db, 'organizations', orgId);
      if (org.joinPolicy === 'open') {
        const newMember: OrgMember = { userId: currentUser.id, role: 'member', joinedAt: new Date().toISOString() };
        await updateDoc(orgRef, { members: arrayUnion(newMember) });
        await updateDoc(doc(db, 'users', currentUser.id), { organizationIds: arrayUnion(orgId) });
        toast.success(`Joined "${org.name}"!`);
      } else if (org.joinPolicy === 'approval_required') {
        if (org.joinRequests?.includes(currentUser.id)) { toast.info("You've already requested to join"); return; }
        await updateDoc(orgRef, { joinRequests: arrayUnion(currentUser.id) });
        toast.success("Join request sent! Waiting for admin approval.");
      } else {
        toast.info("This organization is invite-only.");
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const leaveOrganization = async (orgId: string) => {
    if (!currentUser) return;
    const org = organizations.find(o => o.id === orgId);
    if (!org) { toast.error("Organization not found"); return; }
    if (org.ownerId === currentUser.id) { toast.error("Owners cannot leave. Transfer ownership first."); return; }

    const memberEntry = org.members?.find(m => m.userId === currentUser.id);
    if (!memberEntry) { toast.error("You're not a member"); return; }

    try {
      await updateDoc(doc(db, 'organizations', orgId), { members: arrayRemove(memberEntry) });
      await updateDoc(doc(db, 'users', currentUser.id), { organizationIds: arrayRemove(orgId) });
      toast.success(`Left "${org.name}".`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const handleJoinRequest = async (orgId: string, userId: string, accept: boolean) => {
    if (!currentUser) return;
    const org = organizations.find(o => o.id === orgId);
    if (!org) { toast.error("Organization not found"); return; }
    const isOrgAdmin = org.members?.some(m => m.userId === currentUser.id && (m.role === 'owner' || m.role === 'admin'));
    if (!isOrgAdmin && currentUser.role !== UserRole.PLATFORM_ADMIN) { toast.error("Unauthorized"); return; }

    try {
      const orgRef = doc(db, 'organizations', orgId);
      await updateDoc(orgRef, { joinRequests: arrayRemove(userId) });
      if (accept) {
        const newMember: OrgMember = { userId, role: 'member', joinedAt: new Date().toISOString() };
        await updateDoc(orgRef, { members: arrayUnion(newMember) });
        await updateDoc(doc(db, 'users', userId), { organizationIds: arrayUnion(orgId) });
        toast.success("Member accepted!");
      } else {
        toast.success("Request denied.");
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const addOrgMember = async (orgId: string, userId: string, role: OrgMemberRole) => {
    if (!currentUser) return;
    const org = organizations.find(o => o.id === orgId);
    if (!org) { toast.error("Organization not found"); return; }
    const callerMember = org.members?.find(m => m.userId === currentUser.id);
    if (!callerMember || (callerMember.role !== 'owner' && callerMember.role !== 'admin')) {
      if (currentUser.role !== UserRole.PLATFORM_ADMIN) { toast.error("Only org admins can add members"); return; }
    }
    if (org.members?.some(m => m.userId === userId)) { toast.error("User is already a member"); return; }

    try {
      const newMember: OrgMember = { userId, role, joinedAt: new Date().toISOString() };
      await updateDoc(doc(db, 'organizations', orgId), { members: arrayUnion(newMember) });
      const updates: any = { organizationIds: arrayUnion(orgId) };
      // Auto-promote to ORGANIZER if they're becoming an admin/owner
      if (role === 'admin' || role === 'owner') {
        const targetSnap = await getDoc(doc(db, 'users', userId));
        if (targetSnap.exists() && targetSnap.data().role !== UserRole.PLATFORM_ADMIN) {
          updates.role = UserRole.ORGANIZER;
          updates.isApproved = true;
          updates.status = 'active';
        }
      }
      await updateDoc(doc(db, 'users', userId), updates);
      toast.success("Member added!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const removeOrgMember = async (orgId: string, userId: string) => {
    if (!currentUser) return;
    const org = organizations.find(o => o.id === orgId);
    if (!org) { toast.error("Organization not found"); return; }
    if (userId === org.ownerId) { toast.error("Cannot remove the owner"); return; }
    const callerMember = org.members?.find(m => m.userId === currentUser.id);
    if (!callerMember || callerMember.role === 'member') {
      if (currentUser.role !== UserRole.PLATFORM_ADMIN) { toast.error("Unauthorized"); return; }
    }
    // Admins can only be removed by owners
    const targetMember = org.members?.find(m => m.userId === userId);
    if (!targetMember) { toast.error("User is not a member"); return; }
    if (targetMember.role === 'admin' && callerMember?.role !== 'owner' && currentUser.role !== UserRole.PLATFORM_ADMIN) {
      toast.error("Only the owner can remove admins"); return;
    }

    try {
      await updateDoc(doc(db, 'organizations', orgId), { members: arrayRemove(targetMember) });
      await updateDoc(doc(db, 'users', userId), { organizationIds: arrayRemove(orgId) });
      toast.success("Member removed.");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const updateOrgMemberRole = async (orgId: string, userId: string, newRole: OrgMemberRole) => {
    if (!currentUser) return;
    const org = organizations.find(o => o.id === orgId);
    if (!org) { toast.error("Organization not found"); return; }
    // Only owner can change roles
    if (org.ownerId !== currentUser.id && currentUser.role !== UserRole.PLATFORM_ADMIN) {
      toast.error("Only the organization owner can change member roles"); return;
    }
    const targetMember = org.members?.find(m => m.userId === userId);
    if (!targetMember) { toast.error("User is not a member"); return; }

    try {
      const updatedMembers = org.members.map(m => m.userId === userId ? { ...m, role: newRole } : m);
      await updateDoc(doc(db, 'organizations', orgId), { members: updatedMembers });
      // If promoting to admin, bump their global role
      if (newRole === 'admin' || newRole === 'owner') {
        const targetSnap = await getDoc(doc(db, 'users', userId));
        if (targetSnap.exists() && targetSnap.data().role !== UserRole.PLATFORM_ADMIN) {
          await updateDoc(doc(db, 'users', userId), { role: UserRole.ORGANIZER, isApproved: true, status: 'active' });
        }
      }
      toast.success(`Role updated to ${newRole}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const followOrganization = async (orgId: string) => {
    if (!currentUser) { toast.error("Please login first"); return; }
    try {
      await updateDoc(doc(db, 'organizations', orgId), { followerIds: arrayUnion(currentUser.id) });
      await updateDoc(doc(db, 'users', currentUser.id), { followedOrgIds: arrayUnion(orgId) });
      toast.success("Following organization!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const unfollowOrganization = async (orgId: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'organizations', orgId), { followerIds: arrayRemove(currentUser.id) });
      await updateDoc(doc(db, 'users', currentUser.id), { followedOrgIds: arrayRemove(orgId) });
      toast.success("Unfollowed organization.");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const updateOrganization = async (orgId: string, data: Partial<Organization>) => {
    if (!currentUser) return;
    const org = organizations.find(o => o.id === orgId);
    if (!org) { toast.error("Organization not found"); return; }
    const callerMember = org.members?.find(m => m.userId === currentUser.id);
    if (!callerMember || callerMember.role === 'member') {
      if (currentUser.role !== UserRole.PLATFORM_ADMIN) { toast.error("Only org admins can edit settings"); return; }
    }
    try {
      // Don't allow overwriting critical fields
      const { id, ownerId, members, status, ...safeData } = data as any;
      await updateDoc(doc(db, 'organizations', orgId), safeData);
      toast.success("Organization updated!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `organizations/${orgId}`);
    }
  };

  const registerForEvent = async (eventId: string) => {
    if (!currentUser) {
      toast.error("Please login to register");
      return;
    }
    
    const alreadyRegistered = registrations.some(r => r.eventId === eventId && r.userEmail === currentUser.email);
    if (alreadyRegistered) {
      toast.error("You're already registered!");
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) {
      toast.error("Event not found or has been removed.");
      return;
    }
    if (event.registeredCount >= event.capacity) {
      toast.error("This event is full!");
      return;
    }

    const regId = `${currentUser.id}_${eventId}`;
    const newReg: Registration = {
      id: regId,
      eventId,
      userEmail: currentUser.email,
      userName: currentUser.name,
      organizerEmail: event.organizerEmail,
      timestamp: new Date().toISOString(),
      checkedIn: false,
      qrCode: `qr-${eventId}-${currentUser.id}`,
    };

    try {
      await runTransaction(db, async (transaction) => {
        const eventDocRef = doc(db, 'events', eventId);
        const eventDoc = await transaction.get(eventDocRef);
        if (!eventDoc.exists()) throw new Error("Event does not exist");
        
        const currentData = eventDoc.data() as CampusEvent;
        if (currentData.registeredCount >= currentData.capacity) throw new Error("Event is full");

        transaction.set(doc(db, 'registrations', regId), newReg);
        transaction.update(eventDocRef, { registeredCount: currentData.registeredCount + 1 });
      });
      toast.success("Successfully registered!");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `events/${eventId}/registrations`);
    }
  };

  const checkInUser = async (eventId: string, userEmail: string): Promise<boolean> => {
    const reg = registrations.find(r => r.eventId === eventId && r.userEmail === userEmail);
    if (!reg) {
      toast.error("No registration found");
      return false;
    }
    
    if (reg.checkedIn) {
      toast.warning("Already checked in");
      return false;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const regDocRef = doc(db, 'registrations', reg.id);
        const eventDocRef = doc(db, 'events', eventId);
        const eventDoc = await transaction.get(eventDocRef);
        
        transaction.update(regDocRef, { checkedIn: true });
        if (eventDoc.exists()) {
          const currentEvent = eventDoc.data() as CampusEvent;
          transaction.update(eventDocRef, { checkedInCount: (currentEvent.checkedInCount || 0) + 1 });
        }
      });
      toast.success("Check-in successful!");
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `registrations/${reg.id}`);
      return false;
    }
  };

  const addEvent = async (eventData: any) => {
    const newId = `e-${Math.random().toString(36).substr(2, 9)}`;
    // Single source of truth for image: assets.bannerUrl drives imageUrl
    const bannerUrl = eventData.assets?.bannerUrl || eventData.imageUrl || '';
    const logoUrl = eventData.assets?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${eventData.title.slice(0, 3)}`;
    
    const newEvent: any = {
      ...eventData,
      id: newId,
      organizerId: currentUser?.id,
      registeredCount: 0,
      checkedInCount: 0,
      status: EventStatus.APPROVED,
      imageUrl: bannerUrl,
      assets: { bannerUrl, logoUrl },
      type: eventData.type || PostType.EVENT,
      createdAt: new Date().toISOString(),
    };
    
    try {
      await setDoc(doc(db, 'events', newId), newEvent);
      toast.success("Post created successfully!");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `events/${newId}`);
    }
  };

  const updateEvent = async (updatedEvent: CampusEvent) => {
    const isOrganizer = currentUser?.role === UserRole.ORGANIZER && updatedEvent.organizerEmail === currentUser?.email;
    if (currentUser?.role !== UserRole.PLATFORM_ADMIN && !isOrganizer) {
      toast.error("Unauthorized: You can only edit your own events.");
      return;
    }

    // Sync imageUrl with assets.bannerUrl if latter exists
    const eventToSave = {
      ...updatedEvent,
      imageUrl: updatedEvent.assets?.bannerUrl || updatedEvent.imageUrl
    };

    try {
      await updateDoc(doc(db, 'events', updatedEvent.id), eventToSave as any);
      toast.success("Event updated!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `events/${updatedEvent.id}`);
    }
  };

  const moderateEvent = async (eventId: string, status: EventStatus) => {
    if (currentUser?.role !== UserRole.PLATFORM_ADMIN) {
      toast.error("Unauthorized: Admin access required");
      return;
    }
    try {
      await updateDoc(doc(db, 'events', eventId), { status });
      toast.success(`Event ${status === EventStatus.APPROVED ? 'approved' : status === EventStatus.REJECTED ? 'rejected' : 'reset to pending'}`);
      
      // Optionally notify organizer
      const event = events.find(e => e.id === eventId);
      if (event && status !== EventStatus.PENDING) {
        const organizer = users.find(u => u.email === event.organizerEmail);
        if (organizer) {
          const notifId = `n-${Math.random().toString(36).substr(2, 9)}`;
          await setDoc(doc(db, 'notifications', notifId), {
            id: notifId,
            userId: organizer.id,
            type: NotificationType.SYSTEM,
            title: status === EventStatus.APPROVED ? 'Event Approved' : 'Event Moderation',
            message: status === EventStatus.APPROVED 
              ? `Your event "${event.title}" has been approved and is now live!` 
              : `Your event "${event.title}" has been rejected. Please review our guidelines.`,
            timestamp: new Date().toISOString(),
            read: false,
            eventId
          });
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `events/${eventId}`);
    }
  };

  const deleteEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const isOrganizer = currentUser?.role === UserRole.ORGANIZER && event.organizerEmail === currentUser?.email;
    if (currentUser?.role !== UserRole.PLATFORM_ADMIN && !isOrganizer) {
      toast.error("Unauthorized: You can only delete your own events.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'events', eventId));
      toast.success("Event successfully deleted.");
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `events/${eventId}`);
    }
  };

  const cancelRegistration = async (registrationId: string) => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return;

    try {
      await runTransaction(db, async (transaction) => {
        const regDocRef = doc(db, 'registrations', registrationId);
        const eventDocRef = doc(db, 'events', reg.eventId);
        const eventDoc = await transaction.get(eventDocRef);

        transaction.delete(regDocRef);
        if (eventDoc.exists()) {
          const currentData = eventDoc.data() as CampusEvent;
          transaction.update(eventDocRef, { 
            registeredCount: Math.max(0, currentData.registeredCount - 1) 
          });
        }
      });
      toast.success("Registration cancelled");
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `registrations/${registrationId}`);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const clearNotifications = async () => {
    try {
      const deletePromises = notifications.map(n => deleteDoc(doc(db, 'notifications', n.id)));
      await Promise.all(deletePromises);
      toast.success("Notifications cleared");
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `notifications`);
    }
  };

  const toggleBookmark = async (eventId: string) => {
    if (!currentUser) {
      toast.error("Please login to bookmark events");
      return;
    }

    const currentBookmarks = currentUser.bookmarkedEvents || [];
    const isBookmarked = currentBookmarks.includes(eventId);
    const newBookmarks = isBookmarked 
      ? currentBookmarks.filter(id => id !== eventId) 
      : [...currentBookmarks, eventId];

    try {
      await updateDoc(doc(db, 'users', currentUser.id), { 
        bookmarkedEvents: newBookmarks 
      });
      toast.success(isBookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  const toggleLike = async (eventId: string) => {
    if (!currentUser) {
      toast.error("Please login to like events");
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const currentLikes = event.likes || [];
    const isLiked = currentLikes.includes(currentUser.id);
    const newLikes = isLiked 
      ? currentLikes.filter(id => id !== currentUser.id) 
      : [...currentLikes, currentUser.id];

    try {
      await updateDoc(doc(db, 'events', eventId), { 
        likes: newLikes 
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `events/${eventId}`);
    }
  };

  const toggleFollow = async (targetUserId: string) => {
    if (!targetUserId || !currentUser) {
      if (!currentUser) toast.error("Please login to follow users");
      return;
    }
    if (currentUser.id === targetUserId) return;

    const isFollowing = currentUser.following?.includes(targetUserId);
    const targetUser = users.find(u => u.id === targetUserId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const currentUserRef = doc(db, 'users', currentUser.id);
        const targetUserRef = doc(db, 'users', targetUserId);

        const newFollowing = isFollowing 
          ? (currentUser.following || []).filter(id => id !== targetUserId)
          : [...(currentUser.following || []), targetUserId];

        const newFollowers = isFollowing
          ? (targetUser?.followers || []).filter(id => id !== currentUser.id)
          : [...(targetUser?.followers || []), currentUser.id];

        transaction.update(currentUserRef, { following: newFollowing });
        transaction.update(targetUserRef, { followers: newFollowers });
      });
      toast.success(isFollowing ? "Unfollowed user" : "Following user");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${targetUserId}/follow`);
    }
  };

  const addComment = async (eventId: string, text: string) => {
    if (!currentUser) {
      toast.error("Please login to comment");
      return;
    }

    const commentId = `c-${Math.random().toString(36).substr(2, 9)}`;
    const newComment = {
      id: commentId,
      eventId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text,
      createdAt: new Date().toISOString()
    };

    try {
      await runTransaction(db, async (transaction) => {
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await transaction.get(eventRef);
        
        if (!eventDoc.exists()) throw new Error("Event not found");
        
        const currentCount = (eventDoc.data() as CampusEvent).commentCount || 0;
        
        transaction.set(doc(db, 'comments', commentId), newComment);
        transaction.update(eventRef, { commentCount: currentCount + 1 });
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `events/${eventId}/comments`);
    }
  };

  const createInstitute = async (data: Partial<Institute>) => {
    if (!currentUser || currentUser.role !== UserRole.PLATFORM_ADMIN) throw new Error("Unauthorized");
    try {
      const newRef = doc(collection(db, 'institutes'));
      await setDoc(newRef, {
        ...data,
        id: newRef.id,
        createdAt: serverTimestamp(),
      });
      toast.success("Institute created successfully");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'institutes');
      throw e;
    }
  };

  const updateInstitute = async (id: string, data: Partial<Institute>) => {
    if (!currentUser) throw new Error("Must be logged in");
    try {
      const ref = doc(db, 'institutes', id);
      await updateDoc(ref, data);
      toast.success("Institute updated successfully");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'institutes');
      throw e;
    }
  };

  // ──────── Institute Onboarding Requests ────────

  const submitInstituteRequest = async (data: { instituteName: string; state?: string; district?: string; city?: string; reason: string }) => {
    if (!currentUser) throw new Error("Must be logged in");
    try {
      const newRef = doc(collection(db, 'instituteRequests'));
      await setDoc(newRef, {
        id: newRef.id,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requesterEmail: currentUser.email,
        instituteName: data.instituteName,
        state: data.state || '',
        district: data.district || '',
        city: data.city || '',
        reason: data.reason,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast.success("Institute onboarding request submitted! An admin will review it shortly.");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'instituteRequests');
      throw e;
    }
  };

  const approveInstituteRequest = async (requestId: string, instituteData: Partial<Institute>) => {
    if (!currentUser || currentUser.role !== UserRole.PLATFORM_ADMIN) throw new Error("Unauthorized");
    try {
      // 1. Create the institute
      const newInstRef = doc(collection(db, 'institutes'));
      await setDoc(newInstRef, {
        ...instituteData,
        id: newInstRef.id,
        createdAt: serverTimestamp(),
      });

      // 2. Update the request
      const reqRef = doc(db, 'instituteRequests', requestId);
      await updateDoc(reqRef, {
        status: 'approved',
        reviewedBy: currentUser.id,
        reviewedAt: new Date().toISOString(),
        instituteId: newInstRef.id,
      });

      toast.success("Institute request approved & institute created!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'instituteRequests');
      throw e;
    }
  };

  const rejectInstituteRequest = async (requestId: string, reviewNote?: string) => {
    if (!currentUser || currentUser.role !== UserRole.PLATFORM_ADMIN) throw new Error("Unauthorized");
    try {
      const reqRef = doc(db, 'instituteRequests', requestId);
      await updateDoc(reqRef, {
        status: 'rejected',
        reviewedBy: currentUser.id,
        reviewedAt: new Date().toISOString(),
        reviewNote: reviewNote || '',
      });
      toast.success("Institute request rejected.");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'instituteRequests');
      throw e;
    }
  };

  const createPost = async (postData: Partial<AnyPost>) => {
    if (!currentUser) throw new Error("Must be logged in to post");
    try {
      const newRef = doc(collection(db, 'posts'));
      
      const newPost = {
        ...postData,
        id: newRef.id,
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        organizerEmail: currentUser.email,
        createdAt: serverTimestamp(),
      };

      await setDoc(newRef, newPost);
      toast.success("Post created successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
      throw error;
    }
  };

  const updatePost = async (postId: string, postData: Partial<AnyPost>) => {
    if (!currentUser) throw new Error("Must be logged in");
    try {
      const ref = doc(db, 'posts', postId);
      await updateDoc(ref, postData);
      toast.success("Post updated successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'posts');
      throw error;
    }
  };

  const moderatePost = async (postId: string, status: PostStatus, rejectionReason?: string) => {
    if (!currentUser || (currentUser.role !== UserRole.PLATFORM_ADMIN && currentUser.role !== UserRole.AMBASSADOR)) {
      throw new Error("Unauthorized to moderate posts");
    }
    try {
      const updateData: any = { status };
      if (status === 'approved' || status === 'rejected') {
        updateData.approvedBy = currentUser.id;
        updateData.approvedAt = serverTimestamp();
      }
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      await updateDoc(doc(db, 'posts', postId), updateData);
      toast.success(`Post ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'posts');
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      events, 
      registrations, 
      notifications,
      users,
      organizations,
      myOrganizations,
      institutes,
      posts,
      instituteRequests,
      authLoading,
      isInitializing,
      loadingProgress,
      activeRole,
      setActiveRole,
      login,
      logout,
      setRole,
      updateUserRole,
      registerForEvent, 
      checkInUser,
      addEvent,
      updateEvent,
      moderateEvent,
      deleteEvent,
      updateUserStatus,
      submitOnboarding,
      createOrganization,
      approveOrganization,
      rejectOrganization,
      suspendOrganization,
      reactivateOrganization,
      joinOrganization,
      leaveOrganization,
      handleJoinRequest,
      addOrgMember,
      removeOrgMember,
      updateOrgMemberRole,
      followOrganization,
      unfollowOrganization,
      updateOrganization,
      cancelRegistration,
      markNotificationAsRead,
      clearNotifications,
      toggleBookmark,
      toggleLike,
      toggleFollow,
      addComment,
      createInstitute,
      updateInstitute,
      createPost,
      updatePost,
      moderatePost,
      submitInstituteRequest,
      approveInstituteRequest,
      rejectInstituteRequest
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
