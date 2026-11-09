import React, { useState, useRef, useEffect } from "react";
import { Loader2, Maximize2, ExternalLink, Download, FileWarning, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

function isPdf(url) {
  return /\.(pdf)(\?.*)?$/i.test(url || "");
}

export default function PdfViewer({ book }) {
  const url = book?.url;
  const pdf = isPdf(url);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const containerRef = useRef(null);

  const docViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  // PDFs aceitam navegação por página e zoom via fragmento na URL
  const fragment = pdf ? `#page=${page}&zoom=${zoom}` : "";
  const viewerSrc = pdf ? `${url}${fragment}` : docViewer;

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(false);
    setPage(1);
    const t = setTimeout(() => setLoading(false), 6000);
    return () => clearTimeout(t);
  }, [url]);

  if (!url) return null;

  const openFullscreen = () => {
    const el = containerRef.current?.querySelector("iframe");
    el?.requestFullscreen?.();
  };

  const stepZoom = (delta) => setZoom((z) => Math.min(300, Math.max(50, z + delta)));

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card flex-shrink-0 flex-wrap">
        <p className="text-sm font-semibold text-foreground truncate flex-1 min-w-[120px]">{book.title}</p>

        {pdf && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="number"
              min={1}
              value={page}
              onChange={(e) => setPage(Math.max(1, Number(e.target.value) || 1))}
              className="w-14 h-7 text-center text-xs rounded-md bg-background border border-border"
              title="Ir para página"
            />
            <button
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="w-px h-5 bg-border mx-1" />
            <button
              onClick={() => stepZoom(-25)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Diminuir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-muted-foreground w-9 text-center">{zoom}%</span>
            <button
              onClick={() => stepZoom(25)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}

        {book.category && (
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
            {book.category}
          </span>
        )}
        <a href={url} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Abrir em nova aba">
          <ExternalLink className="w-4 h-4" />
        </a>
        <a href={url} download className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Baixar">
          <Download className="w-4 h-4" />
        </a>
        <button onClick={openFullscreen} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Tela cheia">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Viewer area */}
      <div className="relative flex-1 min-h-0 bg-card">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <FileWarning className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Não foi possível exibir este arquivo no navegador.</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
            >
              <ExternalLink className="w-4 h-4" /> Abrir / Baixar arquivo
            </a>
          </div>
        ) : (
          <iframe
            key={fragment || "doc"}
            src={viewerSrc}
            title={book.title}
            className="w-full h-full"
            onLoad={() => setLoading(false)}
            onError={() => { setError(true); setLoading(false); }}
          />
        )}
      </div>
    </div>
  );
}