var PROTO_PATH = __dirname + '/grpc_chat.proto';
var grpc = require('grpc');
var fs = require('fs');
var path = require('path');
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
             from: user,
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
const ca = fs.readFileSync(path.join(__dirname, 'certs', 'grpc_client_certificate.pem'));
const key = fs.readFileSync(path.join(__dirname, 'certs', 'privkey.pem'));
const cert = fs.readFileSync(path.join(__dirname, 'certs', 'certificate.pem'));
const creds = grpc.ServerCredentials.createSsl(
  ca,
  [{ private_key: key, cert_chain: cert }],
  true
);
server.bind('0.0.0.0:50050', creds);
server.start();
console.log("gRPC Chat Server started...");