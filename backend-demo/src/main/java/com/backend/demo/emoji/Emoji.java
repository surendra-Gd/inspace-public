package com.backend.demo.emoji;

import com.backend.demo.post.Post;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"post"})
@Entity
public class Emoji {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "emoji-seq"
    )
    @SequenceGenerator(
            name = "emoji-seq",
            sequenceName = "emoji-seq",
            allocationSize = 1
    )
    private Long id;
    @ManyToOne
    @JoinColumn(name = "post", referencedColumnName = "postId", nullable = false)
    @JsonBackReference
    private Post post;
    private Long memberId;
    @Enumerated(value = EnumType.STRING)
    private Emojis emojis;

}
