import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}

  getDiagramData(prompt: string) {
    return firstValueFrom(
      this.http.post<any>('http://localhost:8000/generate-diagram', { prompt })
    );
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
