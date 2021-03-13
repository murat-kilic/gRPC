# gRPC

This repo contains code in Medium posts about gRPC

GRPCChat -> https://medium.com/@Mark.io/bi-directional-streaming-grpc-with-node-js-and-java-7cbe0f1e0693
<br/><br/>
## Quickstart

### Node

Install dependencies
```bash
npm --prefix ./GRPCChat/NodeJS/ install ./GRPCChat/NodeJS/
```

Run server
```bash
node GRPCChat/NodeJS/grpcServer
```

Run JS client
```bash
node GRPCChat/NodeJS/grpcClient JsUser
```

### Java

Maven build
```bash
mvn -f GRPCChat/Java/pom.xml clean package
```

Run Java client
```bash
java -cp GRPCChat/Java/target/io.mark.grpc.gRPCChat-1.0-SNAPSHOT.jar\
  -Dusername=JavaUser\
  io.mark.grpc.grpcChat.GRPCChatClient
```
