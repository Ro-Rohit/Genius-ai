'use client';
import { useMemo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import useWindowWidth from './use-screen-width';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

//@ts-ignore
if (typeof Promise.withResolvers === 'undefined') {
  if (window)
    // @ts-expect-error This does not exist outside of polyfill which this is doing
    window.Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ file }: { file: File }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1); // start on first page
  const [loading, setLoading] = useState(true);
  const width = useWindowWidth();

  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }) {
    setNumPages(nextNumPages);
  }

  function onPageLoadSuccess() {
    setLoading(false);
  }

  function goToNextPage() {
    setPageNumber(prevPageNumber => prevPageNumber + 1);
  }

  function goToPreviousPage() {
    setPageNumber(prevPageNumber => prevPageNumber - 1);
  }

  const options = useMemo(() => {
    return {
      cMapUrl: 'cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'standard_fonts/',
    };
  }, []);

  const fileSlice = useMemo(() => file.slice(0), [file]);

  return (
    <>
      <div hidden={loading} className="w-full">
        <Document
          file={fileSlice}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
          renderMode="canvas"
          className=""
        >
          <Page
            className=""
            key={pageNumber}
            pageNumber={pageNumber}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            onLoadSuccess={onPageLoadSuccess}
            onRenderError={() => setLoading(false)}
            width={Math.max(width * 0.4, 250)}
          />
        </Document>
      </div>
      <div className="mt-2 flex w-fit items-center gap-x-3 rounded-md bg-white p-2 shadow-lg hover:opacity-80">
        <ChevronLeft
          onClick={() => {
            goToPreviousPage();
          }}
          className="mx-2 size-4 cursor-pointer"
        />
        <p>
          {pageNumber} of {numPages}
        </p>
        <ChevronRight
          onClick={() => {
            goToNextPage();
          }}
          className="mx-2 size-4 cursor-pointer hover:opacity-80"
        />
      </div>
    </>
  );
}
