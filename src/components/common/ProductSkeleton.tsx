import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="product-skeleton">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-price"></div>
      </div>
      <style jsx>{`
        .product-skeleton {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          animation: pulse 1.5s infinite;
        }
        
        .skeleton-image {
          width: 100%;
          padding-bottom: 100%; /* 1:1 Aspect ratio */
          background-color: #f0f0f0;
          position: relative;
        }
        
        .skeleton-content {
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 80px;
          border-top: 1px solid #f5f5f5;
        }
        
        .skeleton-title {
          height: 20px;
          width: 70%;
          background-color: #f0f0f0;
          border-radius: 4px;
        }
        
        .skeleton-price {
          height: 20px;
          width: 20%;
          background-color: #f0f0f0;
          border-radius: 4px;
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductSkeleton;
