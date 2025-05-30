import Link from "next/link";
import React from "react";

const AboutAreaHomeThree = () => {
  return (
    <>
      <div id="about-one-page" className="tp-about-3-area pt-75 pb-75">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-about-3-title-box mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">
                  About Us
                </span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">
                Our  <br /> Craftsmanship
                </h3>
              </div>
            </div>
            <div className="col-xl-5 col-lg-5 col-md-6">
              <div className="tp-about-3-left-box p-relative">
                <div className="tp-about-3-thumb">
                  {/* Fast-loading fallback image */}
                  <img
                    src="/assets/img/about/IMG_7093.jpg"
                    alt="About us"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 1
                    }}
                    loading="eager"
                  />

                  {/* WebGL wrapper - loads in background */}
                  <div className="tp-hover-distort-wrapper" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="canvas"></div>
                    <div
                      className="tp-hover-distort"
                      data-displacementimage="assets/img/webgl/10.jpg"
                    >
                      <img
                        className="tp-hover-distort-img front"
                        src="/assets/img/about/IMG_7093.jpg"
                        alt="image-here"
                        style={{ opacity: 0 }}
                      />
                      <img
                        className="tp-hover-distort-img back"
                        src="/assets/img/about/IMG_7093.jpg"
                        alt="image-here"
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="tp-about-3-big-text d-none d-xl-block">
                  <h6>About Us</h6>
                </div>
              </div>
            </div>
            <div className="col-xl-7 col-lg-7 col-md-6">
              <div className="tp-about-3-right">
                <div className="tp-about-3-content pb-60">
                  <p className="mb-45">
                  We create mirrors that reflect your style, blending art with luxury. Uncompromising quality, personalized designs.
                  </p>
                  <Link className="tp-btn-black" href="/about-us">
                    <span>See our collections</span>
                  </Link>
                </div>
                <div className="row">
                  <div className="col-xl-9">
                    <div className="tp-about-3-thumb-sm">
                      {/* Fast-loading fallback image */}
                      <img
                        src="/assets/img/about/IMG_7339.jpg"
                        alt="About us"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          aspectRatio: '1 / 1',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          zIndex: 1
                        }}
                        loading="eager"
                      />

                      {/* WebGL wrapper - loads in background */}
                      <div className="tp-hover-distort-wrapper" style={{ position: 'relative', zIndex: 2 }}>
                        <div className="canvas"></div>
                        <div
                          className="tp-hover-distort"
                          data-displacementimage="assets/img/webgl/10.jpg"
                        >
                          <img
                            className="tp-hover-distort-img front"
                            style={{
                              opacity: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              aspectRatio: '1 / 1'
                            }}
                            src="/assets/img/about/IMG_7339.jpg"
                            alt="image-here"
                          />
                          <img
                            className="tp-hover-distort-img back"
                            style={{
                              display: 'none',
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              aspectRatio: '1 / 1'
                            }}
                            src="/assets/img/about/IMG_7182.jpg"
                            alt="image-here"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutAreaHomeThree;
