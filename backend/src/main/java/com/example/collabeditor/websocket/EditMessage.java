package com.example.collabeditor.websocket;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EditMessage(
        @NotNull String editorId,
        @NotNull String userName,
        @NotNull String content,
        long baseVersion,
        @Size(max = 60) String preview
) {
}
