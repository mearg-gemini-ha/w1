import Phaser from 'phaser';
import { socketService } from '../../services/socket';
import { getGameContext } from '../gameContext';

interface GamePlayerState {
  userId: string;
  x: number;
  y: number;
  team?: 'A' | 'B';
}

interface GameStatePayload {
  sessionId: string;
  players: GamePlayerState[];
}

export class GameScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private localPlayer?: Phaser.Physics.Arcade.Image;
  private players = new Map<string, Phaser.Physics.Arcade.Image>();
  private lastSentAt = 0;
  private lastSentPosition = { x: 0, y: 0 };
  private sessionId = '';
  private userId = '';
  private team: 'A' | 'B' | undefined;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const context = getGameContext();
    this.sessionId = context.sessionId;
    this.userId = context.userId;
    this.team = context.team;

    this.physics.world.setBounds(0, 0, 1280, 720);
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.cursors = this.input.keyboard?.createCursorKeys();

    const socket = socketService.connect();

    socket.emit('game:join-session', {
      sessionId: this.sessionId,
      userId: this.userId,
      team: this.team,
    });

    socket.on('game:state', (state: GameStatePayload) => {
      if (state.sessionId !== this.sessionId) return;
      state.players.forEach((player) => this.addOrUpdatePlayer(player));
    });

    socket.on('game:player-joined', (player: GamePlayerState) => {
      this.addOrUpdatePlayer(player);
    });

    socket.on('game:player-update', (player: GamePlayerState) => {
      this.updatePlayerPosition(player);
    });

    socket.on('game:player-left', (data: { userId: string }) => {
      this.removePlayer(data.userId);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      socket.emit('game:leave-session', { sessionId: this.sessionId, userId: this.userId });
      socket.off('game:state');
      socket.off('game:player-joined');
      socket.off('game:player-update');
      socket.off('game:player-left');
    });
  }

  update(time: number) {
    if (!this.localPlayer || !this.cursors) return;

    const speed = 220;
    const body = this.localPlayer.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.cursors.left?.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up?.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down?.isDown) {
      body.setVelocityY(speed);
    }

    body.velocity.normalize().scale(speed);

    this.sendMovementUpdate(time);
  }

  private addOrUpdatePlayer(player: GamePlayerState): void {
    const existing = this.players.get(player.userId);
    if (existing) {
      existing.setPosition(player.x, player.y);
      return;
    }

    const textureKey = this.ensurePlayerTexture(player.team ?? 'A');
    const sprite = this.physics.add.image(player.x, player.y, textureKey);
    sprite.setCollideWorldBounds(true);
    sprite.setDepth(1);

    this.players.set(player.userId, sprite);

    if (player.userId === this.userId) {
      this.localPlayer = sprite;
      this.cameras.main.startFollow(sprite, true, 0.08, 0.08);
      this.lastSentPosition = { x: sprite.x, y: sprite.y };
    }
  }

  private updatePlayerPosition(player: GamePlayerState): void {
    const sprite = this.players.get(player.userId);
    if (!sprite) {
      this.addOrUpdatePlayer(player);
      return;
    }

    if (player.userId === this.userId) return;

    sprite.setPosition(player.x, player.y);
  }

  private removePlayer(userId: string): void {
    const sprite = this.players.get(userId);
    if (sprite) {
      sprite.destroy();
      this.players.delete(userId);
    }
  }

  private ensurePlayerTexture(team: 'A' | 'B'): string {
    const key = team === 'A' ? 'player-team-a' : 'player-team-b';

    if (this.textures.exists(key)) {
      return key;
    }

    const color = team === 'A' ? 0x4f8bff : 0xff5c5c;
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(0, 0, 40, 40, 10);
    graphics.generateTexture(key, 40, 40);
    graphics.destroy();

    return key;
  }

  private sendMovementUpdate(time: number): void {
    if (!this.localPlayer) return;

    const delta = Math.hypot(
      this.localPlayer.x - this.lastSentPosition.x,
      this.localPlayer.y - this.lastSentPosition.y
    );

    if (delta < 4 && time - this.lastSentAt < 120) {
      return;
    }

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('game:player-move', {
      sessionId: this.sessionId,
      userId: this.userId,
      x: this.localPlayer.x,
      y: this.localPlayer.y,
    });

    this.lastSentAt = time;
    this.lastSentPosition = { x: this.localPlayer.x, y: this.localPlayer.y };
  }
}
