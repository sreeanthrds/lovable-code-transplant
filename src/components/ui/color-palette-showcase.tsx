
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ColorCombination {
  name: string;
  description: string;
  primary: string;
  secondary: string;
  feel: string;
  usage: string;
}

const ColorPaletteShowcase = () => {
  console.log('ColorPaletteShowcase component rendering');
  
  const colorCombinations: ColorCombination[] = [
    {
      name: "Slate + Mint",
      description: "Minimalist",
      primary: "#475569",
      secondary: "#10b981",
      feel: "Minimal, approachable, user-friendly",
      usage: "Soft contrast, clean appearance"
    },
    {
      name: "Dark Green + Teal",
      description: "Sophisticated",
      primary: "#166534",
      secondary: "#0f766e",
      feel: "Professional, trustworthy, finance-focused",
      usage: "Replace white with dark green, use teal for candlestick details"
    },
    {
      name: "Navy + Green",
      description: "Professional",
      primary: "#1e3a8a",
      secondary: "#15803d",
      feel: "Corporate, reliable, traditional finance",
      usage: "Navy for main elements, green for growth indicators"
    },
    {
      name: "Charcoal + Emerald",
      description: "Modern",
      primary: "#374151",
      secondary: "#059669",
      feel: "Contemporary, clean, tech-forward",
      usage: "Charcoal for structure, emerald for highlights"
    },
    {
      name: "Forest Green + Gold",
      description: "Premium",
      primary: "#14532d",
      secondary: "#d97706",
      feel: "Luxury, established, high-end trading",
      usage: "Forest green base, gold accents for premium touch"
    },
    {
      name: "Deep Blue + Lime",
      description: "Tech-forward",
      primary: "#1e40af",
      secondary: "#65a30d",
      feel: "Modern fintech, innovative, dynamic",
      usage: "Blue for stability, lime for energy and growth"
    },
    {
      name: "Midnight + Cyan",
      description: "Bold",
      primary: "#1f2937",
      secondary: "#06b6d4",
      feel: "Bold, confident, attention-grabbing",
      usage: "Strong contrast, eye-catching"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground">TradeLayout Logo Color Combinations</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect color combination for your TradeLayout logo on light backgrounds. 
          Each combination shows how your logo would look with white parts replaced by the primary color.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colorCombinations.map((combo, index) => {
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl">{combo.name}</CardTitle>
                  <Badge variant="secondary">{combo.description}</Badge>
                </div>
                
                {/* Color Swatches */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div 
                      className="w-full h-20 rounded-lg border shadow-sm mb-2"
                      style={{ backgroundColor: combo.primary }}
                    ></div>
                    <p className="text-sm font-medium">Primary</p>
                    <p className="text-xs text-muted-foreground font-mono">{combo.primary}</p>
                  </div>
                  <div className="flex-1">
                    <div 
                      className="w-full h-20 rounded-lg border shadow-sm mb-2"
                      style={{ backgroundColor: combo.secondary }}
                    ></div>
                    <p className="text-sm font-medium">Secondary</p>
                    <p className="text-xs text-muted-foreground font-mono">{combo.secondary}</p>
                  </div>
                </div>

                {/* Combined Preview */}
                <div className="mb-4">
                  <div className="w-full h-12 rounded-lg border shadow-sm flex">
                    <div 
                      className="flex-1 rounded-l-lg"
                      style={{ backgroundColor: combo.primary }}
                    ></div>
                    <div 
                      className="flex-1 rounded-r-lg"
                      style={{ backgroundColor: combo.secondary }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">Combined Preview</p>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Feel & Aesthetic</h4>
                    <p className="text-sm text-muted-foreground">{combo.feel}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Usage Guide</h4>
                    <p className="text-sm text-muted-foreground">{combo.usage}</p>
                  </div>

                  {/* Logo preview with glassmorphism styling for dark mode */}
                  <div className="mt-4 p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-white/90 via-white/70 to-white/50 backdrop-blur-lg border border-white/20 shadow-xl">
                    {/* Background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br opacity-10 rounded-2xl" style={{ 
                      background: `linear-gradient(135deg, ${combo.primary}20, ${combo.secondary}20)` 
                    }}></div>
                    
                    <p className="text-xs mb-3 relative z-10 font-medium text-gray-600">
                      Logo Preview (Glassmorphism)
                    </p>
                    <div className="flex items-center justify-center space-x-4 relative z-10">
                      {/* Original logo for reference */}
                      <div className="text-center">
                        <div className="relative w-12 h-12 mb-2">
                          <img 
                            src="/lovable-uploads/771c5927-40d8-4bfb-b06c-7a4b061d694d.png"
                            alt="Original TradeLayout Logo" 
                            className="w-full h-full drop-shadow-lg"
                          />
                        </div>
                        <span className="text-xs text-gray-500">Original</span>
                      </div>
                      
                      <span className="text-lg text-gray-400">→</span>
                      
                      {/* Logo with white parts replaced */}
                      <div className="text-center">
                        <div className="relative w-12 h-12 mb-2">
                          {/* Create a colored version by overlaying the primary color and using the logo as a mask */}
                          <div 
                            className="absolute inset-0 w-full h-full rounded-lg"
                            style={{ backgroundColor: combo.primary }}
                          />
                          <img 
                            src="/lovable-uploads/771c5927-40d8-4bfb-b06c-7a4b061d694d.png" 
                            alt="Logo Mask" 
                            className="absolute inset-0 w-full h-full mix-blend-multiply drop-shadow-lg"
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          With {combo.name.split(' + ')[0]}
                        </span>
                      </div>
                      
                      <div className="ml-4">
                        <span 
                          className="text-lg font-bold drop-shadow-sm"
                          style={{ color: combo.primary }}
                        >
                          TradeLayout
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs mt-3 text-center relative z-10 text-gray-500">
                      Enhanced glassmorphism design with {combo.name} palette
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-2">How to Choose</h3>
          <p className="text-muted-foreground">
            Consider your brand personality: Professional finance (Navy + Green), 
            Modern tech (Deep Blue + Lime), Premium service (Forest + Gold), 
            or Clean minimal (Slate + Mint). Each combination maintains your logo's 
            original design while only replacing white areas with the primary color.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteShowcase;
