package com.backend.demo.dto;

import com.backend.demo.textresponse.MessageType;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
public class TextMessageDTO {
    private Long id;
    private String message;
    private LocalDateTime timeStamp;
    private MessageType type;
    private String prefixes;
    private Long textId;
    private Long memberId;
    private Long spaceId;

    public TextMessageDTO() {
    }

    public TextMessageDTO(
            Long id,
            String message,
            LocalDateTime timeStamp,
            MessageType type,
            String prefixes,
            Long textId,
            Long memberId,
            Long spaceId
    ) {
        this.id = id;
        this.message = message;
        this.timeStamp = timeStamp;
        this.type = type;
        this.prefixes = prefixes;
        this.textId = textId;
        this.memberId = memberId;
        this.spaceId = spaceId;
    }
}
