import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // ทำให้ Service นี้สามารถใช้ได้ทุกที่ในแอป
})
export class TempApiService {
  private apiUrl = 'https://heatwatchapi-1.onrender.com'; // URL ของ API

  constructor(private http: HttpClient) {}

  // ฟังก์ชันดึงอุณหภูมิจาก API
  getTemperature(): Observable<any> {
        return this.http.get<any[]>(`${this.apiUrl}/tmp`);
  }
   getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }
  getDaily(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/daily`);
  }
}
