# ProductAreaHomeFour Component

A flexible, analytics-enabled product carousel component for displaying different types of products with customizable filtering, styling, and behavior options.

## 📋 Features

- **Flexible Product Filtering**: Support for multiple product types and categories
- **Analytics Integration**: Comprehensive user interaction tracking
- **Responsive Design**: Mobile-friendly carousel with adaptive breakpoints
- **Customizable Content**: Dynamic titles, subtitles, and descriptions
- **Performance Optimized**: Efficient API calls with caching and fallbacks
- **Accessibility**: Keyboard navigation and screen reader support

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

- **Efficient API Calls**: Only active queries are executed
- **Caching**: Redux RTK Query caching for repeated requests
- **Fallback Products**: Graceful degradation when API fails
- **Lazy Loading**: Images load with priority optimization
- **Batch Analytics**: Events are batched for performance

## 🎯 Best Practices

1. **Unique Section IDs**: Always provide unique `sectionId` for analytics
2. **Appropriate Limits**: Use reasonable `limit` values (15-20 max)
3. **Category Consistency**: Use consistent category slugs
4. **View All Links**: Provide meaningful `viewAllLink` URLs
5. **Loading States**: Component handles loading states automatically

## 🐛 Troubleshooting

### No Products Displayed
- Check API endpoints are working
- Verify category names/slugs are correct
- Check network requests in browser dev tools

### Analytics Not Working
- Ensure analytics utilities are properly imported
- Check browser console for errors
- Verify analytics API endpoint is accessible

### Styling Issues
- Check CSS class conflicts
- Verify Swiper CSS is loaded
- Use browser dev tools to inspect styles

## 🔮 Future Enhancements

- [ ] Product card analytics integration
- [ ] Advanced filtering options
- [ ] Custom sorting capabilities
- [ ] Infinite scroll support
- [ ] Product comparison features
- [ ] Wishlist integration
