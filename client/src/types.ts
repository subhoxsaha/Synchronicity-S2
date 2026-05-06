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
  interests?: string[];
  badges?: string[];
  attendanceStreak?: number;
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

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  organizerEmail: string;
  organizerName: string;
  category: EventCategory[];
  date: string;
  location: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  imageUrl: string;
  tags: string[];
  coordinates: { lat: number; lng: number };
}

export interface Registration {
  id: string;
  eventId: string;
  userEmail: string;
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
