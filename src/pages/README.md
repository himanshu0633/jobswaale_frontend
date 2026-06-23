# Pages Folder Guide

This folder is split by who sees the screen and what area it belongs to.

## auth
Public auth screens such as user registration.

## public
Public website pages visible without admin login.

## superadmin
All admin portal screens. These are protected by the `/admin/*` route guard.

### superadmin/auth
Super admin login and forgot-password screens.

### superadmin/dashboard
Dashboard and overview screens.

### superadmin/masters
Master setup screens such as country, state, city, industry, job type, categories, and qualifications.

### superadmin/plans
Jobseeker plans, employer plans, plan features, and plan mappings.

### superadmin/people
Jobs, employers, jobseekers, and their add/edit forms.

### superadmin/finance
Payments, transactions, and finance helper data.

### superadmin/content
CMS pages, blogs, and blog categories.

### superadmin/reports
All report screens.

### superadmin/system
Settings, users, roles, and user-role management.
