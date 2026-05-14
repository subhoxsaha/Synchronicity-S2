/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ═══════════════════════════════════════════
// Roles & Hierarchy
// ═══════════════════════════════════════════

export enum UserRole {
  STUDENT = 'student',
  ORGANIZER = 'organizer',
  AMBASSADOR = 'ambassador',
  PLATFORM_ADMIN = 'platform_admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  major?: string;
  year?: string;
  bio?: string;
  followers?: string[];
  following?: string[];
  postCount?: number;
  interests?: string[];
  badges?: string[];
  attendanceStreak?: number;
  bookmarkedEvents?: string[];
  isApproved?: boolean;
  status?: 'pending' | 'active' | 'suspended' | 'review';
  organizationIds?: string[];
  followedOrgIds?: string[];
  // Hierarchy linkage
  instituteId?: string;            // set for ambassadors & organizers
  // Onboarding
  onboardingComplete?: boolean;
  // Dual-role context switching
  secondaryRole?: UserRole;
  activeContext?: 'student' | 'organizer';
  // Legacy fields — kept for backward compat with existing Firestore docs
  orgName?: string;
  orgDescription?: string;
  orgWebsite?: string;
  orgType?: string;
  orgLogo?: string;
  verificationDocuments?: string[];
}

// ═══════════════════════════════════════════
// Institute (new top-level entity)
// ═══════════════════════════════════════════

export interface InstituteSettings {
  requireApprovalForEvents: boolean;
  requireApprovalForAnnouncements: boolean;
  requireApprovalForRecruitment: boolean;
  requireApprovalByDefault: boolean;       // fallback for new post types
  autoPublishOrgIds: string[];             // orgs that bypass approval entirely
  autoPublishPostTypes: PostType[];        // post types that bypass approval
  allowedPostTypes: PostType[];            // what organizers under this institute can create
}

export interface Institute {
  id: string;
  name: string;                    // "Institute of Engineering"
  shortName?: string;              // "IOE"
  type?: string;                   // 'college' | 'university' | 'school'
  description?: string;
  logo?: string;
  ambassadorId?: string;           // userId of the ambassador
  adminIds?: string[];
  state?: string;
  district?: string;
  city?: string;
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'suspended';
  settings?: InstituteSettings;
  departmentNames?: string[];      // e.g. ["CSE", "ECE", "ME"] — for targeting
}

// ═══════════════════════════════════════════
// Institute Onboarding Request
// ═══════════════════════════════════════════

export type InstituteRequestStatus = 'pending' | 'approved' | 'rejected';

export interface InstituteRequest {
  id: string;
  // Requester info
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  // Institute info from the user
  instituteName: string;           // free-text or selected from colleges.json
  state?: string;
  district?: string;
  city?: string;
  reason: string;                  // why they want their institute onboarded
  // Admin decision
  status: InstituteRequestStatus;
  reviewedBy?: string;             // admin userId
  reviewNote?: string;
  reviewedAt?: string;
  // If approved, the resulting institute
  instituteId?: string;
  // Timestamps
  createdAt: string;
}

// ═══════════════════════════════════════════
// Organization Types
// ═══════════════════════════════════════════

export type OrgEntityType =
  | 'club' | 'cell' | 'department' | 'committee'
  | 'chapter' | 'cultural_group' | 'technical_group' | 'other';

export type OrgJoinPolicy = 'open' | 'approval_required' | 'invite_only';
export type OrgMemberRole = 'owner' | 'admin' | 'member';
export type OrgStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface OrgMember {
  userId: string;
  role: OrgMemberRole;
  joinedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  entityType: OrgEntityType;       // replaces generic 'type' string
  type?: string;                   // legacy compat — maps to entityType
  instituteId: string;             // which institute this belongs to
  logo?: string;
  website?: string;
  email?: string;
  isVerified?: boolean;
  coverImage?: string;
  verificationDocuments?: string[];
  status: OrgStatus;
  joinPolicy: OrgJoinPolicy;
  ownerId: string;
  members: OrgMember[];
  followerIds: string[];
  joinRequests?: string[];
  createdAt: string;
  postCount?: number;
  tags?: string[];
  rejectionReason?: string;
}

