package com.example.collabeditor.document;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {
    private final DocumentRepository repository;

    public DocumentService(DocumentRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public DocumentResponse create(String title) {
        return DocumentResponse.from(repository.save(new Document(title.trim())));
    }

    @Transactional(readOnly = true)
    public DocumentResponse get(UUID id) {
        return DocumentResponse.from(find(id));
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> list() {
        return repository.findAll().stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @Transactional
    public DocumentResponse rename(UUID id, String title) {
        Document document = find(id);
        document.rename(title.trim());
        return DocumentResponse.from(document);
    }

    @Transactional
    public EditResult edit(UUID id, String content, long baseVersion) {
        Document document = find(id);
        if (document.getVersion() != baseVersion) {
            return EditResult.conflict(DocumentResponse.from(document));
        }
        document.updateContent(content);
        return EditResult.saved(DocumentResponse.from(document));
    }

    private Document find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new DocumentNotFoundException(id));
    }
}
