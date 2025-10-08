import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const DailyRewardModal = () => {
  const { user, updateUser } = useGame();
  const [showModal, setShowModal] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const dailyRewards = [
    { day: 1, gold: 100, gems: 0, cards: 0, icon: '💰' },
    { day: 2, gold: 150, gems: 5, cards: 0, icon: '💎' },
    { day: 3, gold: 200, gems: 0, cards: 1, icon: '🎴' },
    { day: 4, gold: 300, gems: 10, cards: 0, icon: '💎' },
    { day: 5, gold: 400, gems: 0, cards: 2, icon: '🎴' },
    { day: 6, gold: 500, gems: 25, cards: 1, icon: '🌟' },
    { day: 7, gold: 1000, gems: 100, cards: 5, icon: '🎁' },
  ];

  useEffect(() => {
    checkDailyReward();
  }, [user]);

  const checkDailyReward = () => {
    if (!user) return;

    const lastClaimDate = localStorage.getItem(`lastDailyReward_${user.username}`);
    const streakCount = parseInt(localStorage.getItem(`dailyStreak_${user.username}`) || '0');
    const today = new Date().toDateString();

    if (lastClaimDate !== today) {
      setShowModal(true);
      
      if (lastClaimDate) {
        const lastDate = new Date(lastClaimDate);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          setCurrentStreak(streakCount + 1);
        } else if (diffDays > 1) {
          setCurrentStreak(1);
        }
      } else {
        setCurrentStreak(1);
      }
    }
  };

  const claimDailyReward = () => {
    const streak = currentStreak > 7 ? ((currentStreak - 1) % 7) + 1 : currentStreak;
    const reward = dailyRewards[streak - 1];
    
    updateUser({
      gold: user.gold + reward.gold,
      gems: user.gems + reward.gems,
    });

    const today = new Date().toDateString();
    localStorage.setItem(`lastDailyReward_${user.username}`, today);
    localStorage.setItem(`dailyStreak_${user.username}`, currentStreak.toString());

    setRewardClaimed(true);

    setTimeout(() => {
      setShowModal(false);
      setRewardClaimed(false);
    }, 3000);
  };

  const shareOnSocialMedia = (platform) => {
    const shareText = `🎮 I'm playing Mythic Warriors! Join me in epic card battles! 🎴⚔️`;
    const shareUrl = window.location.origin;
    
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
    
    updateUser({
      gold: user.gold + 50,
      gems: user.gems + 5,
    });
    
    alert('🎉 Bonus! +50 Gold & +5 Gems');
    setShowShareMenu(false);
  };

  const copyToClipboard = () => {
    const shareText = `🎮 Join me in Mythic Warriors! 🎴⚔️ ${window.location.origin}`;
    navigator.clipboard.writeText(shareText);
    
    updateUser({
      gold: user.gold + 50,
      gems: user.gems + 5,
    });
    
    alert('✅ Link copied! +50 Gold & +5 Gems');
  };

  if (!showModal) return null;

  const currentReward = dailyRewards[Math.min(currentStreak - 1, 6)];
  const isDay7 = currentStreak === 7 || currentStreak % 7 === 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className={`bg-slate-800 rounded-xl p-4 sm:p-6 max-w-2xl w-full border-2 ${
        isDay7 ? 'border-yellow-500' : 'border-purple-500'
      } shadow-2xl max-h-[95vh] overflow-y-auto`}>
        
        {!rewardClaimed ? (
          <>
            {/* Header */}
            <div className="text-center mb-3 sm:mb-4">
              <div className="text-4xl sm:text-5xl mb-2">{isDay7 ? '🎁' : '🎉'}</div>
              <h2 className={`text-2xl sm:text-3xl font-bold mb-1 ${
                isDay7 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500'
              }`}>
                {isDay7 ? 'MEGA REWARD!' : 'Daily Rewards'}
              </h2>
              <div className={`inline-block px-3 sm:px-4 py-1 rounded-full border ${
                isDay7 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-purple-900/50 border-purple-500'
              }`}>
                <span className={`font-bold text-xs sm:text-sm ${isDay7 ? 'text-yellow-400' : 'text-purple-300'}`}>
                  🔥 Day {currentStreak} Streak
                </span>
              </div>
            </div>

            {/* Reward Cards - Scrollable on very small screens */}
            <div className="mb-3 sm:mb-4">
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {dailyRewards.map((reward, index) => {
                  const isCurrentDay = index === Math.min(currentStreak - 1, 6);
                  const isPastDay = index < currentStreak - 1;
                  
                  return (
                    <div
                      key={index}
                      className={`relative rounded-lg p-1 sm:p-2 border transition-all ${
                        isCurrentDay
                          ? 'bg-yellow-500/20 border-yellow-500 scale-105 shadow-lg'
                          : isPastDay
                          ? 'bg-green-500/20 border-green-500'
                          : 'bg-slate-900/50 border-slate-600 opacity-50'
                      }`}
                    >
                      {isPastDay && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">
                          <span className="text-white text-[8px] sm:text-xs">✓</span>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{reward.icon}</div>
                        <div className="text-[8px] sm:text-[10px] text-white font-bold mb-0.5 sm:mb-1">D{reward.day}</div>
                        {reward.gold > 0 && (
                          <div className="text-yellow-400 text-[8px] sm:text-[10px] font-bold">{reward.gold > 500 ? '1K' : reward.gold}💰</div>
                        )}
                        {reward.gems > 0 && (
                          <div className="text-purple-400 text-[8px] sm:text-[10px] font-bold">{reward.gems}💎</div>
                        )}
                        {reward.cards > 0 && (
                          <div className="text-blue-400 text-[8px] sm:text-[10px] font-bold">{reward.cards}🎴</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Reward */}
            <div className={`rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border ${
              isDay7
                ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500'
                : 'bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500'
            }`}>
              <h3 className="text-white font-bold text-base sm:text-lg mb-2 sm:mb-3 text-center">
                {isDay7 ? '🎊 MEGA BONUS! 🎊' : 'Today\'s Reward'}
              </h3>
              <div className="flex justify-center items-center gap-4 sm:gap-6 flex-wrap">
                {currentReward.gold > 0 && (
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-1">💰</div>
                    <div className="text-yellow-400 font-bold text-xl sm:text-2xl">+{currentReward.gold}</div>
                    <div className="text-gray-400 text-xs">Gold</div>
                  </div>
                )}
                {currentReward.gems > 0 && (
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-1">💎</div>
                    <div className="text-purple-400 font-bold text-xl sm:text-2xl">+{currentReward.gems}</div>
                    <div className="text-gray-400 text-xs">Gems</div>
                  </div>
                )}
                {currentReward.cards > 0 && (
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-1">🎴</div>
                    <div className="text-blue-400 font-bold text-xl sm:text-2xl">+{currentReward.cards}</div>
                    <div className="text-gray-400 text-xs">Cards</div>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={claimDailyReward}
                className={`w-full py-2.5 sm:py-3 text-white text-base sm:text-lg font-bold rounded-lg shadow-lg transform active:scale-95 transition-all ${
                  isDay7
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 active:from-yellow-700 active:to-orange-700'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 active:from-green-700 active:to-emerald-700'
                }`}
              >
                🎁 Claim Reward
              </button>
              
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 active:from-blue-700 active:to-cyan-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-all"
              >
                📱 Share (+50💰 +5💎)
              </button>

              {showShareMenu && (
                <div className="bg-slate-900/80 rounded-lg p-2 sm:p-3 border border-blue-500/30">
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    <button 
                      onClick={() => shareOnSocialMedia('twitter')} 
                      className="bg-blue-400 active:bg-blue-500 text-white py-2 sm:py-2.5 rounded text-[10px] sm:text-xs font-semibold"
                    >
                      🐦<br className="sm:hidden" /><span className="hidden sm:inline"> </span>Twitter
                    </button>
                    <button 
                      onClick={() => shareOnSocialMedia('facebook')} 
                      className="bg-blue-600 active:bg-blue-700 text-white py-2 sm:py-2.5 rounded text-[10px] sm:text-xs font-semibold"
                    >
                      📘<br className="sm:hidden" /><span className="hidden sm:inline"> </span>Facebook
                    </button>
                    <button 
                      onClick={() => shareOnSocialMedia('whatsapp')} 
                      className="bg-green-500 active:bg-green-600 text-white py-2 sm:py-2.5 rounded text-[10px] sm:text-xs font-semibold"
                    >
                      💬<br className="sm:hidden" /><span className="hidden sm:inline"> </span>WhatsApp
                    </button>
                    <button 
                      onClick={() => shareOnSocialMedia('telegram')} 
                      className="bg-blue-500 active:bg-blue-600 text-white py-2 sm:py-2.5 rounded text-[10px] sm:text-xs font-semibold"
                    >
                      ✈️<br className="sm:hidden" /><span className="hidden sm:inline"> </span>Telegram
                    </button>
                    <button 
                      onClick={() => shareOnSocialMedia('linkedin')} 
                      className="bg-blue-700 active:bg-blue-800 text-white py-2 sm:py-2.5 rounded text-[10px] sm:text-xs font-semibold"
                    >
                      💼<br className="sm:hidden" /><span className="hidden sm:inline"> </span>LinkedIn
                    </button>
                    <button 
                      onClick={copyToClipboard} 
                      className="bg-purple-600 active:bg-purple-700 text-white py-2 sm:py-2.5 rounded text-[10px] sm:text-xs font-semibold"
                    >
                      📋<br className="sm:hidden" /><span className="hidden sm:inline"> </span>Copy
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-slate-700 active:bg-slate-600 text-white text-sm sm:text-base font-semibold rounded-lg transition-all"
              >
                Claim Later
              </button>
            </div>
          </>
        ) : (
          /* Success Animation */
          <div className="text-center py-6 sm:py-8">
            <div className="text-6xl sm:text-7xl mb-3 sm:mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl sm:text-3xl font-bold text-green-400 mb-2 sm:mb-3">
              {isDay7 ? 'MEGA CLAIMED!' : 'Claimed!'}
            </h3>
            <div className="space-y-1 sm:space-y-2">
              {currentReward.gold > 0 && (
                <p className="text-lg sm:text-xl text-yellow-400 font-bold">+{currentReward.gold} Gold</p>
              )}
              {currentReward.gems > 0 && (
                <p className="text-lg sm:text-xl text-purple-400 font-bold">+{currentReward.gems} Gems</p>
              )}
              {currentReward.cards > 0 && (
                <p className="text-lg sm:text-xl text-blue-400 font-bold">+{currentReward.cards} Cards</p>
              )}
            </div>
            <p className="text-gray-400 text-sm sm:text-base mt-3 sm:mt-4">Come back tomorrow!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyRewardModal;