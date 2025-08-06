import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { autofixDiagram } from '../utils/diagram-autofix.util';
import * as go from 'gojs';

@Component({
  selector: 'app-diagram',
  template: `
    <div class="flex w-full">
      <div class="flex-1 border p-2">
        <div class="flex justify-between items-center mb-2">
          <button (click)="zoomIn()" class="px-3 py-1 bg-indigo-500 text-white rounded">+</button>
          <button (click)="zoomOut()" class="px-3 py-1 bg-indigo-500 text-white rounded">-</button>
        </div>
        <div id="gojsDiagram" style="width:100%; height:800px; border: 1px solid #ccc;"></div>
      </div>
    </div>
  `,
})
export class DiagramComponent implements AfterViewInit, OnChanges {
  @Input() nodes: { key: string; category?: string }[] = [];
  @Input() links: { from: string; to: string }[] = [];
  public diagram!: go.Diagram;

  private ICON_MAP: Record<string, string> = {
    actor: 'https://img.icons8.com/ios-filled/100/user-male-circle.png',
    service: 'https://img.icons8.com/ios/50/service--v1.png',
    api: 'https://img.icons8.com/ios-filled/100/api.png',
    database: 'https://img.icons8.com/ios-filled/100/database.png',
    queue: 'https://img.icons8.com/ios-filled/100/queue.png',
    monitoring: 'https://img.icons8.com/ios-filled/100/combo-chart.png',
    external: 'https://img.icons8.com/ios-filled/100/external.png',
    kafka: 'https://img.icons8.com/ios-filled/100/kafka.png',
    default: 'https://img.icons8.com/ios-filled/100/cube.png',
  };

  ngAfterViewInit() {
    this.initDiagram();
    this.renderDiagram();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.diagram && (changes['nodes'] || changes['links'])) {
      this.renderDiagram();
    }
  }

  private initDiagram() {
    const $ = go.GraphObject.make;

    this.diagram = $(go.Diagram, 'gojsDiagram', {
      'undoManager.isEnabled': true,
          layout: $(go.LayeredDigraphLayout, {
          direction: 90,
          layerSpacing: 40,        // Reduced from 80
          columnSpacing: 20,       // Reduced from 50
          setsPortSpots: false,    // Prevents extra node padding
          layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource,
          packOption: go.LayeredDigraphLayout.PackMedian, // Packs layout tighter
    }),
      initialContentAlignment: go.Spot.Center,
      initialAutoScale: go.Diagram.Uniform,
      isReadOnly: true,
      'animationManager.isEnabled': false,
    });

    this.diagram.toolManager.draggingTool.isGridSnapEnabled = true;
    this.diagram.toolManager.draggingTool.gridSnapCellSize = new go.Size(10, 10);
    this.diagram.div!.style.backgroundColor = 'white';

    const createNodeTemplate = (category: string) => {
      const icon = this.ICON_MAP[category] || this.ICON_MAP['default'];
      return $(go.Node, 'Vertical',
        { background: 'transparent' },
        $(go.Picture, {
          source: icon,
          desiredSize: new go.Size(64, 64),
          imageStretch: go.GraphObject.Uniform,
          margin: 4
        }),
        $(go.TextBlock, {
          margin: 4,
          font: 'bold 13px sans-serif',
          stroke: 'black'
        }, new go.Binding('text', 'key'))
      );
    };

    const categories = ['actor', 'service', 'api', 'database', 'queue', 'monitoring', 'external', 'kafka'];
    categories.forEach(cat => {
      this.diagram.nodeTemplateMap.add(cat, createNodeTemplate(cat));
    });

    this.diagram.nodeTemplateMap.add('',
      $(go.Node, 'Auto',
        $(go.Shape, 'RoundedRectangle', {
          fill: '#e2e8f0',
          stroke: '#94a3b8',
          strokeWidth: 1.5
        }),
        $(go.TextBlock, {
          margin: 10,
          font: 'bold 13px sans-serif',
          stroke: 'black'
        }, new go.Binding('text', 'key'))
      )
    );

    this.diagram.linkTemplate =
      $(go.Link,
        {
          routing: go.Link.AvoidsNodes,
          curve: go.Link.JumpOver,
          corner: 6,
          selectable: false
        },
        new go.Binding('points').makeTwoWay(),
        $(go.Shape, {
          strokeWidth: 2
        }, new go.Binding('stroke', '', (data) => this.getLinkColor(data))),
        $(go.Shape, {
          toArrow: 'Standard',
          stroke: null
        }, new go.Binding('fill', '', (data) => this.getLinkColor(data)))
      );
  }

  private getLinkColor(link: { from: string; to: string }): string {
    const fromNode = this.nodes.find(n => n.key === link.from);
    const toNode = this.nodes.find(n => n.key === link.to);

    if (!fromNode || !toNode) return '#64748b';
    if (fromNode.category === 'api' && toNode.category === 'service') return '#2563eb';
    if (fromNode.category === 'queue' || toNode.category === 'queue') return '#16a34a';
    if (fromNode.category === 'external' || toNode.category === 'external') return '#dc2626';

    return '#64748b';
  }

  private renderDiagram() {
    const { fixedDiagram, warnings } = autofixDiagram({
      nodes: this.nodes,
      links: this.links,
    });

    this.diagram.model = new go.GraphLinksModel(fixedDiagram.nodes, fixedDiagram.links);
    this.diagram.zoomToFit();

    if (warnings.length > 0) {
      console.warn('Autofix warnings:', warnings);
    }
  }

  zoomIn() {
    if (this.diagram) this.diagram.scale *= 1.1;
  }

  zoomOut() {
    if (this.diagram) this.diagram.scale *= 0.9;
  }
}
