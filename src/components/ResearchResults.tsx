import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Loader2, FileText, Brain, Lightbulb } from 'lucide-react';

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

interface ResearchStep {
  id: string;
  query: string;
  status: 'pending' | 'processing' | 'completed';
  results: any[];
}

interface SearchResult {
  query: string;
  steps: ResearchStep[];
  documents: Document[];
  synthesis: string;
  completedAt?: Date;
}

interface ResearchResultsProps {
  results: SearchResult[];
}

export const ResearchResults = ({ results }: ResearchResultsProps) => {
  const getStepIcon = (status: ResearchStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-research-accent" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-research-secondary animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getOverallProgress = (steps: ResearchStep[]) => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No research results yet</h3>
        <p className="text-muted-foreground">
          Start a research query to see multi-step reasoning and document analysis
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result, index) => (
        <Card key={index} className="p-6 shadow-research">
          <div className="space-y-6">
            {/* Query Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-research-primary">
                  {result.query}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{result.documents.length} documents analyzed</span>
                  {result.completedAt && (
                    <span>Completed at {result.completedAt.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="bg-research-muted">
                Research #{results.length - index}
              </Badge>
            </div>

            {/* Progress Overview */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Multi-Step Reasoning Progress</span>
                <span>{Math.round(getOverallProgress(result.steps))}%</span>
              </div>
              <Progress value={getOverallProgress(result.steps)} className="w-full" />
            </div>

            {/* Research Steps */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Reasoning Steps
              </h4>
              <div className="grid gap-3">
                {result.steps.map((step, stepIndex) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      step.status === 'completed' 
                        ? 'bg-research-accent/5 border-research-accent/20' 
                        : step.status === 'processing'
                        ? 'bg-research-secondary/5 border-research-secondary/20'
                        : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.query}</p>
                      {step.status === 'completed' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Step {stepIndex + 1} completed successfully
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyzed Documents */}
            {result.documents.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Analyzed Documents
                </h4>
                <div className="grid gap-2">
                  {result.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-2 rounded border bg-card/50">
                      <FileText className="w-4 h-4 text-research-secondary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.metadata.wordCount.toLocaleString()} words
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Relevant
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Synthesis */}
            {result.synthesis && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-research-accent" />
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Research Synthesis
                  </h4>
                </div>
                <Card className="p-4 bg-gradient-subtle border-research-accent/20">
                  <p className="text-sm leading-relaxed">{result.synthesis}</p>
                </Card>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};