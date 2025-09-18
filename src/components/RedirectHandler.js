import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { findUrlByShortcode, updateUrl } from '../utils/storage';
import { isExpired } from '../utils/validation';
import { createClickRecord } from '../utils/analytics';
import { log } from '../utils/logger';
import './RedirectHandler.css';

const RedirectHandler = () => {
  const { shortcode } = useParams();

  useEffect(() => {
    handleRedirect();
  }, [shortcode]);

  const handleRedirect = () => {
    log.debug('Attempting redirect for shortcode', shortcode);
    
    const urlData = findUrlByShortcode(shortcode);
    
    if (!urlData) {
      log.info('Shortcode not found', shortcode);
      return;
    }
    
    if (isExpired(urlData.expiresAt)) {
      log.info('Shortcode expired', shortcode);
      return;
    }
    
    const clickRecord = createClickRecord();
    const updatedClicks = [...urlData.clicks, clickRecord];
    
    updateUrl(shortcode, {
      clickCount: urlData.clickCount + 1,
      clicks: updatedClicks
    });
    
    log.info('Redirecting to original URL', {
      shortcode,
      originalUrl: urlData.originalUrl,
      clickCount: urlData.clickCount + 1
    });
    
    window.location.href = urlData.originalUrl;
  };

  const urlData = findUrlByShortcode(shortcode);
  const expired = urlData && isExpired(urlData.expiresAt);

  if (!urlData) {
    return (
      <div className="redirect-error">
        <div className="error-content">
          <h1>Link Not Found</h1>
          <p>The shortened URL you're looking for doesn't exist or has been removed.</p>
          <div className="error-code">404</div>
          <a href="/" className="home-link">Go to URL Shortener</a>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="redirect-error">
        <div className="error-content">
          <h1>Link Expired</h1>
          <p>This shortened URL has expired and is no longer valid.</p>
          <div className="expired-info">
            <p>Original URL: <span className="original-url">{urlData.originalUrl}</span></p>
            <p>Expired on: {new Date(urlData.expiresAt).toLocaleString()}</p>
          </div>
          <a href="/" className="home-link">Create a New Short URL</a>
        </div>
      </div>
    );
  }

  return (
    <div className="redirect-loading">
      <div className="loading-content">
        <div className="spinner"></div>
        <h2>Redirecting...</h2>
        <p>Taking you to {urlData.originalUrl}</p>
        <p className="manual-link">
          If you're not redirected automatically, 
          <a href={urlData.originalUrl} className="direct-link">click here</a>
        </p>
      </div>
    </div>
  );
};

export default RedirectHandler;