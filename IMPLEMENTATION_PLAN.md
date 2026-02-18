# Implementation Plan — Base Layout & UX

## Phase 1: Onboarding & Auth
- **Logo handling:** Deferred; no changes in this stage.

---

## Phase 2: Home Screen

### 2.1 Top Navigation Bar
- Replace current logo with horizontal logo: `/assets/common/NavBarlogo.png`
- Increase logo size for clear recognition
- Keep responsive behavior (smaller on narrow viewports, larger on desktop)

### 2.2 News & Updates Section
- **Placement:** Immediately after the Intro Slider section on Home
- **Section title:** "News & Updates"
- **Design:** Banner-style cards; each item clickable
- **Interaction:** Click → navigate to detail page (placeholder content)
- **Data:** Static placeholder list (title, short excerpt, optional date)

---

## Phase 3: Enrollment & Bayat Popups

### 3.1 Module Enrollment Modal (all modules)
- **Fields:** Full Name (required), WhatsApp Number (required), Country (dropdown placeholder), City (dropdown placeholder)
- **Niyah (required):** Single checkbox with exact text:  
  *"I sincerely intend to seek knowledge with full dedication, commitment, and reflection, solely to attain closeness to Allah."*
- Validation: all required fields + checkbox must be checked to submit

### 3.2 Bayat Popup
- **Fields:** Full Name, WhatsApp Number, Country, City (same as above)
- **Checkbox 1 (required):**  
  *"I make this bay‘ah purely and sincerely for the sake of Allah alone, seeking His pleasure, guidance, and nearness, without any worldly intention."*
- **Checkbox 2 (required):**  
  *"I have read and fully understood the explanation and responsibility of Bay‘ah."*
- Validation: all fields + both checkboxes required

---

## Phase 4: Learning Module Pages

For each `/modules/[slug]` page:

### 4.1 Top Banner
- Same image as the module card on Home (shared image map)
- Full-width banner: background image + dark overlay
- Large, bold module name in **gold**
- No other content on the banner

### 4.2 Content Flow
- Detailed module description (existing placeholder text)
- **Weekly schedule table:** Same structure for all modules; static placeholder rows (e.g. Day, Time, Topic)
- **CTA:** Single button at bottom: "Enroll in [Module Name]"

---

## Phase 5: Progress Section (Dashboard)

### 5.1 Enrolled Courses List
- Use mock/placeholder enrolled courses for now
- For each course show:
  - Course name
  - **Learning Time** progress bar (placeholder: based on “sessions completed”)
  - **Attendance** progress bar with clear labels: sessions completed + today’s session attendance

### 5.2 Live Session Access
- For each enrolled course: a card/section with:
  - “Updated Zoom session link” (placeholder URL/text)
  - Purpose: make app the central hub; “Join Session” CTA
- No backend; static placeholders only

---

## General
- Mobile-first, responsive, calm UI
- Reuse existing design system (colors, borders, typography)
- Placeholders for all missing data; no DB/API wiring
