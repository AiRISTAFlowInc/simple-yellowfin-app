import { Component, AfterViewInit } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  title = 'Airista x Yellowfin';

  reportUUID: string = '2f6a633f-0198-48e7-94c4-f1cb47621315';
  dashboardUUID: string = 'e7409ff2-f846-44e1-a603-b78ec51b20b9';

  baseUrl: string = 'http://50.19.19.197:82';
  adminId: string = 'admin@yellowfin.com.au';
  adminPass: string = 'test';
  userId: string = 'admin@yellowfin.com.au';
  userPass: string = 'test';
  userOrg: string = '';
  customerId: number = 2047; //hardcoded customer id for example
  securityToken: any;
  reportLoaded: any;

  yellowfinAPI: any;

  constructor(private dataService: DataService) {}

  ngAfterViewInit(): void {
    this.loadExternalScript(this.baseUrl + '/Reporting/JsAPI/v3')
      .then(() => {
        this.yellowfinAPI = (window as any).yellowfin;
        this.createSSOToken();
      })
      .catch((error) => {
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
  }

  createSSOToken(): void {
    const body = {
      signOnUser: {
        userName: this.userId,
        password: this.userPass,
        userOrgRef: this.userOrg,
      },
      noPassword: false,
      adminUser: {
        userName: this.adminId,
        password: this.adminPass,
      },
    };

    this.dataService.postData(this.baseUrl, body).subscribe(
      (response) => {
        console.log('response ', response)
        let securityToken = response.securityToken;
        this.securityToken = response.securityToken;
        console.log('securityToken = ' + securityToken);

        // Initialize Yellowfin API and load the report
        this.yellowfinAPI
          .init()
          .then(() => {
            this.yellowfinAPI
              .newSession(securityToken, this.userOrg)
              .then(() => {
                this.loadReport();
                this.loadDashboard();
              })
              .catch((error: any) => {
                console.error('Error creating Yellowfin session:', error);
              });
          })
          .catch((error: any) => {
            console.error('Error initializing Yellowfin API:', error);
          });
      },
      (error) => {
        console.error('Error obtaining SSO token:', error);
      }
    );
  }

  loadReport(): void {
    const options = {
      reportUUID: this.reportUUID,
      element: document.getElementById('reportDiv'),
      showToolbar: true,
      showTitle: true,
      showInfo: false,
      showFilter: false,
      showExport: true,
      showShare: true,
      showReportDisplayToggle: true,
    };

    this.yellowfinAPI
      .loadReport(options)
      .then((report: any) => {
        console.log("report", report);
        this.reportLoaded = report;
        report.filters.forEach((filter: any) => {
          // JSON.parse('{///}');
          if (filter.name === 'CustomerID') {
            filter.setValue(this.customerId);
          }
        });
        setTimeout(() => {
          report.filters.applyFilters();
        }, 5000);
      })
      .catch((error: any) => {
        console.error('Error loading report:', error);
      });
  }

  downloadReport() {
    console.log('Downloading report');

  const exportFileType = 'XML'; // You can change to 'XML' if preferred
  const contentToExport = [
    {
      changeDate: 20200123000933,
      resourceName: this.reportLoaded.reportInfo.name,
      resourceDescription: this.reportLoaded.reportInfo.description,
      resourceId: this.reportLoaded.reportId,
      resourceUUID: this.reportUUID,
      resourceType: this.reportLoaded.reportRunType,
      resourceOrgId: 1, // Replace with your actual resourceOrgId if needed
    }
  ];

  const body = {
    exportFileType: exportFileType,
    contentToExport: contentToExport,
  };

  // Prepare the headers
  const nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  const ts = Date.now();
  // const headers = new HttpHeaders({
  //   'Authorization': `YELLOWFIN ts=${ts}, nonce=${nonce}, token=${this.securityToken}`, // Use the actual security token
  //   'Accept': 'application/vnd.yellowfin.api-v1+json',
  //   'Content-Type': 'application/json',
  // });

  
  // Sending the request to export content
  this.dataService.postDataReport(this.baseUrl, body, this.securityToken)
    .subscribe(
      (response: any) => {
        // Assuming response contains the byte array of the exported file
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'report.xml'; 
        link.click();
      },
      (error) => {
        console.error('Error downloading report:', error);
      }
    );
  }

  loadDashboard(): void {
    const options = {
      dashboardUUID: this.dashboardUUID,
      element: document.getElementById('dashboardDiv'),
      showToolbar: true,
      showTitle: true,
      showInfo: false,
      showFilter: false,
      showExport: true,
      showShare: true,
      showReportDisplayToggle: true,
    };

    this.yellowfinAPI
      .loadDashboard(options)
      .then((dashboard: any) => {
        dashboard.filters.forEach((filter: any) => {
          if (filter.name === 'CustomerId') {
            filter.setValue(this.customerId);
          }
        });
        dashboard.filters.applyFilters();
      })
      .catch((error: any) => {
        console.error('Error loading dashboard:', error);
      });
  }
}
