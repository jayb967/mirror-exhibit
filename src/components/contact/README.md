# Contact Component

## 📌 Purpose
This folder contains the Contact page components for the Mirror Exhibit e-commerce platform. The components provide a comprehensive contact experience with forms, information, and brand elements.

## 📂 Files Overview
- `index.tsx` - Main Contact page component
- `ContactArea.tsx` - Contact form and information section

## 🧩 Components and Functions

### Contact Component (index.tsx)
- **Purpose:** Main contact page layout and structure
- **Usage:** Used by `/contact` page route
- **Features:**
  - Breadcrumb navigation
  - Contact form and information
  - Brand showcase section
- **Layout:** Uses DefaultLayout (HeaderFive + FooterThree)

### ContactArea Component
- **Purpose:** Contact form and company information display
- **Features:**
  - Contact form with personal details
  - Company contact information
  - Interactive Google Maps integration
  - Phone and email contact details

## 🎯 Page Structure

### Sections Included
1. **Breadcrumb** - Navigation breadcrumb showing "Contact Us"
2. **ContactArea** - Main contact form and information
3. **BrandAreaHomeOne** - Brand showcase with background styling

### Layout Integration
- **Header:** Provided by DefaultLayout (HeaderFive)
- **Footer:** Provided by DefaultLayout (FooterThree)
- **Styling:** Consistent with site theme and responsive design

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Removed duplicate HeaderFive and FooterThree from component       | Fixed stacked navbar issue - DefaultLayout already provides these |
| 2025-01-27 | Simplified component to only include page content sections        | Improved layout consistency and removed duplication |

## 🎨 Contact Form Features

### Form Fields
- Personal details input
- Message/inquiry text area
- Form validation
- Responsive design

### Contact Information Display
- Company phone number
- Email address
- Physical address
- Interactive elements

### Google Maps Integration
- Embedded Google Maps
- Company location display
- Interactive map controls
- Responsive iframe

## 🔗 Route Integration
- **Route:** `/contact`
- **Layout:** `(default)` layout group
- **Page File:** `src/app/(default)/contact/page.tsx`
- **Component:** `src/components/contact/index.tsx`

## 🎯 Contact Information

### Current Contact Details
- **Phone:** 0000-0000-00-000 (placeholder)
- **Email:** Company email address
- **Address:** Company physical address
- **Map:** Google Maps integration

### Brand Section
- **Component:** BrandAreaHomeOne
- **Styling:** Background styling enabled
- **Purpose:** Showcase company branding and partners

## 📱 Responsive Design
- Mobile-first approach
- Optimized form layout for all screens
- Touch-friendly form controls
- Responsive map integration

## 🎯 SEO Optimization
- Proper meta tags set in page route
- Semantic HTML structure
- Breadcrumb navigation for search engines
- Contact schema markup potential

## 🔧 Technical Notes
- Uses TypeScript for type safety
- Form handling with React
- Google Maps iframe integration
- Follows Next.js best practices
- Consistent with site architecture

## 🎨 Styling Notes
- Uses consistent theme styling
- Responsive grid layouts
- Proper form styling
- Interactive hover effects
- Consistent spacing and typography

## 🔗 Integration Points
- **ContactForm:** Separate form component for reusability
- **BrandAreaHomeOne:** Shared brand component
- **DefaultLayout:** Consistent header/footer
- **Breadcrumb:** Shared navigation component
