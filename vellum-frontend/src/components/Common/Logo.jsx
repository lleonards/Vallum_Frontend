import React from 'react';

// Logo Vellum — usa a imagem exata fornecida pelo usuário
export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { img: 28, text: 'text-lg' },
    md: { img: 36, text: 'text-xl' },
    lg: { img: 52, text: 'text-3xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-2 select-none">
      <img
        src="https://www.genspark.ai/api/files/s/pJIKX65x"
        alt="Vellum Logo"
        style={{ height: s.img, width: 'auto', objectFit: 'contain' }}
        draggable={false}
      />
    </div>
  );
}
