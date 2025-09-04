import { useEffect } from 'react';

// Hook para otimizações mobile
export const useMobileOptimizations = () => {
  useEffect(() => {
    // Prevent zoom on input focus in iOS
    const addMaximumScaleToMetaViewport = () => {
      const el = document.querySelector('meta[name=viewport]');
      if (el) {
        let content = el.getAttribute('content');
        if (content) {
          let re = /maximum-scale=[0-9.]+/g;
          
          if (re.test(content)) {
            content = content.replace(re, 'maximum-scale=1.0');
          } else {
            content = [content, 'maximum-scale=1.0'].join(', ');
          }
          
          el.setAttribute('content', content);
        }
      }
    };

    const disableIosTextFieldZoom = addMaximumScaleToMetaViewport;

    // Call the function when inputs get focus and after focusout
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
    
    inputs.forEach(input => {
      input.addEventListener('focusin', disableIosTextFieldZoom, false);
      input.addEventListener('focusout', disableIosTextFieldZoom, false);
    });

    // Cleanup
    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focusin', disableIosTextFieldZoom, false);
        input.removeEventListener('focusout', disableIosTextFieldZoom, false);
      });
    };
  }, []);

  // Add CSS for better mobile experience
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Prevent zoom on input focus */
      @media screen and (max-width: 768px) {
        input[type="email"],
        input[type="password"] {
          font-size: 16px !important;
        }
      }

      /* Improve touch targets */
      @media (hover: none) and (pointer: coarse) {
        button, input, select, textarea {
          min-height: 44px;
        }
      }

      /* Smooth scrolling on mobile */
      @media (max-width: 768px) {
        * {
          -webkit-overflow-scrolling: touch;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
};

export default useMobileOptimizations;