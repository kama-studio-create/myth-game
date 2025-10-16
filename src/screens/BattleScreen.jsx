import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

const BattleScreen = () => {
  const { user, updateUserStats } = useGame();
  const canvasRef = useRef(null);
  const gameInitialized = useRef(false);

  useEffect(() => {
    if (gameInitialized.current) return;
    gameInitialized.current = true;

    const canvas = canvasRef.current;
    const c = canvas.getContext('2d');

    // Responsive canvas sizing
    const container = canvas.parentElement;
    const width = Math.min(container.clientWidth, 1200);
    const height = Math.min(window.innerHeight - 200, 600);
    
    canvas.width = width;
    canvas.height = height;

    c.fillRect(0, 0, canvas.width, canvas.height);

    const gravity = 0.7;

    // ✅ Sprite Class
    class Sprite {
      constructor({ position, imgSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 } }) {
        this.position = position;
        this.height = 150;
        this.width = 50;
        this.image = new Image();
        this.image.src = imgSrc;
        this.imageLoaded = false;

        this.image.onload = () => {
          this.imageLoaded = true;
        };

        this.image.onerror = () => {
          console.error("❌ Failed to load image:", imgSrc);
        };

        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5;
        this.offset = offset;
      }

      draw() {
        if (!this.imageLoaded) return;

        c.drawImage(
          this.image,
          this.framesCurrent * (this.image.width / this.framesMax),
          0,
          this.image.width / this.framesMax,
          this.image.height,
          this.position.x - this.offset.x,
          this.position.y - this.offset.y,
          (this.image.width / this.framesMax) * this.scale,
          this.image.height * this.scale
        );
      }

      animateFrames() {
        this.framesElapsed++;
        if (this.framesElapsed % this.framesHold === 0) {
          this.framesCurrent =
            this.framesCurrent < this.framesMax - 1 ? this.framesCurrent + 1 : 0;
        }
      }

      update() {
        this.draw();
        this.animateFrames();
      }
    }

    // Fighter Class
    class Fighter extends Sprite {
      constructor({ position, velocity, color = 'red', imgSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, sprites, attackBox = { offset: {}, width: undefined, height: undefined } }) {
        super({ position, imgSrc, scale, framesMax, offset });

        this.velocity = velocity;
        this.height = 150;
        this.width = 50;
        this.lastKey = '';
        this.attackBox = {
          position: {
            x: this.position.x,
            y: this.position.y
          },
          width: attackBox.width,
          offset: attackBox.offset,
          height: attackBox.height,
        };
        this.color = color;
        this.isAttacking = false;
        this.health = 100;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5;
        this.sprites = sprites;
        this.dead = false;

        for (const sprite in this.sprites) {
          sprites[sprite].image = new Image();
          sprites[sprite].image.src = sprites[sprite].imgSrc;
        }
      }

      update() {
        this.draw();
        if (this.dead) {
          while (!(this.position.y + this.height + this.velocity.y >= canvas.height - 96)) {
            this.position.y += this.velocity.y;
            this.velocity.y += gravity;
          }
          this.velocity.y = 0;
          this.position.y = canvas.height - 150;
          return;
        }
        this.animateFrames();

        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) {
          this.velocity.y = 0;
          this.position.y = canvas.height - 150;
        } else {
          this.velocity.y += gravity;
        }
      }

      attack() {
        this.switchSprite('attack1');
        this.isAttacking = true;
      }

      takeHit() {
        this.health -= 20;
        if (this.health <= 0) {
          while (this.position.y > 0) { this.position.y -= 5; }
          this.switchSprite('death');
        } else {
          this.switchSprite('takeHit');
        }
      }

      switchSprite(sprite) {
        if (this.image === this.sprites.attack1.image && this.framesCurrent < this.sprites.attack1.framesMax - 1) return;
        if (this.image === this.sprites.takeHit.image && this.framesCurrent < this.sprites.takeHit.framesMax - 1) return;
        if (this.image === this.sprites.death.image) {
          if (this.framesCurrent === this.sprites.death.framesMax - 1 && !this.dead) {
            this.dead = true;
          }
          return;
        }

        switch (sprite) {
          case 'idle':
            if (this.image !== this.sprites.idle.image) {
              this.image = this.sprites.idle.image;
              this.framesMax = this.sprites.idle.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'run':
            if (this.image !== this.sprites.run.image) {
              this.image = this.sprites.run.image;
              this.framesMax = this.sprites.run.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'jump':
            if (this.image !== this.sprites.jump.image) {
              this.image = this.sprites.jump.image;
              this.framesMax = this.sprites.jump.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'fall':
            if (this.image !== this.sprites.fall.image) {
              this.image = this.sprites.fall.image;
              this.framesMax = this.sprites.fall.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'attack1':
            if (this.image !== this.sprites.attack1.image) {
              this.image = this.sprites.attack1.image;
              this.framesMax = this.sprites.attack1.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'takeHit':
            if (this.image !== this.sprites.takeHit.image) {
              this.image = this.sprites.takeHit.image;
              this.framesMax = this.sprites.takeHit.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'death':
            if (this.image !== this.sprites.death.image) {
              this.image = this.sprites.death.image;
              this.framesMax = this.sprites.death.framesMax;
              this.framesCurrent = 0;
            }
            break;
        }
      }
    }

    // Utility Functions
    function rectangularCollision({ rectangle1, rectangle2 }) {
      return (rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
        Math.abs(rectangle1.position.y - rectangle2.position.y) <= rectangle1.attackBox.height);
    }

    function determineWinner({ player, enemy, timerId }) {
      clearTimeout(timerId);
      const displayText = document.querySelector("#display-text");
      if (displayText) {
        displayText.style.display = "flex";
        if (player.health === enemy.health) {
          displayText.innerHTML = "Tie";
        } else if (player.health > enemy.health) {
          displayText.innerHTML = "Player 1 Wins";
        } else if (enemy.health > player.health) {
          displayText.innerHTML = "Player 2 Wins";
        }
      }
    }

    let timer = 60;
    let timerId;

    function decreaseTimer() {
      if (timer > 0) {
        timerId = setTimeout(decreaseTimer, 1000);
        timer--;
        const timerEl = document.querySelector('#timer');
        if (timerEl) {
          timerEl.innerHTML = timer;
        }
      }

      if (timer === 0) {
        determineWinner({ player, enemy, timerId });
      }
    }

    const background = new Sprite({
      position: { x: 0, y: 0 },
      imgSrc: '/img/background.png',
    });

    const shop = new Sprite({
      position: { x: canvas.width * 0.6, y: canvas.height * 0.22 },
      imgSrc: '/img/shop.png',
      scale: 2.0,
      framesMax: 6
    });

    const playerScale = canvas.width < 600 ? 1.2 : 2.0;
    const playerXPos = canvas.width < 600 ? canvas.width * 0.15 : canvas.width * 0.1;
    const enemyXPos = canvas.width < 600 ? canvas.width * 0.75 : canvas.width * 0.8;

    const player = new Fighter({
      position: { x: playerXPos, y: canvas.height * 0.55 },
      velocity: { x: 0, y: 0 },
      scale: playerScale,
      offset: { x: 215, y: 157 },
      imgSrc: '/img/samuraiMack/Idle.png',
      framesMax: 8,
      sprites: {
        idle: { imgSrc: '/img/samuraiMack/Idle.png', framesMax: 8 },
        run: { imgSrc: '/img/samuraiMack/Run.png', framesMax: 8 },
        jump: { imgSrc: '/img/samuraiMack/Jump.png', framesMax: 2 },
        fall: { imgSrc: '/img/samuraiMack/Fall.png', framesMax: 2 },
        attack1: { imgSrc: '/img/samuraiMack/Attack1.png', framesMax: 6 },
        takeHit: { imgSrc: '/img/samuraiMack/Take Hit - white silhouette.png', framesMax: 4 },
        death: { imgSrc: '/img/samuraiMack/Death.png', framesMax: 6 },
      },
      attackBox: { offset: { x: 100, y: 50 }, width: 160, height: 50 },
    });

    const enemy = new Fighter({
      position: { x: enemyXPos, y: canvas.height * 0.55 },
      velocity: { x: 0, y: 0 },
      scale: playerScale,
      offset: { x: 215, y: 167 },
      imgSrc: '/img/kenji/Idle.png',
      framesMax: 4,
      sprites: {
        idle: { imgSrc: '/img/kenji/Idle.png', framesMax: 4 },
        run: { imgSrc: '/img/kenji/Run.png', framesMax: 8 },
        jump: { imgSrc: '/img/kenji/Jump.png', framesMax: 2 },
        fall: { imgSrc: '/img/kenji/Fall.png', framesMax: 2 },
        attack1: { imgSrc: '/img/kenji/Attack1.png', framesMax: 4 },
        takeHit: { imgSrc: '/img/kenji/Take Hit.png', framesMax: 3 },
        death: { imgSrc: '/img/kenji/Death.png', framesMax: 7 },
      },
      attackBox: { offset: { x: -170, y: 50 }, width: 170, height: 50 },
    });

    const keys = {
      a: { pressed: false },
      d: { pressed: false },
      w: { pressed: false },
      ArrowLeft: { pressed: false },
      ArrowRight: { pressed: false },
      ArrowUp: { pressed: false }
    };

    decreaseTimer();

    function animate() {
      window.requestAnimationFrame(animate);
      c.fillStyle = 'black';
      c.fillRect(0, 0, canvas.width, canvas.height);
      background.update();
      shop.update();
      player.update();
      enemy.update();

      player.velocity.x = 0;
      enemy.velocity.x = 0;

      // Player Movement
      if (keys.a.pressed && player.lastKey === 'a') {
        player.switchSprite('run');
        player.velocity.x = -5;
      } else if (keys.d.pressed && player.lastKey === 'd') {
        player.switchSprite('run');
        player.velocity.x = 5;
      } else {
        player.switchSprite('idle');
      }
      if (player.velocity.y < 0) {
        player.switchSprite('jump');
      } else if (player.velocity.y > 0) {
        player.switchSprite('fall');
      }

      // Enemy Movement
      if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.switchSprite('run');
        enemy.velocity.x = -5;
      } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.switchSprite('run');
        enemy.velocity.x = 5;
      } else {
        enemy.switchSprite('idle');
      }
      if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump');
      } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall');
      }

      // Enemy gets hit
      if (rectangularCollision({ rectangle1: player, rectangle2: enemy }) && player.isAttacking && player.framesCurrent === 4) {
        enemy.takeHit();
        player.isAttacking = false;
        const enemyHealth = document.querySelector('#enemyHealth');
        if (enemyHealth) {
          enemyHealth.style.width = enemy.health + "%";
        }
      }

      if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false;
      }

      // Player gets hit
      if (rectangularCollision({ rectangle1: enemy, rectangle2: player }) && enemy.isAttacking && enemy.framesCurrent === 2) {
        player.takeHit();
        enemy.isAttacking = false;
        const playerHealth = document.querySelector('#playerHealth');
        if (playerHealth) {
          playerHealth.style.width = player.health + "%";
        }
      }
      if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false;
      }

      if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId });
      }
    }

    animate();

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'd':
          keys.d.pressed = true;
          player.lastKey = 'd';
          break;
        case 'a':
          keys.a.pressed = true;
          player.lastKey = 'a';
          break;
        case 'w':
          if (player.velocity.y === 0) {
            player.velocity.y = -20;
          }
          break;
        case ' ':
          player.attack();
          break;
        case 'ArrowDown':
          enemy.attack();
          break;
        case 'ArrowRight':
          keys.ArrowRight.pressed = true;
          enemy.lastKey = 'ArrowRight';
          break;
        case 'ArrowLeft':
          keys.ArrowLeft.pressed = true;
          enemy.lastKey = 'ArrowLeft';
          break;
        case 'ArrowUp':
          if (enemy.velocity.y === 0) {
            enemy.velocity.y = -20;
          }
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case 'd':
          keys.d.pressed = false;
          break;
        case 'a':
          keys.a.pressed = false;
          break;
        case 'ArrowRight':
          keys.ArrowRight.pressed = false;
          break;
        case 'ArrowLeft':
          keys.ArrowLeft.pressed = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearTimeout(timerId);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-1 sm:p-4 overflow-x-hidden">
      <div className="w-full max-w-full px-1 sm:px-4">
        {/* HUD - Responsive */}
        <div className="mb-2 sm:mb-4 flex flex-col sm:flex-row items-center gap-1 sm:gap-4 px-1 sm:px-2">
          {/* Player Health */}
          <div className="w-full sm:flex-1 flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white min-w-fit whitespace-nowrap">P1</span>
            <div className="flex-1 relative border-2 border-white h-4 sm:h-8 rounded">
              <div style={{ backgroundColor: 'red', height: '100%' }}></div>
              <div id="playerHealth" style={{ position: 'absolute', background: '#818CF8', top: 0, bottom: 0, right: 0, width: '100%' }}></div>
            </div>
          </div>

          {/* Timer */}
          <div id="timer" className="border-2 border-white w-12 sm:w-20 h-10 sm:h-14 flex items-center justify-center bg-black text-white text-sm sm:text-2xl font-bold rounded flex-shrink-0">
            60
          </div>

          {/* Enemy Health */}
          <div className="w-full sm:flex-1 flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white min-w-fit whitespace-nowrap">P2</span>
            <div className="flex-1 relative border-2 border-white h-4 sm:h-8 rounded">
              <div style={{ backgroundColor: 'red', height: '100%' }}></div>
              <div id="enemyHealth" style={{ position: 'absolute', background: '#818CF8', top: 0, bottom: 0, right: 0, left: 0 }}></div>
            </div>
          </div>
        </div>

        {/* Battle Area - Responsive Container */}
        <div className="relative w-full bg-black rounded-lg overflow-hidden border-2 sm:border-4 border-gray-600" style={{ maxHeight: '70vh' }}>
          <canvas 
            ref={canvasRef}
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
              textShadow: '0 0 20px rgba(0,0,0,0.8)',
              zIndex: 10
            }}
          ></div>
        </div>

        {/* Controls Info */}
        <div className="mt-2 sm:mt-4 p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-purple-500/30">
          <p className="text-xs font-semibold text-gray-300 mb-1">Controls:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 text-xs text-gray-400">
            <div><span className="text-yellow-400">A/D</span> - Move</div>
            <div><span className="text-yellow-400">W</span> - Jump</div>
            <div><span className="text-yellow-400">Space</span> - Attack</div>
            <div><span className="text-yellow-400">Arrows</span> - P2</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleScreen;