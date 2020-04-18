package io.mark.grpc.grpcChat;

import io.grpc.*;
import io.grpc.ManagedChannelBuilder;
import io.grpc.stub.MetadataUtils;
import io.grpc.stub.StreamObserver;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.concurrent.CountDownLatch;
import io.mark.grpc.grpcChat.ChatServiceGrpc.*;

public class GRPCChatClient {
    private  ManagedChannel channel;
    private  ChatServiceStub asyncStub;

    public GRPCChatClient(String host, int port) {
        this(ManagedChannelBuilder.forAddress(host, port).usePlaintext());
    }

    public GRPCChatClient(ManagedChannelBuilder<?> channelBuilder) {
        channel = channelBuilder.build();
        asyncStub = ChatServiceGrpc.newStub(channel);
    }

    public void chat(String username) {
        System.out.println("Enter your messages below:");

        Metadata header=new Metadata();
        Metadata.Key<String> key =
                Metadata.Key.of("username", Metadata.ASCII_STRING_MARSHALLER);
        header.put(key,username);
        asyncStub = MetadataUtils.attachHeaders(asyncStub, header);
        final CountDownLatch finishLatch = new CountDownLatch(1);
        StreamObserver<ChatMessage> requestObserver =
                asyncStub.chat(new StreamObserver<ChatMessage>() {
                    @Override
                    public void onNext(ChatMessage res) {
                        System.out.println(res.getFrom()+" ==> "+ res.getMessage());
                    }

                    @Override
                    public void onError(Throwable t) {
                        Status status = Status.fromThrowable(t);
                        System.err.println("RouteChat Failed: {0}"+status);
                        finishLatch.countDown();
                    }

                    @Override
                    public void onCompleted() {
                        System.out.println("Server sent END");
                        finishLatch.countDown();
                    }
                });
        try {
            InputStream is = System.in;
            BufferedReader br =  new BufferedReader(new InputStreamReader(is));
            String line = null;
            while ((line = br.readLine()) != null) {
                if (line.equalsIgnoreCase("q")) {
                    break;
                }
                requestObserver.onNext(ChatMessage.newBuilder().setMessage(line).build());
            }
        }catch(Exception e){
            System.out.println("Exception occured:"+e);
            requestObserver.onError(e);

        }
         }

    public static void main(String[] args) {
        GRPCChatClient grpcChatClient=new GRPCChatClient("localhost",50050);
        grpcChatClient.chat(System.getProperty("username"));
    }
}
