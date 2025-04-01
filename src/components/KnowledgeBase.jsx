import React, { useState, useEffect } from 'react';
import '../styles/KnowledgeBase.css';
import api from '../services/api';

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // New state for type filter
  const [showAddModal, setShowAddModal] = useState(false);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [types, setTypes] = useState(['All']); // New state for storing types
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSummaryId, setGeneratingSummaryId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // New state for item details modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [summaryVisibility, setSummaryVisibility] = useState({});

  // Simplified effect that just fetches content without JWT validation
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await api.get('/items/all');
      const data = response.data;
      console.log('API Response:', data); // Debug log
      
      // Process items safely with error handling
      const processedItems = Array.isArray(data) ? 
        data.map(item => {
          try {
            // Convert contentId to number if it's numeric
            const contentId = item.contentId;
            const id = typeof contentId === 'string' && /^\d+$/.test(contentId) ? 
              Number(contentId) : contentId;
            
            return {
              id: id || `temp-${Math.random().toString(36).substr(2, 9)}`,
              title: item.title || 'Untitled',
              category: item.category || 'Uncategorized',
              type: item.type || 'Note', // Add type field with default
              description: item.description || 'No description available',
              summary: item.summary || '', // Store the AI-generated summary
              date: item.createdAt || new Date().toISOString(),
              tags: Array.isArray(item.tags) ? item.tags : []
            };
          } catch (err) {
            console.error("Error processing item:", err, item);
            return null; // Will be filtered out below
          }
        }).filter(Boolean) : []; // Filter out null items
      
      // Log the processed items to check ID types
      console.log("Processed items with IDs:", processedItems.map(item => ({
        id: item.id,
        type: typeof item.id
      })));
      
      setItems(processedItems);
      
      // Extract categories safely
      const categorySet = new Set(['All']);
      const typeSet = new Set(['All']); // New set for types
      
      processedItems.forEach(item => {
        if (item.category && item.category.toLowerCase() !== 'all') {
          categorySet.add(item.category);
        }
        if (item.type && item.type.toLowerCase() !== 'all') {
          typeSet.add(item.type); // Add type to types set
        }
      });
      
      setCategories(Array.from(categorySet));
      setTypes(Array.from(typeSet)); // Set types state
      setError(null);
    } catch (error) {
      console.error('Failed to fetch knowledge base data:', error);
      setError('Failed to load knowledge base items. Please try again later.');
      // Set empty data rather than breaking
      setItems([]);
      setCategories(['All']);
      setTypes(['All']); // Reset types
    } finally {
      setLoading(false);
    }
  };

  // Filter items safely with error handling
  const filteredItems = items.filter(item => {
    try {
      const title = (item.title || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const type = (item.type || '').toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();
      const selectedCategoryLower = selectedCategory.toLowerCase();
      const selectedTypeLower = selectedType.toLowerCase();
      
      const matchesSearch = title.includes(searchTermLower);
      const matchesCategory = selectedCategory === 'all' || category === selectedCategoryLower;
      const matchesType = selectedType === 'all' || type === selectedTypeLower;
      
      return matchesSearch && matchesCategory && matchesType;
    } catch (error) {
      console.error("Error filtering item:", error, item);
      return false; // Skip problematic items
    }
  });

  const handleAddKnowledge = async (formData) => {
    try {
      const contentItemData = {
        description: formData.description
      };

      const response = await api.post('/items/add', contentItemData, {
        headers: { 'Content-Type': 'application/json' }
      });

      const newItem = response.data;
      setItems(prevItems => [...prevItems, {
        id: newItem.contentId || `temp-${Math.random().toString(36).substr(2, 9)}`,
        title: newItem.title || 'Untitled',
        category: newItem.category || 'Uncategorized',
        type: newItem.type || 'Note', // Add type field with default
        description: newItem.description || 'No description available',
        summary: newItem.summary || '', // Store the AI-generated summary
        date: newItem.createdAt || new Date().toISOString(),
        tags: Array.isArray(newItem.tags) ? newItem.tags : []
      }]);
      
      // Update categories if needed
      if (newItem.category && !categories.includes(newItem.category)) {
        setCategories(prev => [...prev, newItem.category]);
      }
      
      // Update types if needed
      if (newItem.type && !types.includes(newItem.type)) {
        setTypes(prev => [...prev, newItem.type]);
      }
      
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding knowledge item:", error);
      alert("Failed to add knowledge item. Please try again.");
    }
  };

  const handleDeleteClick = (itemId) => {
    console.log("Item ID to delete:", itemId, "Type:", typeof itemId);
    // Convert to numeric ID if it's a string but contains only digits
    const numericId = /^\d+$/.test(String(itemId)) ? Number(itemId) : itemId;
    console.log("Converted ID:", numericId, "Type:", typeof numericId);
    setDeleteItemId(numericId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Log the ID that will be sent to the server
      console.log("Deleting item with ID:", deleteItemId, "Type:", typeof deleteItemId);
      
      // Ensure the URL contains a properly formatted number if the ID is numeric
      const url = `/items/delete/${deleteItemId}`;
      console.log("Delete request URL:", url);
      
      const response = await api.delete(url);
      console.log("Delete response:", response);
      
      setItems(prevItems => prevItems.filter(item => item.id !== deleteItemId));
      setShowDeleteModal(false);
      setDeleteItemId(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
      }
      alert(`Failed to delete item. Error: ${error.response?.data || error.message}`);
    }
  };
  
  // Function to handle item click and show details
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const toggleSummaryVisibility = (itemId) => {
    setSummaryVisibility((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleGenerateSummary = async (itemId) => {
    setGeneratingSummaryId(itemId);
    try {
      const response = await api.post(`/items/generate-summary/${itemId}`);
      const updatedSummary = response.data.summary;

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, summary: updatedSummary } : item
        )
      );

      // Automatically show the summary after generation
      setSummaryVisibility((prev) => ({
        ...prev,
        [itemId]: true,
      }));
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Failed to generate summary. Please try again.");
    } finally {
      setGeneratingSummaryId(null);
    }
  };

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format: "Jan 15, 2023 • 3:45 PM"
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ' • ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original string if error
    }
  };

  return (
    <div className="knowledge-base">
      <div className="kb-header">
        <h1>Knowledge Base</h1>
        {error && <div className="error-message">{error}</div>}
        <div className="kb-actions">
          <div className="kb-filters">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="advanced-filter">
              <button 
                className="filter-button" 
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-label="Toggle filters"
              >
                Filters {selectedCategory !== 'all' || selectedType !== 'all' ? '(Active)' : ''}
                <span className="filter-icon">{showFilters ? '▲' : '▼'}</span>
              </button>
              
              {showFilters && (
                <div className="filters-dropdown">
                  <div className="filter-section">
                    <h4>Category</h4>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="filter-select"
                      aria-label="Filter by category"
                    >
                      {categories.map(category => (
                        <option key={category.toLowerCase()} value={category.toLowerCase()}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-section">
                    <h4>Type</h4>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="filter-select"
                      aria-label="Filter by type"
                    >
                      {types.map(type => (
                        <option key={type.toLowerCase()} value={type.toLowerCase()}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {(selectedCategory !== 'all' || selectedType !== 'all') && (
                    <button 
                      className="clear-filters-btn"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedType('all');
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            className="btn add-kb-btn"
            onClick={() => setShowAddModal(true)}
          >
            Add Knowledge
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator">Loading knowledge items...</div>
      ) : (
        <div className="kb-content">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div 
                key={item.id} 
                className="kb-item fade-in"
                onClick={() => handleItemClick(item)}
              >
                <div className="kb-item-header">
                  <h3>{item.title}</h3>
                  <div className="kb-item-actions">
                    <span className="category-badge">{item.category}</span>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening the details modal
                        handleDeleteClick(item.id);
                      }}
                      aria-label="Delete item"
                    >
                      <span className="delete-icon">×</span>
                    </button>
                  </div>
                </div>
                <div className="kb-item-description">
                  {item.description.length > 60 
                    ? `${item.description.slice(0, 60)}...` 
                    : item.description}
                  {item.description.length > 60 && (
                    <button
                      className="read-more-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item); // Open the details modal
                      }}
                    >
                      Read More
                    </button>
                  )}
                </div>
                
                {/* Add type label */}
                <div className="item-type-label">{item.type || 'Note'}</div>
                
                {/* Generate Summary Button */}
                <button
                  className="btn generate-summary-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the details modal
                    item.summary
                      ? toggleSummaryVisibility(item.id)
                      : handleGenerateSummary(item.id);
                  }}
                  disabled={generatingSummaryId === item.id}
                >
                  {generatingSummaryId === item.id
                    ? "Generating..."
                    : item.summary && summaryVisibility[item.id]
                    ? "Hide Summary"
                    : "Generate Summary"}
                </button>

                {/* Display Summary Below */}
                {item.summary && summaryVisibility[item.id] && (
                  <div className="summary-box">
                    <h4>Summary:</h4>
                    <p>
                      {item.summary.length > 80 
                        ? `${item.summary.slice(0, 80)}...` 
                        : item.summary}
                      {item.summary.length > 80 && (
                        <button
                          className="read-more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item); // Open the details modal directly
                          }}
                        >
                          Read More
                        </button>
                      )}
                    </p>
                  </div>
                )}

                {/* Display cards with formatted dates */}
                <div className="kb-item-footer">
                  <div className="tags">
                    {(item.tags || []).map((tag, index) => (
                      <span key={`${item.id}-tag-${index}`} className="tag">#{tag}</span>
                    ))}
                  </div>
                  <span className="date">{formatDate(item.date)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-items-message">
              {searchTerm || selectedCategory !== 'all' || selectedType !== 'all' ? 
                'No matching items found. Try adjusting your filters.' : 
                'No knowledge items available. Add some knowledge to get started!'}
            </div>
          )}
        </div>
      )}

      {/* Simplified Add Knowledge Modal */}
      {showAddModal && (
        <SimpleAddKnowledgeModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddKnowledge}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                &times;
              </button>
            </div>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn delete-confirm-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Item Details Modal with Summary Display */}
      {showDetailsModal && selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

// Simplified modal with only description field
const SimpleAddKnowledgeModal = ({ onClose, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({ description });
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content simple-modal">
        <div className="modal-header">
          <h2>Add Knowledge</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              placeholder="Enter your knowledge here. AI will automatically categorize and title it for you."
              required
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn cancel-btn" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Updated component for showing item details with summary
const ItemDetailsModal = ({ item, onClose }) => {
  // Get the formatDate function
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Updated renderTextWithLinks function to avoid duplicated text
  const renderTextWithLinks = (text) => {
    if (!text) return '';
    
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // If no URLs are found, just return the text
    if (!text.match(urlRegex)) {
      return text;
    }
    
    // Create array of parts alternating between text and links
    return text.split(urlRegex).map((part, i) => {
      if (i % 2 === 0) {
        return part; // Text part
      } else {
        // URL part
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content item-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="item-details">
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="category-badge">{item.category}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Type:</span>
            <span className="type-badge">{item.type || 'Note'}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="formatted-date">{formatDate(item.date)}</span>
          </div>
          
          {item.tags && item.tags.length > 0 && (
            <div className="detail-row">
              <span className="detail-label">Tags:</span>
              <div className="tags">
                {item.tags.map((tag, index) => (
                  <span key={`detail-tag-${index}`} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}
          
          <div className="detail-content">
            <h3>Description</h3>
            <p className="detail-description">{renderTextWithLinks(item.description)}</p>
          </div>
          
          {item.summary && (
            <div className="summary-section">
              <div className="summary-header">
                <h3>AI Summary</h3>
              </div>
              <div className="summary-content">
                <p>{renderTextWithLinks(item.summary)}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
