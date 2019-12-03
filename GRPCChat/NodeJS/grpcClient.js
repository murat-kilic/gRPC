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
 var client = new grpcChat.ChatService('localhost:50050',
                                        grpc.credentials.createInsecure());
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var user = process.argv[2];
var metadata = new grpc.Metadata();
metadata.add('username', user);
var call = client.chat(metadata);

call.on('data', function(ChatMessage) {
    console.log(`${ChatMessage.from} ==> ${ChatMessage.message}`);
});
call.on('end', function() {
  console.log('Server ended call');
});
call.on('error', function(e) {
    console.log(e);
});

rl.on("line", function(line) {
  if (line === "quit") {
    call.end();
  } else {
    call.write({
    message : line
  });
  }
});