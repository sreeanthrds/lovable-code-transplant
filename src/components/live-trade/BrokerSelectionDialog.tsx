import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

interface BrokerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBrokerSelect: (broker: any) => void;
}

const availableBrokers = [
  {
    id: 'clickhouse',
    name: 'ClickHouse Simulation',
    description: 'Historical data replay for strategy testing',
    status: 'active',
    domain: 'clickhouse.com',
    logoUrl: 'https://clickhouse.com/images/ch_logo.svg',
    category: 'Simulation'
  },
  {
    id: 'angel-one',
    name: 'Angel One',
    description: "India's largest retail broking house",
    status: 'active',
    domain: 'angelbroking.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=angelone.in&sz=128',
    category: 'Full Service'
  },
  {
    id: 'zerodha',
    name: 'Zerodha Kite',
    description: "India's biggest stock broker",
    status: 'active',
    domain: 'zerodha.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=zerodha.com&sz=128',
    category: 'Discount'
  },
  {
    id: 'upstox',
    name: 'Upstox',
    description: 'Technology-first discount broker',
    status: 'active',
    domain: 'upstox.com',
    logoUrl: 'https://assets.upstox.com/content/dam/upstox/brand/logo/u-logo-2.svg',
    category: 'Discount'
  },
  {
    id: 'fyers',
    name: 'Fyers',
    description: 'Next-gen investment platform',
    status: 'active',
    domain: 'fyers.in',
    logoUrl: 'https://fyers.in/img/fyers-logo.svg',
    category: 'Technology'
  },
  {
    id: 'alice-blue',
    name: 'Alice Blue',
    description: 'Popular discount broker with API support',
    status: 'active',
    domain: 'aliceblueonline.com',
    logoUrl: 'https://ant.aliceblueonline.com/assets/img/ab_logo.svg',
    category: 'Discount'
  },
  {
    id: '5paisa',
    name: '5paisa',
    description: 'Flat fee brokerage with developer APIs',
    status: 'active',
    domain: '5paisa.com',
    logoUrl: 'https://images.5paisa.com/website/5paisa-logo.svg',
    category: 'Discount'
  },
  {
    id: 'dhan',
    name: 'Dhan',
    description: 'Modern trading platform with APIs',
    status: 'active',
    domain: 'dhan.co',
    logoUrl: 'https://images.dhan.co/dhan-logo.svg',
    category: 'Technology'
  },
  {
    id: 'mastertrust',
    name: 'Mastertrust',
    description: 'Full-service broker with API access',
    status: 'active',
    domain: 'mastertrust.co.in',
    logoUrl: 'https://www.mastertrust.co.in/images/logo.png',
    category: 'Full Service'
  },
  {
    id: 'paytm-money',
    name: 'Paytm Money',
    description: 'Digital-first investment platform',
    status: 'active',
    domain: 'paytmmoney.com',
    logoUrl: 'https://assets.paytmmoney.com/logo/paytm-money-logo.svg',
    category: 'Digital'
  },
  {
    id: 'groww',
    name: 'Groww',
    description: 'Simple and transparent investing',
    status: 'active',
    domain: 'groww.in',
    logoUrl: 'https://assets-netstorage.groww.in/web-assets/billion_groww_desktop/prod/_next/static/media/growwLogo.f4e71b72.svg',
    category: 'Digital'
  },
  {
    id: 'iifl-securities',
    name: 'IIFL Securities',
    description: 'Full-service broker with API access',
    status: 'coming-soon',
    domain: 'iiflsecurities',
    category: 'Full Service'
  },
  {
    id: 'kotak-securities',
    name: 'Kotak Securities',
    description: 'Leading financial services provider',
    status: 'coming-soon',
    domain: 'kotaksecurities',
    category: 'Full Service'
  },
  {
    id: 'icici-direct',
    name: 'ICICI Direct',
    description: 'Leading bank-backed broker',
    status: 'coming-soon',
    domain: 'icicidirect',
    category: 'Bank'
  },
  {
    id: 'hdfc-securities',
    name: 'HDFC Securities',
    description: 'Trusted name in financial services',
    status: 'coming-soon',
    domain: 'hdfcsec',
    category: 'Bank'
  },
  {
    id: 'motilal-oswal',
    name: 'Motilal Oswal',
    description: 'Research-driven investment solutions',
    status: 'coming-soon',
    domain: 'motilaloswal',
    category: 'Research'
  }
];

