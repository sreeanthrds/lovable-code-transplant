
import React, { useEffect } from 'react';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import Pricing from '@/components/home/pricing';

const PricingPage = () => {
  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28">
        <section className="container mx-auto px-4 md:px-6 text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-down">
            Points-Based Pricing for Indian Traders
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto animate-slide-up">
            Purchase points to access premium features and extend your trading capabilities.
          </p>
        </section>
        
        <Pricing />
        
        {/* FAQ Section */}
        <section className="container mx-auto px-4 md:px-6 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-secondary/20 rounded-xl p-6 animate-slide-up">
              <h3 className="text-xl font-semibold mb-3">How do points work?</h3>
              <p className="text-foreground/70">
                Points are TradeLayout's in-platform currency. You can use them to access premium features like backtesting sessions, advanced indicators, and report exports.
              </p>
            </div>
            
            <div className="bg-secondary/20 rounded-xl p-6 animate-slide-up">
              <h3 className="text-xl font-semibold mb-3">Do points expire?</h3>
              <p className="text-foreground/70">
                No, your purchased points never expire. You can use them at your convenience whenever you need them.
              </p>
            </div>
            
            <div className="bg-secondary/20 rounded-xl p-6 animate-slide-up">
              <h3 className="text-xl font-semibold mb-3">What payment methods do you accept?</h3>
              <p className="text-foreground/70">
                We accept all major credit/debit cards, UPI, net banking, and selected wallets for payments in INR.
              </p>
            </div>
            
            <div className="bg-secondary/20 rounded-xl p-6 animate-slide-up">
              <h3 className="text-xl font-semibold mb-3">Can I get a refund for unused points?</h3>
              <p className="text-foreground/70">
                Points are non-refundable once purchased. However, if you face any technical issues while using our services, please contact our support team.
              </p>
            </div>
            
            <div className="bg-secondary/20 rounded-xl p-6 animate-slide-up">
              <h3 className="text-xl font-semibold mb-3">Is my data secure?</h3>
              <p className="text-foreground/70">
                Yes, we take security seriously. All data is encrypted and we never share your information with third parties.
              </p>
            </div>
            
            <div className="bg-secondary/20 rounded-xl p-6 animate-slide-up">
              <h3 className="text-xl font-semibold mb-3">Which Indian markets do you cover?</h3>
              <p className="text-foreground/70">
                We cover NSE, BSE, and major Indian commodity exchanges. Our data includes stocks, indices, futures, and options available on these exchanges.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