// ═══════════════════════════════════════════
// Post Types & Status
// ═══════════════════════════════════════════

export enum PostType {
  // Core types
  EVENT = 'event',
  ANNOUNCEMENT = 'announcement',
  RECRUITMENT = 'recruitment',
  // New types
  POLL = 'poll',
  RESOURCE = 'resource',
  GALLERY = 'gallery',
  CHALLENGE = 'challenge',
  LOST_FOUND = 'lost_found',
  BUY_SELL = 'buy_sell',
  JOB = 'job',
  TIMETABLE = 'timetable',
  PROJECT = 'project',
  // Elevated-privilege types
  BROADCAST = 'broadcast',         // Ambassador-only
  SYSTEM_NOTICE = 'system_notice', // Platform Admin-only
  // Legacy compat
  WEBINAR = 'webinar',             // mapped to EVENT with subtype 'webinar'
}

export enum PostStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}

// Legacy compat alias
export const EventStatus = {
  PENDING: PostStatus.PENDING,
  APPROVED: PostStatus.APPROVED,
  REJECTED: PostStatus.REJECTED,
} as const;
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

// ═══════════════════════════════════════════
// Event Categories & Subtypes
// ═══════════════════════════════════════════

export enum EventCategory {
  TECH = 'Tech',
  MUSIC = 'Music',
  SOCIAL = 'Social',
  ACADEMIC = 'Academic',
  SPORTS = 'Sports',
  WORKSHOP = 'Workshop',
  FREE_FOOD = 'Free Food',
  CULTURAL = 'Cultural',
  NETWORKING = 'Networking',
  CAREER = 'Career',
}

export type EventSubtype =
  | 'workshop' | 'seminar' | 'hackathon' | 'cultural_fest'
  | 'sports' | 'webinar' | 'networking' | 'exhibition'
  | 'trip' | 'certification' | 'flagship' | 'other';

// ═══════════════════════════════════════════
// Target Audience
// ═══════════════════════════════════════════

export interface TargetAudience {
  scope: 'all' | 'department' | 'year' | 'custom';
  departments?: string[];
  years?: string[];
}

// ═══════════════════════════════════════════
// Base Post
// ═══════════════════════════════════════════

export interface BasePost {
  id: string;
  type: PostType;
  title: string;
  description: string;

  // Authorship
  organizerId?: string;
  organizerEmail: string;
  organizerName: string;
  organizationId?: string;
  organizationName?: string;
  organizationLogo?: string;
  instituteId?: string;

  // Status & moderation
  status: PostStatus;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;

  // Targeting
  targetAudience?: TargetAudience;

  // Metadata
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  tags: string[];

  // Social
  likes?: string[];
  commentCount?: number;
  shareCount?: number;

  // Flags
  sendPushOnPublish?: boolean;
  isDuplicate?: boolean;
  duplicatedFrom?: string;
}

// ═══════════════════════════════════════════
// Event Post
// ═══════════════════════════════════════════

export interface EventPost extends BasePost {
  type: PostType.EVENT;
  subtype?: EventSubtype;
  category: EventCategory[];
  date: string;
  endDate?: string;
  location: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  imageUrl: string;
  assets: {
    bannerUrl: string;
    logoUrl?: string;
  };
  coordinates: { lat: number; lng: number };
  // Enhanced event fields
  ticketPrice?: number;
  isFreeFood?: boolean;
  isRegistrationRequired?: boolean;
  maxTeamSize?: number;
  externalLink?: string;
  contactEmail?: string;
  gallery?: string[];
  highlights?: string[];
  sponsors?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  format?: 'in-person' | 'virtual' | 'hybrid';
  // Webinar-specific (when subtype = 'webinar')
  meetingLink?: string;
  platform?: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Other';
  speakers?: string[];
  // Certificate & feedback
  certificateEnabled?: boolean;
  feedbackFormEnabled?: boolean;
  // Poster config
  posterConfig?: {
    layout: 'brutal' | 'minimal' | 'cyber' | 'kinetic';
    theme: 'dark' | 'light' | 'vibrant' | 'mono';
    accentColor: string;
    showQr: boolean;
    showImage: boolean;
    overlayOpacity: number;
    fontFamily: 'sans' | 'mono' | 'serif' | 'display';
  };
}

