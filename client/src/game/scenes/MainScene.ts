import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Load assets here
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.add
      .text(centerX, centerY, 'W GAME\n3v3 Arena Ready', {
        fontSize: '48px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 100, 'Press SPACE to start', {
        fontSize: '24px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      console.info('Game starting...');
    });
  }

  update() {
    // Game loop logic here
  }
}
