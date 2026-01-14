import { useEffect } from "react"

// Extend window for TypeScript
declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

const TawktoWidget = () => {
    useEffect(() => {
    const Tawk_API = window.Tawk_API || {};
    const Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/684ac2ba6f07ad190ea22f37/1iti0hain";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(script, firstScriptTag);

    // Optional: store the globals in window to preserve original behavior
    window.Tawk_API = Tawk_API;
    window.Tawk_LoadStart = Tawk_LoadStart;

    return () => {
      // Clean up if needed
      script.remove();
    };
  }, []);

  return null;
};

export default TawktoWidget;