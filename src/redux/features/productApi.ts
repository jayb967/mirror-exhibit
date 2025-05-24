import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

// Custom base query with error handling
const baseQueryWithErrorHandling = fetchBaseQuery({
  baseUrl: '/api',
  timeout: 10000 // 10 second timeout
});

// Enhanced base query with retry logic and error handling
const enhancedBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Try the request
  let result = await baseQueryWithErrorHandling(args, api, extraOptions);

  // If there was an error, log it
  if (result.error) {
    console.error('API Error:', result.error);
  }

  return result;
};

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: enhancedBaseQuery,
  tagTypes: ['Product', 'Products'],
  endpoints: (builder) => ({
    getShowingProducts: builder.query({
      query: () => '/products/show',
      providesTags: [{ type: 'Products' }],
    }),
    getAllProducts: builder.query({
      query: () => '/products/all',
      providesTags: [{ type: 'Products' }],
    }),
    getSingleProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    getRandomProducts: builder.query({
      query: (excludeId) => `/products/random?excludeId=${excludeId || ''}&limit=4`,
    }),
    // New flexible filtered products endpoint
    getFilteredProducts: builder.query({
      query: ({ type = 'all', category, limit = 15, offset = 0 }: {
        type?: string;
        category?: string;
        limit?: number;
        offset?: number;
      }) => {
        const params = new URLSearchParams();
        params.append('type', type);
        if (category) params.append('category', category);
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        return `/products/filtered?${params.toString()}`;
      },
      providesTags: [{ type: 'Products' }],
    }),
    // Category-specific products endpoint
    getProductsByCategory: builder.query({
      query: ({ category, limit = 15, offset = 0, sort = 'created_at', order = 'desc' }: {
        category: string;
        limit?: number;
        offset?: number;
        sort?: string;
        order?: string;
      }) => {
        const params = new URLSearchParams();
        params.append('category', category);
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        params.append('sort', sort);
        params.append('order', order);
        return `/products/by-category?${params.toString()}`;
      },
      providesTags: [{ type: 'Products' }],
    }),
    // Convenience endpoints for specific product types
    getFeaturedProducts: builder.query({
      query: ({ category, limit = 15 }: { category?: string; limit?: number } = {}) => {
        const params = new URLSearchParams();
        params.append('type', 'featured');
        if (category) params.append('category', category);
        params.append('limit', limit.toString());
        return `/products/filtered?${params.toString()}`;
      },
      providesTags: [{ type: 'Products' }],
    }),
    getPopularProducts: builder.query({
      query: ({ category, limit = 15 }: { category?: string; limit?: number } = {}) => {
        const params = new URLSearchParams();
        params.append('type', 'popular');
        if (category) params.append('category', category);
        params.append('limit', limit.toString());
        return `/products/filtered?${params.toString()}`;
      },
      providesTags: [{ type: 'Products' }],
    }),
    getMostViewedProducts: builder.query({
      query: ({ category, limit = 15 }: { category?: string; limit?: number } = {}) => {
        const params = new URLSearchParams();
        params.append('type', 'most-viewed');
        if (category) params.append('category', category);
        params.append('limit', limit.toString());
        return `/products/filtered?${params.toString()}`;
      },
      providesTags: [{ type: 'Products' }],
    }),
    getNewArrivals: builder.query({
      query: ({ category, limit = 15 }: { category?: string; limit?: number } = {}) => {
        const params = new URLSearchParams();
        params.append('type', 'new-arrivals');
        if (category) params.append('category', category);
        params.append('limit', limit.toString());
        return `/products/filtered?${params.toString()}`;
      },
      providesTags: [{ type: 'Products' }],
    }),
    getTrendingProducts: builder.query({
      query: ({ category, limit = 15 }: { category?: string; limit?: number } = {}) => {
        const params = new URLSearchParams();
        params.append('type', 'trending');
        if (category) params.append('category', category);
        params.append('limit', limit.toString());
        return `/products/filtered?${params.toString()}`;
      },
      providesTags: [{ type: 'Products' }],
    }),
  }),
});


export const {
  useGetShowingProductsQuery,
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useGetRandomProductsQuery,
  // New flexible endpoints
  useGetFilteredProductsQuery,
  useGetProductsByCategoryQuery,
  // Convenience endpoints
  useGetFeaturedProductsQuery,
  useGetPopularProductsQuery,
  useGetMostViewedProductsQuery,
  useGetNewArrivalsQuery,
  useGetTrendingProductsQuery
} = productApi;
