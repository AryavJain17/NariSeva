import React, { useState } from 'react';
import './CommunityForum.css';

const CommunityForum = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Breaking the Glass Ceiling: Strategies for Career Advancement",
      author: "Sarah Chen",
      category: "career",
      replies: 24,
      likes: 89,
      timeAgo: "2 hours ago",
      excerpt: "Let's discuss effective strategies for advancing in male-dominated industries...",
      isHot: true,
      authorAvatar: "SC"
    },
    {
      id: 2,
      title: "Starting a Tech Startup as a Female Founder",
      author: "Maria Rodriguez",
      category: "entrepreneurship",
      replies: 18,
      likes: 67,
      timeAgo: "4 hours ago",
      excerpt: "Sharing my journey and lessons learned from building a successful tech company...",
      isHot: false,
      authorAvatar: "MR"
    },
    {
      id: 3,
      title: "Work-Life Balance: Managing Motherhood and Career",
      author: "Jennifer Walsh",
      category: "wellness",
      replies: 45,
      likes: 156,
      timeAgo: "6 hours ago",
      excerpt: "How do you manage the demands of being a working mother? Share your tips...",
      isHot: true,
      authorAvatar: "JW"
    },
    {
      id: 4,
      title: "Negotiating Salary: Know Your Worth",
      author: "Priya Sharma",
      category: "career",
      replies: 32,
      likes: 98,
      timeAgo: "1 day ago",
      excerpt: "Essential tips for salary negotiation and advocating for fair compensation...",
      isHot: false,
      authorAvatar: "PS"
    },
    {
      id: 5,
      title: "Building Confidence in Public Speaking",
      author: "Amanda Thompson",
      category: "leadership",
      replies: 28,
      likes: 73,
      timeAgo: "1 day ago",
      excerpt: "Overcoming fear and building the confidence to speak up in meetings and conferences...",
      isHot: false,
      authorAvatar: "AT"
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Discussions', icon: '💬' },
    { id: 'career', name: 'Career Growth', icon: '💼' },
    { id: 'entrepreneurship', name: 'Entrepreneurship', icon: '🚀' },
    { id: 'wellness', name: 'Health & Wellness', icon: '🌸' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'leadership', name: 'Leadership', icon: '👑' },
    { id: 'support', name: 'Support & Advice', icon: '💜' }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitPost = (newPost) => {
    const post = {
      id: Date.now(),
      title: newPost.title,
      author: newPost.author || 'Anonymous',
      category: newPost.category,
      replies: 0,
      likes: 0,
      timeAgo: 'Just now',
      excerpt: newPost.content,
      isHot: false,
      authorAvatar: newPost.author ? newPost.author.split(' ').map(n => n[0]).join('').toUpperCase() : 'AN'
    };
    setPosts([post, ...posts]);
    setShowNewPostForm(false);
  };

  // ✅ Dynamic Stats Calculation
  const uniqueAuthors = new Set(posts.filter(p => p.author !== 'Anonymous').map(p => p.author));
  const totalMembers = uniqueAuthors.size;
  const totalDiscussions = posts.length;
const totalPosts = posts.length;

  return (
    <div className="community-forum">
      <header className="forum-header">
        <div className="header-content">
          <h1 className="forum-title">
            <span className="title-icon">👩‍💼</span>
            Women Empowerment Community
          </h1>
          <p className="forum-subtitle">Connect, Support, and Inspire Each Other</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{totalMembers}</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="stat">
            <span className="stat-number">{totalDiscussions}</span>
            <span className="stat-label">Discussions</span>
          </div>
          <div className="stat">
            <span className="stat-number">{totalPosts}</span>
            <span className="stat-label">Posts</span>
          </div>
        </div>
      </header>

      <div className="forum-content">
        <aside className="forum-sidebar">
          <div className="search-section">
            <h3>Search Discussions</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search topics, posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>
          </div>

          <div className="categories-section">
            <h3>Categories</h3>
            <div className="categories-list">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="quick-actions">
            <button 
              className="action-btn primary"
              onClick={() => setShowNewPostForm(true)}
            >
              ✏️ Start New Discussion
            </button>
            <button className="action-btn secondary">
              👥 Join Groups
            </button>
          </div>
        </aside>

        <main className="forum-main">
          <div className="forum-toolbar">
            <div className="toolbar-left">
              <h2>
                {activeCategory === 'all' ? 'All Discussions' : 
                 categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <span className="results-count">
                {filteredPosts.length} discussions
              </span>
            </div>
            <div className="toolbar-right">
              <select className="sort-select">
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="replies">Most Replies</option>
              </select>
            </div>
          </div>

          {showNewPostForm && <NewPostForm onSubmit={handleSubmitPost} onCancel={() => setShowNewPostForm(false)} categories={categories} />}

          <div className="posts-list">
            {filteredPosts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <div className="author-info">
                    <div className="author-avatar">{post.authorAvatar}</div>
                    <div className="author-details">
                      <h4 className="author-name">{post.author}</h4>
                      <span className="post-time">{post.timeAgo}</span>
                    </div>
                  </div>
                  {post.isHot && <span className="hot-badge">🔥 Hot</span>}
                </div>

                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                </div>

                <div className="post-footer">
                  <div className="post-category">
                    <span className="category-tag">
                      {categories.find(c => c.id === post.category)?.icon}
                      {categories.find(c => c.id === post.category)?.name}
                    </span>
                  </div>
                  <div className="post-stats">
                    <span className="stat-item">
                      💬 {post.replies} replies
                    </span>
                    <span className="stat-item">
                      💜 {post.likes} likes
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="no-results">
              <h3>No discussions found</h3>
              <p>Try adjusting your search or category filter.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const NewPostForm = ({ onSubmit, onCancel, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: 'career'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      onSubmit(formData);
      setFormData({ title: '', content: '', author: '', category: 'career' });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="new-post-overlay">
      <div className="new-post-form">
        <div className="form-header">
          <h3>Start a New Discussion</h3>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Discussion Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What would you like to discuss?"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.filter(cat => cat.id !== 'all').map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="author">Your Name (Optional)</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Leave blank to post anonymously"
            />
            <small>You can post anonymously by leaving this field empty</small>
          </div>

          <div className="form-group">
            <label htmlFor="content">Discussion Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your thoughts, ask questions, or start a meaningful conversation..."
              rows="6"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              🚀 Post Discussion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityForum;








