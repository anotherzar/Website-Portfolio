/**
 * Google Analytics 4 (GA4) Initialization
 * Measurement ID: G-EVVGGDMGZR
 */
(function () {
    const GA_MEASUREMENT_ID = 'G-EVVGGDMGZR';

    // Inject gtag.js script dynamically
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
})();
