# Security Specification for Campus Hub

## Data Invariants
1. A **User** profile can only be created by the authenticated user whose UID matches the document ID.
2. A **CampusEvent** can only be created by a user with the 'organizer' or 'admin' role.
3. An organizer can only update events they created (matched by `organizerEmail`).
4. A **Registration** can only be created by a student for themselves.
5. A student can only see their own registrations and notifications.
6. Only organizers/admins can see all registrations for an event.
7. Terminal state locking: Once checked in, a registration cannot be "unchecked".

## The Dirty Dozen Payloads

1. **Identity Theft (User Profile)**: User A tries to create a user profile with User B's UID.
2. **Role Escalation**: Student tries to update their own role to 'admin'.
3. **Ghost Event**: Student tries to create an event.
4. **Unauthorized Update**: Organizer A tries to edit Organizer B's event.
5. **Capacity Forgery**: Student tries to decrement an event's capacity during registration.
6. **Registration Spoofing**: Student A tries to register Student B for an event.
7. **Double Registration**: Student tries to create two registrations for the same event (should be blocked by logic, but rules should ideally check uniqueness if possible, though Firestore rules can't easily check collection-wide uniqueness without a specific ID scheme).
8. **Shadow Field Injection**: Adding an `isVerified: true` field to a user profile that doesn't exist in the schema.
9. **Notification Snooping**: User A tries to read User B's notifications.
10. **Terminal State Bypass**: User tries to uncheck themselves after check-in.
11. **System Field Forgery**: User tries to manually update `registeredCount` on an event without a registration document existing (rules should enforce relational write).
12. **ID Poisoning**: Using a 2KB string as an event ID.

## Test Runner (firestore.rules.test.ts)
(To be implemented during verification phase)
