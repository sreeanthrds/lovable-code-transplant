
import React, { useEffect } from 'react';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User } from 'lucide-react';

interface BlogPostProps {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  category: string;
  slug: string;
}

const BlogPost = ({ title, excerpt, date, author, image, category, slug }: BlogPostProps) => {
  return (
    <article className="rounded-xl overflow-hidden shadow-sm border border-border group hover:shadow-md transition-all">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1 bg-success/90 text-white text-xs font-medium rounded-full">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 group-hover:text-success transition-colors">
          <Link to={`/blog/${slug}`}>{title}</Link>
        </h3>
        <p className="text-foreground/70 mb-4 line-clamp-2">{excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-foreground/60">
            <User className="h-4 w-4 mr-1" />
            <span>{author}</span>
            <span className="mx-2">•</span>
            <Calendar className="h-4 w-4 mr-1" />
            <span>{date}</span>
          </div>
          <Link 
            to={`/blog/${slug}`} 
            className="text-success font-medium text-sm flex items-center hover:underline"
          >
            Read more
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};

const Blog = () => {
  const blogPosts: BlogPostProps[] = [
    {
      title: 'How to Backtest Your First Trading Strategy in 5 Steps',
      excerpt: 'A step-by-step guide to creating and testing your first trading strategy using TradeBack Pro.',
      date: 'June 15, 2023',
      author: 'Michael K.',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2940&auto=format&fit=crop',
      category: 'Guides',
      slug: 'how-to-backtest-first-strategy'
    },
    {
      title: 'Top 3 Mistakes Traders Make When Backtesting',
      excerpt: 'Avoid these common pitfalls that can lead to misleading backtest results and trading losses.',
      date: 'May 24, 2023',
      author: 'Sarah J.',
      image: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?q=80&w=2940&auto=format&fit=crop',
      category: 'Tips',
      slug: 'top-mistakes-when-backtesting'
    },
    {
      title: 'Why Historical Data Matters More Than You Think',
      excerpt: 'The quality of your backtest results depends heavily on the quality of your historical data. Here\'s why.',
      date: 'April 17, 2023',
      author: 'Robert L.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop',
      category: 'Education',
      slug: 'why-historical-data-matters'
    },
    {
      title: 'Optimizing Your Strategy Without Overfitting',
      excerpt: 'Learn how to fine-tune your trading strategy parameters without falling into the overfitting trap.',
      date: 'March 8, 2023',
      author: 'Jennifer W.',
      image: 'https://images.unsplash.com/photo-1642543348745-77b08a1af522?q=80&w=2833&auto=format&fit=crop',
      category: 'Advanced',
      slug: 'optimizing-without-overfitting'
    },
    {
      title: 'Risk Management: The Key to Long-Term Trading Success',
      excerpt: 'Discover how proper position sizing and risk parameters can make or break your trading strategy.',
      date: 'February 22, 2023',
      author: 'Daniel C.',
      image: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=2802&auto=format&fit=crop',
      category: 'Strategy',
      slug: 'risk-management-for-traders'
    },
    {
      title: 'From Backtest to Live Trading: Making the Transition',
      excerpt: 'The crucial steps to take when moving from a successful backtest to live market trading.',
      date: 'January 15, 2023',
      author: 'Michael K.',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2940&auto=format&fit=crop',
      category: 'Implementation',
      slug: 'backtest-to-live-trading'
    },
  ];

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28">
        <section className="container mx-auto px-4 md:px-6 mb-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-down">
              Learn to Trade Smarter
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto animate-slide-up">
              Insights, guides, and strategies to help you master the art of trading.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <BlogPost {...post} />
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/signup" 
              className="btn-primary inline-flex items-center group animate-slide-up"
            >
              Sign Up to Test These Tips Yourself
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
