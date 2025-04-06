# Kerrville Folk Festival Volunteer Management System
# Runbook and User Guide

**Version 1.0**  
**Last Updated: April 6, 2025**

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Getting Started](#getting-started)
4. [User Roles](#user-roles)
5. [Admin Guide](#admin-guide)
6. [Coordinator Guide](#coordinator-guide)
7. [Volunteer Guide](#volunteer-guide)
8. [System Administration](#system-administration)
9. [Troubleshooting](#troubleshooting)
10. [Appendices](#appendices)

---

## Introduction

The Kerrville Folk Festival Volunteer Management System is a comprehensive web application designed to streamline the volunteer management process for the festival. This system enables festival organizers to efficiently register, coordinate, schedule, and communicate with volunteers across different crews and roles.

This guide provides detailed information for all user types, including volunteers, coordinators, and administrators, covering all aspects of the system from basic navigation to advanced administrative tasks.

---

## System Overview

The system consists of several integrated modules:

1. **User Management**: Registration, authentication, and profile management
2. **Festival Management**: Creation and configuration of festival events
3. **Volunteer Coordination**: Volunteer applications, approvals, and crew assignments
4. **Shift Management**: Creating, assigning, and managing volunteer shifts
5. **Communications**: Announcements and direct messaging
6. **Task Management**: Assignment and tracking of specific tasks
7. **Reporting**: Analytics and reporting on volunteer activities

The system is built using modern web technologies:
- Frontend: React with Material UI
- Backend: Supabase (PostgreSQL database + authentication services)
- Hosting: Vercel

---

## Getting Started

### Accessing the System

The system can be accessed at [festival-url.com](https://festival-url.com). 

### Account Creation and Login

1. Navigate to the system URL
2. Click "Register" to create a new account
3. Fill in the required details:
   - Email address
   - Password
   - Name
   - Phone number (optional)
4. Verify your email address using the link sent to your inbox
5. Log in using your email and password

### Password Recovery

1. On the login page, click "Forgot Password"
2. Enter your email address
3. Follow the instructions in the password reset email

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection
- Desktop, laptop, or mobile device

---

## User Roles

The system supports four main user roles, each with different permissions and capabilities:

### Administrator
- Full system access
- Manages festivals, users, crews, and system settings
- Access to all reports and analytics
- Can assign other administrators

### Coordinator
- Manages specific crews
- Reviews and approves volunteer applications
- Creates and assigns shifts
- Communicates with volunteers
- Access to crew-specific reports

### Volunteer
- Registers and creates a profile
- Applies for specific roles or crews
- Views and accepts shifts
- Communicates with coordinators
- Updates availability and skills

### Guest/Public
- Views public information about volunteering
- Registers for an account
- Applies to become a volunteer

---

## Admin Guide

### Dashboard Overview

The Admin Dashboard provides a high-level overview of the festival's operations, including:
- Volunteer counts by status (pending, approved, active)
- Upcoming shifts and unassigned shifts
- Recent communications
- System alerts and notifications

### Festival Management

#### Creating a New Festival

1. Navigate to "Festival Management" in the admin menu
2. Click "Create New Festival"
3. Enter festival details:
   - Name
   - Start and end dates
   - Location
   - Description
4. Set registration open/close dates
5. Click "Create Festival"

#### Editing Festival Details

1. In "Festival Management," locate the festival
2. Click "Edit" next to the desired festival
3. Update necessary fields
4. Click "Save Changes"

### User Management

#### Creating Admin Accounts

1. Navigate to "User Management"
2. Click "Create New User"
3. Enter user details
4. Select "Administrator" role
5. Click "Create User"
6. An invitation email will be sent to the new administrator

#### Managing Roles

1. In "User Management," find the user
2. Click "Edit Roles"
3. Select or deselect roles as appropriate
4. Click "Save Changes"

### System Settings

#### General Settings

1. Navigate to "System Settings"
2. In the "General" tab, configure:
   - Site title
   - Email sender details
   - Time zone
   - Language preferences

#### Email Configuration

1. In "System Settings," go to the "Email" tab
2. Configure email templates for:
   - Welcome emails
   - Application status notifications
   - Shift reminders
   - Password resets

#### Backup and Security

1. In the "Backup & Security" tab:
   - Schedule automatic backups
   - View backup history
   - Configure security settings
   - Manage API keys

### Analytics and Reporting

1. Navigate to "Reports" in the admin menu
2. Select from available report types:
   - Volunteer participation
   - Shift coverage
   - Crew performance
   - Registration statistics
3. Set date ranges and filters
4. Generate and export reports as needed

---

## Coordinator Guide

### Dashboard Overview

The Coordinator Dashboard shows key information relevant to the crews you manage:
- Volunteer counts for your crews
- Pending applications
- Upcoming shifts
- Unassigned shifts
- Recent messages

### Volunteer Management

#### Reviewing Applications

1. Go to "Volunteer Management"
2. Navigate to the "Pending Approval" tab
3. Review each application by clicking on the volunteer's name
4. Check the volunteer's information, skills, and availability
5. Click "Approve" or "Reject" for each application
6. Optionally, add notes for rejected applications

#### Assigning Volunteers to Crews

1. In "Volunteer Management," go to the "Approved" tab
2. Select a volunteer
3. Click "Assign to Crew"
4. Select the appropriate crew from the dropdown
5. Click "Assign"

#### Managing Volunteer Skills

1. Select a volunteer in "Volunteer Management"
2. Click "Edit Skills"
3. Check or uncheck skills as appropriate
4. Click "Save Changes"

### Shift Management

#### Creating Shifts

1. Navigate to "Shift Management"
2. Click "Create New Shift"
3. Enter shift details:
   - Date
   - Start and end times
   - Location
   - Required skills
   - Number of volunteers needed
4. Click "Create Shift"

#### Assigning Shifts

1. In "Shift Management," find the shift to assign
2. Click "Assign Volunteers"
3. Select volunteers from the list
4. Click "Assign"

#### Managing Shift Swaps

1. Go to "Shift Swap Management"
2. Review pending swap requests
3. Click "Approve" or "Reject" for each request
4. Provide reason for rejection if applicable

### Communication

#### Creating Announcements

1. Navigate to "Communications"
2. Click on the "Announcements" tab
3. Click "Create New Announcement"
4. Enter announcement details:
   - Title
   - Content
   - Target audience (all volunteers or specific crews)
   - Importance level
5. Click "Post Announcement"

#### Direct Messaging

1. In "Communications," click on the "Messages" tab
2. Select a volunteer from the list
3. Type your message in the text box
4. Click "Send"

### Task Management

#### Creating Tasks

1. Navigate to "Task Management"
2. Click "Create New Task"
3. Enter task details:
   - Title
   - Description
   - Priority
   - Due date
   - Assignee(s)
4. Click "Create Task"

#### Tracking Task Progress

1. In "Task Management," view all tasks
2. Filter by status (pending, in progress, completed)
3. Click on a task to view details
4. Update task status as needed

---

## Volunteer Guide

### Dashboard Overview

Your Volunteer Dashboard displays important information:
- Your upcoming shifts
- Recent announcements
- Assigned tasks
- Messages from coordinators

### Profile Management

#### Updating Your Profile

1. Click on your name in the top-right corner
2. Select "My Profile"
3. Update your personal information
4. Click "Save Changes"

#### Updating Your Skills

1. In your profile, navigate to the "Skills" section
2. Check or uncheck skills as appropriate
3. Click "Save Skills"

#### Setting Availability

1. In your profile, go to the "Availability" section
2. Set your available days and times
3. Click "Save Availability"

### Shift Management

#### Viewing Your Schedule

1. Navigate to "My Shifts" in the main menu
2. View your upcoming shifts
3. Click on a shift for details

#### Requesting Shift Swaps

1. In "My Shifts," find the shift you need to swap
2. Click "Request Swap"
3. Provide a reason for the swap
4. Suggest a replacement (optional)
5. Click "Submit Request"

### Communications

#### Viewing Announcements

1. Navigate to "Communications"
2. The "Announcements" tab shows all announcements
3. Important announcements are highlighted

#### Messaging Coordinators

1. In "Communications," click on the "Messages" tab
2. Type your message in the text box
3. Click "Send"

### Task Management

#### Viewing Your Tasks

1. Navigate to "My Tasks"
2. View tasks assigned to you
3. Click on a task for details

#### Updating Task Status

1. In "My Tasks," find the task to update
2. Click "Mark as In Progress" or "Mark as Complete"
3. Add comments as needed

---

## System Administration

### Database Management

#### Backup Procedures

1. Regular backups are scheduled automatically
2. To perform a manual backup:
   - Navigate to "System Settings" > "Backup & Security"
   - Click "Create Backup Now"
   - Download the backup file if needed

#### Restoration Procedures

1. To restore from a backup:
   - Navigate to "System Settings" > "Backup & Security"
   - Click "Restore from Backup"
   - Select the backup file
   - Confirm the restoration

### Server Management

#### Monitoring

- The system includes basic monitoring for:
  - Server uptime
  - Response time
  - Error rates
  - Database performance

#### Performance Optimization

1. Navigate to "System Settings" > "Performance"
2. Review current metrics
3. Adjust caching settings as needed
4. Schedule maintenance during off-peak hours

---

## Troubleshooting

### Common Issues

#### Login Problems

1. Ensure you're using the correct email and password
2. Check if your account has been activated
3. Try resetting your password
4. Clear browser cache and cookies

#### Display Issues

1. Try refreshing the page
2. Clear browser cache
3. Try a different browser
4. Check your internet connection

#### Data Not Saving

1. Check your internet connection
2. Try refreshing the page
3. Log out and log back in
4. Contact support if the issue persists

### Error Messages

| Error Code | Description | Resolution |
|------------|-------------|------------|
| AUTH-001 | Authentication failed | Check credentials or reset password |
| DB-001 | Database connection error | Wait and retry, contact admin if persistent |
| API-001 | API request timeout | Check internet connection and retry |
| VAL-001 | Validation error | Check input fields for errors |

### Support Contacts

- Technical Support: support@festivalsite.com
- Administrator: admin@festivalsite.com
- Phone: (555) 123-4567

---

## Appendices

### Glossary

- **Crew**: A group of volunteers assigned to a specific area or function
- **Shift**: A scheduled period of volunteer work
- **RLS**: Row-Level Security, a database security feature
- **Supabase**: The backend platform providing database and authentication

### Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| Ctrl+H | Return to Dashboard |
| Ctrl+M | Open Messages |
| Ctrl+S | Save current form |
| Ctrl+F | Search in current view |

### API Documentation

For developers maintaining the system, API documentation is available at:
- [API Documentation Link](https://api-docs.festivalsite.com)

---

*End of Document* 