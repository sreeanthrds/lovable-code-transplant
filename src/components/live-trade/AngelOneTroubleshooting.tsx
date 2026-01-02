import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

const AngelOneTroubleshooting = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDirectLogin = () => {
    // Open Angel One login in a new tab as fallback
    window.open('https://smartapi.angelbroking.com/publisher-login', '_blank');
  };

  return (
    <Card className="mt-4 border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors">
            <CardTitle className="flex items-center justify-between text-orange-800 dark:text-orange-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Angel One Login Issues?
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                If you're seeing JavaScript errors on Angel One's login page, this is a known issue with their website, not our application.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-semibold text-orange-800 dark:text-orange-200">Quick Fixes:</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-orange-700 dark:text-orange-300">1.</span>
                  <span>Refresh the Angel One login page (F5) and try entering credentials again</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="font-medium text-orange-700 dark:text-orange-300">2.</span>
                  <span>Try using a different browser (Chrome, Firefox, Edge)</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="font-medium text-orange-700 dark:text-orange-300">3.</span>
                  <span>Clear browser cache and cookies for Angel One</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="font-medium text-orange-700 dark:text-orange-300">4.</span>
                  <span>Try accessing Angel One directly using the button below</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleDirectLogin}
                variant="outline" 
                size="sm"
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Angel One Directly
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="outline" 
                size="sm"
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>

            <div className="text-xs text-orange-600 dark:text-orange-400 mt-4">
              <strong>Note:</strong> The "inputValue is not defined" error occurs on Angel One's website and is beyond our control. 
              These workarounds should help you complete the login process.
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AngelOneTroubleshooting;