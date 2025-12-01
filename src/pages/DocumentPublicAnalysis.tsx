import React from "react";
import Navbar from "@/components/layout/Navbar";

import { useParams } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import DocumentAnalysisPublicDisplay from "@/components/analysis-public/DocumentAnalysisPublicDisplay";

const DocumentPublicAnalysis = () => {
  const { id: selectedDocumentId } = useParams();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        {" "}
        <DocumentAnalysisPublicDisplay documentId={selectedDocumentId} />
      </main>
      <Footer />
    </div>
  );
};

export default DocumentPublicAnalysis;
