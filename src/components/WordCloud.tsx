import { useMemo } from 'react';

interface WordCloudProps {
  words: Array<{ text: string; value: number }>;
  color: string;
}

export function WordCloud({ words, color }: WordCloudProps) {
  const styledWords = useMemo(() => {
    if (words.length === 0) return [];
    const maxValue = Math.max(...words.map(w => w.value));
    const minValue = Math.min(...words.map(w => w.value));
    const range = maxValue - minValue || 1;

    return words.map(word => {
      const normalized = (word.value - minValue) / range;
      const fontSize = 12 + normalized * 28; // 12px to 40px
      const opacity = 0.4 + normalized * 0.6;
      return { ...word, fontSize, opacity };
    });
  }, [words]);

  if (styledWords.length === 0) return <p className="text-muted-foreground text-center py-4">No keywords found</p>;

  return (
    <div className="flex flex-wrap gap-2 justify-center items-center min-h-[200px] p-4">
      {styledWords.map((word, i) => (
        <span
          key={`${word.text}-${i}`}
          className="inline-block font-semibold transition-transform hover:scale-110 cursor-default"
          style={{
            fontSize: `${word.fontSize}px`,
            color,
            opacity: word.opacity,
          }}
          title={`${word.text}: ${word.value}`}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}
