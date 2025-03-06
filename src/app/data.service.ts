import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  postData(baseUrl: string, body: any): Observable<any> {
    const url = baseUrl + '/api/rpc/login-tokens/create-sso-token'; // Replace with your API endpoint
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'YELLOWFIN ts=' + new Date().getTime() + ', nonce=' + Math.random(),
      'Accept': 'application/vnd.yellowfin.api-v2+json'
    });
    return this.http.post<any>(url, JSON.stringify(body), { headers: headers});
  }
}
