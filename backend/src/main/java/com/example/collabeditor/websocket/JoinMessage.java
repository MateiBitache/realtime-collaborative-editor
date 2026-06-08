package com.example.collabeditor.websocket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JoinMessage(
        @NotBlank @Size(max = 40) String editorId,
        @NotBlank @Size(max = 40) String userName
) {
}
