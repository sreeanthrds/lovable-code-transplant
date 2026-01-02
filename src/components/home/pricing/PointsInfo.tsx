import React from 'react';
import { Info, Zap, TrendingUp, BarChart, Sparkles, CheckCircle } from 'lucide-react';

const PointsInfo = () => {
  const pointUsage = [
    {
      icon: <Zap className="h-6 w-6 text-white" />,
      title: "Live Trading",
      description: "Deploy strategies in real market conditions",
      usage: "1 point/day",
      color: "from-yellow-600 to-orange-600"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      title: "Extended Backtesting",
      description: "Test beyond the 3-month historical limit",
      usage: "2 points/test",
      color: "from-blue-600 to-blue-800"
    },
    {
      icon: <BarChart className="h-6 w-6 text-white" />,
      title: "Advanced Analytics",
      description: "Deep performance insights and custom reports",
      usage: "1 point/report",
      color: "from-green-600 to-emerald-700"
    }
  ];

  const benefits = [
    "Points never expire - use them anytime",
    "Free 10 points monthly for all users",
    "Unused points roll over to next month",
    "Flexible pay-as-you-use model"
  ];

  return (
    <div className="mt-20 animate-slide-up">
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/40 dark:border-white/20 shadow-lg">
        
        <div className="flex items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center mr-4 shadow-lg">
            <Info className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white">How Points Work</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Simple, transparent, and flexible pricing</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {pointUsage.map((item, index) => (
            <div key={index} className="group text-center p-6 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              
              <div className={`bg-gradient-to-r ${item.color} rounded-xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">{item.title}</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{item.description}</p>
              <div className="bg-white/80 dark:bg-white/10 backdrop-blur-sm text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/30 inline-block">
                {item.usage}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/40 dark:border-white/20">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white">Free Tier Benefits</h4>
            </div>
            <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
              <strong className="text-primary">Every user gets 10 free points monthly</strong> to explore premium features. 
              Perfect for testing the platform and understanding its capabilities before scaling up.
            </p>
          </div>
          
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/40 dark:border-white/20">
            <div className="flex items-center mb-6">
              <div className="bg-green-500/10 p-2 rounded-full mr-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white">Key Advantages</h4>
            </div>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-gray-700 dark:text-gray-200">
                  <div className="bg-green-500/10 p-1 rounded-full mr-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsInfo;
