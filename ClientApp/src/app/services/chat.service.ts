import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { User } from '../models/user';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Message } from '../models/message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrivateChatComponent } from '../private-chat/private-chat.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  myName: string = '';
  private chatConnection?: HubConnection
  onlineUsers: string[] = [];
  messages: Message[] = [];
  privateMessages: Message[] = [];
  privateMessageInitiated = false;

  constructor(private httpClient: HttpClient, private modalServce: NgbModal) { }

  registerUser(user: User) {
    return this.httpClient.post(`${environment.apiUrl}api/chat/register-user`, user, { responseType: 'text' });
  }

  createChatConnection() {
    this.chatConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}hubs/chat`).withAutomaticReconnect().build();

    this.chatConnection.start().catch(error => {
      console.error(error);
    });

    this.chatConnection.on('UserConnected', () => {
      this.addUserConnectionId()
    });

    this.chatConnection.on('OnlineUsers', (onlineUsers) => {
      this.onlineUsers = [...onlineUsers];
    });

    this.chatConnection.on('NewMessage', (newMessage: Message) => {
      this.messages = [...this.messages, newMessage];
    });

    this.chatConnection.on('OpenPrivateChat', (newMessage: Message) => {
      this.privateMessages = [...this.privateMessages, newMessage];
      this.privateMessageInitiated = true;
      const modalRef = this.modalServce.open(PrivateChatComponent);
      modalRef.componentInstance.toUser = newMessage.from;
    });

    this.chatConnection.on('NewPrivateMessage', (newMessage: Message) => {
      this.privateMessages = [...this.privateMessages, newMessage];
    });
    
    this.chatConnection.on('ClosePrivateChat', (newMessage: Message) => {
      this.privateMessageInitiated = false;
      this.privateMessages = [];
      this.modalServce.dismissAll();
    });

  }

  stopChatConnection() {
    this.chatConnection?.stop().catch(error => {
      console.error(error);
    });
  }

  async addUserConnectionId() {
    return this.chatConnection?.invoke('AddUserConnectionId', this.myName).catch(error => {
      console.error(error);
    });
  }

  async sendMessage(content: string) {
    const message: Message = {
      from: this.myName,
      content
    };
    return this.chatConnection?.invoke("ReceiveMessage", message).catch(error => {
      console.error(error);
    });
  }

  async sendPrivateMessage(to: string, content: string) {
    const message: Message = {
      from: this.myName,
      to,
      content
    };

    if (!this.privateMessageInitiated) {
      this.privateMessageInitiated = true;
      return this.chatConnection?.invoke("CreatePrivateChat", message)
        .then(() => {
          this.privateMessages = [...this.privateMessages, message]
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      return this.chatConnection?.invoke("ReceivePrivateMessage", message).catch(error => {
        console.error(error);
      });
    }
  }

  async closePrivateChatMessage(otherUser: string) {
    return this.chatConnection?.invoke('RemovePrivateChat', this.myName, otherUser).catch(error => {
      console.error(error);
    });

  }
}
