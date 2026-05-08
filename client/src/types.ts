/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  STUDENT = 'student',
  ORGANIZER = 'organizer',
  ADMIN = 'admin',
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
  followers?: string[]; // User IDs
  following?: string[]; // User IDs
  postCount?: number;
  interests?: string[];
  badges?: string[];
  attendanceStreak?: number;
  bookmarkedEvents?: string[];
  isApproved?: boolean;
  status?: 'pending' | 'active' | 'suspended' | 'review';
  orgName?: string;
  orgDescription?: string;
  orgWebsite?: string;
  orgType?: string;
  orgLogo?: string;
  verificationDocuments?: string[];
}

export enum EventCategory {
  TECH = 'Tech',
  MUSIC = 'Music',
  SOCIAL = 'Social',
  ACADEMIC = 'Academic',
  SPORTS = 'Sports',
  WORKSHOP = 'Workshop',
  FREE_FOOD = 'Free Food',
}

export enum EventStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  organizerEmail: string;
  organizerName: string;
  organizerId?: string; // Adding ID for social lookup
  category: EventCategory[];
  date: string;
  location: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  imageUrl: string;
  assets: {
    bannerUrl: string;
    logoUrl?: string;
  };
  tags: string[];
  coordinates: { lat: number; lng: number };
  status: EventStatus;
  likes?: string[]; // User IDs who liked
  commentCount?: number;
  shareCount?: number;
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
  userName: string; // Added for display
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
}

export enum PostType {
  EVENT = 'event',
  ANNOUNCEMENT = 'announcement',
  RECRUITMENT = 'recruitment',
  GALLERY = 'gallery',
  RESOURCE = 'resource',
}

export interface BasePost {
  id: string;
  type: PostType;
  title: string;
  description: string;
  organizerEmail: string;
  organizerName: string;
  organizerId?: string;
  createdAt: string;
  tags: string[];
  likes?: string[];
  commentCount?: number;
  shareCount?: number;
}

export interface EventPost extends BasePost {
  type: PostType.EVENT;
  category: EventCategory[];
  date: string;
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
  status: EventStatus;
}

export interface AnnouncementPost extends BasePost {
  type: PostType.ANNOUNCEMENT;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
}

export interface RecruitmentPost extends BasePost {
  type: PostType.RECRUITMENT;
  roles: string[];
  deadline: string;
  applicationUrl: string;
  eligibility: string;
}

export type AnyPost = EventPost | AnnouncementPost | RecruitmentPost;
