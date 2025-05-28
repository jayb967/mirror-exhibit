# Contexts

## 📌 Purpose
This folder contains React Context providers that manage global application state and provide shared functionality across components.

## Product Options Caching Solution

**Problem Solved:** Multiple product carousels on the home page were experiencing "No customization options available" errors due to race conditions when each `ProductCard` component made individual API calls to `/api/product-options`.

**Solution Implemented:**
- **SessionStorage Caching:** Product options are cached in sessionStorage after the first successful API call
- **Retry Mechanism:** Failed API calls are retried up to 3 times with 1-second delays
- **Shared Cache:** All ProductCard components check cache first before making API calls
- **Fallback Support:** Components gracefully handle missing options

**Technical Details:**
- First component to load fetches options and caches them
- Subsequent components use cached data instantly
- Cache persists for the browser session
- Automatic retry for failed requests prevents temporary network issues

**Files Modified:**
- `src/components/common/ProductCard.tsx` - Added caching and retry logic
- `src/components/shop-details/OurProductArea.tsx` - Added caching support
- `src/app/api/products/filtered/route.ts` - Added variations to response
- `src/app/api/products/show/route.ts` - Added variations to response

## 📂 Files Overview
- `GlobalModalContext.tsx` - Context provider for managing global modal state and functionality

## 🧩 Context Providers

### GlobalModalContext.tsx ⭐ **NEW**
- **Purpose:** Manages global modal state for product options modal across the entire application
- **Usage:**
  ```tsx
  // Wrap your app with the provider (done in AppWrapper)
  <GlobalModalProvider>
    {children}
  </GlobalModalProvider>

  // Use the hook in components
  const { openModal, closeModal, isModalOpen, modalData } = useGlobalModal();
  ```
- **Features:**
  - Centralized modal state management
  - Automatic carousel pause/resume when modal opens/closes
  - Type-safe modal data interface
  - Prevents multiple modals from being open simultaneously
  - Handles cleanup when modal closes

## 🔧 Integration

### How it works:
1. **AppWrapper** wraps the entire app with `GlobalModalProvider`
2. **GlobalProductModal** component is rendered at app level and listens to context state
3. **ProductCard** components use `useGlobalModal()` hook to trigger modal
4. Modal renders using React Portal at `document.body` level for perfect positioning

### Benefits:
- ✅ Modal always renders outside any container constraints
- ✅ Perfect centering regardless of page scroll or carousel position
- ✅ Automatic carousel pause/resume functionality
- ✅ Single source of truth for modal state
- ✅ Type-safe data passing between components
- ✅ SSR-safe implementation

## 🔄 Recent Changes

| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Fixed Font Awesome "Super constructor null" error | Prevent crashes on checkout and other pages |
| 2025-01-27 | Created GlobalModalContext to replace local modal state | Fix modal positioning issues in carousel components |
| 2025-01-27 | Added automatic carousel pause/resume functionality | Ensure carousel stops when modal is open |
| 2025-01-27 | Implemented type-safe modal data interface | Improve developer experience and prevent bugs |

## 🎯 Usage Examples

### Opening a modal from ProductCard:
```tsx
const { openModal } = useGlobalModal();

const handleOpenModal = () => {
  openModal({
    product: productData,
    frameTypes: availableFrames,
    sizes: availableSizes,
    pauseCarousel: () => swiperRef.autoplay.stop(),
    resumeCarousel: () => swiperRef.autoplay.start()
  });
};
```

### Checking modal state:
```tsx
const { isModalOpen, modalData } = useGlobalModal();

if (isModalOpen && modalData) {
  console.log('Modal is open for product:', modalData.product.title);
}
```

## 🔧 Technical Notes
- Uses React.createContext and useContext for state management
- Provides TypeScript interfaces for type safety
- Handles cleanup automatically when component unmounts
- Compatible with SSR (Server-Side Rendering)
- Integrates seamlessly with existing Redux cart functionality

## 🛠️ Font Awesome Icon Fix

**Problem Solved:** "Super constructor null of Fa is not a constructor" error occurring on checkout and other pages, particularly after user login.

**Root Cause:** The application was using Font Awesome Light (`fal`) icons which require Font Awesome Pro, but only had the free version installed. This caused constructor errors when the icons tried to render.

**Solution Implemented:**
- **Completely removed Font Awesome dependency** to eliminate all potential conflicts
- **Replaced all authentication-related Font Awesome icons** with React Icons (react-icons/hi)
- **Moved Font Awesome CSS and font files** to backup folders to prevent loading
- **Added React Icons with modern, theme-matching design**
- **Added custom CSS styling** with hover effects and animations

**Files Modified:**
- `package.json` - Added react-icons package
- `src/styles/custom-fixes.css` - Added React Icons styling and animations
- `src/components/common/ProfileButtonComponent.tsx` - Replaced with React Icons
- `src/components/common/CartButtonComponent.tsx` - Replaced with React Icons
- `src/components/common/ShoppingCart.tsx` - Replaced with React Icons
- `public/assets/css/font-awesome-pro.css` - Moved to backup
- `public/assets/fonts/fa-*` - Moved Font Awesome fonts to backup folder
- `src/styles/index.scss` - Commented out Font Awesome Pro CSS import
- `src/app/api/dashboard/orders/route.ts` - Fixed Clerk auth context issue
- `src/app/api/dashboard/orders/[id]/route.ts` - Fixed Clerk auth context issue
- `src/services/notificationService.ts` - Fixed Clerk auth context issue
- `src/app/api/addresses/route.ts` - Fixed Clerk auth context issue
- `src/utils/clerk-supabase.ts` - Deprecated problematic function

**React Icon Replacements:**
- `fa-solid fa-user` → `<HiUser />` (user profile)
- `fa-solid fa-spinner` → `<HiRefresh className="animate-spin" />` (loading)
- `fa-solid fa-tachometer-alt` → `<HiChartBar />` (dashboard)
- `fa-solid fa-box` → `<HiShoppingBag />` (orders)
- `fa-solid fa-cog` → `<HiCog />` (settings)
- `fa-solid fa-sign-out-alt` → `<HiLogout />` (sign out)
- `fa-solid fa-sign-in-alt` → `<HiLogin />` (sign in)
- `fa-solid fa-user-plus` → `<HiUserAdd />` (sign up)
- `fa-light fa-trash-can` → `<HiTrash />` (delete)
- `fa-sharp fa-solid fa-cart-shopping` → `<HiShoppingCart />` (cart)
