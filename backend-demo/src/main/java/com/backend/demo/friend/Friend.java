package com.backend.demo.friend;

import com.backend.demo.user.User;
import jakarta.persistence.*;
import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@Entity
@Table(name = "friend", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user1", "user2"})
})
public class Friend {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "friend-seq"
    )
    @SequenceGenerator(
            name = "friend-seq",
            sequenceName = "friend-seq",
            allocationSize = 1
    )
    private Long friendsId;

    @ManyToOne
    @JoinColumn(name = "user1", referencedColumnName = "userId")
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2", referencedColumnName = "userId")
    private User user2;
}
