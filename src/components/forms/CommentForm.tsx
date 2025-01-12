'use client'

import React from 'react';
import { toast } from 'react-toastify';

import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';


interface FormData {
  email: string; 
  name: string;
  phone: string; 
  message: string;
}

const schema = yup
  .object({
    email: yup.string().required().email().label("Email"),
    name: yup.string().required().label("Name"),
    phone: yup.string().required().label("Phone"), 
    message: yup.string().required().label("Message"),
  })
  .required();

const CommentForm = () => {

  const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
  const onSubmit = (data: FormData) => {
    const notify = () => toast("Message send successful");
    notify();
    reset();
    console.log(data);
  };



  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-12">
            <div className="tp-form-input-box">
              <input type="text" placeholder="Your Name" {...register("name")} />
              <p className="form_error">{errors.name?.message}</p>
            </div>
          </div>
          <div className="col-12">
            <div className="tp-form-input-box">
              <input type="email" placeholder="Your Email" {...register("email")} />
              <p className="form_error">{errors.email?.message}</p>
            </div>
          </div>
          <div className="col-12">
            <div className="tp-form-input-box">
              <input type="text" placeholder="Your Phone" {...register("phone")} />
              <p className="form_error">{errors.phone?.message}</p>
            </div>
          </div>
          <div className="col-xl-12 col-lg-12 mb-40">
            <div className="tp-form-textarea-box">
              <textarea placeholder="Messege" {...register("message")}></textarea>
              <p className="form_error">{errors.message?.message}</p>
            </div>
          </div>
        </div>
        <button className="tp-btn-theme w-100"><span>Send a messege</span></button>
      </form>
    </>
  );
};

export default CommentForm;