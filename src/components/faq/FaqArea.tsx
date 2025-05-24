
'use client'

import React, { useState, useEffect } from 'react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

const FaqArea = () => {
  const [generalFaqs, setGeneralFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGeneralFaqs = async () => {
      try {
        const response = await fetch('/api/faqs?type=general');
        const data = await response.json();
        if (data.faqs) {
          setGeneralFaqs(data.faqs);
        }
      } catch (err) {
        console.error('Error fetching general FAQs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneralFaqs();
  }, []);

  // Split FAQs into two columns for display
  const midpoint = Math.ceil(generalFaqs.length / 2);
  const leftColumnFaqs = generalFaqs.slice(0, midpoint);
  const rightColumnFaqs = generalFaqs.slice(midpoint);

  if (loading) {
    return (
      <div className="tp-faq-area p-relative fix pt-120 pb-70">
        <div className="container">
          <div className="row">
            <div className="col-xl-12 text-center">
              <h3>Loading FAQs...</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="tp-faq-area p-relative fix pt-120 pb-70">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-faq-title-box text-center pb-50">
                <span className="tp-section-subtitle">Our faq</span>
                <h4 className="tp-section-title">Frequently asked question</h4>
              </div>
            </div>
            {generalFaqs.length > 0 ? (
              <>
                <div className="col-xl-6 col-lg-6 mb-50 wow tpfadeLeft" data-wow-duration=".9s" data-wow-delay=".5s">
                  <div className="tp-custom-accordion">
                    <div className="accordion" id="accordionExample">
                      {leftColumnFaqs.map((item, i) => (
                        <div key={item.id} className={`accordion-items ${i === 0 ? 'tp-faq-active' : ''}`}>
                          <h2 className="accordion-header" id={`heading${item.id}`}>
                            <button
                              className={`accordion-buttons ${i === 0 ? '' : 'collapsed'}`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#collapse${item.id}`}
                              aria-expanded={`${i === 0 ? true : false}`}
                              aria-controls={`collapse${item.id}`}
                            >
                              <span>{i + 1}.</span> {item.question}
                            </button>
                          </h2>
                          <div
                            id={`collapse${item.id}`}
                            className={`accordion-collapse collapse ${i === 0 ? 'show' : ''}`}
                            aria-labelledby={`heading${item.id}`}
                            data-bs-parent="#accordionExample"
                          >
                            <div className="accordion-body">
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 mb-50 wow tpfadeRight" data-wow-duration=".9s" data-wow-delay=".7s">
                  <div className="tp-custom-accordion">
                    <div className="accordion" id="accordionExample2">
                      {rightColumnFaqs.map((item, i) => (
                        <div key={item.id} className={`accordion-items ${i === 0 ? 'tp-faq-active' : ''}`}>
                          <h2 className="accordion-header" id={`heading2${item.id}`}>
                            <button
                              className={`accordion-buttons ${i === 0 ? '' : 'collapsed'}`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#collapse2${item.id}`}
                              aria-expanded={`${i === 0 ? true : false}`}
                              aria-controls={`collapse2${item.id}`}
                            >
                              <span>{leftColumnFaqs.length + i + 1}.</span> {item.question}
                            </button>
                          </h2>
                          <div
                            id={`collapse2${item.id}`}
                            className={`accordion-collapse collapse ${i === 0 ? 'show' : ''}`}
                            aria-labelledby={`heading2${item.id}`}
                            data-bs-parent="#accordionExample2"
                          >
                            <div className="accordion-body">
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-xl-12 text-center">
                <p>No FAQs available at the moment.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default FaqArea;