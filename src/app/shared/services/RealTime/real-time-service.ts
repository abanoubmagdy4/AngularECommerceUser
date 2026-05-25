import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RealTimeService {
  private hubConnection!: signalR.HubConnection;
  private isConnectionStarted = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  public async startConnection(): Promise<void> {
    // تأكد من أننا في البراوزر وليس في Server-Side Rendering
    if (!this.isBrowser) {
      return;
    }

    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.baseServerUrl}/ProductHub`)
        .withAutomaticReconnect()
        .build();

      await this.hubConnection.start();
      this.isConnectionStarted = true;
      console.log('SignalR connection started successfully');
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.isConnectionStarted = false;
    }
  }

  public onNewProductsArrived(callback: (products: any[]) => void): void {
    // تأكد من أن الاتصال موجود ومبدوء
    if (!this.isBrowser || !this.hubConnection || !this.isConnectionStarted) {
      console.warn('SignalR connection not available or not started yet');
      return;
    }

    try {
      this.hubConnection.on('NewProductsArrived', (products) => {
        callback(products);
      });
    } catch (error) {
      console.error('Error setting up SignalR listener:', error);
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection && this.isConnectionStarted) {
      try {
        await this.hubConnection.stop();
        this.isConnectionStarted = false;
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }

  public isConnected(): boolean {
    return this.isBrowser && this.hubConnection && this.isConnectionStarted;
  }
}
