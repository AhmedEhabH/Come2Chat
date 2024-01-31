import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.css'
})
export class ChatInputComponent {
  content: string = '';
  @Output() contentEmitter = new EventEmitter();

  submitMessage() {
    if (this.content.trim() !== "") {
      this.contentEmitter.emit(this.content);
    }

    this.content = '';
  }
}
