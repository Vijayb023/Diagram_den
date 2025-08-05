import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}

  async getDiagramData(body: { prompt: string; modifications: string[] }): Promise<any> {
  const response = await fetch('http://localhost:8000/generate-diagram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch diagram data');
  }

  return response.json();
}


askQuestion(prompt: string) {
  return firstValueFrom(
    this.http.post<any>('http://localhost:8000/analyze', { prompt })
  );
}
analyzeDiagram(data: { nodes: any[], links: any[] }) {
  return firstValueFrom(
    this.http.post<any>('http://localhost:8000/analyze-diagram', data)
  );
}



}
