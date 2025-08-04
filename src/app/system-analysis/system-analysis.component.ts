import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChatService } from '../chat.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-system-analysis',
  templateUrl: './system-analysis.component.html',
  standalone: true,
  imports: [CommonModule], 
})
export class SystemAnalysisComponent implements OnChanges {
  @Input() diagramText: string = '';
  analysis: string = '';
  loading: boolean = false;

  constructor(private chat: ChatService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diagramText'] && this.diagramText) {
      try {
        const parsed = JSON.parse(this.diagramText);
        if (parsed?.nodes && parsed?.links) {
          this.fetchAnalysis(parsed.nodes, parsed.links);
        }
      } catch (err) {
        console.error('Invalid diagram JSON for analysis:', err);
      }
    }
  }

  async fetchAnalysis(nodes: any[], links: any[]) {
    this.loading = true;
    this.analysis = '';
    try {
      const result = await this.chat.analyzeDiagram({ nodes, links });
      this.analysis = result.analysis || 'No analysis returned.';
    } catch (error) {
      console.error('Analysis error:', error);
      this.analysis = 'Failed to load analysis.';
    } finally {
      this.loading = false;
    }
  }
}
