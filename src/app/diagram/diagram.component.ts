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

    // ✅ Set background separately (fixes the error)
    this.diagram.div!.style.backgroundColor = 'white';


    // ACTOR: User
    this.diagram.nodeTemplateMap.add('actor',
      $(go.Node, 'Vertical',
        { background: 'transparent' },
        $(go.Picture, {
          source: 'https://img.icons8.com/ios-filled/100/000000/user-male-circle.png',
          desiredSize: new go.Size(64, 64),
          imageStretch: go.GraphObject.Uniform,
          margin: 4
        }),
        $(go.TextBlock, {
          margin: 4,
          font: 'bold 13px sans-serif',
          stroke: 'black'
        }, new go.Binding('text', 'key'))
      )
    );

    // DATABASE
    this.diagram.nodeTemplateMap.add('database',
      $(go.Node, 'Vertical',
        { background: 'transparent' },
        $(go.Picture, {
          source: 'https://img.icons8.com/ios-filled/100/000000/database.png',
          desiredSize: new go.Size(64, 64),
          imageStretch: go.GraphObject.Uniform,
          margin: 4
        }),
        $(go.TextBlock, {
          margin: 4,
          font: 'bold 13px sans-serif',
          stroke: 'black'
        }, new go.Binding('text', 'key'))
      )
    );

    // SERVICE
    this.diagram.nodeTemplateMap.add('service',
      $(go.Node, 'Vertical',
        { background: 'transparent' },
        $(go.Picture, {
          source: 'https://img.icons8.com/ios-filled/100/000000/microservices.png',
          desiredSize: new go.Size(64, 64),
          imageStretch: go.GraphObject.Uniform,
          margin: 4
        }),
        $(go.TextBlock, {
          margin: 4,
          font: 'bold 13px sans-serif',
          stroke: 'black'
        }, new go.Binding('text', 'key'))
      )
    );

    // API
    this.diagram.nodeTemplateMap.add('api',
      $(go.Node, 'Vertical',
        { background: 'transparent' },
        $(go.Picture, {
          source: 'https://img.icons8.com/ios-filled/100/000000/api.png',
          desiredSize: new go.Size(64, 64),
          imageStretch: go.GraphObject.Uniform,
          margin: 4
        }),
        $(go.TextBlock, {
          margin: 4,
          font: 'bold 13px sans-serif',
          stroke: 'black'
        }, new go.Binding('text', 'key'))
      )
    );

    // DEFAULT
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

    // LINKS
    this.diagram.linkTemplate =
      $(go.Link,
        {
          routing: go.Link.AvoidsNodes,
          curve: go.Link.JumpOver,
          corner: 6
        },
        $(go.Shape, { stroke: '#64748b', strokeWidth: 1.5 }),
        $(go.Shape, { toArrow: 'Standard', fill: '#64748b', stroke: '#64748b' })
      );
  }

  private renderDiagram() {
    this.diagram.model = new go.GraphLinksModel(this.nodes, this.links);
    this.diagram.zoomToFit();
  }
}
