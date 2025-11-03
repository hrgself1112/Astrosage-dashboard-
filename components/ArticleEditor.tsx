
import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
// FIX: Changed firebase/auth to @firebase/auth to fix module resolution errors.
import type { User } from '@firebase/auth';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import AuthorModal from './AuthorModal';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { authors } from '../constants';
import type { Document } from '../types';


interface DocumentEditorProps {
  onBack: () => void;
  onSave: (document: Omit<Document, 'lastUpdated'>) => void;
  document: Document | null;
  user: User | null;
}

const parseFaqs = (rawText: string) => {
    const lines = rawText.trim().split('\n');
    const items = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();
        if (!line) { // Skip empty lines
            i++;
            continue;
        }

        const questionMatch = line.match(/^\d+\.\s*(.+?)\??$/);
        
        let nextLineIndex = i + 1;
        while(nextLineIndex < lines.length && lines[nextLineIndex].trim() === '') {
            nextLineIndex++;
        }

        if (questionMatch && nextLineIndex < lines.length) {
            const answerLine = lines[nextLineIndex].trim();
            if (!answerLine.match(/^\d+\.\s*(.+?)\??$/)) {
                 items.push({
                    question: questionMatch[1].trim(),
                    answer: answerLine,
                });
                i = nextLineIndex + 1;
                continue;
            }
        }
        
        i++;
    }
    return items;
}

const generateFaqHtml = (rawText: string): string => {
    const items = parseFaqs(rawText);
    if (items.length === 0) return '';
    
    return items.map(item => `<h3>${item.question}</h3>\n<p>${item.answer}</p>`).join('\n');
}


