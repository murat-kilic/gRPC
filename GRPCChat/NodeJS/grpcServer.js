var PROTO_PATH = __dirname + '/grpc_chat.proto';
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
 var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

 var grpcChat = protoDescriptor.io.mark.grpc.grpcChat;
 var clients = new Map();

 
 function chat(call) {
     call.on('data', function(ChatMessage) {
       user=call.metadata.get('username');
       msg=ChatMessage.message;
       console.log(`${user} ==> ${msg}`);
       for (let [msgUser, userCall] of clients) {
         if (msgUser != user) {
           userCall.write(
             {
             fromName: user,
             message : msg
           });
         }
       }
       if (clients.get(user) === undefined) {
         clients.set(user, call);
       }

     });
     call.on('end', function() {
       call.write({
         fromName: 'Chat server',
       message : 'Nice to see ya! Come back again...'
     });
       call.end();
     });
   }


var server = new grpc.Server();
server.addService(grpcChat.ChatService.service, {
    chat:chat
});
server.bind('0.0.0.0:50050', grpc.ServerCredentials.createInsecure());
server.start();
console.log("gRPC Chat Server started...");