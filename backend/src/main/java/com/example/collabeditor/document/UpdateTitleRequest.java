package com.example.collabeditor.document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTitleRequest(
        @NotBlank @Size(max = 120) String title
) {
}
