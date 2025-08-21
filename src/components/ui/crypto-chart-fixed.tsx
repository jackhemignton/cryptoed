"use client";

import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { ChevronDown, Share2, Check } from 'lucide-react';
import RSSNews from './rss-news';

const CryptoIcon = ({ crypto, size = "w-8 h-8" }: { crypto: CryptoOption; size?: string }) => {
  const getIconUrl = (symbol: string) => {
    return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`;
  };

  return (
    <div className={`${size} rounded-full flex items-center justify-center overflow-hidden`}>
      <img 
        src={getIconUrl(crypto.symbol)}
        alt={crypto.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
          ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement)!.style.display = 'flex';
        }}
      />
      <div 
        className="w-full h-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm" 
        style={{display: 'none'}}
      >
        {crypto.symbol.charAt(0)}
      </div>
    </div>
  );
};

interface PriceData {
  date: string;
  price: number;
}

interface CryptoOption {
  symbol: string;
  name: string;
  yahooSymbol: string;
  icon: string;
}

const cryptoOptions: CryptoOption[] = [
  { symbol: 'BTC', name: 'Bitcoin', yahooSymbol: 'BTC-USD', icon: '' },
  { symbol: 'ETH', name: 'Ethereum', yahooSymbol: 'ETH-USD', icon: '' },
  { symbol: 'BNB', name: 'Binance Coin', yahooSymbol: 'BNB-USD', icon: '' },
  { symbol: 'SOL', name: 'Solana', yahooSymbol: 'SOL-USD', icon: '' },
  { symbol: 'ADA', name: 'Cardano', yahooSymbol: 'ADA-USD', icon: '' },
  { symbol: 'DOT', name: 'Polkadot', yahooSymbol: 'DOT-USD', icon: '' },
  { symbol: 'MATIC', name: 'Polygon', yahooSymbol: 'MATIC-USD', icon: '' },
  { symbol: 'LINK', name: 'Chainlink', yahooSymbol: 'LINK-USD', icon: '' },
  { symbol: 'CUSTOM', name: 'Custom Crypto', yahooSymbol: '', icon: '' },
];



const CryptoChart = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(cryptoOptions[0]);
  const [chartData, setChartData] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [isPositive, setIsPositive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customCrypto, setCustomCrypto] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showShareConfirmation, setShowShareConfirmation] = useState(false);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        setError(null);

        const symbolToUse = selectedCrypto.symbol === 'CUSTOM' && customCrypto 
          ? `${customCrypto.toUpperCase()}-USD` 
          : selectedCrypto.yahooSymbol;

        if (!symbolToUse) {
          setError('Please enter a valid cryptocurrency symbol');
          setLoading(false);
          return;
        }
        const tickerResponse = await fetch(
          `https://corsproxy.io/?https://query1.finance.yahoo.com/v8/finance/chart/${symbolToUse}?interval=1d&range=1d`
        );
        
        if (!tickerResponse.ok) {
          throw new Error('Failed to fetch current price');
        }
        
        const tickerData = await tickerResponse.json();
        const currentPriceValue = tickerData.chart.result[0].meta.regularMarketPrice;
        const previousClose = tickerData.chart.result[0].meta.previousClose;
        const priceChangeValue = previousClose && currentPriceValue ? 
          ((currentPriceValue - previousClose) / previousClose) * 100 : 0;
        
        setCurrentPrice(currentPriceValue);
        setPriceChange(priceChangeValue);
        setIsPositive(priceChangeValue >= 0);

        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - (365 * 24 * 60 * 60);
        
        const historyResponse = await fetch(
          `https://corsproxy.io/?https://query1.finance.yahoo.com/v8/finance/chart/${symbolToUse}?interval=1d&period1=${startTime}&period2=${endTime}`
        );
        
        if (!historyResponse.ok) {
          throw new Error('Failed to fetch historical data');
        }
        
        const historyData = await historyResponse.json();
        const timestamps = historyData.chart.result[0].timestamp;
        const quotes = historyData.chart.result[0].indicators.quote[0].close;
        
        const transformedData: PriceData[] = timestamps.map((timestamp: number, index: number) => ({
          date: new Date(timestamp * 1000).toISOString().split('T')[0],
          price: quotes[index] || 0
        })).filter((item: PriceData) => item.price > 0);
        if (transformedData.length >= 2) {
          const latestPrice = transformedData[transformedData.length - 1].price;
          const previousPrice = transformedData[transformedData.length - 2].price;
          const priceChangeValue = previousPrice > 0 ? 
            ((latestPrice - previousPrice) / previousPrice) * 100 : 0;
          
          setPriceChange(priceChangeValue);
          setIsPositive(priceChangeValue >= 0);
        } else {
          setPriceChange(0);
          setIsPositive(true);
        }
        
        setChartData(transformedData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

            fetchCryptoData();

        const interval = setInterval(fetchCryptoData, 60000);

    return () => clearInterval(interval);
  }, [selectedCrypto, customCrypto]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cryptoParam = urlParams.get('crypto');
    const customParam = urlParams.get('custom');
    
    if (cryptoParam) {
      const crypto = cryptoOptions.find(c => c.symbol === cryptoParam);
      if (crypto) {
        setSelectedCrypto(crypto);
      } else if (cryptoParam === 'CUSTOM' && customParam) {
        setSelectedCrypto({ symbol: 'CUSTOM', name: customParam.toUpperCase(), yahooSymbol: '', icon: '' });
        setCustomCrypto(customParam);
      }
    }
  }, []);


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatChange = (change: number) => {
    if (isNaN(change) || !isFinite(change) || change === 0) {
      return '0.00%';
    }
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const handleCryptoSelect = (crypto: CryptoOption) => {
    if (crypto.symbol === 'CUSTOM') {
      setShowCustomInput(true);
      setIsDropdownOpen(false);
    } else {
      setSelectedCrypto(crypto);
      setShowCustomInput(false);
      setCustomCrypto('');
      setIsDropdownOpen(false);
    }
  };

  const handleCustomCryptoSubmit = () => {
    if (customCrypto.trim()) {
      setSelectedCrypto({ symbol: 'CUSTOM', name: customCrypto.toUpperCase(), yahooSymbol: '', icon: '' });
      setShowCustomInput(false);
    }
  };

  const handleShare = () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set('crypto', selectedCrypto.symbol);
    if (selectedCrypto.symbol === 'CUSTOM' && customCrypto) {
      shareUrl.searchParams.set('custom', customCrypto);
    }
    shareUrl.searchParams.set('price', currentPrice.toString());
    shareUrl.searchParams.set('change', priceChange.toString());
    
    const urlString = shareUrl.toString();
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(urlString).then(() => {
        setShowShareConfirmation(true);
        setTimeout(() => setShowShareConfirmation(false), 3000);
      }).catch(() => {
        fallbackCopyTextToClipboard(urlString);
      });
    } else {
      fallbackCopyTextToClipboard(urlString);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setShowShareConfirmation(true);
      setTimeout(() => setShowShareConfirmation(false), 3000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
    
    document.body.removeChild(textArea);
  };


  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Cryptoed
          </h1>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CryptoIcon crypto={selectedCrypto} />
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-2xl font-bold text-white hover:text-gray-300 transition-colors"
                >
                  {selectedCrypto.name}
                  <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                    {cryptoOptions.map((crypto) => (
                      <button
                        key={crypto.symbol}
                        onClick={() => handleCryptoSelect(crypto)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                          selectedCrypto.symbol === crypto.symbol ? 'bg-gray-700 text-orange-400' : 'text-white'
                        }`}
                      >
                        <CryptoIcon crypto={crypto} size="w-6 h-6" />
                        <div>
                          <div className="font-medium">{crypto.name}</div>
                          <div className="text-sm text-gray-400">
                            {crypto.symbol === 'CUSTOM' ? 'Enter symbol' : `${crypto.symbol}/USD`}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {showCustomInput && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg p-6 w-96">
                  <h3 className="text-xl font-bold text-white mb-4">Enter Custom Cryptocurrency</h3>
                  <input
                    type="text"
                    placeholder="e.g., DOGE, SHIB, XRP"
                    value={customCrypto}
                    onChange={(e) => setCustomCrypto(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomCryptoSubmit();
                      } else if (e.key === 'Escape') {
                        setShowCustomInput(false);
                        setCustomCrypto('');
                      }
                    }}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    autoFocus
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleCustomCryptoSubmit}
                      disabled={!customCrypto.trim()}
                      className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      Track
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomCrypto('');
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                Loading...
              </div>
              <div className="text-sm font-medium text-gray-400">
                0.00%
              </div>
            </div>
          </div>

          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <div className="text-white text-lg">Loading {selectedCrypto.name} data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-center h-80">
            <div className="text-red-400 text-lg">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-8 relative">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 drop-shadow-lg">
          Cryptoed
        </h1>
        <p className="text-gray-400 text-lg">Live Cryptocurrency Tracking</p>
        
        <button
          onClick={handleShare}
          className="absolute top-0 right-0 p-3 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 transition-colors duration-200 rounded-xl border border-gray-700/50 text-gray-300 hover:text-white group"
          title="Share current view"
        >
          {showShareConfirmation ? (
            <Check className="w-5 h-5 text-green-400" />
          ) : (
            <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          )}
        </button>
        
        {showShareConfirmation && (
          <div className="absolute top-16 right-0 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg border border-green-400/50 animate-in slide-in-from-top-2 duration-300">
            Shared at {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-gray-800/50 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <CryptoIcon crypto={selectedCrypto} />
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 text-2xl font-bold text-white hover:text-orange-400 transition-colors duration-200"
              >
                {selectedCrypto.name}
                <ChevronDown className={`w-6 h-6 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl z-10 min-w-56">
                  {cryptoOptions.map((crypto) => (
                    <button
                      key={crypto.symbol}
                      onClick={() => handleCryptoSelect(crypto)}
                      className={`w-full text-left px-5 py-4 hover:bg-gray-700/50 transition-colors duration-200 flex items-center gap-4 ${
                        selectedCrypto.symbol === crypto.symbol ? 'bg-gray-700/50 text-orange-400' : 'text-white'
                      }`}
                    >
                      <CryptoIcon crypto={crypto} size="w-7 h-7" />
                      <div>
                        <div className="font-semibold">{crypto.name}</div>
                        <div className="text-sm text-gray-400">
                          {crypto.symbol === 'CUSTOM' ? 'Enter symbol' : `${crypto.symbol}/USD`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {showCustomInput && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-8 w-96 border border-gray-700/50 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">Enter Custom Cryptocurrency</h3>
                <input
                  type="text"
                  placeholder="e.g., DOGE, SHIB, XRP"
                  value={customCrypto}
                  onChange={(e) => setCustomCrypto(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomCryptoSubmit();
                    } else if (e.key === 'Escape') {
                      setShowCustomInput(false);
                      setCustomCrypto('');
                    }
                  }}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                  autoFocus
                />
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleCustomCryptoSubmit}
                    disabled={!customCrypto.trim()}
                    className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold"
                  >
                    Track
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomCrypto('');
                    }}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 transition-colors duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-right">
            <div className="text-4xl font-bold text-white drop-shadow-sm">
              {formatPrice(currentPrice)}
            </div>
            <div className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {formatChange(priceChange)}
            </div>
          </div>
        </div>

        <div className="h-96 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f7931a" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#f7931a" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#f7931a" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPriceNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="chartGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#374151" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="#374151" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="5 5" 
                stroke="url(#chartGrid)"
                strokeOpacity={0.3}
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - date.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  if (diffDays <= 7) {
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                  } else if (diffDays <= 30) {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  } else {
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }
                }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `$${(value / 1000000).toFixed(1)}M`;
                  } else if (value >= 1000) {
                    return `$${(value / 1000).toFixed(0)}k`;
                  } else {
                    return `$${value.toFixed(0)}`;
                  }
                }}
                domain={['dataMin - 5%', 'dataMax + 5%']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(55, 65, 81, 0.5)',
                  borderRadius: '12px',
                  color: '#F9FAFB',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(12px)',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                formatter={(value: number) => [
                  <span key="price" style={{ color: isPositive ? '#f7931a' : '#ef4444', fontWeight: 'bold', fontSize: '16px' }}>
                    {formatPrice(value)}
                  </span>, 
                  'Price'
                ]}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                }}
                cursor={{
                  stroke: isPositive ? "#f7931a" : "#ef4444",
                  strokeWidth: 2,
                  strokeDasharray: '4 4',
                  strokeOpacity: 0.6,
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#f7931a" : "#ef4444"}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={isPositive ? "url(#colorPrice)" : "url(#colorPriceNegative)"}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: isPositive ? "#f7931a" : "#ef4444",
                  strokeWidth: 2,
                  fill: '#111827',
                  strokeOpacity: 0.8,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {chartData.length > 0 && (
            <div className="absolute top-4 right-4 bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 shadow-xl">
              <div className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Price Range</div>
              <div className="text-sm font-semibold text-white space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">
                    High: {formatPrice(Math.max(...chartData.map(d => d.price)))}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400">
                    Low: {formatPrice(Math.min(...chartData.map(d => d.price)))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <RSSNews selectedCrypto={selectedCrypto.name} />
    </div>
  );
};

export default CryptoChart;
