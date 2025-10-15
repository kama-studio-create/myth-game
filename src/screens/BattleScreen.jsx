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

    canvas.width = 1024;
    canvas.height = 576;

    c.fillRect(0, 0, canvas.width, canvas.height);

    const gravity = 0.7;

    // ✅ Sprite Class (fixed for image loading)
class Sprite {
  constructor({ position, imgSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 } }) {
    this.position = position;
    this.height = 150;
    this.width = 50;
    this.image = new Image();
    this.image.src = imgSrc;
    this.imageLoaded = false; // <— NEW flag

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
    // ✅ Don’t draw until image is ready
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
          this.position.y = 330;
          return;
        }
        this.animateFrames();

        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) {
          this.velocity.y = 0;
          this.position.y = 330;
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

    // ✅ FIXED: Replace process.env.PUBLIC_URL with direct paths

const background = new Sprite({
  position: { x: 0, y: 0 },
  imgSrc: '/img/background.png', // ✅ Changed
});

const shop = new Sprite({
  position: { x: 600, y: 128 },
  imgSrc: '/img/shop.png', // ✅ Changed
  scale: 2.75,
  framesMax: 6
});

const player = new Fighter({
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  scale: 2.5,
  offset: { x: 215, y: 157 },
  imgSrc: '/img/samuraiMack/Idle.png', // ✅ Changed
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
  position: { x: 400, y: 100 },
  velocity: { x: 0, y: 0 },
  scale: 2.5,
  offset: { x: 215, y: 167 },
  imgSrc: '/img/kenji/Idle.png', // ✅ Changed
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
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ position: 'absolute', display: 'flex', width: '100%', alignItems: 'center', padding: '20px' }}>
        {/* Player health */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', border: '4px solid white', justifyContent: 'flex-end', borderRight: 'none' }}>
          <div style={{ backgroundColor: 'red', height: '30px', width: '100%' }}></div>
          <div id="playerHealth" style={{ position: 'absolute', background: '#818CF8', top: 0, bottom: 0, right: 0, width: '100%' }}></div>
        </div>

        {/* Timer */}
        <div id="timer" style={{ backgroundColor: 'black', width: '100px', height: '50px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '4px solid white' }}>
          60
        </div>

        {/* Enemy health */}
        <div style={{ position: 'relative', width: '100%', border: '4px solid white', borderLeft: 'none' }}>
          <div style={{ backgroundColor: 'red', height: '30px' }}></div>
          <div id="enemyHealth" style={{ position: 'absolute', background: '#818CF8', top: 0, bottom: 0, right: 0, left: 0 }}></div>
        </div>
      </div>
      
      <div id="display-text" style={{ position: 'absolute', color: 'white', alignItems: 'center', justifyContent: 'center', top: 0, right: 0, bottom: 0, left: 0, display: 'none', fontSize: '48px', fontWeight: 'bold' }}></div>
      
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default BattleScreen;