import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-christmas-tree-claude',
  templateUrl: './christma-tree-claude.component.html',
  styleUrls: ['./christma-tree-claude.component.css']
})
export class ChristmaTreeClaudeComponent implements OnInit, OnDestroy {
  mouseX: number = 0;
  mouseY: number = 0;
  lights: any[] = [];
  private animationId: number | null = null;
  private lightAnimationId: number | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.generateLights();
    this.animateLights();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.lightAnimationId) {
      cancelAnimationFrame(this.lightAnimationId);
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
  }

  generateLights(): void {
    // Generate lights that follow the tree shape
    const numLights = 80;
    
    for (let i = 0; i < numLights; i++) {
      const progress = i / numLights;
      
      // Tree shape: wider at bottom, narrow at top
      const y = progress * 100; // 0 to 100%
      const treeWidth = (100 - y) * 0.3; // Wider at bottom (y=0), narrow at top (y=100)
      
      // Random position within tree width
      const x = 50 + (Math.random() - 0.5) * treeWidth;
      
      this.lights.push({
        x: x,
        y: y,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.5,
        speed: Math.random() * 0.3 + 0.2,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  animateLights(): void {
    const animate = (timestamp: number) => {
      this.lights.forEach((light, index) => {
        // Move light from right to left with a curve
        light.phase += light.speed * 0.02;
        
        // Calculate position along the path
        const t = (light.phase % (Math.PI * 2)) / (Math.PI * 2);
        
        // Horizontal movement (right to left)
        const baseX = 100 - t * 100;
        
        // Vertical position based on tree height
        const yProgress = light.y / 100;
        const treeWidth = (100 - light.y) * 0.3;
        
        // Curve: drops in the middle, same height at start and end
        const curve = Math.sin(t * Math.PI) * 10;
        
        light.x = 50 + (baseX - 50) * (treeWidth / 30);
        light.currentY = light.y + curve;
        
        // Fade out at the end, fade in at the start
        if (t > 0.9) {
          light.opacity = (1 - t) * 10 * (Math.random() * 0.5 + 0.5);
        } else if (t < 0.1) {
          light.opacity = t * 10 * (Math.random() * 0.5 + 0.5);
        } else {
          light.opacity = Math.random() * 0.3 + 0.7;
        }
      });
      
      this.lightAnimationId = requestAnimationFrame(animate);
    };
    
    this.lightAnimationId = requestAnimationFrame(animate);
  }

  getStars(): number[] {
    return Array(150).fill(0);
  }
}