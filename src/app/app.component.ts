import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagramComponent } from './diagram/diagram.component';
import { ChatService } from './chat.service';
import { SystemAnalysisComponent } from './system-analysis/system-analysis.component';
import { LegendComponent } from './legend/legend.component';

interface NodeData {
  key: string;
  category?: string;
}

interface LinkData {
  from: string;
  to: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DiagramComponent, SystemAnalysisComponent, LegendComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  description = '';
  diagramText = '';
  diagramNodes: NodeData[] = [];
  diagramLinks: LinkData[] = [];
  loading = false;
  showJson = false;
  modifications: string[] = [];
  showAnalysis = true;

  @ViewChild(DiagramComponent) diagramComponent!: DiagramComponent;

  constructor(private chat: ChatService) {}

  async generateDiagram() {
    this.loading = true;
    this.diagramText = '';
    this.diagramNodes = [];
    this.diagramLinks = [];

    try {
      const result = await this.chat.getDiagramData({
        prompt: this.description,
        modifications: this.modifications,
      });

      this.diagramNodes = Array.isArray(result.nodes) ? result.nodes : [];
      this.diagramLinks = Array.isArray(result.links) ? result.links : [];
      this.diagramText = JSON.stringify(
        { nodes: this.diagramNodes, links: this.diagramLinks },
        null,
        2
      );
    } catch (err: any) {
      this.diagramText =
        'Error generating diagram.\n' + (err?.message || JSON.stringify(err));
      console.error('Error calling FastAPI/OpenAI:', err);
    } finally {
      this.loading = false;
    }
  }

  async handleConSelected(con: string) {
    if (!this.modifications.includes(con)) {
      this.modifications.push(con);
    }
    await this.generateDiagram();
  }

  zoomIn() {
    if (this.diagramComponent?.diagram) {
      this.diagramComponent.diagram.scale *= 1.1;
    }
  }

  zoomOut() {
    if (this.diagramComponent?.diagram) {
      this.diagramComponent.diagram.scale /= 1.1;
    }
  }

  toggleAnalysis() {
    this.showAnalysis = !this.showAnalysis;
  }
}
