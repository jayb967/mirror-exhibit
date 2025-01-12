

import React from 'react';
import Image from 'next/image';
import shape_img from "@/assets/img/contact/shape-1-1.png"
import ContactFormHomeOne from '@/components/forms/ContactFormHomeOne';

const contact_content = {
  subtitle: "Message",
  title: <>Do you Question <br /> Please Contact Us ?</>,
  description: `Nemo design enim ipsam voluptatem quim voluptas sit aspernatur aut odit auting fugit sed thisnquia consequuntur magni dolores eos designer heresm qui ratione.`
}
const {
  subtitle,
  title,
  description
} = contact_content

const ContactAreaHomeOne = () => {
  return (
    <>
      <div id="contact-one-page" className="tp-contact-area p-relative black-bg fix pt-115 pb-120 z-index">
        <div className="tp-contact-shape-1">
          <Image src={shape_img} alt="image-here" />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-6">
              <div className="tp-contact-left">
                <div className="tp-contact-title-box mb-20">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                  <h3 className="tp-section-title text-white tp-split-text tp-split-in-right">{title}</h3>
                </div>
                <div className="tp-contact-text">
                  <p>{description}</p>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6  wow tpfadeRight" data-wow-duration=".9s" data-wow-delay=".7s">
              <div className="tp-contact-right">
                <ContactFormHomeOne />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactAreaHomeOne;