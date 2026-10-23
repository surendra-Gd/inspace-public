package com.backend.demo.textresponse;

import com.backend.demo.text.Text;
import jakarta.persistence.*;
import jdk.jfr.Timestamp;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class TextMessage {

    @Id
    @SequenceGenerator(
            name = "text_message-seq",
            sequenceName = "text_message-seq",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "text_message-seq"
    )
    private Long id;
    @Column(nullable = false, length = 720)
    private String message;
    @Timestamp
    private LocalDateTime timeStamp;
    @Enumerated(value = EnumType.STRING)
    private MessageType type;
    private String prefixes;
    @ManyToOne
    @JoinColumn(
            name = "text",
            referencedColumnName = "textId",
            nullable = false
    )
    private Text text;
    private Long memberId;
    private Long spaceId;
}