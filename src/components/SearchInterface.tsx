import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, FileText, Settings } from 'lucide-react';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  isProcessing: boolean;
  documentCount: number;
}

export const SearchInterface = ({ onSearch, isProcessing, documentCount }: SearchInterfaceProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isProcessing) {
      onSearch(query.trim());
    }
  };

  const exampleQueries = [
    "What are the main themes and arguments in the uploaded documents?",
    "Compare and contrast different viewpoints presented in the research papers",
    "Identify key methodologies and their effectiveness across studies",
    "Synthesize conclusions and recommendations from all sources"
  ];

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-research-secondary" />
            <div>
              <p className="text-sm text-muted-foreground">Documents Indexed</p>
              <p className="text-2xl font-bold text-research-primary">{documentCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-research-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Local Embeddings</p>
              <Badge variant="secondary" className="mt-1">Active</Badge>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-research-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Multi-Step Reasoning</p>
              <Badge variant="secondary" className="mt-1">Enabled</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Form */}
      <Card className="p-6 shadow-research">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="research-query" className="block text-sm font-medium mb-2">
              Research Query
            </label>
            <Textarea
              id="research-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your research question here. The agent will break it down into sub-queries and analyze your documents comprehensively..."
              className="min-h-[100px] resize-none"
              disabled={isProcessing}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              The agent will use multi-step reasoning to analyze your query
            </p>
            <Button
              type="submit"
              disabled={!query.trim() || isProcessing}
              variant="research"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Start Research
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Example Queries */}
      {!isProcessing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Example Research Queries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left h-auto p-3 hover:border-research-secondary transition-colors"
                onClick={() => handleExampleClick(example)}
              >
                <p className="text-sm">{example}</p>
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};