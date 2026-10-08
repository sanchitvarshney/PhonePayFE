import React, { useLayoutEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";

type Props = {
  value: string;
  height: string;
  moduleMm?: number;
  maxWidthMm?: number;
  className?: string;
};

const Barcode: React.FC<Props> = ({ value, height, moduleMm = 0.5, maxWidthMm = 80, className }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [modules, setModules] = useState(0);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg || !value) {
      setModules(0);
      return;
    }
    try {
      JsBarcode(svg, value, {
        format: "CODE128",
        width: 1,
        height: 50,
        margin: 10,
        marginTop: 0,
        marginBottom: 0,
        displayValue: false,
      });
      setModules(Number.parseFloat(svg.getAttribute("width") ?? "") || 0);
    } catch {
      setModules(0);
    }
  }, [value]);

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label={`Barcode ${value}`}
      preserveAspectRatio="none"
      className={className}
      style={{
        display: modules ? "block" : "none",
        width: `${Math.min(modules * moduleMm, maxWidthMm)}mm`,
        height,
        shapeRendering: "crispEdges",
      }}
    />
  );
};

export default React.memo(Barcode);
