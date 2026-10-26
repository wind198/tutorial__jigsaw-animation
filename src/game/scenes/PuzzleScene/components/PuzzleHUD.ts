import Phaser from 'phaser';
import { SceneDepth } from '../../../shared/depthPolicy';

const INK = '#493522';

// The HUD is a UI element that displays the current status of the game.
export class PuzzleHUD {
  private statusText!: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // setup structure of HUD, it basically contain a text object that will be used to display the message
  setupHud(initialMessage: string): void {
    this.statusText = this.scene.add
      .text(0, 0, initialMessage, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '22px',
        color: INK,
        fontStyle: 'bold',
        align: 'center',
        stroke: '#fff7e5',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(SceneDepth.hud);
  }

  setCenterX(x: number): void {
    this.statusText.setPosition(x, 32);
  }

  setMessage(message: string): void {
    this.statusText.setText(message);
  }
}
