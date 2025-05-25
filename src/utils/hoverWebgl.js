
// import $ from 'jquery';
// import imagesLoaded from 'imagesloaded';
// import * as hoverEffect from '@/assets/plugins/hover-effect.umd';

// const hoverWebGl = () => {

//   if (typeof window !== 'undefined') {

//       function allImagesLoaded() {
//         $('.tp-hover-distort-wrapper').each(function(){
//           const $this = $(this);
//           const canvas = $this.find('.canvas');

//           // Check if the wrapper has already been initialized
//           if (!canvas.data('hoverEffectInitialized')) {
//             if ($this.find('img.front').length > 0) { // Check if front image exists
//               $this.css({
//                 "width" : $this.find('img.front').width(),
//                 "height" : $this.find('img.front').height(),
//               });
//             }

//             const frontImage = $this.find('img.front').attr('src');
//             const backImage = $this.find('img.back').attr('src');
//             const displacementImage = $this.find('.tp-hover-distort').attr('data-displacementimage');

//             // Initialize hoverEffect
//             new hoverEffect({
//               parent: canvas[0],
//               intensity: 3,
//               speedIn: 2,
//               speedOut: 2,
//               angle: Math.PI / 3,
//               angle2: -Math.PI / 3,
//               image1: frontImage,
//               image2: backImage,
//               displacementImage: displacementImage,
//               imagesRatio: $this.find('.tp-hover-distort').height() / $this.find('.tp-hover-distort').width()
//             });

//             // Mark the wrapper as initialized
//             canvas.data('hoverEffectInitialized', true);
//           }
//         });
//       }
//       function handleFailedImages(instance) {
//         console.error('One or more images failed to load.');

//         const failedImages = instance.images.filter(function(img) {
//           return !img.isLoaded;
//         });

//         failedImages.forEach(function(failedImage) {
//           console.error('Failed image source:', failedImage.img.src);
//         });
//       }
//       // Use imagesLoaded
//       const imgLoaded = imagesLoaded('img');
//       imgLoaded.on('done', allImagesLoaded);
//       imgLoaded.on('fail', handleFailedImages);



//   }

// };

// export default hoverWebGl;



import * as hoverEffect from '@/assets/plugins/hover-effect.umd';
const hoverWebGl = async () => {
  const $ = (await import("jquery")).default;
  const imagesLoaded = (await import("imagesloaded")).default;

  if (typeof window !== 'undefined') {

    function allImagesLoaded() {
      $('.tp-hover-distort-wrapper').each(function () {
        const $this = $(this);
        const canvas = $this.find('.canvas');

        // Check if the wrapper has already been initialized and has required elements
        if (!canvas.data('hoverEffectInitialized') && canvas.length > 0) {
          if ($this.find('img.front').length > 0) { // Check if front image exists
            $this.css({
              "width": $this.find('img.front').width(),
              "height": $this.find('img.front').height(),
            });
          }

          const frontImage = $this.find('img.front').attr('src');
          const backImage = $this.find('img.back').attr('src');
          const displacementImage = $this.find('.tp-hover-distort').attr('data-displacementimage');

          // Only initialize if we have all required images
          if (frontImage && backImage && displacementImage) {
            // Initialize hoverEffect
            new hoverEffect({
            parent: canvas[0],
            intensity: 3,
            speedIn: 2,
            speedOut: 2,
            angle: Math.PI / 3,
            angle2: -Math.PI / 3,
            image1: frontImage,
            image2: backImage,
            displacementImage: displacementImage,
            imagesRatio: $this.find('.tp-hover-distort').height() / $this.find('.tp-hover-distort').width()
            });

            // Mark the wrapper as initialized
            canvas.data('hoverEffectInitialized', true);
          }
        }
      });
    }
    function handleFailedImages(instance) {
      // Still try to initialize WebGL effects even if some images failed
      allImagesLoaded();
    }
    // Wait for DOM to be ready, then initialize with a delay for lazy-loaded content
    $(document).ready(function() {
      // Initial check
      const imgLoaded = imagesLoaded('img');
      imgLoaded.on('done', allImagesLoaded);
      imgLoaded.on('fail', handleFailedImages);

      // Also check periodically for lazy-loaded content
      let checkCount = 0;
      const checkInterval = setInterval(() => {
        checkCount++;
        if (checkCount > 10) { // Stop after 10 attempts (5 seconds)
          clearInterval(checkInterval);
          return;
        }

        const newImgLoaded = imagesLoaded('img');
        newImgLoaded.on('done', allImagesLoaded);
        newImgLoaded.on('fail', handleFailedImages);
      }, 500);
    });



  }
};

export default hoverWebGl;

