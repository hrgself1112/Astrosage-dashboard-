
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CreateDocumentCard from './CreateArticleCard';
import DocumentCard from './components/ArticleCard';
import type { Document, Panelist } from './types';
import DocumentFilters from './components/ArticleFilters';
import ViewToggle from './components/ViewToggle';
import DocumentEditor from './components/ArticleEditor';
import ImageGenerator from './components/ImageGenerator';
import Auth from './components/Auth';
import PanelistManager from './components/PanelistManager';
import { db, auth } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc
// FIX: Changed firebase/firestore to @firebase/firestore to fix module resolution errors.
} from '@firebase/firestore';
import { 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User
// FIX: Changed firebase/auth to @firebase/auth to fix module resolution errors.
} from '@firebase/auth';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import AdminPanel from './components/AdminPanel';
import AdminRouteGuard from './components/AdminRouteGuard';
import BackgroundRemover from './components/BackgroundRemover';

export type Page = 'home' | 'documents' | 'search' | 'editor' | 'image-generator' | 'panelists' | 'admin' | 'background-remover';

const getFormattedDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  const [startDate, setStartDate] = useState<string>(getFormattedDate(sevenDaysAgo));
  const [endDate, setEndDate] = useState<string>(getFormattedDate(today));
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [panelists, setPanelists] = useState<Panelist[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) {
        setDocuments([]);
        return;
      };
      try {
        const documentsRef = collection(db, "documents");
        const q = query(documentsRef, where("accessList", "array-contains", user.uid));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Document));
        setDocuments(docsData);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };
    
    const fetchPanelists = async () => {
      if (!user) {
        setPanelists([]);
        return;
      }
      try {
        const querySnapshot = await getDocs(collection(db, "panelists"));
        const panelistsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Panelist));
        setPanelists(panelistsData);
      } catch (error) {
        console.error("Error fetching panelists: ", error);
      }
    };

    setIsLoading(true);
    if (user) {
      Promise.all([fetchDocuments(), fetchPanelists()]).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  const handleSaveDocument = async (docData: Omit<Document, 'id' | 'lastUpdated'> & { id?: string }) => {
    const isNew = !docData.id;
    const now = new Date().toISOString().split('T')[0];

    try {
        if (isNew) {
            const { id, ...newDocData } = docData;
            const docRef = await addDoc(collection(db, "documents"), { ...newDocData, lastUpdated: now });
            setDocuments([...documents, { ...docData, id: docRef.id, lastUpdated: now }]);
        } else {
            const { id, ...updateData } = docData;
            if (!id) throw new Error("Update failed: Document ID is missing.");
            const docRef = doc(db, "documents", id);
            await updateDoc(docRef, { ...updateData, lastUpdated: now });
            setDocuments(documents.map(d => d.id === id ? { ...d, ...docData, lastUpdated: now } : d));
        }
        setCurrentPage('documents');
        setSelectedDocument(null);
    } catch (error) {
        console.error("Error saving document: ", error);
        alert("Failed to save document. Please try again.");
    }
  };

  const handleUpdateDocument = async (id: string, updates: Partial<Document>) => {
    const docRef = doc(db, "documents", id);
    try {
      await updateDoc(docRef, updates);
      setDocuments(documents.map(d => d.id === id ? { ...d, ...updates } : d));
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  
  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, "documents", id));
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch(error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleAddPanelist = async (panelistData: Omit<Panelist, 'id'> & { password?: string }) => {
    if (!panelistData.email || !panelistData.password) {
        alert("Email and password are required to add a new panelist.");
        return Promise.reject("Email and password are required.");
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, panelistData.email, panelistData.password);
        const user = userCredential.user;
        if (!user || !user.email) throw new Error("User creation failed.");
        const newPanelistProfile = {
            email: user.email,
            details: panelistData.details || {},
        };
        await setDoc(doc(db, "panelists", user.uid), newPanelistProfile);
        const newPanelistWithId: Panelist = { id: user.uid, ...newPanelistProfile };
        setPanelists([...panelists, newPanelistWithId]);
        return Promise.resolve();
    } catch (error: any) {
        console.error("Error adding panelist: ", error);
        alert(`Failed to add panelist: ${error.message}`);
        return Promise.reject(error.message);
    }
  };
  
  const handleUpdatePanelist = async (panelistData: Panelist) => {
    if (!panelistData.id) {
        console.error("Update failed: Panelist ID is missing.");
        alert("Failed to update panelist: ID is missing.");
        return;
    }
    const { id, ...updateData } = panelistData;
    const docRef = doc(db, "panelists", id);
    try {
        await updateDoc(docRef, updateData);
        setPanelists(panelists.map(p => p.id === id ? { ...p, ...updateData } : p));
    } catch (error) {
        console.error("Error updating panelist: ", error);
        alert("Failed to update panelist. Please try again.");
    }
  };

  const handleDeletePanelist = async (id: string) => {
    try {
        await deleteDoc(doc(db, "panelists", id));
        setPanelists(panelists.filter(p => p.id !== id));
    } catch (error) {
        console.error("Error deleting panelist: ", error);
        alert("Failed to delete panelist. Please try again.");
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Error sending password reset email: ", error);
        alert(`Failed to send password reset email: ${error.message}`);
        throw error;
    }
  };

  const handleSignOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };
  
  const filteredDocuments = documents.filter(doc => {
    const docDate = new Date(doc.lastUpdated);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    const matchesDate = docDate >= start && docDate <= end;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (isLoading) {
    return <div className="w-full h-screen flex items-center justify-center bg-m3-surface"><SpinnerIcon className="w-10 h-10 text-m3-primary" /></div>;
  }
  
  if (!user) {
    return <Auth />;
  }
  
  const handleNavigate = (page: Page) => {
    setSelectedDocument(null);
    setCurrentPage(page);
  };
  
  const handleEditDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setCurrentPage('editor');
  };

  const handleCreateNew = () => {
    setSelectedDocument(null);
    setCurrentPage('editor');
  }

  return (
    <div className="flex h-screen bg-m3-surface-container">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      <div className="flex-1 flex flex-col h-screen">
        <Header user={user} onSignOut={handleSignOut} />
        {currentPage === 'editor' ? (
          <DocumentEditor
            onBack={() => {
                setCurrentPage('documents');
                setSelectedDocument(null);
            }}
            onSave={handleSaveDocument}
            document={selectedDocument}
            user={user}
          />
        ) : currentPage === 'image-generator' ? (
            <ImageGenerator />
        ) : currentPage === 'panelists' ? (
            <PanelistManager
              panelists={panelists}
              onAdd={handleAddPanelist}
              onUpdate={handleUpdatePanelist}
              onDelete={handleDeletePanelist}
              onSendPasswordReset={handleSendPasswordReset}
            />
        ) : currentPage === 'admin' ? (
          <AdminRouteGuard user={user}>
            <AdminPanel
              user={user}
              onBack={() => setCurrentPage('home')}
            />
          </AdminRouteGuard>
        ) : currentPage === 'background-remover' ? (
          <BackgroundRemover />
        ) : (
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {['home', 'documents'].includes(currentPage) && (
                <>
                  {currentPage === 'home' && (
                    <div className="mb-8">
                      <CreateDocumentCard onClick={handleCreateNew} />
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <h1 className="text-3xl font-bold text-m3-on-surface">Documents</h1>
                    <div className="flex items-center gap-4">
                      <DocumentFilters
                        onSearchChange={setSearchTerm}
                        onStatusChange={setStatusFilter}
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                      />
                      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                    </div>
                  </div>
                  
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-6"}>
                    {filteredDocuments.map(doc => (
                      <DocumentCard 
                        key={doc.id} 
                        document={doc}
                        onUpdate={handleUpdateDocument}
                        onDelete={handleDeleteDocument}
                        onEdit={handleEditDocument}
                        user={user}
                        panelists={panelists}
                        onUpdateAccess={(docId, accessList) => handleUpdateDocument(docId, { accessList })}
                      />
                    ))}
                  </div>
                  {filteredDocuments.length === 0 && !isLoading && (
                    <div className="text-center py-10 text-m3-on-surface-variant">
                      <p>No documents match your criteria.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default App;
