# Home Page Performance Optimizations

A comprehensive performance optimization suite for the Mirror Exhibit home page, designed to eliminate scroll lag and provide smooth user experience while maintaining visual appeal.

## 📋 Features

- **Performance-Based Configuration**: Adaptive settings based on device capabilities
- **Lazy Loading**: Intersection Observer-based component loading
- **Scroll Optimization**: Throttled events and autoplay management
- **Memory Management**: Efficient cleanup and monitoring
- **Animation Optimization**: Hardware-accelerated, non-blocking animations
- **WebGL Optimization**: Conditional loading for high-performance devices only
- **Real-time Monitoring**: Performance metrics tracking and logging

## 🚀 Major Performance Improvements

### ScrollSmoother Optimization
- **Dynamic smooth values** based on device performance detection
- **Reduced motion support** for accessibility compliance
- **Mobile-specific optimizations** with lower smooth values
- **Effects disabled** on medium/low performance devices

### Lazy Loading System
- **LazySection component** for intersection-based loading
- **Priority loading** for above-the-fold content
- **100px root margin** for smooth loading transitions
- **Conditional API calls** only when components are visible

### Product Carousel Performance
- **Scroll-based autoplay pausing** during user interaction (desktop only)
- **Mobile autoplay enabled** for discoverability - continues during scroll
- **Throttled scroll detection** (50ms) to reduce event frequency
- **Intersection Observer** for API calls optimization
- **Image lazy loading** with priority flags for first 4 products
- **Virtual loading** with skeleton placeholders

### Mobile Carousel Enhancements
- **Partial slide preview** (1.2 slides visible) to indicate swipeability
- **Centered slides** with scale effects for active slide emphasis
- **Faster autoplay** (20% faster than desktop) for better engagement
- **Enhanced touch sensitivity** (1.5x) for easier swiping
- **Visual gradient hints** to show additional content
- **Scale animations** for active/inactive slides
- **Touch-optimized** with diagonal swipe support

## 🔧 Recent Updates (2025) - Performance Optimization

### Major Performance Overhaul
- **ScrollSmoother optimization**: Dynamic configuration based on device performance
- **Lazy loading implementation**: Intersection Observer for all non-critical sections
- **Product carousel optimization**: Scroll-based autoplay management and throttled events
- **Animation performance**: Hardware acceleration and requestIdleCallback usage
- **WebGL conditional loading**: Only load on high-performance devices
- **Memory management**: Real-time monitoring and automatic cleanup
- **Performance monitoring**: Comprehensive metrics tracking (FCP, LCP, FID, CLS)

### Error Handling Improvements
- **Removed placeholder products**: No longer shows fallback product data when API fails
- **Added error state**: Shows "Couldn't retrieve products" message when products can't be loaded
- **Skeleton loaders**: Displays loading skeletons during data fetching
- **Better UX**: Clear messaging when products are unavailable instead of showing fake data

## 🎯 Product Types Supported

| Product Type | Description | API Endpoint |
|-------------|-------------|--------------|
| `featured` | Featured products only | `/api/products/filtered?type=featured` |
| `popular` | Most popular products by view count | `/api/products/filtered?type=popular` |
| `most-viewed` | Products with highest view counts | `/api/products/filtered?type=most-viewed` |
| `new-arrivals` | Newest products by creation date | `/api/products/filtered?type=new-arrivals` |
| `trending` | Recently popular products | `/api/products/filtered?type=trending` |
| `all` | All products (default behavior) | `/api/products/show` |

## 🏷️ Category Filtering

The component supports filtering by product categories:

- **Wall Mirrors**: `category="wall-mirrors"`
- **Floor Mirrors**: `category="floor-mirrors"`
- **Decorative Mirrors**: `category="decorative-mirrors"`
- **Bathroom Mirrors**: `category="bathroom-mirrors"`
- **Custom Categories**: Any category slug or name

## 📊 Analytics Events Tracked

| Event Type | Description | When Triggered |
|------------|-------------|----------------|
| `carousel_interaction` | Navigation actions | Next/prev buttons, pause/resume |
| `product_view` | Product visibility | When products load in carousel |
| `product_click` | Product interactions | Clicking on product cards |
| `add_to_cart_click` | Cart additions | Add to cart button clicks |

## 🔧 Props Interface

```typescript
interface ProductAreaHomeFourProps {
  // Product filtering
  productType?: 'featured' | 'popular' | 'most-viewed' | 'new-arrivals' | 'trending' | 'all';
  category?: string; // Category slug or name

  // Display customization
  title?: string;
  subtitle?: string;
  description?: string;
  sectionId?: string;

  // Behavior options
  limit?: number; // Default 15
  autoplay?: boolean; // Default true
  autoplayDelay?: number; // Default 5000ms
  showViewAll?: boolean; // Show "View All" link
  viewAllLink?: string; // Custom link for "View All"

  // Styling options
  className?: string;
  containerClassName?: string;
}
```

## 🚀 Usage Examples

### Basic Usage (Default Behavior)
```jsx
<ProductAreaHomeFour />
```

### Featured Products
```jsx
<ProductAreaHomeFour
  productType="featured"
  title="Featured Collection"
  subtitle="Handpicked Selection"
  description="Our most popular mirrors chosen by design experts"
  sectionId="featured-products"
/>
```

### Category-Specific Products
```jsx
<ProductAreaHomeFour
  productType="popular"
  category="wall-mirrors"
  title="Popular Wall Mirrors"
  subtitle="Customer Favorites"
  description="The most loved wall mirrors by our customers"
  sectionId="popular-wall-mirrors"
  showViewAll={true}
  viewAllLink="/shop?category=wall-mirrors&sort=popular"
/>
```

