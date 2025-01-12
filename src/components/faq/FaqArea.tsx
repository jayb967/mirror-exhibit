

import React from 'react';

interface DataType {
  tab_id: string;
  question: string;
  answer: string;
}

const faq_data: DataType[] = [
  {
    tab_id: 'One',
    question: `How effectively small spaces in interior design?`,
    answer: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
  },
  {
    tab_id: 'Two',
    question: `How to functional and stylish home office?`,
    answer: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
  },
  {
    tab_id: 'Three',
    question: `What industries do you serve?`,
    answer: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
  },
  {
    tab_id: 'Four',
    question: `How do you ensure data privacy solutions?`,
    answer: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
  },
  {
    tab_id: 'Five',
    question: `What some tips creating a cozy atmosphere?`,
    answer: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
  },
]
const faq_data_2: DataType[] = [
  {
    tab_id: '2One',
    question: `What services do you offer?`,
    answer: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
  },
  {
    tab_id: '2Two',
    question: `How to get right furniture for my interior?`,
    answer: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
  },
  {
    tab_id: '2Three',
    question: `What industries do you serve?`,
    answer: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
  },
  {
    tab_id: '2Four',
    question: `Are your services customizable?`,
    answer: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
  },
  {
    tab_id: '2Five',
    question: `What some tips creating a cozy atmosphere?`,
    answer: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
  },
]

const FaqArea = () => {
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
            <div className="col-xl-6 col-lg-6 mb-50 wow tpfadeLeft" data-wow-duration=".9s" data-wow-delay=".5s">
              <div className="tp-custom-accordion">
                <div className="accordion" id="accordionExample">

                  {faq_data.map((item, i) => (
                    <div key={i} className={`accordion-items ${i === 0 ? 'tp-faq-active' : ''}`}>
                      <h2 className="accordion-header" id={`heading${item.tab_id}`}>
                        <button className={`accordion-buttons ${i === 0 ? '' : 'collapsed'}`} type="button" data-bs-toggle="collapse"
                          data-bs-target={`#collapse${item.tab_id}`}
                          aria-expanded={`${i === 0 ? true : false}`}
                          aria-controls={`collapse${item.tab_id}`}>
                          <span>{i + 1}.</span> {item.question}
                        </button>
                      </h2>
                      <div id={`collapse${item.tab_id}`}
                        className={`accordion-collapse collapse ${i === 0 ? 'show' : ''}`}
                        aria-labelledby={`heading${item.tab_id}`}
                        data-bs-parent="#accordionExample">
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

                  {faq_data_2.map((item, i) => (
                    <div key={i} className={`accordion-items ${i === 0 ? 'tp-faq-active' : ''}`}>
                      <h2 className="accordion-header" id={`heading${item.tab_id}`}>
                        <button className={`accordion-buttons ${i === 0 ? '' : 'collapsed'}`} type="button" data-bs-toggle="collapse"
                          data-bs-target={`#collapse${item.tab_id}`}
                          aria-expanded={`${i === 0 ? true : false}`}
                          aria-controls={`collapse${item.tab_id}`}>
                          <span>{i + 6}.</span> {item.question}
                        </button>
                      </h2>
                      <div id={`collapse${item.tab_id}`}
                        className={`accordion-collapse collapse ${i === 0 ? 'show' : ''}`}
                        aria-labelledby={`heading${item.tab_id}`}
                        data-bs-parent="#accordionExample2">
                        <div className="accordion-body">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  ))} 
                  
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default FaqArea;