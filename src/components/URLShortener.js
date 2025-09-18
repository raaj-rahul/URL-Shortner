import React, { useState } from 'react';
import { validateUrl, generateShortcode, isValidShortcode } from '../utils/validation';
import { saveUrl, isShortcodeUnique } from '../utils/storage';
import { log } from '../utils/logger';
import './URLShortener.css';

const URLShortener = () => {
  const [entries, setEntries] = useState([{
    id: 1,
    originalUrl: '',
    customShortcode: '',
    validityPeriod: 30,
    result: null,
    error: null
  }]);

  const addEntry = () => {
    if (entries.length < 5) {
      setEntries([...entries, {
        id: Date.now(),
        originalUrl: '',
        customShortcode: '',
        validityPeriod: 30,
        result: null,
        error: null
      }]);
    }
  };

  const removeEntry = (id) => {
    if (entries.length > 1) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const updateEntry = (id, field, value) => {
    setEntries(entries.map(entry => 
      entry.id === id 
        ? { ...entry, [field]: value, error: null }
        : entry
    ));
  };

  const validateEntry = (entry) => {
    if (!entry.originalUrl.trim()) {
      return 'URL is required';
    }
    
    if (!validateUrl(entry.originalUrl)) {
      return 'Please enter a valid URL (including http:// or https://)';
    }
    
    if (entry.validityPeriod <= 0 || !Number.isInteger(Number(entry.validityPeriod))) {
      return 'Validity period must be a positive number';
    }
    
    if (entry.customShortcode && !isValidShortcode(entry.customShortcode)) {
      return 'Custom shortcode must be alphanumeric (3-20 characters)';
    }
    
    if (entry.customShortcode && !isShortcodeUnique(entry.customShortcode)) {
      return 'This shortcode is already taken';
    }
    
    return null;
  };

  const shortenUrl = (entry) => {
    const error = validateEntry(entry);
    if (error) {
      updateEntry(entry.id, 'error', error);
      return;
    }

    const shortcode = entry.customShortcode || generateShortcode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + entry.validityPeriod * 60 * 1000);
    
    const urlData = {
      id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      shortcode,
      originalUrl: entry.originalUrl,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.getTime(),
      clickCount: 0,
      clicks: []
    };

    try {
      saveUrl(urlData);
      log.info('URL shortened successfully', { shortcode, originalUrl: entry.originalUrl });
      
      updateEntry(entry.id, 'result', {
        shortUrl: `${window.location.origin}/${shortcode}`,
        expiresAt: expiresAt.toLocaleString()
      });
    } catch (error) {
      log.error('Failed to save URL', error);
      updateEntry(entry.id, 'error', 'Failed to save URL. Please try again.');
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      log.debug('URL copied to clipboard', text);
    } catch (err) {
      log.error('Failed to copy URL', err);
    }
  };

  return (
    <div className="url-shortener">
      <div className="header">
        <h1>URL Shortener</h1>
        <p>Create up to 5 shortened URLs at once</p>
      </div>

      <div className="entries">
        {entries.map((entry, index) => (
          <div key={entry.id} className="entry">
            <div className="entry-header">
              <h3>URL #{index + 1}</h3>
              {entries.length > 1 && (
                <button 
                  onClick={() => removeEntry(entry.id)}
                  className="remove-btn"
                  type="button"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Original URL *</label>
                <input
                  type="url"
                  value={entry.originalUrl}
                  onChange={(e) => updateEntry(entry.id, 'originalUrl', e.target.value)}
                  placeholder="https://example.com/very-long-url"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Validity Period (minutes)</label>
                <input
                  type="number"
                  value={entry.validityPeriod}
                  onChange={(e) => updateEntry(entry.id, 'validityPeriod', parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Custom Shortcode (optional)</label>
                <input
                  type="text"
                  value={entry.customShortcode}
                  onChange={(e) => updateEntry(entry.id, 'customShortcode', e.target.value)}
                  placeholder="my-custom-code"
                />
              </div>
            </div>

            <button 
              onClick={() => shortenUrl(entry)}
              className="shorten-btn"
              disabled={!entry.originalUrl.trim()}
            >
              Shorten URL
            </button>

            {entry.error && (
              <div className="error-message">
                {entry.error}
              </div>
            )}

            {entry.result && (
              <div className="result">
                <div className="result-header">
                  <h4>Shortened URL Created!</h4>
                  <p>Expires: {entry.result.expiresAt}</p>
                </div>
                <div className="url-display">
                  <input 
                    type="text" 
                    value={entry.result.shortUrl} 
                    readOnly 
                    className="short-url-input"
                  />
                  <button 
                    onClick={() => copyToClipboard(entry.result.shortUrl)}
                    className="copy-btn"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {entries.length < 5 && (
        <button onClick={addEntry} className="add-entry-btn">
          Add Another URL
        </button>
      )}
    </div>
  );
};

export default URLShortener;