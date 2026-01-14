import React from "react";
import Navbar from "@/components/layout/Navbar";

import { useParams } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import VideoAnalysisPublicDisplay from "@/components/analysis-public/VideoAnalysisPublicDisplay";

const VideoPublicAnalysis = () => {
  const { id: selectedDocumentId } = useParams();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        {" "}
        <VideoAnalysisPublicDisplay videoId={selectedDocumentId} />
      </main>
      <Footer />
    </div>
  );
};

export default VideoPublicAnalysis;
