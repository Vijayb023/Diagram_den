import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagramComponent } from './diagram/diagram.component';
import { ChatService } from './chat.service';
import { SystemAnalysisComponent } from './system-analysis/system-analysis.component';

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
  imports: [CommonModule, FormsModule, DiagramComponent, SystemAnalysisComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  description = '';
  diagramText = '';
  diagramNodes: NodeData[] = [];
  diagramLinks: LinkData[] = [];
  loading = false;

  constructor(private chat: ChatService) {}

  async generateDiagram() {
    this.loading = true;
    this.diagramText = '';
    this.diagramNodes = [];
    this.diagramLinks = [];

    try {
      const result = await this.chat.getDiagramData(this.description);
      this.diagramNodes = Array.isArray(result.nodes) ? result.nodes : [];
      this.diagramLinks = Array.isArray(result.links) ? result.links : [];
      this.diagramText = JSON.stringify({ nodes: this.diagramNodes, links: this.diagramLinks }, null, 2);
    } catch (err: any) {
      this.diagramText = 'Error generating diagram.\n' + (err?.message || JSON.stringify(err));
      console.error('Error calling FastAPI/OpenAI:', err);
    } finally {
      this.loading = false;
    }
  }
}
