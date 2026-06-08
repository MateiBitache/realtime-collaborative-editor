package com.example.collabeditor.document;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class DocumentServiceTest {
    @Autowired
    private DocumentService service;

    @Test
    void createsAndLoadsDocument() {
        DocumentResponse created = service.create("Project Plan");

        DocumentResponse loaded = service.get(created.id());

        assertThat(loaded.title()).isEqualTo("Project Plan");
        assertThat(loaded.content()).isEmpty();
        assertThat(loaded.version()).isZero();
    }

    @Test
    void savesEditWhenVersionMatches() {
        DocumentResponse created = service.create("Notes");

        EditResult result = service.edit(created.id(), "First line", 0);

        assertThat(result.saved()).isTrue();
        assertThat(result.conflict()).isFalse();
        assertThat(result.document().content()).isEqualTo("First line");
        assertThat(result.document().version()).isEqualTo(1);
    }

    @Test
    void reportsConflictWhenVersionIsStale() {
        DocumentResponse created = service.create("Notes");
        service.edit(created.id(), "Current text", 0);

        EditResult result = service.edit(created.id(), "Old edit", 0);

        assertThat(result.saved()).isFalse();
        assertThat(result.conflict()).isTrue();
        assertThat(result.document().content()).isEqualTo("Current text");
        assertThat(result.document().version()).isEqualTo(1);
    }
}