### New Arrivals with Custom Styling
```jsx
<ProductAreaHomeFour
  productType="new-arrivals"
  title="Fresh Designs"
  subtitle="New Arrivals"
  description="Latest additions to our mirror collection"
  sectionId="new-arrivals"
  limit={12}
  autoplayDelay={3000}
  className="custom-carousel"
  containerClassName="custom-container"
/>
```

### Trending Products by Category
```jsx
<ProductAreaHomeFour
  productType="trending"
  category="decorative-mirrors"
  title="Trending Decorative Pieces"
  subtitle="What's Hot"
  description="The most popular decorative mirrors this month"
  sectionId="trending-decorative"
  showViewAll={true}
  viewAllLink="/shop/decorative-mirrors?trending=true"
/>
```

### Disabled Autoplay
```jsx
<ProductAreaHomeFour
  productType="featured"
  title="Featured Products"
  autoplay={false}
  sectionId="static-featured"
/>
```

## 🎨 Styling Options

### CSS Classes Applied
- `tp-product-2-area` - Main container
- `tp-product-2-style-3` - Style variant
- `product-carousel-wrapper` - Carousel wrapper
- `swiper-container` - Swiper container
- `tp-product-2-active` - Active carousel class

### Custom Styling
```jsx
<ProductAreaHomeFour
  className="my-custom-carousel"
  containerClassName="my-custom-container"
  // ... other props
/>
```

## 📱 Responsive Breakpoints

| Screen Size | Slides Visible | Spacing |
|-------------|----------------|---------|
| 1600px+ | 4 slides | 40px |
| 1400px+ | 4 slides | 40px |
| 1200px+ | 3 slides | 30px |
| 992px+ | 3 slides | 30px |
| 768px+ | 2 slides | 20px |
| 576px+ | 2 slides | 20px |
| <576px | 1 slide | 10px |

## 🔄 API Integration

The component automatically selects the appropriate API endpoint based on props:

1. **Combined Filtering**: `productType` + `category` → `/api/products/filtered`
2. **Category Only**: `category` → `/api/products/by-category`
3. **Type Only**: `productType` → Type-specific endpoints
4. **Default**: No filters → `/api/products/show`

## 📈 Performance Features

### Core Optimizations
- **Intersection Observer**: Components only load when visible
- **Throttled Events**: Scroll events limited to 50ms intervals
- **Hardware Acceleration**: force3D enabled for animations
- **requestIdleCallback**: Non-critical operations deferred
- **Performance Detection**: Automatic device capability assessment

### API & Data Optimization
- **Conditional API Calls**: Only fetch when components are in view
- **Efficient Query Management**: Skip unnecessary API calls
- **Redux RTK Query Caching**: Intelligent caching for repeated requests
- **Priority Loading**: First 4 products get priority image loading
- **Batch Analytics**: Events are batched for performance

### Memory Management
- **Automatic Cleanup**: Event listeners and observers properly disposed
- **Memory Monitoring**: Real-time memory usage tracking
- **Animation Cleanup**: GSAP animations properly killed on unmount
- **Observer Disposal**: Intersection observers cleaned up correctly

### Performance Monitoring
- **Core Web Vitals**: FCP, LCP, FID, CLS tracking
- **Scroll Performance**: Frame drop detection and logging
- **Memory Usage**: Periodic memory usage monitoring
- **Performance Summary**: Comprehensive performance logging

## 🎯 Best Practices

1. **Unique Section IDs**: Always provide unique `sectionId` for analytics
2. **Appropriate Limits**: Use reasonable `limit` values (15-20 max)
3. **Category Consistency**: Use consistent category slugs
4. **View All Links**: Provide meaningful `viewAllLink` URLs
5. **Loading States**: Component handles loading states automatically

## 🐛 Troubleshooting

### Performance Issues
- **Check console logs**: Look for performance configuration messages
- **Monitor frame drops**: Check scroll performance logs in console
- **Memory usage**: Watch for memory warnings in console
- **Device performance**: Verify appropriate config is being applied

### No Products Displayed
- Check API endpoints are working
- Verify category names/slugs are correct
- Check network requests in browser dev tools
- Ensure components have intersected (lazy loading)

### Analytics Not Working
- Ensure analytics utilities are properly imported
- Check browser console for errors
- Verify analytics API endpoint is accessible

### Styling Issues
- Check CSS class conflicts
- Verify Swiper CSS is loaded
- Use browser dev tools to inspect styles

### Animation Performance
- Check for `force3D` warnings in console
- Monitor GSAP performance in dev tools
- Verify animations are being cleaned up properly

## 📊 Performance Monitoring

### Console Logs to Watch
```
🚀 Initializing ScrollSmoother with high performance config
🎨 Initializing animations...
🎮 Initializing WebGL effects...
📊 Scroll Performance - Events: 100, Frame drops: 2 (2.0%)
🧠 Memory Usage: 45MB / 128MB (Limit: 2048MB)
🎨 First Contentful Paint: 1234.56ms
🖼️ Largest Contentful Paint: 2345.67ms
⚡ First Input Delay: 12.34ms
📐 Cumulative Layout Shift: 0.0123
🌐 Time to First Byte: 123.45ms
```

### Performance Targets
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Frame drops during scroll:** < 5%
- **Memory usage:** Stable, no leaks

## 🔮 Future Enhancements

- [ ] Product card analytics integration
- [ ] Advanced filtering options
- [ ] Custom sorting capabilities
- [ ] Infinite scroll support
- [ ] Product comparison features
- [ ] Wishlist integration
