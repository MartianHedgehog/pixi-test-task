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

    // Turn the shape ID into a number we can use
    const shapeNumber = this.convertIdToNumber(shapeId);

    // That number to decide how the shape looks
    const numSides = 4 + (shapeNumber % 6); // Between 4-9 sides
    const isRounded = shapeNumber % 10 > 5; // 40% chance of curves

    if (isRounded) {
      this.drawRoundedShape(graphics, radius, numSides, shapeNumber);
    } else {
      this.drawAngularShape(graphics, radius, numSides, shapeNumber);
    }
  }

  // Convert text ID to a consistent number
  private convertIdToNumber(shapeId: string): number {
    let number = 0;
    for (let i = 0; i < shapeId.length; i++) {
      number += shapeId.charCodeAt(i); // Add up ASCII values
    }
    return number;
  }

  private calculateShapePoint(
    pointIndex: number,
    numSides: number,
    radius: number,
    shapeNumber: number,
  ): { x: number; y: number; angle: number } {
    const angle = (pointIndex * 2 * Math.PI) / numSides;

    // Make each point a bit different using the shape number
    const variation = ((shapeNumber * pointIndex) % 100) / 200; // 0 to 0.5
    const pointRadius = radius * (0.6 + variation);

    const x = Math.cos(angle) * pointRadius;
    const y = Math.sin(angle) * pointRadius;

    return { x, y, angle };
  }

  // Draw a shape with smooth curves
  private drawRoundedShape(
    graphics: PIXI.Graphics,
    radius: number,
    numSides: number,
    shapeNumber: number,
  ): void {
    graphics.moveTo(radius, 0);

    for (let i = 1; i <= numSides; i++) {
      const point = this.calculateShapePoint(i, numSides, radius, shapeNumber);

      // Decide if this segment should be curved
      if ((shapeNumber * i) % 3 === 0) {
        // Add a curve - control point is halfway between points
        const prevPoint = this.calculateShapePoint(i - 1, numSides, radius, shapeNumber);
        const midAngle = (prevPoint.angle + point.angle) / 2;
        const controlRadius = radius * 0.4;

        const controlX = Math.cos(midAngle) * controlRadius;
        const controlY = Math.sin(midAngle) * controlRadius;

        graphics.quadraticCurveTo(controlX, controlY, point.x, point.y);
      } else {
        graphics.lineTo(point.x, point.y);
      }
    }
    graphics.closePath();
  }

  // Draw a shape with straight edges
  private drawAngularShape(
    graphics: PIXI.Graphics,
    radius: number,
    numSides: number,
    shapeNumber: number,
  ): void {
    const points = [];

    for (let i = 0; i < numSides; i++) {
      const point = this.calculateShapePoint(i, numSides, radius, shapeNumber);

      points.push(point.x, point.y);
    }

    graphics.poly(points);
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
