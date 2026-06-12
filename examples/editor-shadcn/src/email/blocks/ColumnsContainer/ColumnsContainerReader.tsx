import React, { CSSProperties } from 'react';

import { ColumnsContainer as BaseColumnsContainer } from '@usewaypoint/block-columns-container';

import { ReaderBlock } from '../../Reader/core';

import { ColumnsContainerProps } from './ColumnsContainerPropsSchema';

const EMAIL_WIDTH = 600;

function getPadding(padding: { top: number; bottom: number; left: number; right: number } | null | undefined) {
  return padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : undefined;
}

/**
 * Variante "fluid hybrid": colonne come inline-block che si impilano naturalmente
 * sotto i ~480px senza media query. Con reverseColumnsOnMobile l'ordine visivo da
 * impilate si inverte tramite dir="rtl" sul contenitore (PRD §3.2), mantenendo
 * l'ordine desktop invariato.
 */
function FluidColumns({ style, props, columns }: ColumnsContainerProps & { columns: React.ReactNode[] }) {
  const columnsCount = props?.columnsCount ?? 2;
  const gap = props?.columnsGap ?? 0;
  const reverse = props?.reverseColumnsOnMobile ?? false;
  const contentAlignment = props?.contentAlignment ?? 'middle';
  const padding = style?.padding;
  const innerWidth = EMAIL_WIDTH - (padding?.left ?? 0) - (padding?.right ?? 0);
  const colWidth = Math.floor(innerWidth / columnsCount);

  const verticalAlign = contentAlignment === 'top' ? 'top' : contentAlignment === 'bottom' ? 'bottom' : 'middle';

  const wrapperStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
    padding: getPadding(padding),
  };

  const cols = columns.slice(0, columnsCount);
  // Con dir=rtl il primo elemento DOM finisce a destra: per mantenere l'ordine
  // visivo desktop invariato il DOM va invertito; impilandosi, l'ordine verticale
  // segue il DOM → su mobile le colonne risultano invertite. Questo è l'effetto voluto.
  const domOrder = reverse ? [...cols].reverse() : cols;

  return (
    <div style={wrapperStyle}>
      <div dir={reverse ? 'rtl' : 'ltr'} style={{ textAlign: 'center', fontSize: 0 }}>
        {domOrder.map((col, i) => {
          const fixed = props?.fixedWidths?.[reverse ? columnsCount - 1 - i : i];
          return (
            <div
              key={i}
              dir="ltr"
              style={{
                display: 'inline-block',
                verticalAlign,
                width: '100%',
                maxWidth: fixed ?? colWidth,
                fontSize: 'medium',
                textAlign: 'left',
                boxSizing: 'border-box',
                paddingLeft: gap / 2,
                paddingRight: gap / 2,
              }}
            >
              {col}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ColumnsContainerReader({ style, props }: ColumnsContainerProps) {
  const { columns, ...restProps } = props ?? {};
  const cols = (columns ?? []).map((col) => col.childrenIds.map((childId) => <ReaderBlock key={childId} id={childId} />));

  if (props?.stackOnMobile) {
    return <FluidColumns style={style} props={props} columns={cols} />;
  }

  return <BaseColumnsContainer props={restProps} columns={cols} style={style} />;
}
