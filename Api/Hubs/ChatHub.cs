using Api.Dtos;
using Api.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
namespace Api.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ChatService _chatService;

        public ChatHub(ChatService chatService)
        {
            _chatService = chatService;
        }

        public override async Task OnConnectedAsync()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Come2Chat");
            await Clients.Caller.SendAsync("UserConnected");
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Come2Chat");
            var user = _chatService.GetUserByConnectionId(Context.ConnectionId);
            _chatService.RemoveUserFromList(user);
            await DisplayOnlineUsers();
            await base.OnDisconnectedAsync(exception);
        }

        public async Task AddUserConnectionId(string name)
        {
            _chatService.AddUserConnection(name, Context.ConnectionId);
            await DisplayOnlineUsers();
        }

        public async Task RecieveMessage(MessageDto message)
        {
            await Clients.Groups("Come2Chat").SendAsync("NewMessage", message);
        }

        public async Task CreatePrivateChat(MessageDto message)
        {

        }

        private async Task DisplayOnlineUsers()
        {
            var onlineUsers = _chatService.GetOnlineUser();
            await Clients.Groups("Come2Chat").SendAsync("OnlineUsers", onlineUsers);
        }

        private string GetPrivateGroupName(string from, string to)
        {
            // From: john, To: david ==> "david-john"
            // From: john, To: zoe ==> "john-zoe"
            var stringComapare = string.Compare(from, to) < 0;
            return stringComapare ? $"{from}-{to}" : $"{to}-{from}";
        }
    }
}
