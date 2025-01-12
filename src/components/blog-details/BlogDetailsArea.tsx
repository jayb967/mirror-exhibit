
import React from 'react';
import Image from 'next/image';
import PostboxSidebar from '../common/PostboxSidebar';

import blog_img_1 from "@/assets/img/blog/blog-details-1-1.jpg";
import blog_img_2 from "@/assets/img/blog/blog-details-1-2.jpg";
import blog_img_3 from "@/assets/img/blog/blog-details-1-3.jpg";
// import quote_img_1 from "@/assets/img/blog/quote.png";
import author_img_1 from "@/assets/img/blog/author-1-3.png";
import author_img_2 from "@/assets/img/blog/author-1-1.png";
import author_img_3 from "@/assets/img/blog/author-1-2.png";
import CommentForm from '../forms/CommentForm';



const blog_details_content = {
  date: `08 April`,
  writer: `Devide`,
  solution: `Solution`,
  comment: 2,
  title: `Living Experience with Luxurious Interiors`,
  description: `There are many variations of passages of Lorem Ipsum available, but majority have suffered alteration in some form, by injected humour, or randomised words which don’t look even slightly believable. If you are going to use a passage of Lorem Ipsum. There are many variations of passages of Lorem Ipsum available, but majority have suffered alteration in some form, by injected humour, or randomised words which don’t look even slightly believable. If you are going to use a passage of Lorem Ipsum.`,
  description_2: `Suspendisse ultricies vestibulum vehicula. Proin laoreet porttitor lacus. Duis auctor vel ex eu elementum. Fusce eu volutpat felis. Proin sed eros tincidunt, sagittis sapien eu, porta diam. Aenean finibus scelerisque nulla non facilisis. Fusce vel orci sed quam gravid`,
  title_2: `Our Personal Approach`,
  description_3: `Aliquam condimentum, massa vel mollis volutpat, erat sem pharetra quam, ac mattis arcu elit non massa. Nam mollis nunc velit, vel varius arcu fringilla tristique. Cras elit nunc, sagittis eu bibendum eu, ultrices placerat sem. Praesent vitae metus auctor.`,
  quote: <>And the day came when the risk to remain tight in <br /> a bud was more painful than the risk.</>,
  quote_writer: `Harry Newman`,
  tags_title: `Tags`,
  tags: ['Electricity', 'Biddut', 'Air'],
  about_author: `About Harry Newman`,
  about_info: <>Supported substance consolidates parts of web promoting <br /> and substance showcasing. It includes making</>,
  comments: [
    {
      img: author_img_2,
      name: `Mithcel Adnan`,
      info: <>Curabitur luctus nisl in justo maximus egestas. Curabitur sit amet sapien <br /> vel nunc molestie pulvinar at vitae quam. Aliquam lobortis nisi vitae</>,
    },
    {
      img: author_img_3,
      name: `Liza Olivarez`,
      info: <>Curabitur luctus nisl in justo maximus egestas. Curabitur sit <br /> amet sapien vel nunc molestie pulvinar at vitae quam. Aliquam <br /> lobortis nisi vitae congue consectetur</>,
    }
  ]


}

const { date, writer, solution, comment, title, description, description_2, title_2, description_3, quote, quote_writer, tags_title, tags, about_author, about_info, comments } = blog_details_content

