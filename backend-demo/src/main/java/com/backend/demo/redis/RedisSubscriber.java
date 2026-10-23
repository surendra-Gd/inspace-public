package com.backend.demo.redis;


import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisSubscriber implements MessageListener {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    public RedisSubscriber(
            RedisTemplate<String, Object> redisTemplate,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
    }


    @Override
    public void onMessage(Message message, byte[] pattern) {
        String publishedChannel = redisTemplate.getStringSerializer()
                .deserialize(message.getChannel());
        Object publishedMessage = redisTemplate.getValueSerializer()
                .deserialize(message.getBody());
        if(publishedChannel == null || publishedMessage == null) return;
        System.out.println("Redis published channel: " + publishedChannel);
        messagingTemplate.convertAndSend(publishedChannel, publishedMessage);
    }
}