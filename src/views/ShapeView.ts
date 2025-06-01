import * as PIXI from 'pixi.js';
import { IShape, IShapeView, ShapeType } from 'src/types';

export class ShapeView implements IShapeView {
  private container: PIXI.Container;
  private graphics: Map<string, PIXI.Graphics> = new Map();

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  private createGraphics(shape: IShape): PIXI.Graphics {
    const g = new PIXI.Graphics();
    this.updateGraphics(g, shape);
    this.graphics.set(shape.id, g);
    this.container.addChild(g);
    return g;
  }

  private updateGraphics(graphics: PIXI.Graphics, shape: IShape): void {
    graphics.clear();

    graphics.x = shape.x;
    graphics.y = shape.y;

    switch (shape.type) {
      case ShapeType.TRIANGLE:
        this.drawPolygon(graphics, 3, shape.size / 2);
        break;
      case ShapeType.SQUARE:
        graphics.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
        break;
      case ShapeType.PENTAGON:
        this.drawPolygon(graphics, 5, shape.size / 2);
        break;
      case ShapeType.HEXAGON:
        this.drawPolygon(graphics, 6, shape.size / 2);
        break;
      case ShapeType.CIRCLE:
        graphics.circle(0, 0, shape.size / 2);
        break;
      case ShapeType.ELLIPSE:
        graphics.ellipse(0, 0, shape.size / 2, shape.size / 3);
        break;
      case ShapeType.RANDOM_COMPLEX:
        this.drawRandomComplexShape(graphics, shape.size, shape.id);
        break;
    }

    graphics.fill(shape.color);
  }

  private drawPolygon(graphics: PIXI.Graphics, sides: number, radius: number): void {
    const points: number[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    graphics.poly(points);
  }

  private drawRandomComplexShape(graphics: PIXI.Graphics, size: number, shapeId: string): void {
    const radius = size / 2;
    const shapeNumber = this.convertIdToNumber(shapeId);

    this.drawCloudShape(graphics, radius, shapeNumber);
  }

  private drawCloudShape(graphics: PIXI.Graphics, radius: number, shapeNumber: number): void {
    const numBumps = 6 + (shapeNumber % 4); // 6-9 bumps for a cloud
    const baseRadius = radius * 0.7;

    const points = [];
    for (let i = 0; i < numBumps; i++) {
      points.push(this.calculateCloudPoint(i, numBumps, baseRadius, radius, shapeNumber));
    }

    graphics.moveTo(points[0].x, points[0].y);

    // Draw smooth curves through all points
    for (let i = 0; i < numBumps; i++) {
      const currentPoint = points[i];
      const nextPoint = points[(i + 1) % numBumps]; // Wrap around to first point

      // Create smooth control points
      const midX = (currentPoint.x + nextPoint.x) / 2;
      const midY = (currentPoint.y + nextPoint.y) / 2;

      // Calculate outward bulge
      const angle = Math.atan2(midY, midX); // Angle from center
      const bulgeDistance = 15 + ((shapeNumber * i * 7) % 25); // 15-40px bulge

      const controlX = midX + Math.cos(angle) * bulgeDistance;
      const controlY = midY + Math.sin(angle) * bulgeDistance;

      graphics.quadraticCurveTo(controlX, controlY, nextPoint.x, nextPoint.y);
    }

    graphics.closePath();
  }

  private calculateCloudPoint(
    pointIndex: number,
    numBumps: number,
    baseRadius: number,
    maxRadius: number,
    shapeNumber: number,
  ): { x: number; y: number } {
    const angle = (pointIndex * 2 * Math.PI) / numBumps;

    const variation = ((shapeNumber * pointIndex * 3) % 50) / 100; // 0 to 0.5
    const pointRadius = baseRadius + (maxRadius - baseRadius) * variation;

    const x = Math.cos(angle) * pointRadius;
    const y = Math.sin(angle) * pointRadius;

    return { x, y };
  }

  private convertIdToNumber(shapeId: string): number {
    let number = 0;
    for (let i = 0; i < shapeId.length; i++) {
      number += shapeId.charCodeAt(i); // Add up ASCII values
    }
    return number;
  }

  public render(shapes: IShape[]): void {
    // Remove graphics for shapes that no longer exist
    const currentShapeIds = new Set(shapes.map((s) => s.id));

    for (const [shapeId, graphic] of this.graphics) {
      if (!currentShapeIds.has(shapeId)) {
        this.container.removeChild(graphic);

        graphic.destroy();
        this.graphics.delete(shapeId);
      }
    }

    // Update or create graphics for existing shapes
    shapes.forEach((shape) => {
      if (this.graphics.has(shape.id)) {
        const graphic = this.graphics.get(shape.id)!;

        this.updateGraphics(graphic, shape);
      } else {
        this.createGraphics(shape);
      }
    });
  }

  public destroy(): void {
    for (const [_, graphic] of this.graphics) {
      graphic.destroy();
    }

    this.graphics.clear();
  }
}