const BlogDetailsArea = () => {
  return (
    <>
      <section className="postbox__area pt-150 pb-100">
        <div className="container">
          <div className="row">
            <div className="col-xxl-8 col-xl-8 col-lg-8 mb-50">
              <div className="postbox__wrapper">
                <article className="postbox__item format-image transition-3">
                  <div className="postbox__thumb p-relative m-img">
                    <div className="postbox__thumb-text-2 d-none d-md-block">
                      <span>{date}</span>
                    </div>
                    <Image src={blog_img_1} alt="" />
                  </div>
                  <div className="postbox__content mb-70">
                    <div className="postbox__meta-box d-flex justify-content-between align-items-center">
                      <div className="postbox__meta">
                        <span><i className="fa-light fa-user"></i>By {writer}</span>
                        <span><a href="#"><i className="fa-light fa-tag tag"></i>{solution}</a></span>
                        <span><a href="#"><i className="fa-sharp fa-light fa-comments"></i>0{comment} Comments</a></span>
                      </div>
                      <div className="postbox__meta d-none d-sm-block">
                        <span><i className="fa-sharp fa-light fa-heart"></i>8</span>
                      </div>
                    </div>
                    <h3 className="postbox__title">{title}</h3>
                    <div className="postbox__text">
                      <p>{description}</p>
                      <p className="mb-20">{description_2}</p>

                      <div className="postbox__content pb-20">
                        <div className="postbox__content-thumb mb-50 d-flex justify-content-between">
                          <Image src={blog_img_2} alt="" />
                          <Image src={blog_img_3} alt="" />
                        </div>
                        <div className="postbox__text pb-20">
                          <h4 className="postbox__title pb-5">{title_2}</h4>
                          <p>{description_3}</p>
                        </div>
                      </div>

                      <div
                        className="postbox__blockquote pb-10 p-relative d-flex justify-content-between align-items-start">
                        <blockquote>
                          <p>{quote}</p>
                          <cite>- {quote_writer}</cite>
                        </blockquote>
                        <div className="postbox__blockquote-shape d-none d-xl-block">
                          {/* <Image src={quote_img_1} alt="" /> */}
                        </div>
                      </div>
                      <div className="postbox__thumb m-img p-relative">
                        <div className="postbox__details-share-wrapper">
                          <div className="row">
                            <div className="col-xl-5 col-lg-6 col-md-6">
                              <div className="postbox__details-tag tagcloud">
                                <span>{tags_title}:</span>
                                {tags.map((item, i) => (
                                  <a key={i} href="#">{item}</a>
                                ))}
                              </div>
                            </div>
                            <div className="col-xl-7 col-lg-6 col-md-6">
                              <div className="postbox__details-share text-lg-end">
                                <span>Share:</span>
                                <a target='_blank' href="https://youtube.com"><i className="fa-brands fa-youtube"></i></a>
                                <a target='_blank' href="https://facebook.com"><i className="fab fa-facebook-f"></i></a>
                                <a target='_blank' href="https://instagram.com"><i className="fa-brands fa-instagram"></i></a>
                                <a target='_blank' href="https://twitter.com"><i className="fab fa-twitter"></i></a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="postbox__author black-bg d-sm-flex align-items-start white-bg mb-50">
                    <div className="postbox__author-thumb">
                      <a href="#">
                        <Image src={author_img_1} alt="" />
                      </a>
                    </div>
                    <div className="postbox__author-content">
                      <h3 className="postbox__author-title">
                        <a href="#">{about_author}</a>
                      </h3>
                      <p>{about_info}</p>

                      <div className="postbox__author-social d-flex align-items-center">
                        <a target='_blank' href="https:/facebook.com"><i className="fa-brands fa-facebook-f"></i></a>
                        <a target='_blank' href="https:/instagram.com"><i className="fa-brands fa-instagram"></i></a>
                        <a target='_blank' href="https:/linkedin.com"><i className="fa-brands fa-linkedin-in"></i></a>
                        <a target='_blank' href="https:/twitter.com"><i className="fa-brands fa-twitter"></i></a>
                      </div>
                    </div>
                  </div>
                  <div className="postbox__comment mb-50">
                    <h3 className="postbox__title">02 Comments</h3>
                    <ul>
                      {comments.map((item, i) => (
                        <li key={i} className={`${i % 2 === 1 ? 'children' : ''}`}>
                          <div className="postbox__comment-box p-relative">
                            <div className="postbox__comment-info d-flex align-items-start">
                              <div className="postbox__comment-avater mr-40">
                                <Image src={item.img} alt="" />
                              </div>
                              <div className="postbox__comment-name p-relative">
                                <h5>{item.name}</h5>
                                <div className="postbox__comment-text">
                                  <p>{item.info}</p>
                                  <div className="postbox__comment-reply">
                                    <a href="#"><i className="fa-regular fa-arrow-turn-down-left"></i>Reply</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))} 
                    </ul>
                  </div>
                  <div className="postbox__comment-form-box">
                    <h3 className="postbox__comment-form-title pb-15">Enter You Personal Details</h3>
                    <div className="tp-form-box">
                      <CommentForm />
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <PostboxSidebar />

          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetailsArea;