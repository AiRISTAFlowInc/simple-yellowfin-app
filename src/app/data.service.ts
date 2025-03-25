import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  nonce: number = Math.random();

  constructor(private http: HttpClient) { }

  postData(baseUrl: string, body: any): Observable<any> {
    const url = baseUrl + '/Reporting/api/rpc/login-tokens/create-sso-token';
    const nonce = Math.random();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'YELLOWFIN ts=' + new Date().getTime() + ', nonce=' + nonce,
      'Accept': 'application/vnd.yellowfin.api-v2+json'
    });
    return this.http.post<any>(url, JSON.stringify(body), { headers: headers});
  }

  postDataReport(baseUrl: string, body: any, token: any): Observable<any> {
    const url = baseUrl + '/Reporting/api/rpc/import-export/export-content';
    const nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const ts = Date.now();
    const headers = new HttpHeaders({
      'Authorization': `YELLOWFIN ts=${ts}, nonce=${nonce}, token=${token}`,
      'Accept': 'application/vnd.yellowfin.api-v1+json',
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(url, JSON.stringify(body), { headers: headers});
  }
}
