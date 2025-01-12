

import React from 'react';

const ProgressAreaHomeFive = () => {
  return (
    <>
      <div id="progress-one-page" className="tp-progress-area black-bg pb-100 pt-140">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-progress-title text-center mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">Recent Blogs</span>
                <h3 className="tp-section-title text-white tp-split-text tp-split-in-right">Create a Serene Oasis in Your <br /> Living Space</h3>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6">
              <div className="tp-progress-bar-wrap">
                <div className="tp-progress-bar-item">
                  <label>kitchen</label>
                  <div className="tp-progress-bar">
                    <div className="progress">
                      <div className="progress-bar wow slideInLeft" data-wow-delay=".1s" data-wow-duration="2s"
                        role="progressbar" data-width="75%" aria-valuenow={75} aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: '75%', visibility: 'visible', animationDuration: '2s', animationDelay: '0.1s', animationName: 'slideInLeft' }}>

                        <span>75%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tp-progress-bar-item">
                  <label>Room</label>
                  <div className="tp-progress-bar">
                    <div className="progress">
                      <div className="progress-bar wow slideInLeft" data-wow-delay=".1s" data-wow-duration="2s"
                        role="progressbar" data-width="80%" aria-valuenow={100} aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: '80%', visibility: 'visible', animationDuration: '2s', animationDelay: '0.1s', animationName: 'slideInLeft' }}>

                        <span>80%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tp-progress-bar-item">
                  <label>Duplex House</label>
                  <div className="tp-progress-bar">
                    <div className="progress">
                      <div className="progress-bar wow slideInLeft" data-wow-delay=".1s" data-wow-duration="2s"
                        role="progressbar" data-width="40%" aria-valuenow={100} aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: '40%', visibility: 'visible', animationDuration: '2s', animationDelay: '0.1s', animationName: 'slideInLeft' }}>

                        <span>40%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6">
              <div className="tp-progress-bar-wrap">
                <div className="tp-progress-bar-item">
                  <label>Architecture</label>
                  <div className="tp-progress-bar">
                    <div className="progress">
                      <div className="progress-bar wow slideInLeft" data-wow-delay=".1s" data-wow-duration="2s"
                        role="progressbar" data-width="90%" aria-valuenow={100} aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: '90%', visibility: 'visible', animationDuration: '2s', animationDelay: '0.1s', animationName: 'slideInLeft' }}>

                        <span>90%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tp-progress-bar-item">
                  <label>Drawing room</label>
                  <div className="tp-progress-bar">
                    <div className="progress">
                      <div className="progress-bar wow slideInLeft" data-wow-delay=".1s" data-wow-duration="2s"
                        role="progressbar" data-width="70%" aria-valuenow={100} aria-valuemin={100}
                        aria-valuemax={100}
                        style={{ width: '70%', visibility: 'visible', animationDuration: '2s', animationDelay: '0.1s', animationName: 'slideInLeft' }}>

                        <span>70%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tp-progress-bar-item">
                  <label>Bathroom</label>
                  <div className="tp-progress-bar">
                    <div className="progress">
                      <div className="progress-bar wow slideInLeft" data-wow-delay=".1s" data-wow-duration="2s"
                        role="progressbar" data-width="85%" aria-valuenow={70} aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: '85%', visibility: 'visible', animationDuration: '2s', animationDelay: '0.1s', animationName: 'slideInLeft' }}>

                        <span>85%</span>
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

export default ProgressAreaHomeFive;