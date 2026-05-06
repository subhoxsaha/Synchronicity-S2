import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CampusEvent, Registration, UserRole, Notification, NotificationType } from '../types';
import { MOCK_USERS, MOCK_EVENTS, MOCK_REGISTRATIONS } from '../lib/mockData';
import { toast } from 'sonner';

interface AppContextType {
  currentUser: User | null;
  events: CampusEvent[];
  registrations: Registration[];
  notifications: Notification[];
  setRole: (role: UserRole) => void;
  registerForEvent: (eventId: string) => void;
  checkInUser: (eventId: string, userEmail: string) => boolean;
  addEvent: (event: Omit<CampusEvent, 'id' | 'registeredCount' | 'checkedInCount'>) => void;
  updateEvent: (event: CampusEvent) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [events, setEvents] = useState<CampusEvent[]>(MOCK_EVENTS);
  const [registrations, setRegistrations] = useState<Registration[]>(MOCK_REGISTRATIONS);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Persistence (localStorage)
  useEffect(() => {
    const savedEvents = localStorage.getItem('cp_events');
    const savedRegs = localStorage.getItem('cp_registrations');
    const savedNotifs = localStorage.getItem('cp_notifications');
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedRegs) setRegistrations(JSON.parse(savedRegs));
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
  }, []);

  useEffect(() => {
    localStorage.setItem('cp_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('cp_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('cp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Logic to generate notifications
  useEffect(() => {
    if (!currentUser || currentUser.role !== UserRole.STUDENT) return;

    const newNotifs: Notification[] = [];

    // 1. Upcoming Events (Registered and within 24h)
    registrations.forEach(reg => {
      if (reg.userEmail === currentUser.email) {
        const event = events.find(e => e.id === reg.eventId);
        if (event) {
          const eventTime = new Date(event.date).getTime();
          const now = new Date().getTime();
          const dayInMs = 24 * 60 * 60 * 1000;
          
          if (eventTime > now && eventTime - now < dayInMs) {
            const notifId = `upcoming-${event.id}`;
            if (!notifications.some(n => n.id === notifId)) {
              newNotifs.push({
                id: notifId,
                userId: currentUser.id,
                type: NotificationType.UPCOMING_EVENT,
                title: 'Upcoming Event!',
                message: `"${event.title}" is happening in less than 24 hours at ${event.location}.`,
                timestamp: new Date().toISOString(),
                read: false,
                eventId: event.id
              });
            }
          }
        }
      }
    });

    // 2. New Events Matching Interests (Mock logic: matches one of user interests)
    if (currentUser.interests) {
      events.forEach(event => {
        const matchesInterest = (event.category as string[]).some(cat => currentUser.interests?.includes(cat));
        if (matchesInterest) {
          const notifId = `match-${event.id}`;
          if (!notifications.some(n => n.id === notifId)) {
            newNotifs.push({
              id: notifId,
              userId: currentUser.id,
              type: NotificationType.NEW_EVENT,
              title: 'Recommended for You',
              message: `A new event "${event.title}" matches your interest in ${event.category[0]}.`,
              timestamp: new Date().toISOString(),
              read: false,
              eventId: event.id
            });
          }
        }
      });
    }

    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev]);
    }
  }, [currentUser, events, registrations]);

  const setRole = (role: UserRole) => {
    const user = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    setCurrentUser(user);
    toast.success(`Switched to ${role} view`);
  };

  const registerForEvent = (eventId: string) => {
    if (!currentUser) return;
    
    const alreadyRegistered = registrations.some(r => r.eventId === eventId && r.userEmail === currentUser.email);
    if (alreadyRegistered) {
      toast.error("You're already registered for this event!");
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (event && event.registeredCount >= event.capacity) {
      toast.error("This event is full!");
      return;
    }

    const newReg: Registration = {
      id: `r-${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      userEmail: currentUser.email,
      timestamp: new Date().toISOString(),
      checkedIn: false,
      qrCode: `qr-${eventId}-${currentUser.id}`,
    };

    setRegistrations([...registrations, newReg]);
    setEvents(events.map(e => e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e));
    toast.success("Successfully registered!");
  };

  const checkInUser = (eventId: string, userEmail: string): boolean => {
    const regIndex = registrations.findIndex(r => r.eventId === eventId && r.userEmail === userEmail);
    if (regIndex === -1) {
      toast.error("No registration found for this user");
      return false;
    }
    
    if (registrations[regIndex].checkedIn) {
      toast.warning("User already checked in");
      return false;
    }

    const newRegs = [...registrations];
    newRegs[regIndex].checkedIn = true;
    setRegistrations(newRegs);

    setEvents(events.map(e => e.id === eventId ? { ...e, checkedInCount: e.checkedInCount + 1 } : e));
    toast.success("Check-in successful!");
    return true;
  };

  const addEvent = (eventData: Omit<CampusEvent, 'id' | 'registeredCount' | 'checkedInCount'>) => {
    const newEvent: CampusEvent = {
      ...eventData,
      id: `e-${Math.random().toString(36).substr(2, 9)}`,
      registeredCount: 0,
      checkedInCount: 0,
    };
    setEvents([...events, newEvent]);
    toast.success("Event created successfully!");
  };

  const updateEvent = (updatedEvent: CampusEvent) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    toast.success("Event updated!");
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      events, 
      registrations, 
      notifications,
      setRole, 
      registerForEvent, 
      checkInUser,
      addEvent,
      updateEvent,
      markNotificationAsRead,
      clearNotifications
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
