 
 
import React from 'react';
import Image from 'next/image';
import AppointmentForm from '../forms/AppointmentForm';
import thumb_img from "@/assets/img/contact/thumb-1-1.jpg";


const AppointmentArea = () => {
 
  return (
    <>
      <div className="tp-appointment-area pt-150 pb-150">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-lg-8">
              <div className="tp-form-box pb-50">
                <h4 className="tp-section-title tp-split-text tp-split-in-right pb-60">Enter You Personal Details</h4>           
                <AppointmentForm />
              </div>
            </div>
            <div className="col-xl-4 col-lg-4">
              <div className="tp-appointment-contact">
                <h6 className="tp-appointment-contact-title pb-20">Method of contact*</h6>
                <div className="tp-appointment-contact-box pb-45">
                  <div className="tp-appointment-contact-item">
                    <input type="radio" id="Phone" name="contact" />
                    <label htmlFor="Phone" data-bs-toggle="Phone">Phoner</label>
                  </div>
                  <div className="tp-appointment-contact-item">
                    <input type="radio" id="E-mail" name="contact" />
                    <label htmlFor="E-mail" data-bs-toggle="E-mail">E-mail</label>
                  </div>
                </div>
                <h6 className="tp-appointment-contact-title pb-20">Communication preferences*</h6>
                <div className="tp-appointment-contact-box">
                  <div className="tp-appointment-contact-item">
                    <input type="radio" id="yes" name="contact" />
                    <label htmlFor="yes" data-bs-toggle="yes">Yes - I would like to receive offers and discounts, offers via email and SMS</label>
                  </div>
                  <div className="tp-appointment-contact-item">
                    <input type="radio" id="no" name="contact" />
                    <label htmlFor="no" data-bs-toggle="no">No - I would not like to receive offers via email <br /> and SMS</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="row align-items-center">
              <div className="col-xl-6 col-lg-6 order-1 order-lg-0">
                <div className="tp-appointment-left">
                  <h4 className="tp-section-title tp-split-text tp-split-in-right pb-30">
                    {`What To Expect From Your Appointment`}
                  </h4>
                  <p className="pb-20">It is a long established fact that reader will be distracted by the readable content of page when looking at its layout. The point of using Lorem is it has a more-or-less normal distribution of letters, using Content here not.</p>
                  <div className="tp-appointment-list">
                    <ul>
                      <li><i className="fa-solid fa-check"></i>One of our specialist surveyors will visit your home to measure your room and identify utilities and services</li>
                      <li><i className="fa-solid fa-check"></i>The home measure will typically take between 30-60 minutes.</li>
                      <li><i className="fa-solid fa-check"></i>Your measurements will then be sent back to your Wren Designer and we will be in touch to arrange a Design</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 order-0 order-lg-1">
                <div className="tp-appointment-thumb">
                  <Image src={thumb_img} alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentArea;