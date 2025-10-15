import React, { useState, useEffect } from 'react';
import './DesignContest.css';

const DesignContest = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [contests, setContests] = useState([]);
  const [userDesigns, setUserDesigns] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [userTokens, setUserTokens] = useState(100);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    // Initialize with sample contests
    const sampleContests = [
      {
        id: 1,
        title: 'Mythical Creature Design',
        description: 'Design the most epic mythical creature',
        prize: 500,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        entries: []
      },
      {
        id: 2,
        title: 'Fantasy Weapon Contest',
        description: 'Create legendary weapons from myth',
        prize: 300,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        entries: []
      }
    ];
    setContests(sampleContests);
  }, []);

  const handleSubmitDesign = (contestId, designData) => {
    const newEntry = {
      id: Date.now(),
      contestId,
      title: designData.title,
      description: designData.description,
      imageUrl: designData.imageUrl,
      creator: 'User' + Math.floor(Math.random() * 1000),
      votes: 0,
      createdAt: new Date()
    };

    setContests(contests.map(c => {
      if (c.id === contestId) {
        return { ...c, entries: [...c.entries, newEntry] };
      }
      return c;
    }));

    setUserDesigns([...userDesigns, newEntry]);
  };

  const handleVote = (contestId, entryId) => {
    const voteKey = `${contestId}-${entryId}`;
    
    if (userVotes[voteKey]) {
      alert('You have already voted for this design!');
      return;
    }

    setContests(contests.map(c => {
      if (c.id === contestId) {
        return {
          ...c,
          entries: c.entries.map(e => 
            e.id === entryId ? { ...e, votes: e.votes + 1 } : e
          )
        };
      }
      return c;
    }));

    setUserVotes({ ...userVotes, [voteKey]: true });
  };

  const calculateWinner = (contest) => {
    if (contest.entries.length === 0) return null;
    return contest.entries.reduce((max, entry) => 
      entry.votes > max.votes ? entry : max
    );
  };

  const awardTokens = (contest) => {
    const winner = calculateWinner(contest);
    if (!winner) {
      alert('No entries to determine a winner!');
      return;
    }

    setContests(contests.map(c => {
      if (c.id === contest.id) {
        return { ...c, status: 'completed', winner: winner.id };
      }
      return c;
    }));

    alert(`Winner: ${winner.creator} with ${winner.votes} votes! Rewarded ${contest.prize} tokens!`);
  };

  const ContestCard = ({ contest }) => {
    const timeLeft = Math.ceil((contest.endDate - new Date()) / (1000 * 60 * 60 * 24));
    const winner = contest.status === 'completed' ? calculateWinner(contest) : null;

    return (
      <div className="contest-card">
        <div className="contest-header">
          <h3>{contest.title}</h3>
          <span className={`status-badge ${contest.status}`}>
            {contest.status}
          </span>
        </div>
        <p className="contest-description">{contest.description}</p>
        <div className="contest-info">
          <div className="info-item">
            <span className="label">Prize Pool:</span>
            <span className="value">{contest.prize} Tokens</span>
          </div>
          <div className="info-item">
            <span className="label">Entries:</span>
            <span className="value">{contest.entries.length}</span>
          </div>
          {contest.status === 'active' && (
            <div className="info-item">
              <span className="label">Time Left:</span>
              <span className="value">{timeLeft} days</span>
            </div>
          )}
        </div>
        {winner && (
          <div className="winner-banner">
            🏆 Winner: {winner.creator} with {winner.votes} votes
          </div>
        )}
        <button 
          className="btn-primary"
          onClick={() => setSelectedContest(contest)}
        >
          {contest.status === 'active' ? 'View & Vote' : 'View Results'}
        </button>
      </div>
    );
  };

  const DesignSubmissionForm = ({ contest, onClose }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      imageUrl: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSubmitDesign(contest.id, formData);
      alert('Design submitted successfully!');
      onClose();
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Submit Your Design</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Design Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Submit Design</button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ContestDetailView = ({ contest, onClose }) => {
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const sortedEntries = [...contest.entries].sort((a, b) => b.votes - a.votes);

    return (
      <div className="modal-overlay">
        <div className="modal-content contest-detail">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>{contest.title}</h2>
          <p>{contest.description}</p>
          
          {contest.status === 'active' && (
            <button 
              className="btn-primary mb-20"
              onClick={() => setShowSubmitForm(true)}
            >
              Submit Your Design
            </button>
          )}

          <h3>Submissions ({sortedEntries.length})</h3>
          <div className="entries-grid">
            {sortedEntries.map(entry => (
              <div key={entry.id} className="entry-card">
                <div className="entry-image">
                  {entry.imageUrl ? (
                    <img src={entry.imageUrl} alt={entry.title} />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                </div>
                <div className="entry-content">
                  <h4>{entry.title}</h4>
                  <p>{entry.description}</p>
                  <div className="entry-footer">
                    <span className="creator">by {entry.creator}</span>
                    <div className="vote-section">
                      <span className="votes">👍 {entry.votes}</span>
                      {contest.status === 'active' && (
                        <button
                          className="btn-vote"
                          onClick={() => handleVote(contest.id, entry.id)}
                          disabled={userVotes[`${contest.id}-${entry.id}`]}
                        >
                          {userVotes[`${contest.id}-${entry.id}`] ? 'Voted' : 'Vote'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {contest.status === 'active' && contest.entries.length > 0 && (
            <button 
              className="btn-danger mt-20"
              onClick={() => awardTokens(contest)}
            >
              End Contest & Award Winner
            </button>
          )}

          {showSubmitForm && (
            <DesignSubmissionForm 
              contest={contest}
              onClose={() => setShowSubmitForm(false)}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="design-contest-container">
      <div className="contest-header-section">
        <h1>🎨 Design Contest</h1>
        <div className="user-tokens">
          Your Tokens: <strong>{userTokens}</strong>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Contests
        </button>
        <button 
          className={`tab ${activeTab === 'my-designs' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-designs')}
        >
          My Designs ({userDesigns.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'browse' && (
          <div className="contests-grid">
            {contests.map(contest => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        )}

        {activeTab === 'my-designs' && (
          <div className="my-designs">
            {userDesigns.length === 0 ? (
              <div className="empty-state">
                <p>You haven't submitted any designs yet.</p>
                <p>Browse contests and submit your creations!</p>
              </div>
            ) : (
              <div className="entries-grid">
                {userDesigns.map(design => (
                  <div key={design.id} className="entry-card">
                    <div className="entry-image">
                      {design.imageUrl ? (
                        <img src={design.imageUrl} alt={design.title} />
                      ) : (
                        <div className="placeholder-image">No Image</div>
                      )}
                    </div>
                    <div className="entry-content">
                      <h4>{design.title}</h4>
                      <p>{design.description}</p>
                      <div className="entry-footer">
                        <span className="votes">👍 {design.votes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedContest && (
        <ContestDetailView 
          contest={selectedContest}
          onClose={() => setSelectedContest(null)}
        />
      )}
    </div>
  );
};

export default DesignContest;