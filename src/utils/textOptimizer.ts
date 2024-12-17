export const optimizeText = () => {
    const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize < 12) {
          el.style.fontSize = '12px';
        }
        el.style.textRendering = 'optimizeLegibility';
        el.style.webkitFontSmoothing = 'antialiased';
        el.style.mozOsxFontSmoothing = 'grayscale';
      }
    });
  };