
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DocumentUpload from '@/components/analysis/DocumentUpload';
import DocumentAnalysisDisplay from '@/components/analysis/DocumentAnalysisDisplay';
import VideoUpload from '@/components/analysis/VideoUpload';
import VideoAnalysisDisplay from '@/components/analysis/VideoAnalysisDisplay';

const Analysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const [activeTab, setActiveTab] = useState<string>('document-upload');
  const [documents, setDocuments] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/sign-in', { state: { from: '/analysis' } });
      return;
    }
    
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('document_analysis')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (documentsError) {
          console.error('Error fetching documents:', documentsError);
        } else {
          // Get horse names for each document
          const docsWithHorseNames = await Promise.all(
            documentsData.map(async (doc) => {
              const { data: horse } = await supabase
                .from('horses')
                .select('name')
                .eq('id', doc.horse_id)
                .single();
              
              return {
                ...doc,
                horse_name: horse?.name
              };
            })
          );
          
          setDocuments(docsWithHorseNames);
        }
        
        // Fetch videos
        const { data: videosData, error: videosError } = await supabase
          .from('video_analysis')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (videosError) {
          console.error('Error fetching videos:', videosError);
        } else {
          // Get horse names for each video
          const videosWithHorseNames = await Promise.all(
            videosData.map(async (video) => {
              const { data: horse } = await supabase
                .from('horses')
                .select('name')
                .eq('id', video.horse_id)
                .single();
              
              return {
                ...video,
                horse_name: horse?.name
              };
            })
          );
          
          setVideos(videosWithHorseNames);
        }
      } catch (error) {
        console.error('Error fetching analysis data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
    
    // Set up real-time listeners for updates
    const documentChannel = supabase
      .channel('document_analysis_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'document_analysis',
        filter: `user_id=eq.${user.id}`
      }, () => {
        // Refetch documents when changes occur
        fetchUserData();
      })
      .subscribe();
      
    const videoChannel = supabase
      .channel('video_analysis_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'video_analysis',
        filter: `user_id=eq.${user.id}`
      }, () => {
        // Refetch videos when changes occur
        fetchUserData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(documentChannel);
      supabase.removeChannel(videoChannel);
    };
  }, [user, navigate]);
  
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-serif font-bold mb-6">
            {language === 'en' ? "Equestrian AI Analysis" : "Análisis de IA ecuestre"}
          </h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid grid-cols-4 md:grid-cols-4 w-full">
              <TabsTrigger value="document-upload">
                {language === 'en' ? "Upload Document" : "Subir Documento"}
              </TabsTrigger>
              <TabsTrigger value="document-list">
                {language === 'en' ? "My Documents" : "Mis Documentos"} ({documents.length})
              </TabsTrigger>
              <TabsTrigger value="video-upload">
                {language === 'en' ? "Upload Video" : "Subir Video"}
              </TabsTrigger>
              <TabsTrigger value="video-list">
                {language === 'en' ? "My Videos" : "Mis Videos"} ({videos.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="document-upload">
              <DocumentUpload />
            </TabsContent>
            
            <TabsContent value="document-list">
              {documents.length > 0 ? (
                <div className="space-y-6">
                  {selectedDocumentId ? (
                    <div>
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedDocumentId(null)}
                        className="mb-4"
                      >
                        ← {language === 'en' ? "Back to Documents" : "Volver a Documentos"}
                      </Button>
                      <DocumentAnalysisDisplay documentId={selectedDocumentId} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Name" : "Nombre"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Horse" : "Caballo"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Type" : "Tipo"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Date" : "Fecha"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Status" : "Estado"}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Action" : "Acción"}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {documents.map((doc) => (
                              <tr key={doc.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">{doc.file_name}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {doc.horse_name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full mr-2 ${doc.discipline === 'dressage' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                                    <span className="text-sm text-gray-700">
                                      {doc.discipline === 'dressage' 
                                        ? doc.test_level || (language === 'en' ? "Dressage" : "Doma")
                                        : doc.competition_type || (language === 'en' ? "Jumping" : "Salto")
                                      }
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(doc.document_date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                                    doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    doc.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {doc.status === 'completed' ? (language === 'en' ? "Completed" : "Completado") :
                                     doc.status === 'pending' ? (language === 'en' ? "Pending" : "Pendiente") :
                                     doc.status === 'processing' ? (language === 'en' ? "Processing" : "Procesando") :
                                     (language === 'en' ? "Failed" : "Fallido")}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedDocumentId(doc.id)}
                                    disabled={doc.status !== 'completed'}
                                    className={doc.discipline === 'dressage' ? 'text-purple-700 border-purple-200' : 'text-blue-700 border-blue-200'}
                                  >
                                    {language === 'en' ? "View Analysis" : "Ver Análisis"}
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="p-6 text-center bg-gray-50">
                  <p className="text-gray-600 mb-4">
                    {language === 'en' 
                      ? "You haven't uploaded any documents for analysis yet" 
                      : "Aún no has subido ningún documento para análisis"}
                  </p>
                  <Button onClick={() => setActiveTab('document-upload')}>
                    {language === 'en' ? "Upload Document" : "Subir Documento"}
                  </Button>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="video-upload">
              <VideoUpload />
            </TabsContent>
            
            <TabsContent value="video-list">
              {videos.length > 0 ? (
                <div className="space-y-6">
                  {selectedVideoId ? (
                    <div>
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedVideoId(null)}
                        className="mb-4"
                      >
                        ← {language === 'en' ? "Back to Videos" : "Volver a Videos"}
                      </Button>
                      <VideoAnalysisDisplay videoId={selectedVideoId} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Name" : "Nombre"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Horse" : "Caballo"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Type" : "Tipo"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Date" : "Fecha"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Status" : "Estado"}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? "Action" : "Acción"}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {videos.map((video) => (
                              <tr key={video.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">{video.file_name}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {video.horse_name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full mr-2 ${video.discipline === 'dressage' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                                    <span className="text-sm text-gray-700">
                                      {video.discipline === 'dressage' 
                                        ? (language === 'en' ? "Dressage" : "Doma")
                                        : (language === 'en' ? "Jumping" : "Salto")
                                      }
                                      {" - "}
                                      {video.video_type === 'training' 
                                        ? (language === 'en' ? "Training" : "Entrenamiento")
                                        : (language === 'en' ? "Competition" : "Competición")
                                      }
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(video.recording_date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                                    video.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    video.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    video.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {video.status === 'completed' ? (language === 'en' ? "Completed" : "Completado") :
                                     video.status === 'pending' ? (language === 'en' ? "Pending" : "Pendiente") :
                                     video.status === 'processing' ? (language === 'en' ? "Processing" : "Procesando") :
                                     (language === 'en' ? "Failed" : "Fallido")}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedVideoId(video.id)}
                                    disabled={video.status !== 'completed'}
                                    className={video.discipline === 'dressage' ? 'text-purple-700 border-purple-200' : 'text-blue-700 border-blue-200'}
                                  >
                                    {language === 'en' ? "View Analysis" : "Ver Análisis"}
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="p-6 text-center bg-gray-50">
                  <p className="text-gray-600 mb-4">
                    {language === 'en' 
                      ? "You haven't uploaded any videos for analysis yet" 
                      : "Aún no has subido ningún video para análisis"}
                  </p>
                  <Button onClick={() => setActiveTab('video-upload')}>
                    {language === 'en' ? "Upload Video" : "Subir Video"}
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analysis;
