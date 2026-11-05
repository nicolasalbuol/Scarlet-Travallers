import React, { useState, useRef, useEffect } from "react";
import { BookOpen, ChevronDown, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookSelector({ books, selectedBook, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = books.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce((acc, book) => {
    const cat = book.category || "Geral";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(book);
    return acc;
  }, {});

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:border-primary/50 transition-all group"
      >
        {selectedBook?.cover_image ? (
          <img src={selectedBook.cover_image} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
        )}
        <div className="flex-1 text-left min-w-0">
          {selectedBook ? (
            <>
              <p className="text-sm font-semibold text-foreground truncate">{selectedBook.title}</p>
              {selectedBook.category && (
                <p className="text-xs text-muted-foreground truncate">{selectedBook.category}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Selecionar livro...</p>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            style={{ maxHeight: 360 }}
          >
            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar livros..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-background rounded-lg border border-input focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
              {Object.keys(grouped).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum livro encontrado.</p>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    {Object.keys(grouped).length > 1 && (
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                        {category}
                      </div>
                    )}
                    {items.map((book) => {
                      const isSelected = selectedBook?.id === book.id;
                      return (
                        <button
                          key={book.id}
                          onClick={() => { onSelect(book); setOpen(false); setSearch(""); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary/5 transition-colors ${isSelected ? "bg-primary/10" : ""}`}
                        >
                          {book.cover_image ? (
                            <img src={book.cover_image} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 text-left min-w-0">
                            <p className={`text-sm font-medium truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                              {book.title}
                            </p>
                            {book.description && (
                              <p className="text-xs text-muted-foreground truncate">{book.description}</p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}