"use client";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";

export default function PdfReactPdf({ src }: {src: string}) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  return (
    <main className="w-full h-full overflow-auto">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.js">
        <div className="!h-full">
          <Viewer fileUrl={src} plugins={[defaultLayoutPluginInstance]} />
        </div>
      </Worker>
    </main>
  );
}
