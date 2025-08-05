import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-system-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-analysis.component.html',
})
export class SystemAnalysisComponent {
  @Input() diagramText: string = '';
  @Output() requestDiagramImprovement = new EventEmitter<string>(); // 🔄 clearer event name

  loading = false;
  analysis = '';
  analysisSections: { title: string; items: string[] }[] = [];

  ngOnChanges() {
    if (this.diagramText) {
      try {
        const parsed = JSON.parse(this.diagramText);
        this.generateAnalysis(parsed.nodes, parsed.links);
      } catch {
        this.analysis = 'Invalid diagram JSON.';
      }
    }
  }

  async generateAnalysis(nodes: any[], links: any[]) {
    this.loading = true;
    this.analysis = '';
    try {
      const response = await fetch('http://localhost:8000/analyze-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, links }),
      });
      const data = await response.json();
      this.analysis = data.analysis || 'No insights available.';
      this.parseAnalysis(this.analysis);
    } catch (err: any) {
      this.analysis = 'Error fetching analysis.\n' + err.message;
    } finally {
      this.loading = false;
    }
  }

  parseAnalysis(text: string) {
    this.analysisSections = [];
    const pros = text.match(/(?<=Pros:)([\s\S]*?)(?=Cons:|$)/i);
    const cons = text.match(/(?<=Cons:)([\s\S]*?)(?=Improvements:|$)/i);

    if (pros) {
      this.analysisSections.push({
        title: 'Pros',
        items: pros[0].trim().split('\n').filter(Boolean),
      });
    }

    if (cons) {
      this.analysisSections.push({
        title: 'Cons',
        items: cons[0].trim().split('\n').filter(Boolean),
      });
    }
  }

  handleConsClick(con: string) {
    this.requestDiagramImprovement.emit(con); // ⬅ Emits clicked con for diagram update
  }
}
