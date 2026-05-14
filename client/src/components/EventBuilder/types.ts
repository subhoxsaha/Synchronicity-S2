import { EventCategory } from '../../types';

// ═══════════════════════════════════════════
// All post types supported by the builder
// ═══════════════════════════════════════════

export const BUILDER_POST_TYPES = [
  { value: 'event',        label: 'Event',         icon: '📅', color: '#4F46E5' },
  { value: 'announcement', label: 'Announcement',  icon: '📢', color: '#F59E0B' },
  { value: 'recruitment',  label: 'Recruitment',   icon: '👥', color: '#8B5CF6' },
  { value: 'poll',         label: 'Poll / Survey', icon: '📊', color: '#14B8A6' },
  { value: 'job',          label: 'Job / Opportunity', icon: '💼', color: '#3B82F6' },
  { value: 'resource',     label: 'Resource',      icon: '📎', color: '#06B6D4' },
  { value: 'gallery',      label: 'Gallery',       icon: '🖼️', color: '#EC4899' },
  { value: 'challenge',    label: 'Challenge',     icon: '🏆', color: '#EF4444' },
  { value: 'lost_found',   label: 'Lost & Found',  icon: '🔍', color: '#78716C' },
  { value: 'buy_sell',     label: 'Marketplace',   icon: '🛒', color: '#22C55E' },
  { value: 'project',      label: 'Project',       icon: '🚀', color: '#F97316' },
  { value: 'webinar',      label: 'Webinar',       icon: '🎥', color: '#7C3AED' },
] as const;

export type BuilderPostType = (typeof BUILDER_POST_TYPES)[number]['value'];

// ═══════════════════════════════════════════
// Poll question structure
// ═══════════════════════════════════════════

export interface PollQuestionDraft {
  id: string;
  question: string;
  answerType: 'single_choice' | 'multiple_choice' | 'rating' | 'open_text';
  options: string[];
}

// ═══════════════════════════════════════════
// Unified form data for all post types
// ═══════════════════════════════════════════

export interface EventFormData {
  // --- Base fields (all types) ---
  type: string;
  title: string;
  description: string;
  category: EventCategory[];
  tags: string[];
  highlights: string[];
  imageUrl: string;
  assets: { bannerUrl: string; logoUrl?: string };
  contactEmail: string;
  externalLink: string;

  // --- Event / Webinar ---
  format: 'in-person' | 'virtual' | 'hybrid';
  difficulty: '' | 'beginner' | 'intermediate' | 'advanced';
  date: string;
  endDate: string;
  location: string;
  coordinates: { lat: number; lng: number };
  meetingLink: string;
  gallery: string[];
  capacity: number;
  ticketPrice: number;
  isFreeFood: boolean;
  isRegistrationRequired: boolean;
  maxTeamSize: number;
  sponsors: string[];

  // --- Webinar ---
  platform: string;
  link: string;

  // --- Recruitment ---
  roles: string;
  deadline: string;
  applicationUrl: string;
  eligibility: string;
  recruitmentType: string;
  selectionProcess: string;
  commitment: string;

  // --- Announcement ---
  priority: 'low' | 'medium' | 'high' | 'urgent';
  announcementType: string;
  attachmentUrl: string;

  // --- Poll ---
  pollType: string;
  questions: PollQuestionDraft[];
  responseDeadline: string;
  isAnonymous: boolean;
  showLiveResults: boolean;

  // --- Job / Opportunity ---
  jobType: string;
  companyOrOrg: string;
  roleTitle: string;
  compensation: string;
  applicationLink: string;
  applicationDeadline: string;

  // --- Resource ---
  resourceType: string;
  resourceUrl: string;
  fileUrl: string;

  // --- Gallery ---
  galleryType: string;
  images: { url: string; caption?: string }[];

  // --- Challenge ---
  challengeType: string;
  startDate: string;
  instructions: string;
  submissionMethod: 'in_app' | 'link' | 'promise';
  submissionUrl: string;
  prize: string;
  leaderboardVisible: boolean;

  // --- Lost & Found ---
  itemType: 'lost' | 'found';
  itemDescription: string;
  lastSeenLocation: string;
  contactMethod: 'in_app' | 'phone' | 'email';
  contactInfo: string;

