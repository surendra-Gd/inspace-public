package com.backend.demo.postcomment;

import com.backend.demo.post.Post;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class PostComment {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "post-comment-seq"
    )
    @SequenceGenerator(
            name = "post-comment-seq",
            sequenceName = "post-comment-seq",
            allocationSize = 1
    )
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post", referencedColumnName = "postId", nullable = false)
    private Post post;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", referencedColumnName = "commentId")
    private PostComment parentComment;

    @Column(nullable = false)
    private Long memberId;

    @Column(nullable = false)
    private Long spaceId;

    @Column(nullable = false, length = 720)
    private String payload;

    @Column(length = 300, nullable = true)
    private String prefixes;

    private Integer replyCount;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime commentedOn;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<PostComment> replies;


    @Column(nullable = false)
    @UpdateTimestamp
    private LocalDateTime lastUpdatedOn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostCommentType commentType;
}