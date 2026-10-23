package com.backend.demo.payload;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class SpaceChannels {
    private List<String> channels;
    private Action action;
}
