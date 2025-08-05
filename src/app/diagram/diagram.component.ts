import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import * as go from 'gojs';

@Component({
  selector: 'app-diagram',
  template: '<div id="gojsDiagram" style="width:100%; height:600px;"></div>',
})
export class DiagramComponent implements AfterViewInit, OnChanges {
  @Input() nodes: { key: string; category?: string }[] = [];
  @Input() links: { from: string; to: string }[] = [];
  private diagram!: go.Diagram;

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
        layerSpacing: 80,
        columnSpacing: 50,
      }),
      initialContentAlignment: go.Spot.Center,
      padding: 20,
    });

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
          corner: 6
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

    if (fromNode.category === 'api' && toNode.category === 'service') return '#2563eb'; // blue
    if (fromNode.category === 'queue' || toNode.category === 'queue') return '#16a34a'; // green
    if (fromNode.category === 'external' || toNode.category === 'external') return '#dc2626'; // red

    return '#64748b'; // default gray
  }

  private renderDiagram() {
    this.diagram.model = new go.GraphLinksModel(this.nodes, this.links);
    this.diagram.zoomToFit();
  }
}
