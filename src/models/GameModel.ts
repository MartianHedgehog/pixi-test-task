import { Shape } from 'src/models/ShapeModel';
import { Bounds, IGameModel, IShape, ShapeType } from 'src/types';

export class GameModel implements IGameModel {
  public shapes: IShape[] = [];
  public gravity: number = 1;
  public spawnRate: number = 1;
  public bounds: Bounds = { width: 800, height: 600 };
  public totalSurfaceArea: number = 0;
  private timeSinceLastSpawn: number = 0;

  public addShape(x: number, y: number, type: ShapeType | null = null): IShape {
    const shapeType = type !== null ? type : (Math.floor(Math.random() * 7) as ShapeType);
    const color = Math.floor(Math.random() * 0xffffff);
    const size = 50 + Math.random() * 50;

    const shape = new Shape(x, y, shapeType, color, size);
    this.shapes.push(shape);
    this.updateSurfaceArea();
    return shape;
  }

  public removeShape(shapeId: string): boolean {
    const index = this.shapes.findIndex((s) => s.id === shapeId);
    if (index !== -1) {
      this.shapes.splice(index, 1);
      this.updateSurfaceArea();
      return true;
    }
    return false;
  }

  public update(deltaTime: number): void {
    // Convert PIXI deltaTime to seconds (deltaTime = 1.0 at 60fps)
    const deltaSeconds = deltaTime / 60;

    // Auto spawn shapes
    this.timeSinceLastSpawn += deltaSeconds;
    const spawnInterval = 1.0 / this.spawnRate; // seconds between spawns

    if (this.spawnRate > 0 && this.timeSinceLastSpawn >= spawnInterval) {
      const x = Math.random() * this.bounds.width;
      this.addShape(x, -50);
      this.timeSinceLastSpawn = 0;
    }

    // Update shapes and handle collisions
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i];

      if (!shape.update(this.gravity * deltaTime * 2, this.bounds)) {
        this.shapes.splice(i, 1);
        this.updateSurfaceArea();
        continue;
      }

      // Check collisions with other shapes
      for (let j = i + 1; j < this.shapes.length; j++) {
        shape.checkCollision(this.shapes[j]);
      }
    }
  }

  private updateSurfaceArea(): void {
    this.totalSurfaceArea = this.shapes.reduce((sum, shape) => sum + shape.area, 0);
  }

  public getShapeAt(x: number, y: number): IShape | null {
    for (const shape of this.shapes) {
      const dx = x - shape.x;
      const dy = y - shape.y;
      if (Math.sqrt(dx * dx + dy * dy) < shape.size / 2) {
        return shape;
      }
    }
    return null;
  }

  public setSpawnRate(rate: number): void {
    this.spawnRate = Math.max(0, Math.min(10, rate));
  }

  public setGravity(gravity: number): void {
    this.gravity = Math.max(0.1, Math.min(10.0, gravity));
  }

  public getShapeCount(): number {
    return this.shapes.length;
  }

  public getTotalSurfaceArea(): number {
    return this.totalSurfaceArea;
  }
}
