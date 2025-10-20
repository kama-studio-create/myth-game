import React, { useState, useEffect } from 'react';

const DesignContest = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [contests, setContests] = useState([]);
  const [userDesigns, setUserDesigns] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [userTokens, setUserTokens] = useState(1000);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    const sampleContests = [
      {
        id: 1,
        title: 'Mythical Creature Design',
        description: 'Design the most epic mythical creature for our next expansion pack',
        prize: 500,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        category: 'Character',
        entries: [],
        participants: 24
      },
      {
        id: 2,
        title: 'Fantasy Weapon Contest',
        description: 'Create legendary weapons inspired by mythology and fantasy',
        prize: 300,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        category: 'Weapon',
        entries: [],
        participants: 18
      },
      {
        id: 3,
        title: 'Battle Arena Design',
        description: 'Design an epic battle arena for our upcoming tournament',
        prize: 750,
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'active',
        category: 'Environment',
        entries: [],
        participants: 32
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
      creator: 'You',
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
    
    if (userVotes[voteKey]) return;

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

  const ContestCard = ({ contest }) => {
    const timeLeft = Math.ceil((contest.endDate - new Date()) / (1000 * 60 * 60 * 24));
    const progressPercent = Math.min(100, (contest.entries.length / contest.participants) * 100);

    return (
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">{contest.title}</h3>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                {contest.category}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold text-white">{contest.prize}</div>
              <div className="text-xs text-white/80">Prize Pool</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-gray-300 text-sm mb-4">{contest.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Submissions</div>
              <div className="text-lg font-bold text-white">{contest.entries.length}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Time Left</div>
              <div className="text-lg font-bold text-yellow-400">{timeLeft}d</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs text-gray-300">{contest.entries.length}/{contest.participants}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => setSelectedContest(contest)}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
          >
            View & Participate
          </button>
        </div>
      </div>
    );
  };

  const DesignSubmissionForm = ({ contest, onClose }) => {
    const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '' });
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setFormData({...formData, imageUrl: reader.result});
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.title && formData.description && formData.imageUrl) {
        handleSubmitDesign(contest.id, formData);
        alert('Design submitted successfully!');
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-xl border-2 border-purple-500 shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Submit Your Design</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">×</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Design Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                placeholder="Enter design title"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none resize-none"
                placeholder="Describe your design"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full"
                required
              />
              {imagePreview && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-700">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all">
                Submit Design
              </button>
              <button type="button" onClick={onClose} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all">
                Cancel
              </button>
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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-xl border-2 border-purple-500 shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{contest.title}</h2>
              <p className="text-white/80">{contest.description}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-3xl flex-shrink-0">×</button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Action Buttons */}
            {contest.status === 'active' && (
              <button 
                onClick={() => setShowSubmitForm(true)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all"
              >
                Submit Your Design
              </button>
            )}

            {/* Entries */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                Submissions ({sortedEntries.length})
              </h3>
              
              {sortedEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No submissions yet. Be the first to submit!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedEntries.map((entry, index) => (
                    <div key={entry.id} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500/50 transition-all">
                      {/* Rank Badge */}
                      <div className="relative">
                        {index < 3 && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                            {index === 0 ? '🥇 1st' : index === 1 ? '🥈 2nd' : '🥉 3rd'}
                          </div>
                        )}
                        
                        {/* Image */}
                        <div className="aspect-video bg-slate-900 overflow-hidden">
                          {entry.imageUrl ? (
                            <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h4 className="text-lg font-bold text-white mb-1">{entry.title}</h4>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{entry.description}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                          <div className="text-sm text-gray-400">by {entry.creator}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-yellow-400">{entry.votes}</span>
                            {contest.status === 'active' && (
                              <button
                                onClick={() => handleVote(contest.id, entry.id)}
                                disabled={userVotes[`${contest.id}-${entry.id}`]}
                                className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
                                  userVotes[`${contest.id}-${entry.id}`]
                                    ? 'bg-green-600/30 text-green-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
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
              )}
            </div>
          </div>

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
              Design Contest Arena
            </h1>
            <p className="text-gray-400">Showcase your designs and compete for prizes</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
            <div className="text-gray-400 text-sm mb-1">Your Tokens</div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{userTokens}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-purple-500/30">
          {[
            { id: 'browse', label: 'Browse Contests', icon: '🎨' },
            { id: 'my-designs', label: `My Designs (${userDesigns.length})`, icon: '✨' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map(contest => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        )}

        {activeTab === 'my-designs' && (
          <div>
            {userDesigns.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-xl text-gray-400 mb-2">No designs submitted yet</p>
                <p className="text-gray-500">Browse contests and submit your creations to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userDesigns.map(design => (
                  <div key={design.id} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500/50 transition-all">
                    <div className="aspect-video bg-slate-900">
                      {design.imageUrl ? (
                        <img src={design.imageUrl} alt={design.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-white mb-1">{design.title}</h4>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{design.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                        <span className="text-sm text-gray-400">Votes: {design.votes}</span>
                        <span className="text-yellow-400 font-bold">{design.contestId}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedContest && (
          <ContestDetailView 
            contest={selectedContest}
            onClose={() => setSelectedContest(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DesignContest;