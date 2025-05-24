# Contexts

## 📌 Purpose
This folder contains React Context providers that manage global application state and provide shared functionality across components.

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
