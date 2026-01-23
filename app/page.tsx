import { PageLayout } from '@/app/components/layouts';

export default function Home() {
  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-amber-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">
            Down for Maintenance
          </h1>
          
          <p className="text-slate-400 leading-relaxed">
            Dev is sleeping, we will continue the testing phase in the morning.
          </p>
          
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              LLM: Legal Legends Manual
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
