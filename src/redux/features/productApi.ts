import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }), // Replace with your backend URL
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
  }),
});


export const { useGetShowingProductsQuery, useGetAllProductsQuery, useGetSingleProductQuery } = productApi;
