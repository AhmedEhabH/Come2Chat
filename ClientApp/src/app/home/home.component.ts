import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  userForm: FormGroup = new FormGroup({});
  submitted: boolean;
  apiErrorMessages: string[] = [];
  openChat = false;

  constructor(private formBuilder: FormBuilder, private chatService: ChatService) {
    this.submitted = false;
    this.initializeForm();
  }
  initializeForm() {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]]
    });
  }

  submitForm() {
    this.submitted = true;

    if (this.userForm.valid) {
      this.chatService.registerUser(this.userForm.value).subscribe({
        next: () => {
          this.chatService.myName = this.userForm.get('name')?.value;
          this.openChat = true;
          this.userForm.reset();
          this.submitted = false;
        },
        error: error => {
          // console.error(error);
          if (typeof (error.error) !== 'object') {
            this.apiErrorMessages.push(error.error);
          }
        }

      });
    }
  }

  closeChat() {
    this.openChat = false;
  }

}
