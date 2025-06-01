import { IUIView } from 'src/types';

export class UIView implements IUIView {
  private shapeCountElement: HTMLElement | null;
  private surfaceAreaElement: HTMLElement | null;
  private spawnRateElement: HTMLElement | null;
  private gravityValueElement: HTMLElement | null;

  constructor() {
    this.shapeCountElement = document.getElementById('shapeCount');
    this.surfaceAreaElement = document.getElementById('surfaceArea');
    this.spawnRateElement = document.getElementById('spawnRate');
    this.gravityValueElement = document.getElementById('gravityValue');
  }

  public updateInfo(shapeCount: number, surfaceArea: number): void {
    if (this.shapeCountElement) {
      this.shapeCountElement.textContent = shapeCount.toString();
    }
    if (this.surfaceAreaElement) {
      this.surfaceAreaElement.textContent = Math.round(surfaceArea).toString();
    }
  }

  public updateControls(spawnRate: number, gravity: number): void {
    if (this.spawnRateElement) {
      this.spawnRateElement.textContent = spawnRate.toString();
    }
    if (this.gravityValueElement) {
      this.gravityValueElement.textContent = gravity.toFixed(1);
    }
  }

  public getElement(id: string): HTMLElement | null {
    return document.getElementById(id);
  }
}
