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
      // Add error handling
      onError: (error, { dispatch, getState }) => {
        console.error('Error fetching products:', error);
      },
    }),
    getAllProducts: builder.query({
      query: () => '/products/all',
      providesTags: [{ type: 'Products' }],
      // Add error handling
      onError: (error, { dispatch, getState }) => {
        console.error('Error fetching all products:', error);
      },
    }),
    getSingleProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
      // Add error handling
      onError: (error, { dispatch, getState }) => {
        console.error(`Error fetching product with ID ${getState().arg}:`, error);
      },
    }),
    getRandomProducts: builder.query({
      query: (excludeId) => `/products/random?excludeId=${excludeId || ''}&limit=4`,
      // Add error handling
      onError: (error, { dispatch, getState }) => {
        console.error('Error fetching random products:', error);
      },
    }),
  }),
});


export const {
  useGetShowingProductsQuery,
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useGetRandomProductsQuery
} = productApi;
