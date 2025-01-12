
'use client'

import React from 'react';
import { toast } from 'react-toastify';

import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';


interface FormData {
  email: string;
  phone: string;
  name: string;
  address: string;
  message: string;
}

const schema = yup
  .object({
    email: yup.string().required().email().label("Email"),
    phone: yup.string().required().label("Phone"),
    name: yup.string().required().label("Name"),
    address: yup.string().required().label("Subject"),
    message: yup.string().required().label("Message"),
  })
  .required();


const ContactForm = () => {

 
  const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
  const onSubmit = (data: FormData) => {   
    const notify = () => toast("Message send successful");
    notify();
    reset();
    console.log(data);
  };


  return (
    <>
      <form id="contact-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-xl-6 col-lg-6 mb-10">
            <div className="tp-form-input-box">
              <input type="text" placeholder="First name" {...register("name")} />
              <p className="form_error">{errors.name?.message}</p>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 mb-10">
            <div className="tp-form-input-box">
              <input type="email" placeholder="Your Email" {...register("email")} />
              <p className="form_error">{errors.email?.message}</p>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 mb-10">
            <div className="tp-form-input-box">
              <input type="text" placeholder="Phone" {...register("phone")} />
              <p className="form_error">{errors.phone?.message}</p>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 mb-10">
            <div className="tp-form-input-box">
              <input type="text" placeholder="Address" {...register("address")} />
              <p className="form_error">{errors.address?.message}</p>
            </div>
          </div>
          <div className="col-xl-12 col-lg-12 mb-10">
            <div className="tp-form-textarea-box">
              <textarea placeholder="Messege" {...register("message")}></textarea>
              <p className="form_error">{errors.message?.message}</p>
            </div>
          </div>
        </div>
        <button className="tp-btn-theme black-bg" type="submit"><span>Send a messege</span></button>

      </form>
    </>
  );
};

export default ContactForm;