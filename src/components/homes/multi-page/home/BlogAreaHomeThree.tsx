import blog_data from "@/data/blog_data";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const blogs = blog_data.filter((item) => item.path === "home_3");

const BlogAreaHomeThree = () => {
  return (
    <>
      <div
        id="blog-one-page"
        className="tp-blog-2-area fix grey-bg pt-145 pb-150"
      >
        <div className="container">
          <div className="tp-blog-2-title-wrap mb-50">
            <div className="row align-items-end">
              <div className="col-xl-7 col-lg-7">
                <div className="tp-blog-2-title-box">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">
                    Recent Blogs
                  </span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">
                    Unlock the Potential of Your <br /> Home s Interior
                  </h3>
                </div>
              </div>
              <div className="col-xl-5 col-lg-5">
                <div className="tp-blog-2-top-text">
                  <p className="mb-0 text-black">
                    Nemo design enim ipsam voluptatem quim voluptas sit designe
                    aspernatur aut odit auting fugit sed thisnquia consequuntur
                    wa magni dolores eos designer heresm qui ratione{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            {blogs.map((item, i) => (
              <div key={i} className="col-12">
                <div className="tp-blog-2-item">
                  <div className="row align-items-center">
                    <div className="col-xxl-4 col-xl-3 col-lg-3">
                      <div className="tp-blog-2-title-box">
                        <h4 className="tp-blog-2-title">
                          <Link href="/blog-details">
                            Imagination with <br /> Stunning Interior
                          </Link>
                        </h4>
                      </div>
                    </div>
                    <div className="col-xxl-6 col-xl-6 col-lg-6">
                      <div className="tp-blog-2-middle-box d-flex justify-content-between align-items-center">
                        <div className="tp-blog-meta">
                          <span>
                            <svg
                              width="11"
                              height="13"
                              viewBox="0 0 11 13"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3.5625 1.96875H6.9375V1.03125C6.9375 0.726562 7.17188 0.46875 7.5 0.46875C7.80469 0.46875 8.0625 0.726562 8.0625 1.03125V1.96875H9C9.82031 1.96875 10.5 2.64844 10.5 3.46875V10.9688C10.5 11.8125 9.82031 12.4688 9 12.4688H1.5C0.65625 12.4688 0 11.8125 0 10.9688V3.46875C0 2.64844 0.65625 1.96875 1.5 1.96875H2.4375V1.03125C2.4375 0.726562 2.67188 0.46875 3 0.46875C3.30469 0.46875 3.5625 0.726562 3.5625 1.03125V1.96875ZM1.125 6.28125H3V4.96875H1.125V6.28125ZM1.125 7.40625V8.90625H3V7.40625H1.125ZM4.125 7.40625V8.90625H6.375V7.40625H4.125ZM7.5 7.40625V8.90625H9.375V7.40625H7.5ZM9.375 4.96875H7.5V6.28125H9.375V4.96875ZM9.375 10.0312H7.5V11.3438H9C9.1875 11.3438 9.375 11.1797 9.375 10.9688V10.0312ZM6.375 10.0312H4.125V11.3438H6.375V10.0312ZM3 10.0312H1.125V10.9688C1.125 11.1797 1.28906 11.3438 1.5 11.3438H3V10.0312ZM6.375 4.96875H4.125V6.28125H6.375V4.96875Z"
                                fill="black"
                              />
                            </svg>
                            {item.date}, {new Date().getFullYear()}
                          </span>
                          <span>
                            <svg
                              width="17"
                              height="13"
                              viewBox="0 0 17 13"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5.875 0.351562C8.54688 0.351562 10.75 2.20312 10.75 4.47656C10.75 6.77344 8.54688 8.60156 5.875 8.60156C5.42969 8.60156 5.00781 8.55469 4.58594 8.46094C3.88281 8.90625 2.85156 9.35156 1.5625 9.35156C1.32812 9.35156 1.11719 9.23438 1.04688 9C0.953125 8.78906 0.976562 8.55469 1.14062 8.36719C1.16406 8.36719 1.67969 7.80469 2.05469 7.05469C1.39844 6.35156 1 5.46094 1 4.47656C1 2.20312 3.17969 0.351562 5.875 0.351562ZM4.84375 7.35938C5.19531 7.45312 5.52344 7.47656 5.875 7.47656C7.9375 7.47656 9.625 6.14062 9.625 4.47656C9.625 2.83594 7.9375 1.47656 5.875 1.47656C3.78906 1.47656 2.125 2.83594 2.125 4.47656C2.125 5.32031 2.52344 5.92969 2.875 6.28125L3.4375 6.86719L3.0625 7.59375C2.96875 7.73438 2.875 7.89844 2.78125 8.0625C3.20312 7.94531 3.60156 7.75781 4 7.5L4.39844 7.26562L4.84375 7.35938ZM11.3359 3.375C13.9375 3.46875 16 5.27344 16 7.47656C16 8.46094 15.5781 9.35156 14.9219 10.0547C15.2969 10.8047 15.8125 11.3672 15.8359 11.3672C16 11.5547 16.0234 11.7891 15.9297 12C15.8594 12.2344 15.6484 12.3516 15.4141 12.3516C14.125 12.3516 13.0938 11.9062 12.3906 11.4609C11.9688 11.5547 11.5469 11.6016 11.125 11.6016C9.20312 11.6016 7.53906 10.6641 6.74219 9.30469C7.14062 9.25781 7.53906 9.16406 7.89062 9.02344C8.54688 9.91406 9.74219 10.4766 11.125 10.4766C11.4531 10.4766 11.7812 10.4531 12.1328 10.3594L12.5781 10.2656L12.9766 10.5C13.375 10.7578 13.7734 10.9453 14.1953 11.0625C14.1016 10.8984 14.0078 10.7344 13.9141 10.5938L13.5391 9.86719L14.1016 9.28125C14.4531 8.92969 14.875 8.32031 14.875 7.47656C14.875 5.92969 13.375 4.66406 11.4766 4.5L11.5 4.47656C11.5 4.10156 11.4297 3.72656 11.3359 3.375Z"
                                fill="black"
                              />
                            </svg>
                            {item.comments > 1 ? "Comments" : "Comment"} (0{" "}
                            {item.comments})
                          </span>
                        </div>
                        <div className="tp-blog-2-thumb">
                          <Link href="/blog-details">
                            <Image src={item.img} alt="image-here" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-xxl-2 col-xl-3 col-lg-3">
                      <div className="tp-blog-2-button text-lg-end">
                        <Link
                          className="tp-btn-border-lg grey-border-2"
                          href="/blog-details"
                        >
                          <span>View More</span>
                        </Link>
                      </div>
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

export default BlogAreaHomeThree;
