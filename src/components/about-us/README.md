# About Us Component

## 📌 Purpose
This folder contains the About Us page component for the Mirror Exhibit e-commerce platform. The component displays company information, craftsmanship details, testimonials, and contact information.

## 📂 Files Overview
- `index.tsx` - Main About Us page component

## 🧩 Components and Functions

### AboutUs Component
- **Purpose:** Display comprehensive information about Mirror Exhibit company
- **Usage:** Used by `/about-us` page route
- **Features:**
  - Breadcrumb navigation
  - Company story and craftsmanship information
  - Fun facts and statistics
  - Customer testimonials
  - Contact information section
- **Layout:** Uses DefaultLayout (HeaderFive + FooterThree)

## 🎯 Page Structure

### Sections Included
1. **Breadcrumb** - Navigation breadcrumb showing "About Us"
2. **AboutAreaHomeOne** - Main about section with company story
3. **FunFactAreaHomeOne** - Statistics and achievements
4. **TestimonialAreaHomeOne** - Customer testimonials
5. **ContactAreaHomeOne** - Contact information and form

### Layout Integration
- **Header:** Provided by DefaultLayout (HeaderFive)
- **Footer:** Provided by DefaultLayout (FooterThree)
- **Styling:** Consistent with site theme and responsive design

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Removed duplicate HeaderFive and FooterThree from component       | Fixed stacked navbar issue - DefaultLayout already provides these |
| 2025-01-27 | Simplified component to only include page content sections        | Improved layout consistency and removed duplication |

## 🎨 Styling Notes
- Uses consistent theme styling
- Responsive design for all device sizes
- Smooth scrolling and animations
- Proper spacing and typography

## 🔗 Route Integration
- **Route:** `/about-us`
- **Layout:** `(default)` layout group
- **Page File:** `src/app/(default)/about-us/page.tsx`
- **Component:** `src/components/about-us/index.tsx`

## 🎯 Content Areas

### About Area (AboutAreaHomeOne)
- Company story and mission
- Craftsmanship details
- Brand values and philosophy

### Fun Facts (FunFactAreaHomeOne)
- Company statistics
- Achievement numbers
- Visual counters and animations

### Testimonials (TestimonialAreaHomeOne)
- Customer reviews
- Success stories
- Social proof elements

### Contact Area (ContactAreaHomeOne)
- Contact form
- Company contact information
- Location details

## 📱 Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interactions
- Proper image scaling

## 🎯 SEO Optimization
- Proper meta tags set in page route
- Semantic HTML structure
- Breadcrumb navigation for search engines
- Optimized content structure

## 🔧 Technical Notes
- Uses TypeScript for type safety
- Implements lazy loading for performance
- Follows Next.js best practices
- Consistent with site architecture
