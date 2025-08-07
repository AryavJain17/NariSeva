import React, { useEffect } from 'react';
import "./LanguageSelector.css";
const LanguageSelector = () => {
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,gu,fr,de',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
      );
    };

    if (!window.google || !window.google.translate) {
      addGoogleTranslateScript();
    } else {
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <div id="google_translate_element" style={{ zIndex: 9999, position: 'relative' }} />
  );
};

export default LanguageSelector;
