import React from "react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/923001234567"
      className="whatsapp-button fixed bottom-4 right-4 z-50 flex items-center justify-center bg-green-500 rounded-full w-16 h-16 shadow-lg"
      aria-label="Chat on WhatsApp"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="Chat on WhatsApp"
        className="whatsapp-icon w-9 h-9"
        loading="lazy"
      />
    </a>
  );
};

export default WhatsAppButton;

// .whatsapp-button {
//   position: fixed;
//   bottom: 20px;
//   right: 20px;
//   background-color: #25d366;
//   border-radius: 50%;
//   width: 60px;
//   height: 60px;
//   box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   text-decoration: none;
//   z-index: 1000;
// }

// .whatsapp-icon {
//   width: 35px;
//   height: 35px;
// }