const DocumentEditor: React.FC<DocumentEditorProps> = ({ onBack, onSave, document, user }) => {
  const [documentTitle, setDocumentTitle] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [content, setContent] = useState('');
  const [snippet, setSnippet] = useState('');
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [h1, setH1] = useState('');
  const [faqRaw, setFaqRaw] = useState('');
  
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isMetaOpen, setIsMetaOpen] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(authors[0]?.id || null);

  const selectedAuthor = useMemo(() => authors.find(a => a.id === selectedAuthorId), [selectedAuthorId]);
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    if (document) {
      setDocumentTitle(document.title || '');
      setSeoTitle(document.seoTitle || document.title || '');
      setContent(document.content || '');
      setSnippet(document.snippet || '');
      setUrl(document.url || '');
      setKeywords(document.keywords || '');
      setDescription(document.description || '');
      setImageUrl(document.imageUrl || '');
      setImageAlt(document.imageAlt || '');
      setH1(document.h1 || '');
      setFaqRaw(document.faqRaw || '');
      setSelectedAuthorId(document.authorId || authors[0]?.id || null);
    } else {
      // Reset for new document
      setDocumentTitle('');
      setSeoTitle('');
      setContent('');
      setSnippet('');
      setUrl('');
      setKeywords('');
      setDescription('');
      setImageUrl('');
      setImageAlt('');
      setH1('');
      setFaqRaw('');
      setSelectedAuthorId(authors[0]?.id || null);
    }
  }, [document]);
  
  const handleSave = (status: Document['status']) => {
    if (!documentTitle.trim()) {
        alert('Please enter a document title.');
        return;
    }
    // Fix: Replace non-existent getHTML() with root.innerHTML to get Quill editor content
    const htmlContent = quillRef.current?.getEditor().root.innerHTML || content;
    const plainText = quillRef.current?.getEditor().getText() || '';
    const generatedSnippet = snippet.trim() ? snippet : plainText.slice(0, 150) + (plainText.length > 150 ? '...' : '');

    const docToSave: Omit<Document, 'lastUpdated'> = {
      id: document?.id,
      title: documentTitle,
      seoTitle: seoTitle,
      content: htmlContent,
      snippet: generatedSnippet,
      status,
      visibility: document?.visibility || 'PRIVATE',
      url,
      keywords,
      description,
      imageUrl,
      imageAlt,
      h1,
      authorId: selectedAuthorId || undefined,
      faqRaw,
      faqHtml: generateFaqHtml(faqRaw),
      ownerId: document?.ownerId || user?.uid || '',
      accessList: document?.accessList || (user ? [user.uid] : []),
    };
    onSave(docToSave);
  };
  
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-m3-surface">
      <header className="bg-m3-surface flex-shrink-0 flex justify-between items-center h-[73px] px-4 md:px-6 border-b border-m3-outline/20">
        <button onClick={onBack} className="flex items-center gap-2 text-m3-on-surface-variant hover:text-m3-on-surface">
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-medium">Back to Documents</span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSave('DRAFT')} className="px-5 py-2 text-sm font-medium rounded-full text-m3-primary hover:bg-m3-primary-container">
            Save Draft
          </button>
          <button onClick={() => handleSave('READY TO PUBLISH')} className="px-5 py-2 text-sm font-medium rounded-full bg-m3-primary text-m3-on-primary hover:opacity-90">
            Publish
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <input
            type="text"
            placeholder="Untitled Document"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="w-full text-4xl font-bold bg-transparent outline-none text-m3-on-surface placeholder:text-m3-on-surface-variant/50"
          />

          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={quillModules}
            placeholder="Start writing your amazing document here..."
          />
          
          <div className="p-6 bg-m3-surface-container-high rounded-2xl">
            <h3 className="text-lg font-medium text-m3-on-surface-variant">Snippet</h3>
            <textarea
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              placeholder="A short summary of the document (auto-generated if left blank)..."
              rows={3}
              className="mt-2 w-full p-3 bg-m3-surface-container rounded-lg border border-m3-outline focus:ring-m3-primary focus:border-m3-primary"
            />
          </div>
          
          <div className="border border-m3-outline/30 rounded-2xl overflow-hidden">
             <button onClick={() => setIsMetaOpen(!isMetaOpen)} className="w-full flex justify-between items-center p-4 bg-m3-surface-container-high hover:bg-m3-surface-variant transition">
                <h3 className="text-lg font-medium text-m3-on-surface-variant">SEO & Metadata</h3>
                {isMetaOpen ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
            </button>
            {isMetaOpen && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-m3-surface-container">
                  <div><label className="text-sm font-medium text-m3-on-surface-variant">Meta Title</label><input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="mt-1 w-full p-2 bg-m3-surface rounded-md border border-m3-outline focus:ring-1 focus:ring-m3-primary"/></div>
                  <div><label className="text-sm font-medium text-m3-on-surface-variant">URL Slug</label><input type="text" value={url} onChange={e => setUrl(e.target.value)} className="mt-1 w-full p-2 bg-m3-surface rounded-md border border-m3-outline focus:ring-1 focus:ring-m3-primary"/></div>
                  <div className="md:col-span-2"><label className="text-sm font-medium text-m3-on-surface-variant">Meta Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full p-2 bg-m3-surface rounded-md border border-m3-outline h-20 focus:ring-1 focus:ring-m3-primary"/></div>
                  <div className="md:col-span-2"><label className="text-sm font-medium text-m3-on-surface-variant">Keywords (comma-separated)</label><input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} className="mt-1 w-full p-2 bg-m3-surface rounded-md border border-m3-outline focus:ring-1 focus:ring-m3-primary"/></div>
                  <div><label className="text-sm font-medium text-m3-on-surface-variant">Image URL</label><input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-1 w-full p-2 bg-m3-surface rounded-md border border-m3-outline focus:ring-1 focus:ring-m3-primary"/></div>
                  <div><label className="text-sm font-medium text-m3-on-surface-variant">Image Alt Text</label><input type="text" value={imageAlt} onChange={e => setImageAlt(e.target.value)} className="mt-1 w-full p-2 bg-m3-surface rounded-md border border-m3-outline focus:ring-1 focus:ring-m3-primary"/></div>
                  <div className="md:col-span-2"><label className="text-sm font-medium text-m3-on-surface-variant">H1</label><input type="text" value={h1} onChange={e => setH1(e.target.value)} className="mt-1 w-full p-2 bg-m3-surface rounded-md border border-m3-outline focus:ring-1 focus:ring-m3-primary"/></div>
                </div>
            )}
          </div>

          <div className="p-6 bg-m3-surface-container-high rounded-2xl">
              <h3 className="text-lg font-medium text-m3-on-surface-variant mb-2">FAQ Content</h3>
              <p className="text-sm text-m3-on-surface-variant/80 mb-4">Enter questions and answers below. Each question should start with a number and a dot (e.g., "1. Question?"), followed by the answer on the next line.</p>
              <textarea
                  value={faqRaw}
                  onChange={(e) => setFaqRaw(e.target.value)}
                  placeholder={`1. What is the first question?\nThis is the answer to the first question.\n\n2. What is the second question?\nThis is the answer to the second question.`}
                  className="w-full h-48 p-3 bg-m3-surface-container rounded-lg border border-m3-outline focus:ring-m3-primary focus:border-m3-primary font-mono text-sm"
              />
          </div>

        </div>
      </main>
      
      {isAuthorModalOpen && (
        <AuthorModal
          authors={authors}
          currentAuthorId={selectedAuthorId}
          onSelect={(authorId) => {
            setSelectedAuthorId(authorId);
            setIsAuthorModalOpen(false);
          }}
          onClose={() => setIsAuthorModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DocumentEditor;
