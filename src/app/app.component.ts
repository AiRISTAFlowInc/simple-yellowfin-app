import { Component, AfterViewInit } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Airista x Yellowfin';

  reportUUID: string = '2f6a633f-0198-48e7-94c4-f1cb47621315';
  dashboardUUID: string = 'e7409ff2-f846-44e1-a603-b78ec51b20b9';

  baseUrl: string = 'http://50.19.19.197:8081';
  adminId: string = 'admin@yellowfin.com.au';
  adminPass: string = 'test';
  userId: string = 'admin@yellowfin.com.au';
  userPass: string = 'test';
  userOrg: string = '';

  yellowfinAPI: any;

  constructor(private dataService: DataService) { }

  ngAfterViewInit(): void {
    this.loadExternalScript(this.baseUrl + '/JsAPI/v3').then(() => {
      this.yellowfinAPI = (window as any).yellowfin;
      this.createSSOToken();
    }).catch((error) => {
      console.error('Error loading external script', error);
    });
  }

  loadExternalScript(src: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  createSSOToken(): void {
    const body = {
      signOnUser: {
        userName: this.userId,
        password: this.userPass,
        userOrgRef: this.userOrg
      },
      noPassword: false,
      adminUser: {
        userName: this.adminId,
        password: this.adminPass
      }
    };

    this.dataService.postData(this.baseUrl, body).subscribe(
      response => {
        let securityToken = response.securityToken;
        console.log('securityToken = ' + securityToken);

        // Initialize Yellowfin API and load the report
        this.yellowfinAPI.init().then(() => {
          this.yellowfinAPI.newSession(securityToken, this.userOrg).then(() => {
            this.loadReport();
            this.loadDashboard();
          }).catch((error: any) => {
            console.error('Error creating Yellowfin session:', error);
          });
        }).catch((error: any) => {
          console.error('Error initializing Yellowfin API:', error);
        });
      },
      error => {
        console.error('Error obtaining SSO token:', error);
      }
    );
  };

  loadReport(): void {
    const options = {
      reportUUID: this.reportUUID,
      element: document.getElementById('reportDiv'),
      showToolbar: true,
      showTitle: true,
      showInfo: false,
      showFilter: true,
      showExport: true,
      showShare: true,
      showReportDisplayToggle: true,
    };

    this.yellowfinAPI.loadReport(options).catch((error: any) => {
      console.error('Error loading report:', error);
    });
  };

  loadDashboard(): void {
    const options = {
      dashboardUUID: this.dashboardUUID,
      element: document.getElementById('dashboardDiv'),
      showToolbar: true,
      showTitle: true,
      showInfo: false,
      showFilter: true,
      showExport: true,
      showShare: true,
      showReportDisplayToggle: true,
    };

    this.yellowfinAPI.loadDashboard(options).catch((error: any) => {
      console.error('Error loading dashboard:', error);
    });
  };
}
