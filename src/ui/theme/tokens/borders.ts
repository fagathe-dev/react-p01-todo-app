export interface Borders {
  widths: {
    none: '0px';
    thin: '1px';
    thick: '2px';
  };
  focusRing: {
    width: '3px';
    offset: '2px';
    color: string; // Permet d'accepter n'importe quelle couleur RGBA
  };
}

export const borders: Borders = {
  widths: {
    none: '0px',
    thin: '1px',
    thick: '2px',
  },
  focusRing: {
    width: '3px',
    offset: '2px',
    color: 'rgba(88, 119, 76, 0.3)',
  },
};
