# Footer Components

## 📌 Purpose
This folder contains all footer layout components for the Mirror Exhibit e-commerce platform. Each footer provides different styling and content layouts for various page types.

## 📂 Files Overview
- `FooterOne.tsx` - Primary footer for one-page layouts with newsletter signup
- `FooterTwo.tsx` - Alternative footer with different styling and layout
- `FooterThree.tsx` - Main footer used for home page and default layout pages
- `FooterFour.tsx` - Service-focused footer layout
- `FooterFive.tsx` - Newsletter-focused footer layout

## 🧩 Components and Functions

### FooterThree.tsx (Primary Footer)
- **Purpose:** Main footer used on home page and all default layout pages
- **Usage:** `<FooterThree />`
- **Features:**
  - Company logo and description
  - Navigation links (About Us, Shop, Cart, Dashboard, Contact)
  - Contact information (address, email)
  - Social media links
  - Copyright information
- **Styling:** Black background with white text, responsive design

### FooterOne.tsx
- **Purpose:** Footer for one-page layouts and special pages
- **Features:**
  - Newsletter subscription form
  - Shop category links (Wall Mirrors, Decorative Mirrors, etc.)
  - Social media links (Instagram, Pinterest, Facebook)
  - Company information

### FooterTwo.tsx
- **Purpose:** Alternative footer layout
- **Features:**
  - Standard page links (About Us, Our Team, Recent News)
  - Office information section
  - Newsletter signup

### FooterFour.tsx
- **Purpose:** Service-focused footer
- **Features:**
  - Service listings (UI Design, UX Design, etc.)
  - Social media links
  - Office information

### FooterFive.tsx
- **Purpose:** Newsletter-focused footer
- **Features:**
  - Prominent newsletter section
  - Page navigation
  - Contact information

## 🎯 Usage Guidelines

### Default Layout Pages
All pages using the `(default)` layout automatically get `FooterThree`:
- About Us page
- Contact page
- Cart page
- Shop pages
- Product detail pages

### Home Page
The home page specifically imports and uses `FooterThree` in its component structure.

### Admin Pages
Admin pages use their own layout and do not include any of these footer components.

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Updated FooterThree pages section to include Shop, Cart, Dashboard, Contact | User requested footer navigation updates |
| 2025-01-27 | Removed "Gallery Lists" link from FooterThree                     | User requested removal of non-functional link |

## 🎨 Styling Notes
- All footers use consistent black background (`black-bg` class)
- White text for contrast
- Responsive grid layouts using Bootstrap classes
- Consistent spacing with `pt-75 pb-50` padding
- Hover effects on links
- WOW.js animations for scroll effects

## 🔗 Navigation Links
**FooterThree Current Links:**
- About Us → `/about-us`
- Shop → `/shop`
- Cart → `/cart`
- Dashboard → `/dashboard`
- Contact → `/contact`

## 📱 Responsive Design
- Mobile-first approach
- Stacked layout on small screens
- Proper column distribution on larger screens
- Touch-friendly link sizes on mobile

## 🎯 Integration Points
- Used by `DefaultLayout.tsx` for consistent footer across pages
- Imported directly in home page component
- Styled with global CSS classes from the theme
