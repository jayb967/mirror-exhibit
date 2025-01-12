
import React from 'react';
import Link from 'next/link';

interface DataType {
  title: string;
  price: number;
  delay: string;
  feature_data: string[];
}

const price_data: DataType[] = [
  {
    title: "Stater  Plan",
    price: 19,
    delay: '.3s',
    feature_data: [
      "Mistakes To Avoid",
      "Your Startup",
      "Knew About Fonts",
      "Winning Metric for Your Startup",
      "Your Startup",
    ]
  },
  {
    title: "Basic Plan",
    price: 29,
    delay: '.5s',
    feature_data: [
      "Mistakes To Avoid",
      "Your Startup",
      "Knew About Fonts",
      "Winning Metric for Your Startup",
      "Your Startup",
    ]
  },
  {
    title: "Premium Plan",
    price: 89,
    delay: '.7s',
    feature_data: [
      "Mistakes To Avoid",
      "Your Startup",
      "Knew About Fonts",
      "Winning Metric for Your Startup",
      "Your Startup",
    ]
  },

]

const PricingArea = () => {
  return (
    <>
      <div className="tp-price-area pb-150">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-price-title-box mb-60 text-center">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">pricing section</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">Designing the Future One <br /> Room at a Time</h3>
              </div>
            </div>
            {price_data.map((item, i) => (
              <div key={i} className="col-xl-4 col-lg-4 col-md-6 mb-50 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay={item.delay}>
                <div className="tp-price-item text-center">
                  <h4 className="tp-price-title pb-40">{item.title}</h4>
                  <div className="tp-price-rate">
                    <h6><i>${item.price}</i>/mo</h6>
                  </div>
                  <div className="tp-price-content">
                    <div className="tp-price-list pb-40 text-start">
                      <ul>
                        {item.feature_data.map((feature, index) => (
                          <li key={index}><i className="fa-sharp fa-solid fa-square-check"></i>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="tp-price-button">
                      <Link className="tp-btn-theme w-100" href="/contact">
                        <span>Get Now
                          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.25 4.71875L12.25 7.4375C12.4062 7.5625 12.4688 7.75 12.5 8C12.5 8.1875 12.4062 8.40625 12.25 8.5L9.25 11.2812C9.03125 11.5 8.71875 11.5312 8.4375 11.4375C8.15625 11.3125 8 11.0312 8 10.75V9H5.25C4.8125 9 4.5 8.6875 4.5 8.25V7.75C4.5 7.34375 4.8125 7 5.25 7H7.96875V5.25C7.96875 4.96875 8.1875 4.6875 8.4375 4.59375C8.6875 4.46875 9.03125 4.5 9.25 4.71875ZM8.5 0C12.9062 0 16.5 3.59375 16.5 8C16.5 12.4375 12.9062 16 8.5 16C4.0625 16 0.5 12.4375 0.5 8C0.5 3.59375 4.0625 0 8.5 0ZM8.5 14.5C12.0625 14.5 15 11.5938 15 8C15 4.4375 12.0625 1.5 8.5 1.5C4.90625 1.5 2 4.4375 2 8C2 11.5938 4.90625 14.5 8.5 14.5Z" fill="currentcolor" />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingArea;