import Phaser from 'phaser';
import type { BoardLayout } from '../PuzzleSceneLayout';
import { SceneDepth } from '../../../shared/depthPolicy';

export function runCompletionCelebration(
  scene: Phaser.Scene,
  layout: BoardLayout,
  pieceContainers: Phaser.GameObjects.Container[],
  onReplay: () => void,
): void {
  const { boardX, boardY, boardSize } = layout;

  // show a quick flash of the board to indicate that the puzzle is complete
  scene.cameras.main.flash(250, 255, 244, 190, false);
  
  // animate the pieces to indicate that the puzzle is complete
  scene.tweens.add({
    targets: pieceContainers,
    scaleX: 1.035,
    scaleY: 1.035,
    duration: 170,
    yoyo: true,
    repeat: 1,
    ease: 'Sine.InOut',
  });

  for (let i = 0; i < 24; i++) {
    const x = Phaser.Math.Between(boardX, boardX + boardSize);
    const y = Phaser.Math.Between(boardY, boardY + boardSize);
    const star = scene.add
      .star(x, y, 5, 4, 10, Phaser.Display.Color.RandomRGB().color)
      .setDepth(SceneDepth.effects)
      .setAlpha(0);
    scene.tweens.add({
      targets: star,
      alpha: 1,
      y: y - Phaser.Math.Between(25, 100),
      angle: Phaser.Math.Between(-90, 90),
      scale: { from: 0.4, to: 1.2 },
      duration: Phaser.Math.Between(500, 900),
      ease: 'Cubic.Out',
      onComplete: () => star.destroy(),
    });
  }

  const replay = scene.add
    .text(scene.scale.width / 2, scene.scale.height - 42, 'Play again ↻', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#493522',
      backgroundColor: '#ffe16a',
      padding: { x: 22, y: 10 },
    })
    .setOrigin(0.5)
    .setDepth(SceneDepth.hud)
    .setInteractive({ useHandCursor: true });

  replay.once('pointerdown', () => {
    replay.destroy();
    onReplay();
  });
}
