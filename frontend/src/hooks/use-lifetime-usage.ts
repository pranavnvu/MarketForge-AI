import { useMemo } from 'react';
import { useProjects } from './use-projects';

export function useLifetimeUsage() {
  const { data: dbProjects = [] } = useProjects();
  
  return useMemo(() => {
    // Read historical ledger from sessionStorage
    const savedLedger = JSON.parse(sessionStorage.getItem('devforge_project_ledger') || '{}');
    
    // Update ledger with current projects' peak usage
    dbProjects.forEach((p: any) => {
      let currentWords = 0;
      if (p.config?.fileRegistry) {
        Object.values(p.config.fileRegistry).forEach((fileContent: any) => {
          if (typeof fileContent === 'string') {
            const words = fileContent.trim().split(/\s+/);
            if (words[0] !== '') {
              currentWords += words.length;
            }
          }
        });
      }
      
      const currentTokens = currentWords; // Mapping words to the existing 'tokens' property
      // We'll estimate API calls based on words generated. Roughly 1 API call per 200 words.
      const currentApiCalls = currentTokens > 0 ? Math.ceil(currentTokens / 200) : 0;
      
      // Keep historical high for this specific project (never decrease)
      savedLedger[p.id] = {
        tokens: Math.max(savedLedger[p.id]?.tokens || 0, currentTokens),
        apiCalls: Math.max(savedLedger[p.id]?.apiCalls || 0, currentApiCalls)
      };
    });

    // Save updated ledger
    sessionStorage.setItem('devforge_project_ledger', JSON.stringify(savedLedger));

    // Calculate true cumulative lifetime usage from the ledger
    const lifetimeProjectsCount = Object.keys(savedLedger).length;
    let lifetimeTokensCount = 0;
    let lifetimeApiCount = 0; // Removed arbitrary base of 12

    Object.values(savedLedger).forEach((usage: any) => {
      lifetimeTokensCount += usage.tokens;
      lifetimeApiCount += usage.apiCalls;
    });

    const finalUsage = {
      projects: lifetimeProjectsCount,
      tokens: lifetimeTokensCount,
      apiCalls: lifetimeApiCount,
      isQuotaExceeded: lifetimeProjectsCount >= 3 || lifetimeTokensCount >= 50000 || lifetimeApiCount >= 1000
    };
    
    // Keep legacy item updated just in case
    sessionStorage.setItem('devforge_lifetime_usage', JSON.stringify(finalUsage));
    
    return finalUsage;
  }, [dbProjects]);
}
