import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Trash2, Download, RefreshCw } from 'lucide-react';
import { EmbeddingService } from '@/services/EmbeddingService';

interface Document {
  id: string;
  title: string;
  content: string;
  embedding: number[];
  metadata: {
    source: string;
    uploadedAt: Date;
    wordCount: number;
  };
}

interface DocumentManagerProps {
  documents: Document[];
  onDocumentsUpdate: (documents: Document[]) => void;
}

export const DocumentManager = ({ documents, onDocumentsUpdate }: DocumentManagerProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const newDocuments: Document[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await readFileAsText(file);
        
        // Generate embedding using local model
        const embedding = await EmbeddingService.generateEmbedding(content);
        
        const document: Document = {
          id: crypto.randomUUID(),
          title: file.name,
          content,
          embedding,
          metadata: {
            source: file.name,
            uploadedAt: new Date(),
            wordCount: content.split(/\s+/).length
          }
        };
        
        newDocuments.push(document);
        setProcessingProgress(((i + 1) / files.length) * 100);
      }
      
      const updatedDocuments = [...documents, ...newDocuments];
      onDocumentsUpdate(updatedDocuments);
      
      toast({
        title: "Documents processed successfully",
        description: `Added ${newDocuments.length} document(s) with local embeddings`,
      });
      
    } catch (error) {
      console.error('Error processing documents:', error);
      toast({
        title: "Error processing documents",
        description: "Please try again or check file format",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleDeleteDocument = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    onDocumentsUpdate(updatedDocuments);
    
    toast({
      title: "Document removed",
      description: "Document and its embedding have been deleted",
    });
  };

  const handleRegenerateEmbeddings = async () => {
    if (documents.length === 0) return;
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      const updatedDocuments = [];
      
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const newEmbedding = await EmbeddingService.generateEmbedding(doc.content);
        
        updatedDocuments.push({
          ...doc,
          embedding: newEmbedding
        });
        
        setProcessingProgress(((i + 1) / documents.length) * 100);
      }
      
      onDocumentsUpdate(updatedDocuments);
      
      toast({
        title: "Embeddings regenerated",
        description: `Updated embeddings for ${documents.length} document(s)`,
      });
      
    } catch (error) {
      console.error('Error regenerating embeddings:', error);
      toast({
        title: "Error regenerating embeddings",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6 shadow-research">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Document Repository</h2>
            <div className="flex gap-2">
              {documents.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleRegenerateEmbeddings}
                  disabled={isProcessing}
                  className="hover:border-research-accent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Embeddings
                </Button>
              )}
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                variant="research"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing documents and generating embeddings...</span>
                <span>{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Upload text files (.txt, .md, .json) to build your local document index. 
            Embeddings are generated locally using transformer models.
          </p>
        </div>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Indexed Documents ({documents.length})
          </h3>
          {documents.length > 0 && (
            <Badge variant="secondary" className="bg-research-muted">
              Total: {documents.reduce((acc, doc) => acc + doc.metadata.wordCount, 0).toLocaleString()} words
            </Badge>
          )}
        </div>
        
        {documents.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
            <p className="text-muted-foreground mb-4">
              Upload documents to start building your research corpus
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="hover:border-research-secondary"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Document
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-4 shadow-card hover:shadow-research transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-research-secondary" />
                      <h4 className="font-semibold truncate">{doc.title}</h4>
                      <Badge variant="secondary" className="ml-auto">
                        {doc.metadata.wordCount.toLocaleString()} words
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {doc.content.slice(0, 200)}...
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Uploaded: {doc.metadata.uploadedAt.toLocaleDateString()}
                      </span>
                      <span>
                        Embedding: {doc.embedding.length} dimensions
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};