const BrokerSelectionDialog: React.FC<BrokerSelectionDialogProps> = ({
  open,
  onOpenChange,
  onBrokerSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBrokers = availableBrokers.filter(broker =>
    broker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBrokers = filteredBrokers.filter(broker => broker.status === 'active');
  const comingSoonBrokers = filteredBrokers.filter(broker => broker.status === 'coming-soon');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl">Connect to Broker</DialogTitle>
          <p className="text-muted-foreground">Choose a broker to connect for live trading</p>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brokers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Broker Grid */}
        <div className="flex-1 overflow-auto">
          {/* Active Brokers */}
          {activeBrokers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Available Brokers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeBrokers.map((broker) => (
                  <div
                    key={broker.id}
                    className="relative rounded-lg p-4 cursor-pointer group transition-all bg-transparent border-2 border-white/30 hover:border-green-500/60 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    onClick={() => onBrokerSelect(broker)}
                  >
                    {/* Status Indicator */}
                    <div className="absolute top-3 right-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                    </div>

                    {/* Broker Logo */}
                    <div className="w-12 h-12 rounded-lg border-2 border-white/40 bg-transparent flex items-center justify-center shadow-sm mb-3">
                      <img 
                        src={broker.logoUrl || `https://logo.clearbit.com/${broker.domain}`}
                        alt={`${broker.name} logo`}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          if (broker.logoUrl && e.currentTarget.src === broker.logoUrl) {
                            e.currentTarget.src = `https://logo.clearbit.com/${broker.domain}`;
                          } else {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(broker.name)}&size=32&background=000&color=fff`;
                          }
                        }}
                      />
                    </div>

                    {/* Broker Info */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-white">{broker.name}</h4>
                      <p className="text-sm text-white/70">{broker.description}</p>
                      <Badge variant="secondary" className="text-xs bg-transparent border border-white/30 text-white">
                        {broker.category}
                      </Badge>
                    </div>

                    {/* Action */}
                    <div className="mt-4">
                      <div className="text-sm text-green-400 group-hover:text-green-300 font-semibold">
                        Click to setup connection
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coming Soon Brokers */}
          {comingSoonBrokers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Coming Soon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comingSoonBrokers.map((broker) => (
                  <div
                    key={broker.id}
                    className="relative rounded-lg p-4 cursor-not-allowed bg-transparent border-2 border-white/20 opacity-60"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="text-xs bg-transparent border-white/30 text-white">
                        Coming Soon
                      </Badge>
                    </div>

                    {/* Broker Logo */}
                    <div className="w-12 h-12 rounded-lg border-2 border-white/30 bg-transparent flex items-center justify-center shadow-sm mb-3">
                      <img 
                        src={broker.logoUrl || `https://logo.clearbit.com/${broker.domain}`}
                        alt={`${broker.name} logo`}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          if (broker.logoUrl && e.currentTarget.src === broker.logoUrl) {
                            e.currentTarget.src = `https://logo.clearbit.com/${broker.domain}`;
                          } else {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(broker.name)}&size=32&background=000&color=fff`;
                          }
                        }}
                      />
                    </div>

                    {/* Broker Info */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-white">{broker.name}</h4>
                      <p className="text-sm text-white/60">{broker.description}</p>
                      <Badge variant="outline" className="text-xs bg-transparent border-white/20 text-white">
                        {broker.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredBrokers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">No brokers found</div>
              <div className="text-sm text-muted-foreground">Try adjusting your search query</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrokerSelectionDialog;