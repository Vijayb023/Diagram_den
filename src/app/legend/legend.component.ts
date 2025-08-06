import { Component } from '@angular/core';

@Component({
  selector: 'app-legend',
  template: `
    <div class="bg-gray-100 p-4 rounded-lg shadow-md text-sm space-y-2">
      <h3 class="font-semibold text-gray-700 mb-2">Legend</h3>
      <div><span class="inline-block w-4 h-1 bg-blue-600 mr-2"></span>API → Service</div>
      <div><span class="inline-block w-4 h-1 bg-green-600 mr-2"></span>Messaging (Kafka/SQS)</div>
      <div><span class="inline-block w-4 h-1 bg-red-600 mr-2"></span>External Integration</div>
      <div><span class="inline-block w-4 h-1 bg-gray-500 mr-2"></span>Other communication</div>
    </div>
  `
})
export class LegendComponent {}
