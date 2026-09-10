import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Copy,
  Check,
  AlertCircle,
  X,
  Building2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Compass
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:4000';

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMeta, setSearchMeta] = useState({ query: '', type: '', count: 0 });
  const [popularAreas, setPopularAreas] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [copiedPincode, setCopiedPincode] = useState(null);

  // Fetch popular Bangalore locations on initial mount
  useEffect(() => {
    async function fetchPopular() {
      try {
        setPopularLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/popular`);
        if (!res.ok) throw new Error('Failed to load popular areas');
        const data = await res.json();
        if (data && Array.isArray(data.popular)) {
          setPopularAreas(data.popular);
        }
      } catch (err) {
        console.warn('Could not fetch popular areas from API, using defaults:', err.message);
        setPopularAreas(['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Electronic City', 'Bellandur']);
      } finally {
        setPopularLoading(false);
      }
    }
    fetchPopular();
  }, []);

  // Central search execution function
  const executeSearch = async (searchTerm) => {
    const trimmed = (searchTerm || '').trim();
    if (!trimmed) {
      setError('Please enter a Bangalore pincode or area name to search.');
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Server returned error ${res.status}`);
      }

      setResults(data.results || []);
      setSearchMeta({
        query: data.query || trimmed,
        type: data.type || 'area',
        count: data.count || (data.results ? data.results.length : 0)
      });
      setHasSearched(true);
    } catch (err) {
      setError(err.message || 'Unable to connect to server. Please ensure the backend is running.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handlePopularClick = (areaName) => {
    setQuery(areaName);
    executeSearch(areaName);
  };

  const handleClear = () => {
    setQuery('');
    setError('');
  };

  const handleCopyPincode = (pincode) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pincode);
      setCopiedPincode(pincode);
      setTimeout(() => setCopiedPincode(null), 2000);
    }
  };

  return (
    <div className="app-container">
      {/* Background ambient lighting accents */}
      <div className="bg-glow bg-glow-1" aria-hidden="true" />
      <div className="bg-glow bg-glow-2" aria-hidden="true" />

      {/* Main Container */}
      <main className="main-wrapper">
        {/* Header Branding */}
        <header className="header">
          <div className="badge-pill">
            <span className="pulse-dot" />
            <Sparkles size={14} className="icon-sparkle" />
            <span>Bangalore Postal Directory</span>
          </div>
          <h1 className="title">Bangalore Pincode Explorer</h1>
          <p className="subtitle">
            Find an area by 6-digit pincode or discover pincodes by locality name
          </p>
        </header>

        {/* Search Card Section */}
        <section className="search-section" aria-label="Search Form">
          <form className="search-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-icon-wrapper" aria-hidden="true">
                <Search size={20} className="search-icon" />
              </div>

              <input
                id="pincode-search-input"
                type="text"
                className="search-input"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter 560048 or Whitefield..."
                autoComplete="off"
                aria-label="Bangalore pincode or area name search query"
              />

              {query && (
                <button
                  type="button"
                  className="clear-button"
                  onClick={handleClear}
                  aria-label="Clear search input"
                >
                  <X size={18} />
                </button>
              )}

              <button
                type="submit"
                className="search-button"
                disabled={loading}
                aria-label="Submit search"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spinner" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Helper Tips */}
          <div className="helper-text">
            <span className="helper-label">
              <HelpCircle size={13} /> Try searching:
            </span>
            <button
              type="button"
              className="helper-link"
              onClick={() => handlePopularClick('560048')}
            >
              560048
            </button>
            <span className="separator">•</span>
            <button
              type="button"
              className="helper-link"
              onClick={() => handlePopularClick('Whitefield')}
            >
              Whitefield
            </button>
            <span className="separator">•</span>
            <button
              type="button"
              className="helper-link"
              onClick={() => handlePopularClick('Koramangala')}
            >
              Koramangala
            </button>
          </div>

          {/* Popular Location Chips */}
          <div className="popular-section">
            <span className="popular-title">Popular Areas:</span>
            <div className="chips-wrapper">
              {popularLoading ? (
                <div className="chips-skeleton">Loading popular areas...</div>
              ) : (
                popularAreas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    className={`chip ${query.toLowerCase() === area.toLowerCase() ? 'chip-active' : ''}`}
                    onClick={() => handlePopularClick(area)}
                  >
                    <MapPin size={13} className="chip-icon" />
                    <span>{area}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Feedback Messages (Validation or Server Error) */}
        {error && (
          <section className="error-card" role="alert">
            <div className="error-icon-box">
              <AlertCircle size={22} className="error-icon" />
            </div>
            <div className="error-content">
              <h3 className="error-title">Search Notice</h3>
              <p className="error-message">{error}</p>
            </div>
            <button
              type="button"
              className="error-dismiss"
              onClick={() => setError('')}
              aria-label="Dismiss error message"
            >
              <X size={16} />
            </button>
          </section>
        )}

        {/* Results Area */}
        <section className="results-container" aria-live="polite">
          {/* Loading Skeleton */}
          {loading && (
            <div className="loading-state">
              <div className="spinner-large" />
              <p className="loading-text">Searching Bangalore postal records...</p>
            </div>
          )}

          {/* Successful Search Results */}
          {!loading && hasSearched && results.length > 0 && (
            <div className="results-wrapper">
              <div className="results-meta-bar">
                <div className="results-count-wrapper">
                  <span className="results-count-number">{searchMeta.count}</span>
                  <span className="results-count-label">
                    {searchMeta.count === 1 ? 'match found' : 'matches found'}
                  </span>
                  <span className="results-query-highlight">
                    for &ldquo;{searchMeta.query}&rdquo;
                  </span>
                </div>
                <div className="search-type-badge">
                  <span>
                    Matched by: <strong>{searchMeta.type.toUpperCase()}</strong>
                  </span>
                </div>
              </div>

              <div className="cards-grid">
                {results.map((item, index) => (
                  <article key={`${item.pincode}-${item.area}-${index}`} className="result-card">
                    <div className="card-top">
                      <div className="area-info">
                        <div className="location-icon-circle">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h2 className="area-name">{item.area}</h2>
                          <div className="district-tag">
                            <MapPin size={12} />
                            <span>{item.district || 'Bengaluru Urban'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pincode-badge-box">
                        <span className="pincode-label">PINCODE</span>
                        <div className="pincode-number-row">
                          <span className="pincode-number">{item.pincode}</span>
                          <button
                            type="button"
                            className="copy-btn"
                            onClick={() => handleCopyPincode(item.pincode)}
                            title="Copy Pincode"
                            aria-label={`Copy pincode ${item.pincode}`}
                          >
                            {copiedPincode === item.pincode ? (
                              <span className="copied-indicator">
                                <Check size={14} /> Copied
                              </span>
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <span className="state-tag">Karnataka, India</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${item.area}, Bengaluru, Karnataka ${item.pincode}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-link"
                      >
                        <span>View on Map</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Empty State: No results found */}
          {!loading && hasSearched && results.length === 0 && !error && (
            <div className="empty-state-card">
              <div className="empty-icon-circle">
                <Compass size={32} />
              </div>
              <h3 className="empty-title">No matching postal areas found</h3>
              <p className="empty-description">
                We couldn&rsquo;t find any records for &ldquo;<strong>{searchMeta.query}</strong>&rdquo;.
              </p>
              <ul className="empty-tips">
                <li>Check for typos or spelling variations (e.g., &ldquo;Koramangala&rdquo; or &ldquo;Whitefield&rdquo;).</li>
                <li>If searching by pincode, make sure it is exactly 6 digits starting with 56 (e.g., 560048).</li>
                <li>Try clicking one of the popular area shortcuts above.</li>
              </ul>
            </div>
          )}

          {/* Initial State (Before any search) */}
          {!hasSearched && !loading && !error && (
            <div className="initial-guide-card">
              <div className="guide-header">
                <Sparkles size={18} className="guide-icon" />
                <h3>How to search</h3>
              </div>
              <div className="guide-grid">
                <div className="guide-item">
                  <div className="guide-step-num">1</div>
                  <div>
                    <strong>Search by 6-digit Pincode</strong>
                    <p>Enter any 6-digit Bangalore code like <code>560048</code> or <code>560066</code> to see all localities covered.</p>
                  </div>
                </div>
                <div className="guide-item">
                  <div className="guide-step-num">2</div>
                  <div>
                    <strong>Search by Locality Name</strong>
                    <p>Type any area name or part of it like <code>Indiranagar</code> or <code>white</code> to find matching pincodes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>
            Bangalore Pincode Explorer • Prepared for <strong>Anshu Raj</strong>
          </p>
          <p className="footer-subtext">
            Fast, client-server decoupled postal lookup service powered by React, Express & Vite.
          </p>
        </footer>
      </main>
    </div>
  );
}
