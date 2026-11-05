import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileWarning } from "lucide-react";
import BookSelector from "@/components/books/BookSelector";
import PdfViewer from "@/components/books/PdfViewer";

export default function Book() {
  const [selectedBook, setSelectedBook] = useState(null);

  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: () => base44.entities.Book.list("order", 100),
    onSuccess: (data) => {
      if (data.length > 0 && !selectedBook) setSelectedBook(data[0]);
    },
  });

  // Auto-select first book when loaded
  React.useEffect(() => {
    if (books.length > 0 && !selectedBook) setSelectedBook(books[0]);
  }, [books]);

  const activeUrl = selectedBook?.url;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 mr-auto">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="font-cinzel text-xl font-bold text-foreground">Biblioteca</h1>
        </div>
        {books.length > 0 && (
          <BookSelector
            books={books}
            selectedBook={selectedBook}
            onSelect={setSelectedBook}
          />
        )}
      </div>

      {/* Viewer */}
      <div className="flex-1 min-h-0 bg-card border border-border rounded-xl overflow-hidden">
        {activeUrl ? (
          <PdfViewer key={activeUrl} book={selectedBook} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <FileWarning className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <h3 className="font-cinzel text-lg font-semibold text-muted-foreground mb-2">
              {books.length === 0 ? "Nenhum livro disponível" : "Selecione um livro"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {books.length === 0
                ? "O administrador precisa adicionar livros na área administrativa."
                : "Escolha um livro no seletor acima para visualizá-lo."}
            </p>
          </div>
        )}
      </div>

      <div className="text-center mt-3 text-xs text-muted-foreground/30 flex-shrink-0">
        Sistema Scarlet Travellers por Izumi Yoshikawa
      </div>
    </div>
  );
}