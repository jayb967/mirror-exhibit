

import React from 'react';
import ContactForm from '../forms/ContactForm';

const ContactArea = () => {
  return (
    <>
      <div className="tp-form-area pt-145 pb-150">
        <div className="container">
          <div className="tp-form-top pb-100">
            <div className="row">
              <div className="col-xl-8 col-lg-8 mb-50">
                <div className="tp-form-box tp-form-box-style-2">
                  <h4 className="tp-section-title pb-60">Contact us below</h4>

                  <ContactForm /> 

                </div>
              </div>
              <div className="col-xl-4 col-lg-4 mb-50">
                <div className="tp-contact-box">
                  <h4 className="tp-section-title pb-10">Get in touch </h4>
                  <p className="pb-25">Fill out the form or shoot us an email here </p>
                  <ul>
                    
                    <li>
                      <div className="tp-contact-item d-flex align-items-center">
                        <div className="tp-contact-icon-2">
                          <span>
                            <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18.125 0C19.1406 0 20 0.859375 20 1.875C20 2.5 19.6875 3.04688 19.2188 3.39844L10.7422 9.76562C10.2734 10.1172 9.6875 10.1172 9.21875 9.76562L0.742188 3.39844C0.273438 3.04688 0 2.5 0 1.875C0 0.859375 0.820312 0 1.875 0H18.125ZM8.47656 10.7812C9.375 11.4453 10.5859 11.4453 11.4844 10.7812L20 4.375V12.5C20 13.9062 18.8672 15 17.5 15H2.5C1.09375 15 0 13.9062 0 12.5V4.375L8.47656 10.7812Z" fill="currentcolor" />
                            </svg>
                          </span>
                        </div>
                        <div className="tp-contact-content">
                          <h6>Email Address</h6>
                          <a href="mailto:info@mirrorexhibit.com">info@mirrorexhibit.com</a>
                        </div>
                      </div>
                    </li>
                   
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="tp-map-box">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d423286.2742374521!2d-118.69193037432425!3d34.02016130606357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c0b6e4b0a6b1%3A0x8e4b0a6b1e4b0a6b!2sLos%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1689181288902!5m2!1sen!2sus"
                  width="600" height="450" style={{ border: 0 }} allowFullScreen={true} loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactArea;