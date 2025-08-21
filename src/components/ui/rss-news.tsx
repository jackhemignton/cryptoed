"use client";

import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, RefreshCw, Rss } from 'lucide-react';

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category?: string;
}

interface RSSFeed {
  name: string;
  url: string;
  category: string;
  special?: boolean;
}

const rssFeeds: RSSFeed[] = [
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'general' },
  { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss', category: 'general' },
  { name: 'Decrypt', url: 'https://decrypt.co/feed', category: 'general' },
  { name: 'The Block', url: 'https://www.theblock.co/rss.xml', category: 'general' },
  { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/', category: 'general' },
  { name: 'Bitcoin.com News', url: 'https://news.bitcoin.com/feed/', category: 'bitcoin' },
  { name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/.rss/full/', category: 'bitcoin' },
  { name: 'Bitcoin News', url: 'https://bitcoinnews.com/feed/', category: 'bitcoin' },
  { name: 'Ethereum Foundation Blog', url: 'https://blog.ethereum.org/feed.xml', category: 'ethereum' },
  { name: 'ETHNews', url: 'https://www.ethnews.com/feed', category: 'ethereum' },
  { name: 'Ethereum World News', url: 'https://ethereumworldnews.com/feed/', category: 'ethereum' },
  { name: 'Binance Blog', url: 'https://www.binance.com/en/blog', category: 'binance', special: true },
  { name: 'BNB Chain Blog', url: 'https://bnbchain.org/en/blog/feed/', category: 'binance' },
  { name: 'Solana Blog', url: 'https://solana.com/feed.xml', category: 'solana' },
  { name: 'Solana News', url: 'https://solana.com/news/feed', category: 'solana' },
  { name: 'Cardano News', url: 'https://cryptonews.com/news/cardano-news/', category: 'cardano' },
  { name: 'ADA News', url: 'https://ambcrypto.com/tag/cardano/', category: 'cardano' },
  { name: 'Polkadot Blog', url: 'https://polkadot.network/blog/feed/', category: 'polkadot' },
  { name: 'Web3 Foundation', url: 'https://web3.foundation/blog/feed/', category: 'polkadot' },
  { name: 'Polygon Blog', url: 'https://polygon.technology/blog/feed', category: 'polygon' },
  { name: 'Polygon News', url: 'https://polygon.technology/news/feed', category: 'polygon' },
  { name: 'Chainlink Blog', url: 'https://blog.chain.link/feed/', category: 'chainlink' },
  { name: 'Chainlink News', url: 'https://chainlinkcommunity.com/feed/', category: 'chainlink' },
];

const RSSNews = ({ selectedCrypto }: { selectedCrypto: string }) => {
  const [news, setNews] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBinanceBlog = async (): Promise<RSSItem[]> => {
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent('https://www.binance.com/en/blog')}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Binance Blog');
      }
      
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      
      const articles = doc.querySelectorAll('article, .blog-post, .post-item');
      const parsedItems: RSSItem[] = [];
      
      articles.forEach((article) => {
        const titleElement = article.querySelector('h1, h2, h3, .title, .post-title');
        const linkElement = article.querySelector('a[href*="/blog/"]');
        const dateElement = article.querySelector('.date, .published, time');
        const excerptElement = article.querySelector('.excerpt, .summary, p');
        
        if (titleElement && linkElement) {
          const title = titleElement.textContent?.trim() || '';
          const link = linkElement.getAttribute('href') || '';
          const fullLink = link.startsWith('http') ? link : `https://www.binance.com${link}`;
          const pubDate = dateElement?.textContent?.trim() || new Date().toISOString();
          const description = excerptElement?.textContent?.trim() || title;
          
          parsedItems.push({
            title: title.replace(/<[^>]*>/g, ''),
            description: description.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
            link: fullLink,
            pubDate,
            source: 'Binance Blog',
            category: 'binance'
          });
        }
      });
      
      return parsedItems.slice(0, 10);
    } catch (error) {
      console.error('Error fetching Binance Blog:', error);
      return [];
    }
  };

  const fetchRSSFeed = async (feedUrl: string, feedName: string, special: boolean = false): Promise<RSSItem[]> => {
    if (special && feedName === 'Binance Blog') {
      try {
        return await fetchBinanceBlog();
      } catch (error) {
        console.warn(`Failed to fetch ${feedName}:`, error);
        return [];
      }
    }
    
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`;
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        console.warn(`Failed to fetch ${feedName}: HTTP ${response.status}`);
        return [];
      }
      
      const text = await response.text();
      
      if (!text || text.trim().length === 0) {
        console.warn(`Empty response from ${feedName}`);
        return [];
      }
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      

      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        console.warn(`XML parsing error for ${feedName}:`, parseError.textContent);
        return [];
      }
      
      const items = xmlDoc.querySelectorAll('item');
      const parsedItems: RSSItem[] = [];
      
      items.forEach((item) => {
        try {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const category = item.querySelector('category')?.textContent || '';
          
          if (selectedCrypto && selectedCrypto !== 'CUSTOM') {
            const searchText = `${title} ${description}`.toLowerCase();
            const cryptoName = selectedCrypto.toLowerCase();
            if (!searchText.includes(cryptoName)) {
              return;
            }
          }
          
          if (title && link) {
            parsedItems.push({
              title: title.replace(/<[^>]*>/g, ''),
              description: description.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
              link,
              pubDate,
              source: feedName,
              category
            });
          }
        } catch (itemError) {
          console.warn(`Error parsing item from ${feedName}:`, itemError);
        }
      });
      
      return parsedItems;
    } catch (error) {
      console.warn(`Error fetching ${feedName}:`, error);
      return [];
    }
  };

  const fetchAllNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allNews: RSSItem[] = [];
      
      let relevantFeeds = rssFeeds;
      if (selectedCrypto && selectedCrypto !== 'CUSTOM') {
        const cryptoLower = selectedCrypto.toLowerCase();
        const cryptoCategory = cryptoLower === 'bitcoin' ? 'bitcoin' :
                              cryptoLower === 'ethereum' ? 'ethereum' :
                              cryptoLower === 'binance coin' ? 'binance' :
                              cryptoLower === 'solana' ? 'solana' :
                              cryptoLower === 'cardano' ? 'cardano' :
                              cryptoLower === 'polkadot' ? 'polkadot' :
                              cryptoLower === 'polygon' ? 'polygon' :
                              cryptoLower === 'chainlink' ? 'chainlink' : 'general';
        
        relevantFeeds = rssFeeds.filter(feed => 
          feed.category === cryptoCategory || feed.category === 'general'
        );
      }
      
      const promises = relevantFeeds.map(feed => fetchRSSFeed(feed.url, feed.name, feed.special));
              const results = await Promise.allSettled(promises);
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            allNews.push(...result.value);
          } else {
            console.error(`Failed to fetch ${relevantFeeds[index].name}:`, result.reason);
          }
        });
        
        allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        
        const uniqueNews = allNews.filter((item, index, self) => 
          index === self.findIndex(t => 
            t.title.toLowerCase().includes(item.title.toLowerCase().substring(0, 30)) ||
            item.title.toLowerCase().includes(t.title.toLowerCase().substring(0, 30))
          )
        );
        
        setNews(uniqueNews.slice(0, 20));
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch news from RSS feeds');
      console.error('RSS fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNews();
  }, [selectedCrypto, fetchAllNews]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleRefresh = () => {
    fetchAllNews();
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Rss className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">
            RSS News Feed
            {selectedCrypto && selectedCrypto !== 'CUSTOM' && (
              <span className="text-orange-400 ml-2">• {selectedCrypto}</span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-xs text-gray-400">
              Updated {formatTimeAgo(lastUpdated.toISOString())}
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      )}

      <div className="space-y-4">
        {loading && news.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <div className="text-white">Loading RSS feeds...</div>
            </div>
          </div>
        ) : news.length > 0 ? (
          news.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white line-clamp-2">
                      {item.title}
                    </h3>
                    {item.category && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-orange-400 bg-gray-700">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(item.pubDate)}
                    </div>
                    <span>•</span>
                    <span className="font-medium text-orange-400">{item.source}</span>
                  </div>
                </div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-orange-400 transition-colors"
                  title="Read full article"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Rss className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-lg">No news found</div>
            <div className="text-gray-500 text-sm mt-2">
              {selectedCrypto && selectedCrypto !== 'CUSTOM' 
                ? `No recent news about ${selectedCrypto}`
                : 'Try refreshing or check back later'
              }
            </div>
          </div>
        )}
      </div>

      {news.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Sources: {selectedCrypto && selectedCrypto !== 'CUSTOM' 
              ? rssFeeds.filter(feed => {
                  const cryptoLower = selectedCrypto.toLowerCase();
                  const cryptoCategory = cryptoLower === 'bitcoin' ? 'bitcoin' :
                                        cryptoLower === 'ethereum' ? 'ethereum' :
                                        cryptoLower === 'binance coin' ? 'binance' :
                                        cryptoLower === 'solana' ? 'solana' :
                                        cryptoLower === 'cardano' ? 'cardano' :
                                        cryptoLower === 'polkadot' ? 'polkadot' :
                                        cryptoLower === 'polygon' ? 'polygon' :
                                        cryptoLower === 'chainlink' ? 'chainlink' : 'general';
                  return feed.category === cryptoCategory || feed.category === 'general';
                }).map(feed => feed.name).join(', ')
              : rssFeeds.map(feed => feed.name).join(', ')
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default RSSNews;