  // --- Buy / Sell ---
  listingType: 'sell' | 'buy' | 'exchange';
  itemTitle: string;
  price: string;
  isFree: boolean;
  condition: string;

  // --- Project ---
  projectType: string;
  currentStatus: string;
  rolesNeeded: string[];
  currentTeamSize: number;
  howToJoin: string;
  isOngoing: boolean;
}

export const DEFAULT_FORM: EventFormData = {
  type: 'event',
  title: '',
  description: '',
  category: [],
  tags: [],
  highlights: [],
  imageUrl: '',
  assets: { bannerUrl: '', logoUrl: '' },
  contactEmail: '',
  externalLink: '',

  // Event / Webinar
  format: 'in-person',
  difficulty: '',
  date: '',
  endDate: '',
  location: '',
  coordinates: { lat: 22.5726, lng: 88.3639 },
  meetingLink: '',
  gallery: [],
  capacity: 100,
  ticketPrice: 0,
  isFreeFood: false,
  isRegistrationRequired: true,
  maxTeamSize: 1,
  sponsors: [],

  // Webinar
  platform: 'Zoom',
  link: '',

  // Recruitment
  roles: '',
  deadline: '',
  applicationUrl: '',
  eligibility: '',
  recruitmentType: 'core_team',
  selectionProcess: '',
  commitment: '',

  // Announcement
  priority: 'medium',
  announcementType: 'general',
  attachmentUrl: '',

  // Poll
  pollType: 'opinion',
  questions: [{ id: '1', question: '', answerType: 'single_choice', options: ['', ''] }],
  responseDeadline: '',
  isAnonymous: false,
  showLiveResults: true,

  // Job
  jobType: 'internship',
  companyOrOrg: '',
  roleTitle: '',
  compensation: '',
  applicationLink: '',
  applicationDeadline: '',

  // Resource
  resourceType: 'study_material',
  resourceUrl: '',
  fileUrl: '',

  // Gallery
  galleryType: 'event_photos',
  images: [],

  // Challenge
  challengeType: 'photo_video',
  startDate: '',
  instructions: '',
  submissionMethod: 'in_app',
  submissionUrl: '',
  prize: '',
  leaderboardVisible: true,

  // Lost & Found
  itemType: 'lost',
  itemDescription: '',
  lastSeenLocation: '',
  contactMethod: 'in_app',
  contactInfo: '',

  // Buy / Sell
  listingType: 'sell',
  itemTitle: '',
  price: '',
  isFree: false,
  condition: 'good',

  // Project
  projectType: 'open_source',
  currentStatus: 'idea',
  rolesNeeded: [],
  currentTeamSize: 1,
  howToJoin: '',
  isOngoing: false,
};

export interface StepProps {
  form: EventFormData;
  setForm: React.Dispatch<React.SetStateAction<EventFormData>>;
}

// ═══════════════════════════════════════════
// Step configuration per post type
// ═══════════════════════════════════════════

export type StepConfig = { label: string; key: string }[];

export const STEPS_FOR_TYPE: Record<string, StepConfig> = {
  event:        [{ label: 'Basics', key: 'basics' }, { label: 'Venue', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
  webinar:      [{ label: 'Basics', key: 'basics' }, { label: 'Venue', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
  announcement: [{ label: 'Basics', key: 'basics' }, { label: 'Details', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
  recruitment:  [{ label: 'Basics', key: 'basics' }, { label: 'Roles', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
  poll:         [{ label: 'Basics', key: 'basics' }, { label: 'Questions', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
  job:          [{ label: 'Basics', key: 'basics' }, { label: 'Job Details', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
  resource:     [{ label: 'Basics', key: 'basics' }, { label: 'Resource', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
  gallery:      [{ label: 'Basics', key: 'basics' }, { label: 'Gallery', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
  challenge:    [{ label: 'Basics', key: 'basics' }, { label: 'Challenge', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
  lost_found:   [{ label: 'Basics', key: 'basics' }, { label: 'Item Info', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
  buy_sell:     [{ label: 'Basics', key: 'basics' }, { label: 'Listing', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
  project:      [{ label: 'Basics', key: 'basics' }, { label: 'Project', key: 'details' }, { label: 'Media', key: 'media' }, { label: 'Settings', key: 'settings' }],
};
