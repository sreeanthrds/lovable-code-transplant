
import React from 'react';
import { Award, Users, Star, Quote } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

const TestimonialCard = ({ quote, author, role, rating }: TestimonialProps) => (
  <div className="group p-8 rounded-2xl bg-white/90 dark:bg-white/10 backdrop-blur-xl shadow-lg border border-white/40 dark:border-white/20 h-full flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
    
    <div className="flex items-center mb-6">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star 
            key={i} 
            className={`w-5 h-5 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} transition-all duration-300`} 
          />
        ))}
      </div>
      <div className="ml-auto bg-primary/10 p-2 rounded-full">
        <Quote className="w-6 h-6 text-primary opacity-70" />
      </div>
    </div>
    
    <blockquote className="text-gray-700 dark:text-gray-200 mb-8 flex-grow text-lg leading-relaxed italic">
      "{quote}"
    </blockquote>
    
    <div className="flex items-center mt-auto">
      {/* Clean avatar */}
      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center mr-4 shadow-lg">
        <span className="text-lg font-bold text-white">{author.charAt(0)}</span>
      </div>
      <div>
        <div className="font-semibold text-gray-900 dark:text-white text-lg">{author}</div>
        <div className="text-sm text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">{role}</div>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const testimonials = [
    {
      quote: "This platform revolutionized my trading approach. The backtesting accuracy and detailed analytics helped me identify winning strategies I never knew existed.",
      author: "Rajesh Kumar",
      role: "Professional Day Trader",
      rating: 5
    },
    {
      quote: "The visual strategy builder is a game-changer. I can now create complex trading algorithms without any programming knowledge. My portfolio performance improved by 35%.",
      author: "Priya Sharma",
      role: "Swing Trader",
      rating: 5
    },
    {
      quote: "Outstanding platform with incredible Indian market data coverage. The simulation environment is so realistic that I feel confident deploying strategies in live markets.",
      author: "Michael Chen",
      role: "Quantitative Analyst",
      rating: 5
    },
    {
      quote: "The flexible pricing plans are brilliant. I started with the free tier and upgraded as my needs grew. Perfect for traders at any level.",
      author: "Ankita Patel",
      role: "Options Trader",
      rating: 5
    },
    {
      quote: "Best trading platform I've used in 10 years of trading. The real-time insights and risk management tools saved me from major losses.",
      author: "David Wilson",
      role: "Portfolio Manager",
      rating: 5
    }
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Subtle decorative element */}
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl opacity-40"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16">
          <div className="mb-8 lg:mb-0 animate-fade-in">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent">
                Trusted by Professionals
              </h2>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Join thousands of successful traders who have transformed their trading journey with our platform.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Clean stats */}
            <div className="flex items-center bg-white/80 dark:bg-white/10 backdrop-blur-xl px-8 py-4 rounded-xl border border-white/40 dark:border-white/20">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">15,000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Active Traders</div>
              </div>
            </div>
            <div className="flex items-center bg-white/80 dark:bg-white/10 backdrop-blur-xl px-8 py-4 rounded-xl border border-white/40 dark:border-white/20">
              <div className="bg-yellow-500/10 p-2 rounded-full mr-3">
                <Star className="h-6 w-6 text-yellow-500 fill-current" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">4.9/5</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
        
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <TestimonialCard 
                  quote={testimonial.quote} 
                  author={testimonial.author} 
                  role={testimonial.role}
                  rating={testimonial.rating}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 lg:-left-12 bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 hover:bg-white/95 dark:hover:bg-white/15 shadow-lg" />
          <CarouselNext className="right-4 lg:-right-12 bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 hover:bg-white/95 dark:hover:bg-white/15 shadow-lg" />
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;
