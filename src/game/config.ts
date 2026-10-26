import Phaser from 'phaser';
import { PuzzleScene } from './scenes/PuzzleScene/PuzzleScene';

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#f6e8c8',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1000,
      height: 760,
    },
    input: {
      activePointers: 3,
      smoothFactor: 0,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    scene: [PuzzleScene],
  };
}
