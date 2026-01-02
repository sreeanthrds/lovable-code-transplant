
import React from 'react';
import ColorPaletteShowcase from '@/components/ui/color-palette-showcase';
import WebsiteLayout from '@/layouts/WebsiteLayout';

const ColorPalette = () => {
  console.log('ColorPalette page rendering');
  
  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-background">
        <ColorPaletteShowcase />
      </div>
    </WebsiteLayout>
  );
};

export default ColorPalette;
