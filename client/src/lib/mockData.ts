import { CampusEvent, EventCategory, User, UserRole, Registration, EventStatus, PostType } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Student',
    email: 'alex@college.edu',
    role: UserRole.STUDENT,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    major: 'Computer Science',
    year: 'Junior',
    interests: ['Tech', 'Workshop', 'Free Food'],
    badges: ['Tech Bro', 'Early Bird'],
    attendanceStreak: 5,
  },
  {
    id: 'u2',
    name: 'Sarah Organizer',
    email: 'sarah@college.edu',
    role: UserRole.ORGANIZER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: 'u3',
    name: 'Dean Admin',
    email: 'dean@college.edu',
    role: UserRole.PLATFORM_ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dean',
  }
];

export const MOCK_EVENTS: CampusEvent[] = [
  {
    id: 'e1',
    type: PostType.EVENT,
    title: 'Code & Coffee: React Native Workshop',
    description: 'Learn how to build cross-platform mobile apps with React Native. Free coffee provided!',
    organizerEmail: 'sarah@college.edu',
    organizerName: 'Sarah Organizer',
    category: [EventCategory.TECH, EventCategory.WORKSHOP, EventCategory.FREE_FOOD],
    date: new Date(Date.now() + 72000000).toISOString(), // 20 hours from now
    location: 'Engineering Hall, Room 402',
    capacity: 20,
    registeredCount: 12,
    checkedInCount: 0,
    imageUrl: 'https://picsum.photos/seed/code/1200/800',
    assets: {
      bannerUrl: 'https://picsum.photos/seed/code/1200/800',
      logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Code'
    },
    tags: ['coding', 'mobile', 'react'],
    coordinates: { lat: 37.4285, lng: -122.1747 },
    status: EventStatus.APPROVED,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    type: PostType.EVENT,
    title: 'Spring Music Festival',
    description: 'A night of live music featuring local campus bands and special guests.',
    organizerEmail: 'sarah@college.edu',
    organizerName: 'Sarah Organizer',
    category: [EventCategory.MUSIC, EventCategory.SOCIAL],
    date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    location: 'Central Plaza',
    capacity: 500,
    registeredCount: 342,
    checkedInCount: 0,
    imageUrl: 'https://picsum.photos/seed/music/1200/800',
    assets: {
      bannerUrl: 'https://picsum.photos/seed/music/1200/800',
      logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Music'
    },
    tags: ['music', 'festival', 'spring'],
    coordinates: { lat: 37.4275, lng: -122.1697 },
    status: EventStatus.APPROVED,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e3',
    type: PostType.EVENT,
    title: 'Hackathon Prep: Algorithms 101',
    description: 'Get ready for the annual hackathon with this intensive algorithm review session.',
    organizerEmail: 'sarah@college.edu',
    organizerName: 'Sarah Organizer',
    category: [EventCategory.TECH, EventCategory.ACADEMIC],
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    location: 'CS Building, Lab A',
    capacity: 50,
    registeredCount: 48,
    checkedInCount: 42,
    imageUrl: 'https://picsum.photos/seed/algo/1200/800',
    assets: {
      bannerUrl: 'https://picsum.photos/seed/algo/1200/800',
      logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Hack'
    },
    tags: ['hackathon', 'algorithms', 'prep'],
    coordinates: { lat: 37.4295, lng: -122.1717 },
    status: EventStatus.APPROVED,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e4',
    type: PostType.EVENT,
    title: 'UX Design Workshop',
    description: 'Introduction to User Experience design principles and tools.',
    organizerEmail: 'sarah@college.edu',
    organizerName: 'Sarah Organizer',
    category: [EventCategory.TECH, EventCategory.WORKSHOP],
    date: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    location: 'Design Studio',
    capacity: 30,
    registeredCount: 5,
    checkedInCount: 0,
    imageUrl: 'https://picsum.photos/seed/design/1200/800',
    assets: {
      bannerUrl: 'https://picsum.photos/seed/design/1200/800',
      logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=UX'
    },
    tags: ['ux', 'design', 'ui'],
    coordinates: { lat: 37.4265, lng: -122.1727 },
    status: EventStatus.APPROVED,
    createdAt: new Date().toISOString(),
  }
];

export const MOCK_REGISTRATIONS: Registration[] = [
  {
    id: 'r1',
    eventId: 'e1',
    userEmail: 'alex@college.edu',
    userName: 'Alex Chen',
    organizerEmail: 'sarah@college.edu',
    timestamp: new Date().toISOString(),
    checkedIn: false,
    qrCode: 'qr-e1-alex',
  }
];
