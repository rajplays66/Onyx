# 🔥 Onyx App — UI Upgrade

## New Files
| File | What it does |
|------|-------------|
| `onyx-app.css` | All new UI styles — bottom nav, drawer, auth, profile, notifications, bookmarks, floating bubble, section animations |
| `onyx-app.js` | All new UI logic — same list above |
| `index.html` | Updated — links both new files |
| `syncro-chat.html` | Updated — links both new files, adds `syncro-page` class to body |

## Features Added

### 📱 Bottom Navigation Bar
- Home · Tech · Syncro AI · Alerts · Menu
- Active state with gold glow + pip indicator
- Tap ripple effect
- Auto-hides on desktop, shows only on mobile
- Active link updates on scroll

### 🗂 Side Drawer (Menu button)
- Brand header with Onyx logo
- User avatar + name + email (or "Guest" if not signed in)
- Edit Profile / Saved Posts (when logged in)
- Sign In (when logged out)
- All nav links
- Dark mode toggle with animated switch
- Log Out (when logged in)
- Social links

### 🔐 Auth Modal (Sign In sheet)
- Slides up from bottom (iOS-style)
- Continue with Google
- Continue with Apple
- Continue with Email (expandable form)
- Saves user to localStorage

### 👤 Profile Page
- Slides in from right
- Upload/change profile photo (camera picker)
- Edit display name, bio, email
- Save button with toast confirmation
- Log Out button
- Saved Posts list

### 🔔 Notifications Panel
- Slides in from right
- Unread badge on nav bell icon
- Gold left-border on unread items
- Tap to mark as read
- Clear All button
- Stagger slide-in animation

### 💬 Floating Syncro AI Bubble
- Floats with gentle bob animation
- Tooltip on hover: "Chat with Syncro"
- Hidden on Syncro page itself
- Pulsing ring animation

### 🔖 Bookmarks
- Bookmark button on every blog card (top-left)
- Pop animation when saved
- Saved posts appear in Profile page
- Persisted to localStorage

### ✨ Section Animations (unique per section)
| Section | Animation |
|---------|-----------|
| Hero/Banner | Scale + fade (epic entrance) |
| Blog Cards | Bounce slide-up with stagger delay |
| About | Slide in from left (storytelling) |
| Contact | Radial reveal (reaching out feel) |
| Stats | Count pop-in with overshoot |
| Footer | Gentle fade-up |

### 🎨 Other
- Toast notifications (top-center, auto-dismiss)
- Swipe right gesture to close any panel/drawer
- ESC key closes panels
- Theme toggle in drawer syncs with existing toggle
- localStorage persists: user, bookmarks, notifications, theme

## How to Deploy to Vercel
1. Replace your existing files with all files from this folder
2. Deploy as normal — no new dependencies, pure HTML/CSS/JS
3. The `onyx-app.css` and `onyx-app.js` are the only new files to add

## Notes
- Google/Apple sign-in is simulated (mocked). To make it real, integrate Firebase Auth or Supabase and replace the `simulateOAuth()` function in `onyx-app.js`
- Notifications are local only — to make them real, use a push notification service like Firebase Cloud Messaging