// Backward-compat alias
export type CampusEvent = EventPost;

// ═══════════════════════════════════════════
// Announcement Post
// ═══════════════════════════════════════════

export interface AnnouncementPost extends BasePost {
  type: PostType.ANNOUNCEMENT;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  announcementType?: 'result' | 'deadline' | 'policy' | 'achievement' | 'congratulations' | 'general' | 'emergency';
  pinDuration?: number;          // hours to pin if urgent
  attachmentUrl?: string;        // PDF attachment
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// Recruitment Post
// ═══════════════════════════════════════════

export interface RecruitmentRole {
  title: string;
  description?: string;
  responsibilities?: string;
  skills?: string[];
  openings?: number;
  eligibilityDepartments?: string[];
  eligibilityYears?: string[];
}

export interface RecruitmentPost extends BasePost {
  type: PostType.RECRUITMENT;
  recruitmentType?: 'core_team' | 'domain_member' | 'volunteer' | 'intern' | 'mentor' | 'collaborator' | 'campus_ambassador';
  roles: RecruitmentRole[] | string[];  // string[] for legacy compat
  deadline: string;
  applicationUrl?: string;              // external form
  applicationForm?: FormField[];        // in-app form builder
  eligibility?: string;                 // legacy text field
  selectionProcess?: string;
  commitment?: string;
  notifyShortlisted?: boolean;
  imageUrl?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';
  required: boolean;
  options?: string[];              // for select/radio/checkbox
  placeholder?: string;
}

// ═══════════════════════════════════════════
// Poll / Survey Post
// ═══════════════════════════════════════════

export interface PollQuestion {
  id: string;
  question: string;
  answerType: 'single_choice' | 'multiple_choice' | 'rating' | 'open_text';
  options?: string[];
}

export interface PollPost extends BasePost {
  type: PostType.POLL;
  pollType?: 'opinion' | 'survey' | 'preference' | 'feedback' | 'suggestion';
  questions: PollQuestion[];
  responseDeadline: string;
  isAnonymous: boolean;
  showLiveResults: boolean;
  linkedEventId?: string;
  responses?: Record<string, any>;   // userId -> answers
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// Resource / Link Post
// ═══════════════════════════════════════════

export interface ResourcePost extends BasePost {
  type: PostType.RESOURCE;
  resourceType: 'study_material' | 'recording' | 'tool' | 'template' | 'reading_list' | 'job_listing' | 'scholarship' | 'official_notice';
  url?: string;
  fileUrl?: string;
  accessEligibility?: TargetAudience;
  requiresLogin?: boolean;
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// Gallery / Recap Post
// ═══════════════════════════════════════════

export interface GalleryPost extends BasePost {
  type: PostType.GALLERY;
  galleryType?: 'event_photos' | 'behind_scenes' | 'team_intro' | 'milestone' | 'spotlight' | 'collaboration' | 'press';
  images: { url: string; caption?: string }[];
  linkedEventId?: string;
  featuredMemberIds?: string[];
  externalArticleUrl?: string;
  reactionsEnabled?: boolean;
  imageUrl?: string;               // thumbnail / cover
}

// ═══════════════════════════════════════════
// Challenge / Campaign Post
// ═══════════════════════════════════════════

export interface ChallengePost extends BasePost {
  type: PostType.CHALLENGE;
  challengeType?: 'photo_video' | 'awareness' | 'streak' | 'quiz' | 'nomination' | 'hashtag';
  startDate: string;
  endDate: string;
  instructions: string;
  submissionMethod: 'in_app' | 'link' | 'promise';
  submissionUrl?: string;
  prize?: string;
  leaderboardVisible: boolean;
  linkedBadgeId?: string;
  linkedCertificateId?: string;
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// Lost & Found Post
// ═══════════════════════════════════════════

export interface LostFoundPost extends BasePost {
  type: PostType.LOST_FOUND;
  itemType: 'lost' | 'found';
  itemDescription: string;
  itemImage?: string;
  lastSeenLocation?: string;
  currentLocation?: string;
  contactMethod: 'in_app' | 'phone' | 'email';
  contactInfo?: string;
  resolvedStatus: 'open' | 'resolved';
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// Buy / Sell / Exchange Post
// ═══════════════════════════════════════════

export interface BuySellPost extends BasePost {
  type: PostType.BUY_SELL;
  listingType: 'sell' | 'buy' | 'exchange';
  itemTitle: string;
  price?: number;                   // 0 = free
  isFree: boolean;
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  images?: string[];
  sellerDepartment?: string;
  sellerYear?: string;
  itemStatus: 'available' | 'sold' | 'reserved';
  contactMethod: 'in_app' | 'phone' | 'email';
  contactInfo?: string;
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// Job / Opportunity Post
// ═══════════════════════════════════════════

export interface JobPost extends BasePost {
  type: PostType.JOB;
  jobType: 'internship' | 'full_time' | 'freelance' | 'research' | 'competition' | 'scholarship' | 'fellowship';
  companyOrOrg: string;
  roleTitle: string;
  eligibility?: string;
  compensation?: string;
  applicationLink: string;
  applicationDeadline: string;
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// Timetable / Schedule Post
// ═══════════════════════════════════════════

export interface TimetableSlot {
  time: string;
  entries: { track: string; content: string; speaker?: string }[];
}

export interface TimetablePost extends BasePost {
  type: PostType.TIMETABLE;
  scheduleType: 'event_schedule' | 'exam_timetable' | 'meeting_schedule' | 'venue_availability';
  slots: TimetableSlot[];
  linkedEventId?: string;
  downloadable: boolean;
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// Collaborative / Open Project Post
// ═══════════════════════════════════════════

export interface ProjectPost extends BasePost {
  type: PostType.PROJECT;
  projectType: 'open_source' | 'research' | 'publication' | 'media' | 'social' | 'startup';
  currentStatus: 'idea' | 'in_progress' | 'active' | 'completed';
  rolesNeeded: string[];
  currentTeamSize: number;
  commitment: string;
  isOngoing: boolean;
  howToJoin: string;
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// Broadcast Post (Ambassador-only)
// ═══════════════════════════════════════════

export interface BroadcastPost extends BasePost {
  type: PostType.BROADCAST;
  priority: 'normal' | 'urgent';
  pinDuration?: number;
  attachmentUrl?: string;
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// System Notice Post (Platform Admin-only)
// ═══════════════════════════════════════════

export interface SystemNoticePost extends BasePost {
  type: PostType.SYSTEM_NOTICE;
  noticeType: 'maintenance' | 'update' | 'policy' | 'general';
  showBanner: boolean;
  bannerColor?: string;
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// Webinar Post (legacy compat — maps to EventPost with subtype)
// ═══════════════════════════════════════════

export interface WebinarPost extends BasePost {
  type: PostType.WEBINAR;
  date: string;
  time?: string;
  link: string;
  platform?: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Other';
  speakers?: string[];
  capacity?: number;
  registeredCount?: number;
  status: PostStatus;
  imageUrl?: string;
}

// ═══════════════════════════════════════════
// Union type for all posts
// ═══════════════════════════════════════════

export type AnyPost =
  | EventPost
  | AnnouncementPost
  | RecruitmentPost
  | PollPost
  | ResourcePost
  | GalleryPost
  | ChallengePost
  | LostFoundPost
  | BuySellPost
  | JobPost
  | TimetablePost
  | ProjectPost
  | BroadcastPost
  | SystemNoticePost
  | WebinarPost;

// ═══════════════════════════════════════════
// Supporting types (unchanged)
// ═══════════════════════════════════════════

export interface EventComment {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  userEmail: string;
  userName: string;
  organizerEmail: string;
  timestamp: string;
  checkedIn: boolean;
  qrCode: string;
}

export interface Recommendation {
  eventId: string;
  score: number;
  reason: string;
}

export enum NotificationType {
  UPCOMING_EVENT = 'upcoming_event',
  NEW_EVENT = 'new_event',
  SYSTEM = 'system',
  POST_APPROVED = 'post_approved',
  POST_REJECTED = 'post_rejected',
  NEW_APPLICATION = 'new_application',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  eventId?: string;
  postId?: string;
}

// ═══════════════════════════════════════════
// Recruitment Application (in-app storage)
// ═══════════════════════════════════════════

export interface Application {
  id: string;
  postId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  roleAppliedFor: string;
  responses: Record<string, any>;  // fieldId -> answer
  submittedAt: string;
  status: 'submitted' | 'shortlisted' | 'selected' | 'rejected';
  reviewedBy?: string;
  reviewNote?: string;
}

// ═══════════════════════════════════════════
// Post type metadata (for UI rendering)
// ═══════════════════════════════════════════

export const POST_TYPE_META: Record<PostType, {
  label: string;
  icon: string;
  color: string;
  requiredRole: UserRole;
  studentCanPost: boolean;
}> = {
  [PostType.EVENT]:         { label: 'Event',         icon: '📅', color: '#4F46E5', requiredRole: UserRole.ORGANIZER, studentCanPost: false },
  [PostType.ANNOUNCEMENT]:  { label: 'Announcement',  icon: '📢', color: '#F59E0B', requiredRole: UserRole.ORGANIZER, studentCanPost: false },
  [PostType.RECRUITMENT]:   { label: 'Recruitment',   icon: '👥', color: '#8B5CF6', requiredRole: UserRole.ORGANIZER, studentCanPost: false },
  [PostType.POLL]:          { label: 'Poll / Survey',  icon: '📊', color: '#14B8A6', requiredRole: UserRole.ORGANIZER, studentCanPost: false },
  [PostType.RESOURCE]:      { label: 'Resource',      icon: '📎', color: '#06B6D4', requiredRole: UserRole.ORGANIZER, studentCanPost: false },
  [PostType.GALLERY]:       { label: 'Gallery',       icon: '🖼️', color: '#EC4899', requiredRole: UserRole.ORGANIZER, studentCanPost: false },
  [PostType.CHALLENGE]:     { label: 'Challenge',     icon: '🏆', color: '#EF4444', requiredRole: UserRole.ORGANIZER, studentCanPost: false },
  [PostType.LOST_FOUND]:    { label: 'Lost & Found',  icon: '🔍', color: '#78716C', requiredRole: UserRole.STUDENT,   studentCanPost: true },
  [PostType.BUY_SELL]:      { label: 'Marketplace',   icon: '🛒', color: '#22C55E', requiredRole: UserRole.STUDENT,   studentCanPost: true },
  [PostType.JOB]:           { label: 'Opportunity',   icon: '💼', color: '#3B82F6', requiredRole: UserRole.ORGANIZER, studentCanPost: false },
  [PostType.TIMETABLE]:     { label: 'Schedule',      icon: '🗓️', color: '#A855F7', requiredRole: UserRole.ORGANIZER, studentCanPost: false },
  [PostType.PROJECT]:       { label: 'Project',       icon: '🚀', color: '#F97316', requiredRole: UserRole.ORGANIZER, studentCanPost: false },
  [PostType.BROADCAST]:     { label: 'Broadcast',     icon: '📡', color: '#DC2626', requiredRole: UserRole.AMBASSADOR,studentCanPost: false },
  [PostType.SYSTEM_NOTICE]: { label: 'System Notice', icon: '⚙️', color: '#1E293B', requiredRole: UserRole.PLATFORM_ADMIN, studentCanPost: false },
  [PostType.WEBINAR]:       { label: 'Webinar',       icon: '🎥', color: '#7C3AED', requiredRole: UserRole.ORGANIZER, studentCanPost: false },
};
