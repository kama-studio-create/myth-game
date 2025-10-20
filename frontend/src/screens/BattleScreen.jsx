import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';

const BattleScreen = () => {
  const { user } = useGame();
  const battleCanvasRef = useRef(null);
  const gameInitializedRef = useRef(false);
  const [showBattleMenu, setShowBattleMenu] = useState(false);

  useEffect(() => {
    if (!battleCanvasRef.current || gameInitializedRef.current) return;
    
    gameInitializedRef.current = true;
    const canvas = battleCanvasRef.current;
    const c = canvas.getContext('2d');

    // Set canvas size
    canvas.width = Math.min(canvas.parentElement.clientWidth, 1200);
    canvas.height = Math.min(window.innerHeight - 250, 600);

    const gravity = 0.7;
    let animationFrameId = null;

    // Image loading helper
    const loadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    };

    // Sprite Class with image support
    class Sprite {
      constructor({ position, imgSrc, scale = 1, width = 100, height = 150 }) {
        this.position = position;
        this.scale = scale;
        this.width = width;
        this.height = height;
        this.image = null;
        this.imageLoaded = false;
        
        if (imgSrc) {
          const img = new Image();
          img.onload = () => {
            this.image = img;
            this.imageLoaded = true;
          };
          img.src = imgSrc;
        }
      }

      draw() {
        if (this.imageLoaded && this.image) {
          c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width * this.scale,
            this.height * this.scale
          );
        } else {
          c.fillStyle = '#333';
          c.fillRect(this.position.x, this.position.y, this.width * this.scale, this.height * this.scale);
        }
      }

      update() {
        this.draw();
      }
    }

    // Fighter Class
    class Fighter extends Sprite {
      constructor({ position, imgSrc, scale = 1 }) {
        super({ position, imgSrc, scale, width: 100, height: 150 });
        this.velocity = { x: 0, y: 0 };
        this.health = 100;
        this.isAttacking = false;
        this.dead = false;
      }

      update() {
        if (this.imageLoaded && this.image) {
          c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width * this.scale,
            this.height * this.scale
          );
        } else {
          c.fillStyle = this.dead ? '#666' : '#4f46e5';
          c.fillRect(this.position.x, this.position.y, 60 * this.scale, 100 * this.scale);
        }
        
        this.position.y += this.velocity.y;
        
        if (this.position.y + 100 * this.scale >= canvas.height - 50) {
          this.velocity.y = 0;
          this.position.y = canvas.height - 150 * this.scale;
        } else {
          this.velocity.y += gravity;
        }
      }

      takeDamage() {
        this.health -= 20;
        if (this.health <= 0) {
          this.dead = true;
        }
      }
    }

    // Create background
    const background = new Sprite({
      position: { x: 0, y: 0 },
      imgSrc: '/img/background.png',
      scale: 1,
      width: canvas.width,
      height: canvas.height
    });

    // Create shop
    const shop = new Sprite({
      position: { x: canvas.width * 0.6, y: canvas.height * 0.15 },
      imgSrc: '/img/shop.png',
      scale: 2,
      width: 200,
      height: 200
    });

    // Create players
    const player = new Fighter({
      position: { x: 50, y: canvas.height - 250 },
      imgSrc: '/img/samuraiMack/Idle.png',
      scale: 2
    });

    const enemy = new Fighter({
      position: { x: canvas.width - 200, y: canvas.height - 250 },
      imgSrc: '/img/kenji/Idle.png',
      scale: 2
    });

    let timer = 60;
    let battleStartTime = Date.now();
    let lastTimerUpdate = 0;

    function animate() {
      // Draw background
      c.fillStyle = '#1a1a2e';
      c.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw background image
      background.update();
      
      // Draw shop
      shop.update();
      
      // Draw and update fighters
      player.update();
      enemy.update();

      // Update timer
      const elapsed = Math.floor((Date.now() - battleStartTime) / 1000);
      const remainingTime = Math.max(0, 60 - elapsed);
      
      if (remainingTime !== lastTimerUpdate) {
        lastTimerUpdate = remainingTime;
        const timerEl = document.querySelector('#timer');
        if (timerEl) {
          timerEl.innerHTML = remainingTime;
        }
        
        // Update health bars
        const playerHealthEl = document.querySelector('#playerHealth');
        const enemyHealthEl = document.querySelector('#enemyHealth');
        if (playerHealthEl) playerHealthEl.style.width = player.health + "%";
        if (enemyHealthEl) enemyHealthEl.style.width = enemy.health + "%";
      }

      // Check win condition
      if (remainingTime <= 0 || player.health <= 0 || enemy.health <= 0) {
        const displayText = document.querySelector("#display-text");
        if (displayText && displayText.style.display === 'none') {
          displayText.style.display = "flex";
          if (player.health > enemy.health) {
            displayText.innerHTML = "🏆 Player 1 Wins";
          } else if (enemy.health > player.health) {
            displayText.innerHTML = "🏆 Player 2 Wins";
          } else {
            displayText.innerHTML = "⚖️ Tie";
          }
        }
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    const handleKeyDown = (e) => {
      if (e.key === 'a' && player.position.x > 0) player.position.x -= 15;
      if (e.key === 'd' && player.position.x < canvas.width - 100) player.position.x += 15;
      if (e.key === 'w' && player.position.y === canvas.height - 250) {
        player.velocity.y = -20;
      }
      if (e.key === ' ') {
        player.isAttacking = true;
        enemy.takeDamage();
      }

      if (e.key === 'ArrowLeft' && enemy.position.x > 0) enemy.position.x -= 15;
      if (e.key === 'ArrowRight' && enemy.position.x < canvas.width - 100) enemy.position.x += 15;
      if (e.key === 'ArrowUp' && enemy.position.y === canvas.height - 250) {
        enemy.velocity.y = -20;
      }
      if (e.key === 'ArrowDown') {
        enemy.isAttacking = true;
        player.takeDamage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-1 sm:p-4 overflow-x-hidden">
      <div className="w-full max-w-full px-1 sm:px-4">
        {/* Header with Menu Button */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
              🎮 NFT Battle Arena
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">Epic Card Battle</p>
          </div>
          
          <button
            onClick={() => setShowBattleMenu(!showBattleMenu)}
            className="ml-2 p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-bold transition-all shadow-lg"
          >
            <span className="text-lg sm:text-xl">⚙️</span>
          </button>
        </div>

        {/* Battle Menu Modal */}
        {showBattleMenu && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border-2 border-purple-500 shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-4 px-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Battle Details</h2>
                <button
                  onClick={() => setShowBattleMenu(false)}
                  className="text-white hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-purple-300 mb-3">⚔️ Battle Stats</h3>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Battle Mode</span>
                      <span className="text-purple-400 font-bold">NFT Arena</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Duration</span>
                      <span className="text-yellow-400 font-bold">60 Seconds</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-yellow-300 mb-3">💎 Token Pool</h3>
                  <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Total Pool</span>
                      <span className="text-yellow-400 font-bold text-lg">9200 🪙</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Player 1</span>
                      <span className="text-yellow-300">5000 🪙</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Player 2</span>
                      <span className="text-yellow-300">4200 🪙</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-green-300 mb-3">🏆 Prize Fund</h3>
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Prize Pool</span>
                      <span className="text-green-400 font-bold">4600 🪙</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">1st Place</span>
                      <span className="text-green-300">4050 🪙</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-blue-300 mb-3">🔗 Blockchain</h3>
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Network</span>
                      <span className="text-blue-300">Ethereum</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Status</span>
                      <span className="text-blue-300">🟢 Live</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 px-6 py-4 border-t border-purple-500/30">
                <button
                  onClick={() => setShowBattleMenu(false)}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all"
                >
                  Close Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-2 sm:p-3 border border-purple-500/30">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-1">👤</div>
              <p className="text-xs sm:text-sm font-bold text-white">Player 1</p>
              <p className="text-xs text-gray-400 mb-2">Your NFT Card</p>
              <div className="bg-black/30 rounded px-2 py-1">
                <p className="text-xs text-yellow-400 font-semibold">💎 5000 Tokens</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-lg p-2 sm:p-3 border border-blue-500/30">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-1">🎯</div>
              <p className="text-xs sm:text-sm font-bold text-white">Opponent</p>
              <p className="text-xs text-gray-400 mb-2">Enemy NFT Card</p>
              <div className="bg-black/30 rounded px-2 py-1">
                <p className="text-xs text-yellow-400 font-semibold">💎 4200 Tokens</p>
              </div>
            </div>
          </div>
        </div>

        {/* HUD - Health & Timer */}
        <div className="mb-2 sm:mb-4 flex flex-col sm:flex-row items-center gap-1 sm:gap-4 px-1 sm:px-2">
          <div className="w-full sm:flex-1 flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white min-w-fit whitespace-nowrap">P1 HP</span>
            <div className="flex-1 relative border-2 border-pink-500 h-4 sm:h-8 rounded">
              <div style={{ backgroundColor: '#ec4899', height: '100%' }}></div>
              <div id="playerHealth" style={{ position: 'absolute', background: '#60a5fa', top: 0, bottom: 0, right: 0, width: '100%' }}></div>
            </div>
          </div>

          <div id="timer" className="border-2 border-yellow-400 w-12 sm:w-20 h-10 sm:h-14 flex items-center justify-center bg-black text-yellow-400 text-sm sm:text-2xl font-bold rounded-lg flex-shrink-0 shadow-lg shadow-yellow-400/50">
            60
          </div>

          <div className="w-full sm:flex-1 flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white min-w-fit whitespace-nowrap">P2 HP</span>
            <div className="flex-1 relative border-2 border-blue-500 h-4 sm:h-8 rounded">
              <div style={{ backgroundColor: '#0ea5e9', height: '100%' }}></div>
              <div id="enemyHealth" style={{ position: 'absolute', background: '#60a5fa', top: 0, bottom: 0, right: 0, left: 0 }}></div>
            </div>
          </div>
        </div>

        {/* Battle Area */}
        <div className="relative w-full bg-black rounded-xl overflow-hidden border-2 sm:border-4 border-purple-500 shadow-2xl shadow-purple-500/50" style={{ maxHeight: '70vh' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none z-5"></div>
          
          <canvas 
            ref={battleCanvasRef}
            className="w-full h-full block"
          ></canvas>
          
          <div 
            id="display-text" 
            style={{ 
              position: 'absolute', 
              color: 'white', 
              alignItems: 'center', 
              justifyContent: 'center', 
              top: 0, 
              right: 0, 
              bottom: 0, 
              left: 0, 
              display: 'none', 
              fontSize: 'clamp(20px, 6vw, 56px)',
              fontWeight: 'bold',
              textShadow: '0 0 30px rgba(168, 85, 247, 0.8)',
              zIndex: 10
            }}
          ></div>
        </div>

        {/* Battle Info Footer */}
        <div className="mt-3 sm:mt-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <p className="text-xs text-gray-400 mb-1">Battle Mode</p>
                <p className="text-xs sm:text-sm font-bold text-purple-400">NFT Arena</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="text-xs sm:text-sm font-bold text-green-400">🟢 Live</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Pool</p>
                <p className="text-xs sm:text-sm font-bold text-yellow-400">9200 💎</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleScreen;