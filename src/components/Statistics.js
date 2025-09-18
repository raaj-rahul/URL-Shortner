import React, { useState, useEffect } from 'react';
import { getUrls, removeExpiredUrls } from '../utils/storage';
import { isExpired } from '../utils/validation';
import { log } from '../utils/logger';
import './Statistics.css';

const Statistics = () => {
  const [urls, setUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = () => {
    const allUrls = removeExpiredUrls();
    setUrls(allUrls);
    log.debug('Loaded URLs for statistics', { count: allUrls.length });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatExpiry = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isExp = isExpired(timestamp);
    
    return {
      formatted: date.toLocaleString(),
      expired: isExp,
      timeLeft: isExp ? 'Expired' : `${Math.round((timestamp - now.getTime()) / (1000 * 60))} min left`
    };
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      log.debug('URL copied from statistics', text);
    } catch (err) {
      log.error('Failed to copy URL', err);
    }
  };

  const getTotalClicks = () => {
    return urls.reduce((total, url) => total + url.clickCount, 0);
  };

  const getClickStats = () => {
    if (urls.length === 0) return { totalUrls: 0, activeUrls: 0, totalClicks: 0 };
    
    return {
      totalUrls: urls.length,
      activeUrls: urls.filter(url => !isExpired(url.expiresAt)).length,
      totalClicks: getTotalClicks()
    };
  };

  const stats = getClickStats();

  return (
    <div className="statistics">
      <div className="header">
        <h1>Statistics</h1>
        <div className="summary">
          <div className="stat-card">
            <span className="stat-value">{stats.totalUrls}</span>
            <span className="stat-label">Total URLs</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.activeUrls}</span>
            <span className="stat-label">Active URLs</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalClicks}</span>
            <span className="stat-label">Total Clicks</span>
          </div>
        </div>
      </div>

      {urls.length === 0 ? (
        <div className="empty-state">
          <p>No shortened URLs yet. Go create some!</p>
        </div>
      ) : (
        <div className="content">
          <div className="urls-list">
            <h2>All Shortened URLs</h2>
            {urls.map(url => {
              const expiry = formatExpiry(url.expiresAt);
              return (
                <div 
                  key={url.id} 
                  className={`url-item ${expiry.expired ? 'expired' : ''} ${selectedUrl?.id === url.id ? 'selected' : ''}`}
                  onClick={() => setSelectedUrl(url)}
                >
                  <div className="url-main">
                    <div className="url-info">
                      <div className="original-url">
                        <strong>Original:</strong> {url.originalUrl}
                      </div>
                      <div className="short-url">
                        <strong>Short:</strong> 
                        <span className="short-link">{window.location.origin}/{url.shortcode}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(`${window.location.origin}/${url.shortcode}`);
                          }}
                          className="copy-small-btn"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="url-stats">
                      <div className="click-count">{url.clickCount} clicks</div>
                      <div className={`expiry ${expiry.expired ? 'expired' : ''}`}>
                        {expiry.timeLeft}
                      </div>
                    </div>
                  </div>
                  <div className="url-dates">
                    <span>Created: {formatDate(url.createdAt)}</span>
                    <span>Expires: {expiry.formatted}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedUrl && (
            <div className="url-details">
              <h2>Click Analytics</h2>
              <div className="details-header">
                <h3>{selectedUrl.shortcode}</h3>
                <p>{selectedUrl.originalUrl}</p>
                <div className="detail-stats">
                  <span>Total Clicks: {selectedUrl.clickCount}</span>
                </div>
              </div>

              {selectedUrl.clicks.length === 0 ? (
                <p className="no-clicks">No clicks recorded yet</p>
              ) : (
                <div className="clicks-list">
                  <h4>Click History</h4>
                  {selectedUrl.clicks.map((click, index) => (
                    <div key={index} className="click-item">
                      <div className="click-time">
                        {formatDate(click.timestamp)}
                      </div>
                      <div className="click-info">
                        <span className="referrer">From: {click.referrer}</span>
                        <span className="geo">Location: {click.geo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Statistics;