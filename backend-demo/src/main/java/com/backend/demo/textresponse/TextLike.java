package com.backend.demo.textresponse;

import com.backend.demo.text.Text;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;


@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TextLike {

    @Id
    @SequenceGenerator(
            sequenceName = "text_like-seq",
            name = "text_like-seq",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "text_like-seq"
    )
    private Long likeId;
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
