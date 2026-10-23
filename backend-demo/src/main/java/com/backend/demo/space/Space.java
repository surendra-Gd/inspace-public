package com.backend.demo.space;

import com.backend.demo.member.SpaceMember;
import com.backend.demo.spacerequest.SpaceRequest;
import com.backend.demo.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDate;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity(name = "space")
@ToString(exclude = {"members", "requests"})
@Table(
        name = "space",
        indexes = @Index(name = "idx_unique_id", columnList = "uniqueId")
)
public class Space {

    @Id
    @GeneratedValue (
            strategy = GenerationType.SEQUENCE,
            generator = "space-seq"
    )
    @SequenceGenerator (
            name = "space-seq",
            sequenceName = "space-seq",
            allocationSize = 1
    )
    private Long spaceId;
    @Column(nullable = false)
    private String spacename;
    @Column(nullable = false, unique = true)
    private String uniqueId;
    @CreatedDate
    private LocalDate registeredOn;

    @ManyToOne
    @JoinColumn(name = "admin", referencedColumnName = "userId")
    private User admin;

    @OneToMany(mappedBy = "space", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<SpaceMember> members;

    @OneToMany(mappedBy = "space", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<SpaceRequest> requests;

}
