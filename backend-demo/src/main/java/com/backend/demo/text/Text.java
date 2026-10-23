package com.backend.demo.text;

import com.backend.demo.textresponse.TextLike;
import com.backend.demo.textresponse.TextMessage;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jdk.jfr.Timestamp;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"messages"})
public class Text {

    @Id
    @SequenceGenerator(
            name = "text-seq",
            sequenceName = "text-seq",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "text-seq"
    )
    private Long textId;
    @Column(name = "text", length = 720, nullable = false)
    private String text;
    private Long memberId;

    // Store tagged as a single comma-separated String
    @Column(name = "tagged", length = 1000)
    private String tagged;
    @OneToMany(mappedBy = "text", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<TextMessage> messages;
    @OneToMany(mappedBy = "text", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<TextLike> likes;
    private Long spaceId;
    @Timestamp
    private LocalDateTime createdOn;
    private boolean isAnonymous;
    private Long messagesCount;
    private Long likesCount;
    @Timestamp
    private LocalDateTime lastUpdatedOn;
}