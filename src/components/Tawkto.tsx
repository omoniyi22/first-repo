import { useEffect } from "react"

const TawktoWidget = () => {
    useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/6849bc36abb786190625a40c/1itg0eggs";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    return () => {
      // Clean up on unmount
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default TawktoWidget;