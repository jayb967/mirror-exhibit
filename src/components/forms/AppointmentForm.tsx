'use client'

import NiceSelect from '@/ui/NiceSelect';
import React from 'react';

const AppointmentForm = () => {
  const selectHandler = (e: any) => { };

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="row">
          <div className="col-xl-6 col-lg-6 mb-30">
            <div className="tp-form-input-box">
              <input type="text" placeholder="First name*" />
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 mb-30">
            <div className="tp-form-input-box">
              <input type="text" placeholder="Last name*" />
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 mb-30">
            <div className="tp-form-input-box">
              <input type="email" placeholder="Your Email*" />
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 mb-30">
            <div className="tp-form-input-box">
              <input type="text" placeholder="Street Address*" />
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 mb-30">
            <div className="tp-form-input-box">
              <input type="text" placeholder="Your Phone*" />
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 mb-10">
            <div className="tp-form-input-box">
              <div className="postbox__select">
                <NiceSelect
                  className="input-fieldf"
                  options={[
                    { value: "01", text: "Choose Your Country" },
                    { value: "02", text: "01 Year" },
                    { value: "03", text: "02 Year" },
                    { value: "04", text: "03 Year" },
                    { value: "05", text: "04 Year" },
                    { value: "06", text: "05 Year" },
                  ]}
                  defaultCurrent={0}
                  onChange={selectHandler}
                  name=""
                  placeholder="" />

              </div>
            </div>
          </div>
          <div className="col-xl-12 col-lg-12 mb-10">
            <div className="tp-form-input-box">
              <div className="postbox__select">

                <NiceSelect
                  className="input-fieldf"
                  options={[
                    { value: "01", text: "Service Type" },
                    { value: "02", text: "01 Year" },
                    { value: "03", text: "02 Year" },
                    { value: "04", text: "03 Year" },
                    { value: "05", text: "04 Year" },
                    { value: "06", text: "05 Year" },
                  ]}
                  defaultCurrent={0}
                  onChange={selectHandler}
                  name=""
                  placeholder="" />

              </div>
            </div>
          </div>
          <div className="col-xl-12 col-lg-12 mb-60">
            <div className="tp-form-textarea-box">
              <textarea placeholder="Messege"></textarea>
            </div>
          </div>
        </div>
        <button className="tp-btn-theme theme-lg"><span>Send a messege</span></button>
      </form>
    </>
  );
};

export default AppointmentForm;