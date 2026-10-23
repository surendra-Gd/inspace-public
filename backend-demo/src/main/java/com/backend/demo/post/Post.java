package com.backend.demo.post;

import com.backend.demo.emoji.Emoji;
import com.backend.demo.postcomment.PostComment;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jdk.jfr.Timestamp;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@ToString(exclude = {"comments"})
public class Post {

    @Id
    @SequenceGenerator(
            name = "post-seq",
            sequenceName = "post-seq",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "post-seq"
    )
    private Long postId;
    @Column(updatable = false, nullable = false)
    private Long memberId;
    @Timestamp
    private LocalDateTime sharedOn;
    private String expression;
    @Column(unique = true)
    private String imageKey;
    @Column(length = 2000)
    private String url;
    private Integer width;
    private Integer height;
    private String versionId;
    @Timestamp
    private Instant expiredOn;
    @Timestamp
    private Instant generatedOn;
    @Column(updatable = false, nullable = false)
    private Long spaceId;
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JsonManagedReference
    private List<Emoji> emojis;
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<PostComment> comments;

}
