# Mirror Exhibit Admin Section

This directory contains the admin section of the Mirror Exhibit application, migrated from the standalone mirror-exhibit-admin project.

## Structure

- `layout.tsx` - The main layout for all admin pages (no longer wraps with AdminLayout)
- `page.tsx` - The admin dashboard page
- `globals.css` - Admin-specific global styles with Tailwind CSS
- Various feature-specific folders for different admin functions

## Technology Stack

The admin section uses:

- Next.js 14+
- React 18+
- Tailwind CSS (with prefix `tw-` to avoid conflicts with Bootstrap)
- React Hook Form for form handling
- Redux Toolkit for state management
- React Toastify for notifications
- Chart.js for data visualization
- Various UI components migrated from the original admin project

## Integration Notes

The admin section is integrated into the main Mirror Exhibit NextJS application with the following considerations:

1. Tailwind CSS is configured with a prefix (`tw-`) to avoid conflicts with Bootstrap
2. The admin section has its own layout and navigation
3. Authentication and API calls use Supabase instead of the original backend
4. Each page uses SimpleAdminLayout component for consistent styling
5. Client-side only rendering is used for navigation to avoid hydration errors

## Recent Changes

| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2024-06-01 | Removed AdminLayout wrapper from admin layout                      | Fix hydration errors           |
| 2024-06-01 | Added suppressHydrationWarning to prevent hydration errors         | Fix content disappearing issue |
| 2024-06-01 | Updated all admin pages to use SimpleAdminLayout                   | Consistent styling             |
| 2024-06-01 | Created client-side only SimpleAdminLayout component               | Avoid server/client mismatch   |
| 2024-06-01 | Updated font sizes to minimum 12px                                 | Improve readability            |
| 2024-06-01 | Standardized button colors to match theme                          | Consistency with frontend      |

## Design Notes

- The admin dashboard follows the main site's theme with black, white, and gold (#A6A182) color scheme
- No rounded corners are used to maintain the modern contemporary style
- Icons are sized appropriately (5x5 instead of 6x6) to avoid appearing oversized
- Consistent spacing and padding throughout the layout
- All font sizes are at least 12px for readability
- Buttons use the theme colors (black primary buttons, gold secondary buttons)

## Migration Status

The migration is currently in progress. Current status:

- [x] Setup and dependency installation
- [x] Core components migration
- [x] Feature components migration
- [x] State management and API integration
- [ ] Testing and optimization