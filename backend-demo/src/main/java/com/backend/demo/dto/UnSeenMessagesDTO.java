package com.backend.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UnSeenMessagesDTO {
    private Long textId;
    private Long count;


    public UnSeenMessagesDTO() {}

    public UnSeenMessagesDTO(Long textId, Long count) {
        this.textId = textId;
        this.count = count;
    }
}
