package com.backend.demo.dto;

import com.backend.demo.textresponse.MessageType;
import jakarta.persistence.*;
import lombok.*;


import jakarta.validation.constraints.Pattern;


@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateTextMessage {

    @Pattern(regexp = "^(?!.*[;\\\\*])[\\s\\S]{1,720}$",
            message = "Text message contains invalid characters or exceeds the allowed length.")
    private String message;

    @Enumerated(value = EnumType.STRING)
    private MessageType type;

    private String prefixes;
    private Long textId;
    private Long memberId;
}
