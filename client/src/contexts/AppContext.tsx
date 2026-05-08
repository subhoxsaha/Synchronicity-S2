import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CampusEvent, Registration, UserRole, Notification, NotificationType, EventCategory, EventStatus } from '../types';
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
  deleteDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { setCookie, eraseCookie } from '../lib/cookies';

interface AppContextType {
  currentUser: User | null;
  events: CampusEvent[];
  registrations: Registration[];
  notifications: Notification[];
  users: User[];
  authLoading: boolean;
  loadingProgress: number;
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole) => void;
  login: (targetRole?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, status: 'pending' | 'active' | 'suspended' | 'review') => Promise<void>;
  submitOnboarding: (details: Partial<User>) => Promise<void>;
  registerForEvent: (eventId: string) => Promise<void>;
  checkInUser: (eventId: string, userEmail: string) => Promise<boolean>;
  addEvent: (event: Omit<CampusEvent, 'id' | 'registeredCount' | 'checkedInCount' | 'status'>) => Promise<void>;
  updateEvent: (event: CampusEvent) => Promise<void>;
  moderateEvent: (eventId: string, status: EventStatus) => Promise<void>;
  cancelRegistration: (registrationId: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  toggleBookmark: (eventId: string) => Promise<void>;
  toggleLike: (eventId: string) => Promise<void>;
  toggleFollow: (targetUserId: string) => Promise<void>;
  addComment: (eventId: string, text: string) => Promise<void>;
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
              
              const bootstrappedAdmins = ['subhoxsaha@gmail.com', 'ashimasaha87759@gmail.com', 'subhrajit.saha.work@gmail.com'];
              if (bootstrappedAdmins.includes(userData.email) && userData.role !== UserRole.ADMIN) {
                  updateDoc(userDoc, { role: UserRole.ADMIN, status: 'active', isApproved: true });
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
              const isBootstrappedAdmin = ['subhoxsaha@gmail.com', 'ashimasaha87759@gmail.com', 'subhrajit.saha.work@gmail.com'].includes(firebaseUser.email || '');
              const savedIntent = localStorage.getItem('campus_login_intent') as UserRole | null;
              const role = isBootstrappedAdmin ? UserRole.ADMIN : (savedIntent || UserRole.STUDENT);
              
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

  // Events Listener
  useEffect(() => {
    const q = collection(db, 'events');
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CampusEvent));
      setEvents(eventList);

      // Seed initial data if empty
      if (snapshot.empty && currentUser?.role === UserRole.ADMIN) {
        const initialEvents: Omit<CampusEvent, 'id' | 'registeredCount' | 'checkedInCount' | 'status'>[] = [
          {
            title: "Tech Innovation Summit 2026",
            description: "Join us for the biggest tech event on campus. Learn about AI, Web3, and future technologies from industry experts.",
            organizerEmail: currentUser.email,
            organizerName: "Tech Hub",
            category: [EventCategory.TECH, EventCategory.WORKSHOP],
            date: new Date(Date.now() + 86400000 * 2).toISOString(),
            location: "Main Innovation Center",
            capacity: 200,
            imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200",
            assets: {
                bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200",
                logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Tech"
            },
            tags: ["AI", "Future", "Innovation"],
            coordinates: { lat: 37.4275, lng: -122.1697 }
          },
          {
             title: "Midnight Jazz Festival",
             description: "Smooth jazz, great vibes, and late-night coffee. The perfect way to unwind under the stars.",
             organizerEmail: currentUser.email,
             organizerName: "Arts Council",
             category: [EventCategory.MUSIC, EventCategory.SOCIAL],
             date: new Date(Date.now() + 86400000 * 3).toISOString(),
             location: "Starlight Garden",
             capacity: 100,
             imageUrl: "https://images.unsplash.com/photo-1514525253361-bee8d4884cff?q=80&w=1200",
             assets: {
                bannerUrl: "https://images.unsplash.com/photo-1514525253361-bee8d4884cff?q=80&w=1200",
                logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Jazz"
             },
             tags: ["Music", "Jazz", "Vibes"],
             coordinates: { lat: 37.4290, lng: -122.1720 }
          }
        ];
        
        for (const event of initialEvents) {
          const id = `e-${Math.random().toString(36).substr(2, 9)}`;
          setDoc(doc(db, 'events', id), { ...event, id, registeredCount: 0, checkedInCount: 0, status: EventStatus.APPROVED })
            .catch(e => console.error("Seeding failed", e));
        }
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'events'));

    return () => unsubscribe();
  }, [currentUser]);

  // Registrations Listener (Filtered by user if not admin/organizer)
  useEffect(() => {
    if (authLoading || !currentUser) {
      setRegistrations([]);
      return;
    }

    let q;
    try {
      if (currentUser.role === UserRole.ADMIN) {
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

  // Users Listener (For Social Discovery)
  useEffect(() => {
    if (authLoading || !currentUser) {
      setUsers([]);
      return;
    }

    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => doc.data() as User);
      setUsers(userList);
    }, (error) => {
      if (auth.currentUser?.email === currentUser?.email) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    });

    return () => unsubscribe();
  }, [currentUser, authLoading]);

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
    if (role === UserRole.ADMIN && currentUser.role !== UserRole.ADMIN) {
      toast.error("Unauthorized: Admin status must be granted by the Dean.");
      return;
    }

    const userDoc = doc(db, 'users', currentUser.id);
    try {
      const updates: any = { role };
      if (role === UserRole.ORGANIZER && !currentUser.isApproved) {
        updates.status = 'pending';
        updates.isApproved = false;
        toast.info("Organizer application submitted! Please wait for approval.");
      } else if (role !== UserRole.ADMIN) {
        // Switching back to student/regular from organizer
        updates.status = 'active';
      }
      
      await updateDoc(userDoc, updates);
      if (role !== UserRole.ORGANIZER || currentUser.isApproved) {
          toast.success(`Role updated to ${role}`);
      }
      setActiveRole(role);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    if (currentUser?.role !== UserRole.ADMIN) {
      toast.error("Unauthorized: Admin access required");
      return;
    }
    try {
      const isApproved = role !== UserRole.ORGANIZER; // Auto-approve others
      await updateDoc(doc(db, 'users', userId), { 
          role, 
          isApproved,
          status: isApproved ? 'active' : 'pending' 
      });
      toast.success(`User role updated to ${role}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const updateUserStatus = async (userId: string, status: 'pending' | 'active' | 'suspended' | 'review') => {
    if (currentUser?.role !== UserRole.ADMIN) {
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
        status: 'review',
        isApproved: false
      });
      toast.success("Application submitted for review!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.id}`);
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
    if (event && event.registeredCount >= event.capacity) {
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

  const addEvent = async (eventData: Omit<CampusEvent, 'id' | 'registeredCount' | 'checkedInCount' | 'status'>) => {
    const newId = `e-${Math.random().toString(36).substr(2, 9)}`;
    const newEvent: CampusEvent = {
      ...eventData,
      id: newId,
      organizerId: currentUser?.id,
      registeredCount: 0,
      checkedInCount: 0,
      status: currentUser?.role === UserRole.ADMIN ? EventStatus.APPROVED : EventStatus.PENDING,
      // Ensure assets structure is solid
      assets: {
        bannerUrl: eventData.imageUrl || eventData.assets?.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200",
        logoUrl: eventData.assets?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${eventData.title.slice(0, 3)}`
      },
      imageUrl: eventData.imageUrl || eventData.assets?.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200"
    };
    
    try {
      await setDoc(doc(db, 'events', newId), newEvent);
      toast.success("Event created successfully!");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `events/${newId}`);
    }
  };

  const updateEvent = async (updatedEvent: CampusEvent) => {
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
    if (currentUser?.role !== UserRole.ADMIN) {
      toast.error("Unauthorized: Admin access required");
      return;
    }
    try {
      await updateDoc(doc(db, 'events', eventId), { status });
      toast.success(`Event ${status === EventStatus.APPROVED ? 'approved' : 'rejected'}`);
      
      // Optionally notify organizer
      const event = events.find(e => e.id === eventId);
      if (event) {
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

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      events, 
      registrations, 
      notifications,
      users,
      authLoading,
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
      updateUserStatus,
      submitOnboarding,
      cancelRegistration,
      markNotificationAsRead,
      clearNotifications,
      toggleBookmark,
      toggleLike,
      toggleFollow,
      addComment
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
